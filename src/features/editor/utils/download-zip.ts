/**
 * Utilitário para gerar e baixar um ZIP contendo HTML + CSS da landing page.
 *
 * Usa a API JSZip-free (via Blob nativo) para manter zero dependências extras.
 * Gera um ZIP simples usando apenas APIs nativas do browser.
 */

import { craftJsonToHtml } from './export-html'

interface ZipEntry {
  name: string
  content: string
}

/**
 * Cria um arquivo ZIP a partir de uma lista de entradas texto.
 * Implementação leve sem dependências externas (formato ZIP store, sem compressão).
 */
function createSimpleZip(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder()
  const files: { name: Uint8Array; data: Uint8Array; offset: number }[] = []

  // Calcular offsets
  let offset = 0
  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const dataBytes = encoder.encode(entry.content)
    files.push({ name: nameBytes, data: dataBytes, offset })
    // Local file header (30) + name + data
    offset += 30 + nameBytes.length + dataBytes.length
  }

  const centralDirOffset = offset

  // Build buffer
  const parts: Uint8Array[] = []

  // Local file headers + data
  for (const file of files) {
    const header = new ArrayBuffer(30)
    const view = new DataView(header)
    view.setUint32(0, 0x04034b50, true)  // Local file header signature
    view.setUint16(4, 20, true)           // Version needed
    view.setUint16(6, 0, true)            // Flags
    view.setUint16(8, 0, true)            // Compression (store)
    view.setUint16(10, 0, true)           // Mod time
    view.setUint16(12, 0, true)           // Mod date
    view.setUint32(14, crc32(file.data), true) // CRC-32
    view.setUint32(18, file.data.length, true) // Compressed size
    view.setUint32(22, file.data.length, true) // Uncompressed size
    view.setUint16(26, file.name.length, true) // Filename length
    view.setUint16(28, 0, true)           // Extra field length

    parts.push(new Uint8Array(header))
    parts.push(file.name)
    parts.push(file.data)
  }

  // Central directory
  let centralDirSize = 0
  for (const file of files) {
    const cdh = new ArrayBuffer(46)
    const view = new DataView(cdh)
    view.setUint32(0, 0x02014b50, true)   // Central directory header
    view.setUint16(4, 20, true)            // Version made by
    view.setUint16(6, 20, true)            // Version needed
    view.setUint16(8, 0, true)             // Flags
    view.setUint16(10, 0, true)            // Compression
    view.setUint16(12, 0, true)            // Mod time
    view.setUint16(14, 0, true)            // Mod date
    view.setUint32(16, crc32(file.data), true) // CRC-32
    view.setUint32(20, file.data.length, true) // Compressed size
    view.setUint32(24, file.data.length, true) // Uncompressed size
    view.setUint16(28, file.name.length, true) // Filename length
    view.setUint16(30, 0, true)            // Extra field length
    view.setUint16(32, 0, true)            // Comment length
    view.setUint16(34, 0, true)            // Disk number start
    view.setUint16(36, 0, true)            // Internal attrs
    view.setUint32(38, 0, true)            // External attrs
    view.setUint32(42, file.offset, true)  // Local header offset

    parts.push(new Uint8Array(cdh))
    parts.push(file.name)
    centralDirSize += 46 + file.name.length
  }

  // End of central directory
  const eocd = new ArrayBuffer(22)
  const eocdView = new DataView(eocd)
  eocdView.setUint32(0, 0x06054b50, true)  // EOCD signature
  eocdView.setUint16(4, 0, true)            // Disk number
  eocdView.setUint16(6, 0, true)            // Central dir disk
  eocdView.setUint16(8, files.length, true)  // Entries on disk
  eocdView.setUint16(10, files.length, true) // Total entries
  eocdView.setUint32(12, centralDirSize, true) // Central dir size
  eocdView.setUint32(16, centralDirOffset, true) // Central dir offset
  eocdView.setUint16(20, 0, true)           // Comment length
  parts.push(new Uint8Array(eocd))

  return new Blob(parts as BlobPart[], { type: 'application/zip' })
}

/**
 * CRC-32 simples para validação do ZIP.
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

/**
 * Exporta como arquivo HTML único (inline).
 */
export function downloadHtmlInline(json: string, pageTitle: string) {
  const { html } = craftJsonToHtml(json, { pageTitle })
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, `${slugify(pageTitle)}.html`)
}

/**
 * Exporta como ZIP com HTML + CSS separados.
 */
export function downloadZip(json: string, pageTitle: string) {
  const { html, css } = craftJsonToHtml(json, { pageTitle, externalCss: true })

  const entries: ZipEntry[] = [
    { name: 'index.html', content: html },
  ]

  if (css) {
    entries.push({ name: 'styles.css', content: css })
  }

  const blob = createSimpleZip(entries)
  downloadBlob(blob, `${slugify(pageTitle)}.zip`)
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
