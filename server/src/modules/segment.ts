// ─── Segmentacao: detectar limites de secao ──────────────────

import type { BoxNode } from '../types/box-node.js'
import type { SectionKind } from '../types/layout-node.js'
import { isFullWidth } from '../utils/geometry.js'
import { isTransparent, isDark, rgbToHex } from '../utils/color.js'

export interface SectionCandidate {
  node: BoxNode
  kind: SectionKind
  bgColor: string | null
  order: number
}

/**
 * Identifica as secoes de uma pagina a partir da arvore normalizada.
 * Retorna candidatos ordenados por posicao Y.
 */
export function detectSections(root: BoxNode): SectionCandidate[] {
  const viewportWidth = root.rect.w || 1440

  // Desembrulhar wrappers de nivel superior (body -> single wrapper -> children)
  const effectiveRoot = unwrapTopLevel(root)

  let candidates: SectionCandidate[] = []

  // Estrategia 1: filhos full-width diretos
  const fullWidthChildren = effectiveRoot.children.filter((c) =>
    isFullWidth(c.rect, viewportWidth, 0.85),
  )

  if (fullWidthChildren.length >= 2) {
    candidates = fullWidthChildren.map((node, i) => ({
      node,
      kind: inferSectionKind(node, i, fullWidthChildren.length, viewportWidth),
      bgColor: extractBgColor(node.computed),
      order: i,
    }))
  }

  // Estrategia 2: tags semanticas se a primeira falhou
  if (candidates.length < 2) {
    candidates = findSemanticSections(effectiveRoot, viewportWidth)
  }

  // Estrategia 3: todos os filhos diretos como secoes
  if (candidates.length < 2) {
    candidates = effectiveRoot.children
      .filter((c) => c.rect.h > 50)
      .map((node, i) => ({
        node,
        kind: inferSectionKind(node, i, effectiveRoot.children.length, viewportWidth),
        bgColor: extractBgColor(node.computed),
        order: i,
      }))
  }

  // Expandir secoes genericas grandes em sub-secoes
  candidates = splitLargeGenericSections(candidates, viewportWidth)

  // Ordenar por posicao Y
  candidates.sort((a, b) => a.node.rect.y - b.node.rect.y)

  // Re-inferir kinds com posicao relativa
  candidates.forEach((c, i) => {
    c.kind = inferSectionKind(c.node, i, candidates.length, viewportWidth)
  })

  return candidates
}

// ─── Split de secoes genericas grandes ───────────────────────

function splitLargeGenericSections(
  sections: SectionCandidate[],
  viewportWidth: number,
): SectionCandidate[] {
  const result: SectionCandidate[] = []

  for (const section of sections) {
    // Apenas split de secoes genericas/hero que sao muito altas
    if (section.kind !== 'generic' && section.kind !== 'hero') {
      result.push(section)
      continue
    }

    // Se a secao nao e muito alta, nao tentar dividir
    if (section.node.rect.h < 800) {
      result.push(section)
      continue
    }

    // Recursivamente encontrar sub-secoes
    const subNodes = recursiveSplit(section.node, viewportWidth, 0)

    if (subNodes.length >= 2) {
      console.log(`[segment] Dividindo secao (h=${section.node.rect.h}) em ${subNodes.length} sub-secoes`)
      for (const child of subNodes) {
        console.log(`[segment]   sub: tag=${child.tag}, h=${child.rect.h}, children=${child.children.length}`)
        result.push({
          node: child,
          kind: 'generic',
          bgColor: extractBgColor(child.computed),
          order: result.length,
        })
      }
    } else {
      result.push(section)
    }
  }

  return result
}

/**
 * Recursivamente desce pela arvore ate encontrar o nivel onde existem
 * multiplos filhos significativos (as verdadeiras secoes visuais).
 */
function recursiveSplit(node: BoxNode, viewportWidth: number, depth: number): BoxNode[] {
  if (depth > 12) return [node]

  // Desembrulhar cadeia de filhos unicos
  let target = node
  for (let i = 0; i < 8; i++) {
    if (target.children.length === 1 && target.children[0].children.length >= 1) {
      target = target.children[0]
    } else {
      break
    }
  }

  // Encontrar filhos significativos (visiveis e com tamanho relevante)
  const significant = target.children.filter(
    (c) => c.rect.h > 30 && c.rect.w > viewportWidth * 0.3,
  )

  // Se encontrou 2+ filhos significativos, temos as sub-secoes
  if (significant.length >= 2) {
    // Para cada filho alto, tentar dividir recursivamente
    const results: BoxNode[] = []
    for (const child of significant) {
      if (child.rect.h > 800 && child.children.length > 0) {
        const subSplit = recursiveSplit(child, viewportWidth, depth + 1)
        if (subSplit.length >= 2) {
          results.push(...subSplit)
        } else {
          results.push(child)
        }
      } else {
        results.push(child)
      }
    }
    return results
  }

  // Se tem apenas 1 filho significativo e ele e alto, descer nele
  if (significant.length === 1 && significant[0].rect.h > 800) {
    return recursiveSplit(significant[0], viewportWidth, depth + 1)
  }

  // Nao conseguiu dividir — retornar o proprio no
  return [target]
}

// ─── Helpers ─────────────────────────────────────────────────

function unwrapTopLevel(root: BoxNode): BoxNode {
  // Recursivamente desembrulhar wrappers de nivel superior ate achar multiplos filhos significativos
  let current = root
  for (let i = 0; i < 6; i++) {
    if (current.children.length === 1) {
      const single = current.children[0]
      if (['div', 'main', 'article', 'section', 'header'].includes(single.tag) && single.children.length >= 1) {
        current = single
        continue
      }
    }
    break
  }
  return current
}

function findSemanticSections(root: BoxNode, viewportWidth: number): SectionCandidate[] {
  // Tags que representam secoes individuais
  const sectionTags = new Set(['section', 'footer', 'article'])
  // Tags que sao wrappers — recursar dentro deles para achar secoes
  const wrapperTags = new Set(['main', 'header', 'nav'])
  const found: SectionCandidate[] = []

  function walk(node: BoxNode): void {
    if (sectionTags.has(node.tag) && node.rect.h > 30) {
      found.push({
        node,
        kind: 'generic',
        bgColor: extractBgColor(node.computed),
        order: found.length,
      })
      return // Nao recursar dentro de secoes semanticas
    }

    // Para main/header/nav: verificar se tem secoes dentro
    if (wrapperTags.has(node.tag) && node.rect.h > 30) {
      const innerSections: BoxNode[] = []
      function findInnerSections(n: BoxNode): void {
        if (sectionTags.has(n.tag) && n.rect.h > 30) {
          innerSections.push(n)
          return
        }
        n.children.forEach(findInnerSections)
      }
      node.children.forEach(findInnerSections)

      if (innerSections.length >= 2) {
        // Encontrou secoes internas — adicionar como secoes separadas
        // Mas primeiro adicionar nav/header como secao propria se for nav
        if (node.tag === 'nav' || node.tag === 'header') {
          found.push({
            node,
            kind: 'generic',
            bgColor: extractBgColor(node.computed),
            order: found.length,
          })
        }
        for (const inner of innerSections) {
          found.push({
            node: inner,
            kind: 'generic',
            bgColor: extractBgColor(inner.computed),
            order: found.length,
          })
        }
        return
      }

      // Sem secoes internas — tratar o wrapper como secao
      found.push({
        node,
        kind: 'generic',
        bgColor: extractBgColor(node.computed),
        order: found.length,
      })
      return
    }

    for (const child of node.children) {
      walk(child)
    }
  }

  walk(root)

  // Atribuir kinds
  found.forEach((c, i) => {
    c.kind = inferSectionKind(c.node, i, found.length, viewportWidth)
  })

  return found
}

function inferSectionKind(
  node: BoxNode,
  index: number,
  total: number,
  viewportWidth: number,
): SectionKind {
  const tag = node.tag
  const h = node.rect.h
  const linkCount = countLinks(node)
  const hasH1 = hasTag(node, 'h1')
  const hasH2 = hasTag(node, 'h2')
  const hasH3 = hasTag(node, 'h3')
  const hasBtn = hasTag(node, 'button') || hasTag(node, 'button-like')
  const bgColor = extractBgColor(node.computed)

  // NavBar: primeira secao, baixa, com links
  if (index === 0 && (tag === 'nav' || tag === 'header' || (h < 150 && linkCount > 2))) {
    return 'navbar'
  }

  // NavBar: qualquer secao baixa nas primeiras posicoes com muitos links
  if (index <= 1 && h < 120 && linkCount > 3) {
    return 'navbar'
  }

  // Footer: ultima secao, tag footer ou aspecto de footer
  if (index === total - 1 && (tag === 'footer' || isLikelyFooter(node))) {
    return 'footer'
  }

  // Footer: penultima secao se parecer footer
  if (index >= total - 2 && tag === 'footer') {
    return 'footer'
  }

  // Hero: primeiras secoes, alta, com H1 ou texto grande
  if ((index === 0 || index === 1) && h > 300 && (hasH1 || hasBigText(node))) {
    return 'hero'
  }

  // Hero: primeira secao muito alta mesmo sem H1 explicito
  if (index === 0 && h > 600) {
    return 'hero'
  }

  // CTA: secao com botao e heading (relaxar restricoes de bg)
  if (hasBtn && (hasH1 || hasH2) && h < 500) {
    return 'cta'
  }

  // Features: secao com cards/grid (3+ filhos com tamanhos similares)
  if (hasGridLikeChildren(node)) {
    return 'features'
  }

  // Testimonials: cards com texto longo (citacoes)
  if (hasTestimonialPattern(node)) {
    return 'testimonials'
  }

  return 'generic'
}

function hasBigText(node: BoxNode): boolean {
  // Procurar texto com fontSize >= 28px
  function walk(n: BoxNode): boolean {
    const fs = parseFloat(n.computed.fontSize || '0')
    const fw = parseInt(n.computed.fontWeight || '400')
    if (fs >= 28 && fw >= 600 && n.text) return true
    return n.children.some(walk)
  }
  return walk(node)
}

function countLinks(node: BoxNode): number {
  let count = 0
  if (node.tag === 'a') count++
  for (const child of node.children) {
    count += countLinks(child)
  }
  return count
}

function hasTag(node: BoxNode, tagName: string): boolean {
  if (node.tag === tagName) return true
  return node.children.some((c) => hasTag(c, tagName))
}

function isLikelyFooter(node: BoxNode): boolean {
  const bgColor = extractBgColor(node.computed)
  const hasManyLinks = countLinks(node) > 4
  const hasDarkBg = bgColor ? isDark(bgColor) : false
  return hasManyLinks && hasDarkBg
}

function hasGridLikeChildren(node: BoxNode): boolean {
  // Procurar em ate 3 niveis
  function findGridContainer(n: BoxNode, depth: number): boolean {
    if (depth > 3) return false
    const directChildren = n.children.filter((c) => c.rect.w > 50 && c.rect.h > 50)
    if (directChildren.length >= 3) {
      // Verificar tamanhos similares
      const widths = directChildren.map((c) => c.rect.w)
      const avg = widths.reduce((s, w) => s + w, 0) / widths.length
      const allSimilar = widths.every((w) => Math.abs(w - avg) / avg < 0.25)
      if (allSimilar) return true
    }
    return n.children.some((c) => findGridContainer(c, depth + 1))
  }
  return findGridContainer(node, 0)
}

function hasTestimonialPattern(node: BoxNode): boolean {
  // Muitas citacoes com imagens circulares (borderRadius 50%)
  let circleImgs = 0
  let longTexts = 0

  function walk(n: BoxNode): void {
    if (n.isImg && n.computed.borderRadius?.includes('50%')) circleImgs++
    if (n.text && n.text.length > 50) longTexts++
    n.children.forEach(walk)
  }

  walk(node)
  return circleImgs >= 2 && longTexts >= 2
}

function extractBgColor(computed: Record<string, string>): string | null {
  const bg = computed.backgroundColor
  if (bg && !isTransparent(bg)) {
    return rgbToHex(bg) || bg
  }
  return null
}
