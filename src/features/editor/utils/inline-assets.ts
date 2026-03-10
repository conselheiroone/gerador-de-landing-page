/**
 * Converte URLs locais em data URIs base64 para export.
 *
 * Captura caminhos /assets/, http://localhost e http://127.0.0.1
 *
 * Garante que imagens funcionem no:
 * - iframe srcDoc do ExportModal (preview)
 * - HTML exportado standalone
 */

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
}

/**
 * Extrai todas as URLs locais únicas de um HTML string.
 * Captura url('...'), src="...", href="..." com caminhos /assets/ ou http://localhost/127.0.0.1
 */
function extractLocalUrls(html: string): string[] {
  const urls = new Set<string>()

  // Regex para extrair URLs de atributos e CSS
  // Captura o valor dentro de url(...), src="...", href="..."
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
 * Verifica se uma URL é local (precisa ser convertida para base64).
 */
function isLocalUrl(url: string): boolean {
  // Já é data URI — ignorar
  if (url.startsWith('data:')) return false

  // /assets/... (relativo — servido pelo Vite)
  if (/^\/?assets\//i.test(url)) return true

  // http://localhost:PORT/... ou http://127.0.0.1:PORT/...
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url)) return true

  return false
}

/**
 * Busca uma imagem e retorna como data URI base64.
 * Retorna null se falhar.
 */
async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const blob = await response.blob()
    const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase() || ''
    const mimeType = MIME_TYPES[ext] || blob.type || 'application/octet-stream'

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        if (base64) {
          resolve(`data:${mimeType};base64,${base64}`)
        } else {
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Substitui todas as URLs locais no HTML por data URIs base64.
 *
 * @param html - HTML string com URLs locais
 * @returns HTML com imagens embutidas como base64
 */
export async function inlineLocalAssets(html: string): Promise<string> {
  const urls = extractLocalUrls(html)
  if (urls.length === 0) return html

  // Busca todas em paralelo
  const results = await Promise.all(
    urls.map(async (url) => {
      const dataUri = await fetchAsBase64(url)
      return { url, dataUri }
    }),
  )

  // Substitui no HTML (URLs maiores primeiro para evitar substituição parcial)
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
