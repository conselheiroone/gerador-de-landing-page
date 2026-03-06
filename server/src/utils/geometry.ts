// ─── Utilitarios de geometria para inferencia de layout ──────

import type { Rect } from '../types/box-node.js'

/** Verifica se retangulos estao na mesma linha horizontal */
export function areHorizontallyAligned(rects: Rect[], tolerance = 30): boolean {
  if (rects.length < 2) return false

  // Todos devem ter Y similar (dentro da tolerancia)
  const baseY = rects[0].y
  const allSameRow = rects.every((r) => Math.abs(r.y - baseY) < tolerance)

  if (!allSameRow) return false

  // Devem estar lado a lado (X crescente)
  const sorted = [...rects].sort((a, b) => a.x - b.x)
  for (let i = 1; i < sorted.length; i++) {
    // O proximo deve comecar depois (ou perto) do anterior terminar
    const prevEnd = sorted[i - 1].x + sorted[i - 1].w
    if (sorted[i].x < prevEnd - tolerance * 2) return false
  }

  return true
}

/** Verifica se retangulos estao na mesma coluna vertical */
export function areVerticallyStacked(rects: Rect[], tolerance = 30): boolean {
  if (rects.length < 2) return true // Um unico elemento e "stacked"

  const sorted = [...rects].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].y < sorted[i - 1].y - tolerance) return false
  }

  return true
}

/** Detecta padrao de grid (varios itens com dimensoes similares) */
export function detectGridPattern(
  rects: Rect[],
  sizeTolerance = 0.2,
): { isGrid: boolean; columns: number } {
  if (rects.length < 3) return { isGrid: false, columns: 0 }

  // Checar se os tamanhos sao similares
  const avgW = rects.reduce((s, r) => s + r.w, 0) / rects.length
  const avgH = rects.reduce((s, r) => s + r.h, 0) / rects.length

  const similarSize = rects.every(
    (r) =>
      Math.abs(r.w - avgW) / avgW < sizeTolerance &&
      Math.abs(r.h - avgH) / avgH < sizeTolerance,
  )

  if (!similarSize) return { isGrid: false, columns: 0 }

  // Detectar colunas pelas posicoes X
  const xPositions = [...new Set(rects.map((r) => r.x))].sort((a, b) => a - b)
  const xGroups = groupNearValues(xPositions, avgW * 0.15)
  const columns = xGroups.length

  if (columns >= 2 && columns <= 6) {
    return { isGrid: true, columns }
  }

  return { isGrid: false, columns: 0 }
}

/** Agrupa valores proximos */
function groupNearValues(values: number[], tolerance: number): number[][] {
  if (values.length === 0) return []

  const groups: number[][] = [[values[0]]]
  for (let i = 1; i < values.length; i++) {
    const lastGroup = groups[groups.length - 1]
    if (values[i] - lastGroup[0] < tolerance) {
      lastGroup.push(values[i])
    } else {
      groups.push([values[i]])
    }
  }
  return groups
}

/** Agrupa retangulos por linhas (Y similar) */
export function groupByRows(rects: Rect[], tolerance = 30): Rect[][] {
  const sorted = [...rects].sort((a, b) => a.y - b.y)
  const rows: Rect[][] = []
  let currentRow: Rect[] = []
  let currentY = -Infinity

  for (const r of sorted) {
    if (Math.abs(r.y - currentY) > tolerance) {
      if (currentRow.length > 0) rows.push(currentRow)
      currentRow = [r]
      currentY = r.y
    } else {
      currentRow.push(r)
    }
  }
  if (currentRow.length > 0) rows.push(currentRow)

  return rows
}

/** Calcula a fracao da largura do pai que os filhos ocupam */
export function widthCoverageRatio(childRects: Rect[], parentRect: Rect): number {
  if (parentRect.w === 0) return 0
  const totalChildW = childRects.reduce((s, r) => s + r.w, 0)
  return totalChildW / parentRect.w
}

/** Verifica se um retangulo e "full-width" (>= threshold do parent) */
export function isFullWidth(rect: Rect, viewportWidth: number, threshold = 0.9): boolean {
  return rect.w >= viewportWidth * threshold
}

/** Centro X de um retangulo */
export function centerX(r: Rect): number {
  return r.x + r.w / 2
}

/** Centro Y de um retangulo */
export function centerY(r: Rect): number {
  return r.y + r.h / 2
}
