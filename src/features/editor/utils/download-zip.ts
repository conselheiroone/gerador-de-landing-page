/**
 * Utilitário para gerar e baixar exportações da landing page.
 *
 * Suporta:
 * - HTML inline (arquivo único com imagens base64)
 * - ZIP com estrutura de pastas organizada:
 *   /index.html
 *   /assets/css/styles.css
 *   /assets/img/img-001-foto.jpg
 *   /assets/img/img-002-hero.png
 *   ...
 *
 * Usa APIs nativas do browser (zero dependências externas).
 */

import { craftJsonToHtml } from './export-html'
import {
  inlineAllAssets,
  extractAllImageUrls,
  fetchAsArrayBuffer,
  urlToFilename,
} from './inline-assets'

// ─── Tipos ───────────────────────────────────────────────────────

interface ZipTextEntry {
  name: string
  content: string
}

interface ZipBinaryEntry {
  name: string
  data: Uint8Array
}

type ZipEntry = ZipTextEntry | ZipBinaryEntry

function isBinaryEntry(entry: ZipEntry): entry is ZipBinaryEntry {
  return 'data' in entry
}

// ─── ZIP Builder ─────────────────────────────────────────────────

/**
 * Cria um arquivo ZIP a partir de entradas texto e/ou binárias.
 * Implementação leve sem dependências (formato ZIP store, sem compressão).
 * Suporta subdiretórios (ex: "assets/img/photo.jpg").
 */
function createZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder()
  const files: { name: Uint8Array; data: Uint8Array; offset: number }[] = []

  let offset = 0
  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const dataBytes = isBinaryEntry(entry) ? entry.data : encoder.encode(entry.content)
    files.push({ name: nameBytes, data: dataBytes, offset })
    offset += 30 + nameBytes.length + dataBytes.length
  }

  const centralDirOffset = offset
  const parts: Uint8Array[] = []

  // Local file headers + data
  for (const file of files) {
    const header = new ArrayBuffer(30)
    const view = new DataView(header)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint32(14, crc32(file.data), true)
    view.setUint32(18, file.data.length, true)
    view.setUint32(22, file.data.length, true)
    view.setUint16(26, file.name.length, true)
    view.setUint16(28, 0, true)
    parts.push(new Uint8Array(header))
    parts.push(file.name)
    parts.push(file.data)
  }

  // Central directory
  let centralDirSize = 0
  for (const file of files) {
    const cdh = new ArrayBuffer(46)
    const view = new DataView(cdh)
    view.setUint32(0, 0x02014b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 20, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint16(14, 0, true)
    view.setUint32(16, crc32(file.data), true)
    view.setUint32(20, file.data.length, true)
    view.setUint32(24, file.data.length, true)
    view.setUint16(28, file.name.length, true)
    view.setUint16(30, 0, true)
    view.setUint16(32, 0, true)
    view.setUint16(34, 0, true)
    view.setUint16(36, 0, true)
    view.setUint32(38, 0, true)
    view.setUint32(42, file.offset, true)
    parts.push(new Uint8Array(cdh))
    parts.push(file.name)
    centralDirSize += 46 + file.name.length
  }

  // End of central directory
  const eocd = new ArrayBuffer(22)
  const eocdView = new DataView(eocd)
  eocdView.setUint32(0, 0x06054b50, true)
  eocdView.setUint16(4, 0, true)
  eocdView.setUint16(6, 0, true)
  eocdView.setUint16(8, files.length, true)
  eocdView.setUint16(10, files.length, true)
  eocdView.setUint32(12, centralDirSize, true)
  eocdView.setUint32(16, centralDirOffset, true)
  eocdView.setUint16(20, 0, true)
  parts.push(new Uint8Array(eocd))

  return new Blob(parts as BlobPart[], { type: 'application/zip' })
}

/**
 * CRC-32 para validação do ZIP.
 */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * Dispara o download de um Blob como arquivo.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'landing-page'
}

// ─── Exportação HTML Inline ──────────────────────────────────────

/**
 * Exporta como arquivo HTML único (totalmente autossuficiente).
 * Converte TODAS as imagens (locais + externas) para base64 data URIs.
 */
export async function downloadHtmlInline(json: string, pageTitle: string) {
  const { html } = craftJsonToHtml(json, { pageTitle })
  const inlined = await inlineAllAssets(html)
  const blob = new Blob([inlined], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${slugify(pageTitle)}.html`)
}

// ─── Exportação ZIP com Assets ───────────────────────────────────

/**
 * Exporta como ZIP com estrutura organizada:
 *   /index.html
 *   /assets/css/styles.css
 *   /assets/img/img-001-nome.ext
 *   ...
 *
 * Assets de imagem são baixados como arquivos reais (não base64).
 * URLs no HTML são reescritas para apontar para os assets locais.
 */
export async function downloadZip(json: string, pageTitle: string) {
  const { html, css } = craftJsonToHtml(json, { pageTitle, externalCss: true })

  // 1. Extrair todas as URLs de imagens do HTML
  const imageUrls = extractAllImageUrls(html)

  // 2. Baixar todas as imagens em paralelo
  const downloadResults = await Promise.all(
    imageUrls.map(async (url, index) => {
      const result = await fetchAsArrayBuffer(url)
      if (!result) return null
      const filename = urlToFilename(url, index, result.mimeType)
      return { originalUrl: url, filename, data: result.data }
    }),
  )

  // 3. Filtrar downloads bem-sucedidos
  const assets = downloadResults.filter(
    (r): r is { originalUrl: string; filename: string; data: Uint8Array } => r !== null,
  )

  // 4. Reescrever URLs no HTML para apontar para assets/img/filename
  let processedHtml = html
  // Substituir URLs maiores primeiro para evitar colisão parcial
  const sortedAssets = [...assets].sort((a, b) => b.originalUrl.length - a.originalUrl.length)
  for (const asset of sortedAssets) {
    const escaped = asset.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    processedHtml = processedHtml.replace(
      new RegExp(escaped, 'g'),
      `assets/img/${asset.filename}`,
    )
  }

  // 5. Ajustar referência ao CSS: styles.css → assets/css/styles.css
  processedHtml = processedHtml.replace(
    'href="styles.css"',
    'href="assets/css/styles.css"',
  )

  // 6. Montar entradas do ZIP
  const entries: ZipEntry[] = [
    { name: 'index.html', content: processedHtml },
  ]

  if (css) {
    entries.push({ name: 'assets/css/styles.css', content: css })
  }

  for (const asset of assets) {
    entries.push({ name: `assets/img/${asset.filename}`, data: asset.data })
  }

  // 7. Gerar e baixar ZIP
  const blob = createZip(entries)
  downloadBlob(blob, `${slugify(pageTitle)}.zip`)
}
