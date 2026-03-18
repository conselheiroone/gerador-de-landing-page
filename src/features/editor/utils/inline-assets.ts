/**
 * Utilitário de assets para exportação.
 *
 * Converte URLs de imagens em:
 * - data URIs base64 (para HTML inline e preview no iframe)
 * - arquivos binários baixados (para ZIP com assets reais)
 *
 * Captura TODAS as URLs de imagem, incluindo:
 * - /assets/... (Vite local)
 * - http://localhost / http://127.0.0.1 (dev server)
 * - URLs externas (Supabase storage, CDNs, Google Fonts, etc.)
 */

export const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
}

/** Extensões de imagem reconhecidas */
const IMAGE_EXTENSIONS = new Set(Object.keys(MIME_TYPES))

/**
 * Extrai TODAS as URLs de imagens únicas de um HTML string.
 * Captura url('...'), src="...", href="..." — qualquer URL que pareça ser imagem.
 */
export function extractAllImageUrls(html: string): string[] {
  const urls = new Set<string>()
  const urlRegex = /(?:url\(\s*['"]?|(?:src|href)\s*=\s*["'])([^"')>\s]+)/gi
  let match
  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[1]
    if (isImageUrl(url)) {
      urls.add(url)
    }
  }
  return Array.from(urls)
}

/**
 * Extrai apenas URLs locais (que precisam de conversão para base64 no preview).
 */
export function extractLocalUrls(html: string): string[] {
  const urls = new Set<string>()
  const urlRegex = /(?:url\(\s*['"]?|(?:src|href)\s*=\s*["'])([^"')>\s]+)/gi
  let match
  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[1]
    if (isLocalUrl(url)) {
      urls.add(url)
    }
  }
  return Array.from(urls)
}

/**
 * Verifica se uma URL aponta para uma imagem (por extensão ou padrões conhecidos).
 */
function isImageUrl(url: string): boolean {
  if (url.startsWith('data:')) return false
  if (url.endsWith('.css') || url.endsWith('.js')) return false
  // Google Fonts link → não é imagem
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) return false
  // Checa extensão
  const ext = getExtension(url)
  if (ext && IMAGE_EXTENSIONS.has(ext)) return true
  // Supabase storage URLs frequentemente não têm extensão no path
  if (url.includes('/storage/v1/object/')) return true
  // YouTube thumbnails
  if (url.includes('img.youtube.com')) return true
  // Se é URL local, considerar como imagem (fallback)
  if (isLocalUrl(url)) return true
  return false
}

/**
 * Verifica se uma URL é local (servida pelo Vite/dev server).
 */
export function isLocalUrl(url: string): boolean {
  if (url.startsWith('data:')) return false
  if (/^\/?assets\//i.test(url)) return true
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) return true
  return false
}

/**
 * Extrai a extensão de uma URL (sem query string).
 */
function getExtension(url: string): string {
  const clean = url.split(/[?#]/)[0]
  const ext = clean.split('.').pop()?.toLowerCase() || ''
  return ext
}

/**
 * Gera um nome de arquivo seguro a partir de uma URL.
 * Ex: "https://example.com/path/photo.jpg?v=1" → "photo.jpg"
 * Ex: "https://storage.supabase.co/storage/v1/object/public/images/abc123" → "abc123.bin" (ou com mime type)
 */
export function urlToFilename(url: string, index: number, mimeType?: string): string {
  const clean = url.split(/[?#]/)[0]
  const segments = clean.split('/').filter(Boolean)
  let name = segments.pop() || `image-${index}`

  // Sanitizar nome
  name = name.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Garantir extensão
  const ext = getExtension(name)
  if (!ext || !IMAGE_EXTENSIONS.has(ext)) {
    // Inferir extensão do mime type
    const mimeExt = mimeType ? Object.entries(MIME_TYPES).find(([, m]) => m === mimeType)?.[0] : null
    name = `${name}.${mimeExt || 'png'}`
  }

  // Evitar colisões — prefixar com índice
  return `img-${String(index).padStart(3, '0')}-${name}`.substring(0, 120)
}

/**
 * Busca uma URL e retorna como Blob.
 * Retorna null se falhar.
 */
export async function fetchAsBlob(url: string): Promise<{ blob: Blob; mimeType: string } | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    const ext = getExtension(url)
    const mimeType = MIME_TYPES[ext] || blob.type || 'application/octet-stream'
    return { blob, mimeType }
  } catch {
    return null
  }
}

/**
 * Busca uma URL e retorna como data URI base64.
 * Retorna null se falhar.
 */
async function fetchAsBase64(url: string): Promise<string | null> {
  const result = await fetchAsBlob(url)
  if (!result) return null

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      if (base64) {
        resolve(`data:${result.mimeType};base64,${base64}`)
      } else {
        resolve(null)
      }
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(result.blob)
  })
}

/**
 * Busca uma URL e retorna como Uint8Array (para inclusão no ZIP).
 * Retorna null se falhar.
 */
export async function fetchAsArrayBuffer(url: string): Promise<{ data: Uint8Array; mimeType: string } | null> {
  const result = await fetchAsBlob(url)
  if (!result) return null

  try {
    const buffer = await result.blob.arrayBuffer()
    return { data: new Uint8Array(buffer), mimeType: result.mimeType }
  } catch {
    return null
  }
}

/**
 * Substitui todas as URLs locais no HTML por data URIs base64.
 * Usado para preview no iframe e export HTML inline.
 *
 * @param html - HTML string com URLs locais
 * @returns HTML com imagens embutidas como base64
 */
export async function inlineLocalAssets(html: string): Promise<string> {
  const urls = extractLocalUrls(html)
  if (urls.length === 0) return html

  const results = await Promise.all(
    urls.map(async (url) => {
      const dataUri = await fetchAsBase64(url)
      return { url, dataUri }
    }),
  )

  let result = html
  const sorted = results
    .filter((r) => r.dataUri !== null)
    .sort((a, b) => b.url.length - a.url.length)

  for (const { url, dataUri } of sorted) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(escaped, 'g'), dataUri!)
  }

  return result
}

/**
 * Substitui TODAS as URLs de imagens (locais + externas) por data URIs base64.
 * Usado para export HTML inline totalmente autossuficiente.
 *
 * @param html - HTML string
 * @returns HTML com TODAS as imagens embutidas como base64
 */
export async function inlineAllAssets(html: string): Promise<string> {
  const urls = extractAllImageUrls(html)
  if (urls.length === 0) return html

  const results = await Promise.all(
    urls.map(async (url) => {
      const dataUri = await fetchAsBase64(url)
      return { url, dataUri }
    }),
  )

  let result = html
  const sorted = results
    .filter((r) => r.dataUri !== null)
    .sort((a, b) => b.url.length - a.url.length)

  for (const { url, dataUri } of sorted) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(escaped, 'g'), dataUri!)
  }

  return result
}
