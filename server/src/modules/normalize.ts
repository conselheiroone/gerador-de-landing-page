// ─── Normalizacao: limpar ruido, colapsar wrappers, merge texto ──

import type { BoxNode } from '../types/box-node.js'
import { isTransparent } from '../utils/color.js'

const WRAPPER_TAGS = new Set([
  'div', 'section', 'article', 'main', 'aside', 'span', 'figure', 'figcaption',
])

const REMOVE_TAGS = new Set([
  'script', 'style', 'noscript', 'link', 'meta', 'iframe',
])

/**
 * Pipeline de normalizacao do BoxNode tree.
 * Remove invisibles, colapsa wrappers triviais, merge texto inline.
 */
export function cleanBoxTree(root: BoxNode): BoxNode {
  let tree = removeInvisible(root)
  tree = collapseWrappers(tree)
  tree = mergeInlineText(tree)
  tree = markButtons(tree)
  return tree
}

// ─── Remove invisivel ────────────────────────────────────────

function removeInvisible(node: BoxNode): BoxNode {
  const filtered = node.children
    .filter((child) => {
      // Remover tags que nao devem existir
      if (REMOVE_TAGS.has(child.tag)) return false

      // Area zero ou muito pequena
      if (child.rect.w < 2 && child.rect.h < 2) return false

      // Opacity 0
      if (child.computed.opacity === '0') return false

      // Off-screen muito longe
      if (child.rect.x < -2000 || child.rect.y < -5000) return false
      if (child.rect.x > 5000) return false

      return true
    })
    .map((child) => removeInvisible(child))

  return { ...node, children: filtered }
}

// ─── Colapsar wrappers triviais ──────────────────────────────

function hasVisualStyles(computed: Record<string, string>): boolean {
  if (computed.backgroundColor && !isTransparent(computed.backgroundColor)) return true
  if (computed.backgroundImage) return true
  if (computed.border) return true
  if (computed.boxShadow) return true
  if (computed.borderRadius) return true
  if (computed.gap) return true
  if (computed.padding || computed.paddingTop || computed.paddingBottom) return true
  return false
}

function collapseWrappers(node: BoxNode): BoxNode {
  // Primeiro, recursivamente processar filhos
  const processedChildren = node.children.map((c) => collapseWrappers(c))

  // Se tem exatamente 1 filho e e um wrapper generico sem estilos visuais
  if (
    processedChildren.length === 1 &&
    WRAPPER_TAGS.has(node.tag) &&
    !hasVisualStyles(node.computed) &&
    !node.text
  ) {
    const child = processedChildren[0]
    // Verificar se o filho tem rect similar (dentro de 10px)
    const dx = Math.abs(node.rect.x - child.rect.x)
    const dy = Math.abs(node.rect.y - child.rect.y)
    const dw = Math.abs(node.rect.w - child.rect.w)
    const dh = Math.abs(node.rect.h - child.rect.h)

    if (dx < 10 && dy < 10 && dw < 20 && dh < 20) {
      // Herdar o rect do pai (mais acurado) mas manter propriedades do filho
      return {
        ...child,
        rect: node.rect,
        computed: { ...node.computed, ...child.computed },
      }
    }
  }

  return { ...node, children: processedChildren }
}

// ─── Merge de texto inline ───────────────────────────────────

function sameTextStyle(a: Record<string, string>, b: Record<string, string>): boolean {
  const props = ['fontFamily', 'fontSize', 'fontWeight', 'color', 'lineHeight', 'textAlign']
  return props.every((p) => (a[p] || '') === (b[p] || ''))
}

function mergeInlineText(node: BoxNode): BoxNode {
  const newChildren: BoxNode[] = []

  for (const child of node.children) {
    const processed = mergeInlineText(child)

    // Tentar merge com o ultimo child se ambos sao texto inline
    const last = newChildren[newChildren.length - 1]
    if (
      last &&
      last.text &&
      processed.text &&
      last.children.length === 0 &&
      processed.children.length === 0 &&
      isInlineTag(last.tag) &&
      isInlineTag(processed.tag) &&
      sameTextStyle(last.computed, processed.computed) &&
      Math.abs(last.rect.y - processed.rect.y) < 5 // Mesma linha
    ) {
      // Merge: combinar textos
      newChildren[newChildren.length - 1] = {
        ...last,
        text: `${last.text} ${processed.text}`,
        rect: {
          ...last.rect,
          w: processed.rect.x + processed.rect.w - last.rect.x,
        },
      }
    } else {
      newChildren.push(processed)
    }
  }

  return { ...node, children: newChildren }
}

function isInlineTag(tag: string): boolean {
  return ['span', 'a', 'strong', 'em', 'b', 'i', 'small', 'mark'].includes(tag)
}

// ─── Marcar botoes ───────────────────────────────────────────

function markButtons(node: BoxNode): BoxNode {
  const children = node.children.map((c) => markButtons(c))

  // <button> sempre como botao
  if (node.tag === 'button') {
    return { ...node, tag: 'button-like', children }
  }

  // <a> com estilos de botao
  if (node.tag === 'a' && hasButtonStyles(node.computed)) {
    return { ...node, tag: 'button-like', children }
  }

  return { ...node, children }
}

function hasButtonStyles(computed: Record<string, string>): boolean {
  const hasBg = computed.backgroundColor && !isTransparent(computed.backgroundColor)
  const hasPadding =
    computed.paddingLeft || computed.paddingRight || computed.paddingTop || computed.paddingBottom
  const hasBorder = computed.border && computed.border !== '0px none'
  const hasRadius = computed.borderRadius && computed.borderRadius !== '0px'
  const hasDisplay = computed.display === 'inline-flex' || computed.display === 'inline-block'

  // Botao: bg + padding, OU borda + padding, OU radius + padding, OU display inline-flex
  return (!!hasBg && !!hasPadding) ||
    (!!hasBorder && !!hasPadding) ||
    (!!hasRadius && !!hasPadding) ||
    (!!hasBg && !!hasDisplay)
}
