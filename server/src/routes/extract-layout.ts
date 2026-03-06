// ─── Route: POST /api/extract-layout ─────────────────────────

import type { Request, Response } from 'express'
import { z } from 'zod'
import { extractBoxTree } from '../modules/extract.js'
import { cleanBoxTree } from '../modules/normalize.js'
import { detectSections } from '../modules/segment.js'
import { inferLayout } from '../modules/infer.js'
import { extractTokens } from '../modules/tokenize.js'
import { sanitize } from '../modules/sanitize.js'
import { toCraftJson } from '../modules/export-craft.js'

const requestSchema = z.object({
  url: z.string().url(),
})

// Semaforo simples: 1 extracao por vez (Playwright e pesado)
let isExtracting = false

export async function extractLayoutRoute(req: Request, res: Response): Promise<void> {
  // Validar input
  const parsed = requestSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: `URL invalida: ${parsed.error.issues[0]?.message || 'formato incorreto'}`,
    })
    return
  }

  // Concorrencia: uma extracao por vez
  if (isExtracting) {
    res.status(429).json({
      success: false,
      error: 'Uma extracao ja esta em andamento. Tente novamente em alguns segundos.',
    })
    return
  }

  isExtracting = true
  const startTime = Date.now()

  try {
    console.log(`[extract] Iniciando: ${parsed.data.url}`)

    // Step 1: Renderizar e extrair BoxNode tree
    console.log('[extract] Step 1/7: Renderizando pagina...')
    const { tree: rawTree, title } = await extractBoxTree(parsed.data.url)
    console.log(`[extract] BoxNode tree: ${countNodes(rawTree)} nos`)

    // Step 2: Normalizar
    console.log('[extract] Step 2/7: Normalizando...')
    const cleanTree = cleanBoxTree(rawTree)
    console.log(`[extract] Apos normalizacao: ${countNodes(cleanTree)} nos`)

    // Debug: mostrar estrutura top-level
    console.log(`[extract] Root: tag=${cleanTree.tag}, children=${cleanTree.children.length}, rect=${JSON.stringify(cleanTree.rect)}`)
    for (const child of cleanTree.children.slice(0, 5)) {
      console.log(`[extract]   child: tag=${child.tag}, h=${child.rect.h}, w=${child.rect.w}, children=${child.children.length}`)
      for (const gc of child.children.slice(0, 5)) {
        console.log(`[extract]     gc: tag=${gc.tag}, h=${gc.rect.h}, w=${gc.rect.w}, children=${gc.children.length}, text=${gc.text?.slice(0, 30) || ''}`)
      }
    }

    // Step 3: Segmentar em secoes
    console.log('[extract] Step 3/7: Segmentando secoes...')
    const sections = detectSections(cleanTree)
    console.log(`[extract] Secoes detectadas: ${sections.length} (${sections.map((s) => s.kind).join(', ')})`)
    for (const s of sections) {
      console.log(`[extract]   section: kind=${s.kind}, tag=${s.node.tag}, h=${s.node.rect.h}, children=${s.node.children.length}, bg=${s.bgColor || 'none'}`)
    }

    if (sections.length === 0) {
      res.json({
        success: false,
        error: 'Nenhuma secao detectada na pagina. O site pode ser uma SPA que nao renderizou.',
        craftJson: '',
        colorPalette: null,
        fontFamily: null,
        sectionCount: 0,
        title,
      })
      return
    }

    // Step 4: Inferir layout semantico
    console.log('[extract] Step 4/7: Inferindo layout...')
    const layout = inferLayout(sections)
    console.log(`[extract] Layout: ${countLayoutNodes(layout)} nos (${layout.kind}, ${layout.kind === 'Page' ? layout.children.length : 0} filhos diretos)`)

    // Step 5: Extrair tokens de design (usar arvore RAW para dados completos)
    console.log('[extract] Step 5/7: Extraindo tokens...')
    const tokens = extractTokens(rawTree)
    console.log(`[extract] Paleta: primary=${tokens.colorPalette.primary}, accent=${tokens.colorPalette.accent}, font=${tokens.typography.fontFamily}`)

    // Step 6: Sanitizar (substituir conteudo por placeholders)
    console.log('[extract] Step 6/7: Sanitizando...')
    const sanitized = sanitize(layout)

    // Step 7: Exportar para Craft.js JSON
    console.log('[extract] Step 7/7: Exportando Craft.js JSON...')
    const result = toCraftJson(sanitized, tokens, title)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[extract] Concluido em ${elapsed}s (${result.sectionCount} secoes)`)

    res.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`[extract] Erro: ${msg}`)

    res.status(500).json({
      success: false,
      error: msg,
      craftJson: '',
      colorPalette: null,
      fontFamily: null,
      sectionCount: 0,
      title: null,
    })
  } finally {
    isExtracting = false
  }
}

function countNodes(node: { children: unknown[] }): number {
  let count = 1
  for (const child of node.children) {
    if (child && typeof child === 'object' && 'children' in child) {
      count += countNodes(child as { children: unknown[] })
    }
  }
  return count
}

function countLayoutNodes(node: { kind: string; children?: unknown[] }): number {
  let count = 1
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === 'object' && 'kind' in child) {
        count += countLayoutNodes(child as { kind: string; children?: unknown[] })
      }
    }
  }
  return count
}
