// ─── Inferencia: BoxNode → LayoutNode (estrutura semantica) ──

import type { BoxNode } from '../types/box-node.js'
import type { LayoutNode, LayoutStyle, SectionKind } from '../types/layout-node.js'
import type { SectionCandidate } from './segment.js'
import {
  areHorizontallyAligned,
  detectGridPattern,
  groupByRows,
  widthCoverageRatio,
} from '../utils/geometry.js'
import { isTransparent, rgbToHex } from '../utils/color.js'

const ROW_Y_TOLERANCE = 30
const GRID_SIZE_TOLERANCE = 0.2

/**
 * Converte secoes segmentadas em uma arvore LayoutNode semantica.
 */
export function inferLayout(sections: SectionCandidate[]): LayoutNode {
  const page: LayoutNode = {
    kind: 'Page',
    children: sections.map((s) => inferSectionLayout(s)),
  }
  return page
}

// ─── Secao ───────────────────────────────────────────────────

function inferSectionLayout(section: SectionCandidate): LayoutNode {
  const { node, kind } = section
  const style = extractLayoutStyle(node)

  // NavBar: componente especial
  if (kind === 'navbar') {
    return buildNavBarLayout(node, style)
  }

  // Inferir filhos da secao
  const children = inferChildren(node, node.rect.w)

  return {
    kind: 'Section',
    sectionKind: kind,
    style,
    children,
  }
}

// ─── NavBar ──────────────────────────────────────────────────

function buildNavBarLayout(node: BoxNode, style: LayoutStyle): LayoutNode {
  // Contar links e detectar CTA
  let linkCount = 0
  let hasCta = false

  function walk(n: BoxNode): void {
    if (n.tag === 'a' || (n.tag === 'button-like' && n.text)) {
      linkCount++
    }
    if (n.tag === 'button-like' || n.tag === 'button') {
      hasCta = true
    }
    n.children.forEach(walk)
  }

  walk(node)

  return {
    kind: 'NavBar',
    style,
    logoChildren: [],
    linkCount: Math.max(linkCount - (hasCta ? 1 : 0), 3),
    hasCta,
  }
}

// ─── Inferencia recursiva de filhos ──────────────────────────

function inferChildren(node: BoxNode, parentWidth: number): LayoutNode[] {
  const visibleChildren = node.children.filter(
    (c) => c.rect.w > 2 && c.rect.h > 2,
  )

  if (visibleChildren.length === 0) {
    // Sem filhos visiveis: tratar como folha
    const leaf = classifyLeafForce(node)
    return leaf ? [leaf] : []
  }

  // Se so tem 1 filho, checar se e container central ou recursar
  if (visibleChildren.length === 1) {
    const child = visibleChildren[0]

    // Verificar se e um container centralizado (max-width + margin auto)
    if (isCentralContainer(child, parentWidth)) {
      const innerChildren = inferChildren(child, child.rect.w)
      const containerStyle = extractLayoutStyle(child)
      return [
        {
          kind: 'Container',
          style: {
            ...containerStyle,
            maxWidth: `${child.rect.w}px`,
          },
          children: innerChildren,
        },
      ]
    }

    return inferChildren(child, parentWidth)
  }

  // Multiplos filhos: inferir layout (Row, Grid, ou Column)
  return inferMultipleChildren(visibleChildren, parentWidth)
}

function inferMultipleChildren(
  children: BoxNode[],
  parentWidth: number,
): LayoutNode[] {
  const rects = children.map((c) => c.rect)

  // 1. Tentar Grid (3+ itens de tamanho similar)
  if (children.length >= 3) {
    const gridResult = detectGridPattern(rects, GRID_SIZE_TOLERANCE)
    if (gridResult.isGrid) {
      const gridStyle = extractLayoutStyle(children[0])
      return [
        {
          kind: 'Grid',
          style: {
            ...gridStyle,
            backgroundColor: undefined, // Grid nao herda bg dos filhos
          },
          columns: gridResult.columns,
          children: children.map((c) => inferChildNode(c, parentWidth)),
        },
      ]
    }
  }

  // 2. Agrupar por linhas (Y similar)
  const rows = groupByRows(rects, ROW_Y_TOLERANCE)

  if (rows.length === 1 && children.length > 1) {
    // Todos na mesma linha: Row
    if (areHorizontallyAligned(rects, ROW_Y_TOLERANCE)) {
      const coverage = widthCoverageRatio(rects, { x: 0, y: 0, w: parentWidth, h: 0 })
      if (coverage > 0.4) {
        return [
          {
            kind: 'Row',
            style: { flexDirection: 'row', gap: estimateGap(children) },
            children: children.map((c) => ({
              kind: 'Column' as const,
              style: {
                ...extractLayoutStyle(c),
                width: `${Math.round((c.rect.w / parentWidth) * 100)}%`,
              },
              children: inferChildren(c, c.rect.w),
            })),
          },
        ]
      }
    }
  }

  // 3. Multiplas linhas ou stack vertical: processar cada filho individualmente
  // Se ha linhas claras, criar Rows
  if (rows.length > 1 && rows.some((r) => r.length > 1)) {
    const result: LayoutNode[] = []
    for (const row of rows) {
      const rowChildren = children.filter((c) =>
        row.some(
          (r) => Math.abs(r.x - c.rect.x) < 5 && Math.abs(r.y - c.rect.y) < 5,
        ),
      )

      if (rowChildren.length > 1 && areHorizontallyAligned(rowChildren.map((c) => c.rect))) {
        result.push({
          kind: 'Row',
          style: { flexDirection: 'row', gap: estimateGap(rowChildren) },
          children: rowChildren.map((c) => ({
            kind: 'Column' as const,
            style: {
              ...extractLayoutStyle(c),
              width: `${Math.round((c.rect.w / parentWidth) * 100)}%`,
            },
            children: inferChildren(c, c.rect.w),
          })),
        })
      } else {
        // Itens individuais na coluna
        for (const c of rowChildren) {
          result.push(inferChildNode(c, parentWidth))
        }
      }
    }
    return result
  }

  // 4. Default: cada filho como item de coluna
  return children.map((c) => inferChildNode(c, parentWidth))
}

// ─── Classificacao de no individual ──────────────────────────

function inferChildNode(node: BoxNode, parentWidth: number): LayoutNode {
  // Folha textual
  const leaf = classifyLeaf(node)
  if (leaf) return leaf

  // Container com filhos
  const style = extractLayoutStyle(node)
  const children = inferChildren(node, node.rect.w)

  // Se e container centralizado
  if (isCentralContainer(node, parentWidth)) {
    return {
      kind: 'Container',
      style: {
        ...style,
        maxWidth: `${node.rect.w}px`,
      },
      children,
    }
  }

  return {
    kind: 'Container',
    style,
    children,
  }
}

/**
 * Classifica um nó como folha quando chamado do inferChildNode (pode ter filhos).
 * Retorna null se o nó deve ser tratado como container.
 */
function classifyLeaf(node: BoxNode): LayoutNode | null {
  // Imagem
  if (node.isImg) {
    return {
      kind: 'Image',
      style: extractLayoutStyle(node),
      placeholder: true,
    }
  }

  // Video -> placeholder de imagem
  if (node.isVideo) {
    return {
      kind: 'Image',
      style: {
        ...extractLayoutStyle(node),
        minHeight: Math.max(node.rect.h, 200),
      },
      placeholder: true,
    }
  }

  // Botao
  if (node.tag === 'button-like' || node.tag === 'button') {
    return {
      kind: 'Button',
      style: extractLayoutStyle(node),
      text: node.text || findDeepText(node) || 'Saiba Mais',
    }
  }

  // Heading (h1-h4) — sempre tratar como texto, mesmo com children inline
  if (/^h[1-4]$/.test(node.tag)) {
    return {
      kind: 'Text',
      style: extractLayoutStyle(node),
      text: node.text || findDeepText(node) || '',
      variant: node.tag as 'h1' | 'h2' | 'h3' | 'h4',
    }
  }

  // <p>, <li>, <span> com texto direto (sem filhos)
  if (node.text && node.children.length === 0) {
    return classifyTextNode(node, node.text)
  }

  // <p> ou texto block com children inline — tratar como texto concatenado
  if (isTextBlockTag(node.tag) && node.children.length > 0 && allChildrenAreInline(node)) {
    const text = collectAllText(node)
    if (text) {
      return classifyTextNode(node, text)
    }
  }

  // <a> sem estilos de botao mas com texto -> link como texto
  if (node.tag === 'a' && (node.text || findDeepText(node))) {
    return {
      kind: 'Text',
      style: extractLayoutStyle(node),
      text: node.text || findDeepText(node) || '',
      variant: 'span',
    }
  }

  // Se o no nao tem filhos mas tambem nao e classificavel, ignorar
  if (node.children.length === 0 && !node.text) {
    return null
  }

  return null // Nao e folha, sera processado como container
}

/**
 * Classifica um nó como folha FORÇADAMENTE — chamado quando sabemos que não tem filhos visíveis.
 * Mais agressivo que classifyLeaf: ignora node.children.length.
 */
function classifyLeafForce(node: BoxNode): LayoutNode | null {
  // Imagem
  if (node.isImg) {
    return {
      kind: 'Image',
      style: extractLayoutStyle(node),
      placeholder: true,
    }
  }

  // Video
  if (node.isVideo) {
    return {
      kind: 'Image',
      style: { ...extractLayoutStyle(node), minHeight: Math.max(node.rect.h, 200) },
      placeholder: true,
    }
  }

  // Botao
  if (node.tag === 'button-like' || node.tag === 'button') {
    return {
      kind: 'Button',
      style: extractLayoutStyle(node),
      text: node.text || findDeepText(node) || 'Saiba Mais',
    }
  }

  // Heading
  if (/^h[1-4]$/.test(node.tag)) {
    return {
      kind: 'Text',
      style: extractLayoutStyle(node),
      text: node.text || findDeepText(node) || '',
      variant: node.tag as 'h1' | 'h2' | 'h3' | 'h4',
    }
  }

  // Qualquer nó com texto — ignorar node.children.length (filhos já foram filtrados como invisíveis)
  const text = node.text || collectAllText(node) || findDeepText(node)
  if (text) {
    return classifyTextNode(node, text)
  }

  // <a> com texto profundo
  if (node.tag === 'a') {
    const linkText = findDeepText(node)
    if (linkText) {
      return {
        kind: 'Text',
        style: extractLayoutStyle(node),
        text: linkText,
        variant: 'span',
      }
    }
  }

  return null
}

function classifyTextNode(node: BoxNode, text: string): LayoutNode {
  const fontSize = parsePx(node.computed.fontSize)
  const fontWeight = parseInt(node.computed.fontWeight || '400')

  // Texto grande e bold -> heading
  if (fontSize && fontSize >= 24 && fontWeight >= 600) {
    return {
      kind: 'Text',
      style: extractLayoutStyle(node),
      text,
      variant: fontSize >= 32 ? 'h1' : 'h2',
    }
  }

  return {
    kind: 'Text',
    style: extractLayoutStyle(node),
    text,
    variant: 'p',
  }
}

function isTextBlockTag(tag: string): boolean {
  return ['p', 'li', 'label', 'blockquote', 'figcaption', 'td', 'th', 'dt', 'dd'].includes(tag)
}

function allChildrenAreInline(node: BoxNode): boolean {
  const inlineTags = new Set(['span', 'a', 'strong', 'em', 'b', 'i', 'small', 'mark', 'br', 'sub', 'sup', 'abbr', 'code', 'time'])
  return node.children.every((c) => inlineTags.has(c.tag) || (c.text && c.children.length === 0))
}

function collectAllText(node: BoxNode): string | null {
  const parts: string[] = []
  if (node.text) parts.push(node.text)
  for (const child of node.children) {
    const childText = collectAllText(child)
    if (childText) parts.push(childText)
  }
  const combined = parts.join(' ').trim()
  return combined.length > 0 ? combined : null
}

// ─── Helpers ─────────────────────────────────────────────────

function extractLayoutStyle(node: BoxNode): LayoutStyle {
  const c = node.computed
  const style: LayoutStyle = {}

  // Background
  if (c.backgroundColor && !isTransparent(c.backgroundColor)) {
    style.backgroundColor = rgbToHex(c.backgroundColor) || c.backgroundColor
  }
  if (c.backgroundImage && c.backgroundImage !== 'none') {
    style.backgroundImage = c.backgroundImage
    // Tentar extrair gradiente
    const gradMatch = c.backgroundImage.match(
      /linear-gradient\(\s*([\d.]+deg)?\s*,?\s*(#[0-9a-f]+|rgb[^)]+\))\s*,\s*(#[0-9a-f]+|rgb[^)]+\))/i,
    )
    if (gradMatch) {
      style.gradientDirection = gradMatch[1] || '135deg'
      style.gradientFrom = rgbToHex(gradMatch[2]) || gradMatch[2]
      style.gradientTo = rgbToHex(gradMatch[3]) || gradMatch[3]
      style.gradientType = 'linear'
    }
  }

  // Texto
  if (c.color) style.color = rgbToHex(c.color) || c.color
  if (c.fontSize) style.fontSize = parsePx(c.fontSize)
  if (c.fontWeight && c.fontWeight !== '400') style.fontWeight = c.fontWeight
  if (c.fontFamily) style.fontFamily = cleanFontFamily(c.fontFamily)
  if (c.textAlign && c.textAlign !== 'start') style.textAlign = c.textAlign
  if (c.lineHeight) style.lineHeight = c.lineHeight
  if (c.letterSpacing && c.letterSpacing !== '0px') style.letterSpacing = c.letterSpacing

  // Box model
  const pt = parsePx(c.paddingTop) || 0
  const pb = parsePx(c.paddingBottom) || 0
  const pl = parsePx(c.paddingLeft) || 0
  const pr = parsePx(c.paddingRight) || 0
  if (pt > 0 || pb > 0) style.paddingY = Math.round((pt + pb) / 2)
  if (pl > 0 || pr > 0) style.paddingX = Math.round((pl + pr) / 2)
  if (pt === pb && pl === pr && pt === pl && pt > 0) {
    style.padding = pt
    delete style.paddingX
    delete style.paddingY
  }

  // Layout
  if (c.gap) style.gap = parsePx(c.gap)
  if (c.flexDirection) style.flexDirection = c.flexDirection
  if (c.justifyContent && c.justifyContent !== 'normal') style.justifyContent = c.justifyContent
  if (c.alignItems && c.alignItems !== 'normal') style.alignItems = c.alignItems

  // Decoracao
  if (c.borderRadius) style.borderRadius = parsePx(c.borderRadius)
  if (c.boxShadow) style.boxShadow = c.boxShadow
  if (c.border && c.border !== '0px none') style.border = c.border

  // Dimensoes
  if (c.minHeight) style.minHeight = parsePx(c.minHeight)
  if (c.maxWidth) style.maxWidth = c.maxWidth
  if (c.opacity && c.opacity !== '1') style.opacity = parseFloat(c.opacity)

  return style
}

function parsePx(val: string | undefined): number | undefined {
  if (!val) return undefined
  const num = parseFloat(val)
  return isNaN(num) ? undefined : Math.round(num)
}

function cleanFontFamily(raw: string): string {
  // Pegar primeira font da lista
  const first = raw.split(',')[0].trim().replace(/['"]/g, '')
  return first
}

function findDeepText(node: BoxNode): string | null {
  if (node.text) return node.text
  for (const child of node.children) {
    const t = findDeepText(child)
    if (t) return t
  }
  return null
}

function isCentralContainer(node: BoxNode, parentWidth: number): boolean {
  // Container centralizado: largura < parentWidth com margem auto
  const widthRatio = node.rect.w / parentWidth
  if (widthRatio > 0.95) return false // Full-width, nao e central
  if (widthRatio < 0.5) return false // Muito estreito

  // Verificar se esta centrado (margem similar dos dois lados)
  const leftMargin = node.rect.x
  const rightMargin = parentWidth - (node.rect.x + node.rect.w)
  const marginDiff = Math.abs(leftMargin - rightMargin)

  return marginDiff < 50 && node.rect.w > 300
}

function estimateGap(children: BoxNode[]): number {
  if (children.length < 2) return 16

  const sorted = [...children].sort((a, b) => a.rect.x - b.rect.x)
  const gaps: number[] = []

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].rect.x - (sorted[i - 1].rect.x + sorted[i - 1].rect.w)
    if (gap > 0) gaps.push(gap)
  }

  if (gaps.length === 0) return 16
  return Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
}
