// ─── Tokenizacao: extrair paleta de cores e tipografia ───────

import type { BoxNode } from '../types/box-node.js'
import type { DesignTokens, ColorPalette } from '../types/design-tokens.js'
import { rgbToHex, isTransparent, isWhiteish, isDark } from '../utils/color.js'

/**
 * Percorre toda a arvore de BoxNodes e extrai tokens de design:
 * - Paleta de cores (ponderada por area/frequencia)
 * - Tipografia (font-family, font-size base)
 */
export function extractTokens(root: BoxNode): DesignTokens {
  const bgColors = new Map<string, number>() // cor -> area total
  const textColors = new Map<string, number>() // cor -> comprimento texto
  const fontFamilies = new Map<string, number>() // font -> area
  const buttonBgColors: string[] = []
  const gradients: string[] = []

  function walk(node: BoxNode): void {
    const area = node.rect.w * node.rect.h

    // Background colors ponderados por area
    const bg = node.computed.backgroundColor
    if (bg && !isTransparent(bg)) {
      const hex = rgbToHex(bg)
      if (hex) {
        bgColors.set(hex, (bgColors.get(hex) || 0) + area)
      }
    }

    // Gradientes
    const bgImg = node.computed.backgroundImage
    if (bgImg && bgImg.includes('gradient')) {
      gradients.push(bgImg)
    }

    // Text colors ponderados por texto
    if (node.text && node.computed.color) {
      const hex = rgbToHex(node.computed.color)
      if (hex) {
        textColors.set(hex, (textColors.get(hex) || 0) + node.text.length)
      }
    }

    // Font families ponderados por area
    if (node.computed.fontFamily) {
      const primary = node.computed.fontFamily.split(',')[0].trim().replace(/['"]/g, '')
      if (primary && primary !== 'inherit' && primary !== 'sans-serif' && primary !== 'serif') {
        fontFamilies.set(primary, (fontFamilies.get(primary) || 0) + area)
      }
    }

    // Accent: cor de botoes
    if (
      (node.tag === 'button-like' || node.tag === 'button') &&
      node.computed.backgroundColor &&
      !isTransparent(node.computed.backgroundColor)
    ) {
      const hex = rgbToHex(node.computed.backgroundColor)
      if (hex) buttonBgColors.push(hex)
    }

    node.children.forEach(walk)
  }

  walk(root)

  // Extrair gradiente do primeiro encontrado
  const gradient = parseGradient(gradients[0])

  // Primary: maior area de background (excluindo branco/quase-branco)
  const primaryColor = topEntry(bgColors, (c) => !isWhiteish(c))

  // Accent: cor mais comum em botoes
  const accentColor = mostCommon(buttonBgColors) || primaryColor

  // Background: maior area total
  const backgroundColor = topEntry(bgColors)

  // Text: cor de texto mais usada
  const textColor = topEntry(textColors)

  // FontFamily: mais usada por area
  const fontFamily = topEntry(fontFamilies)

  const colorPalette: ColorPalette = {
    primary: primaryColor,
    accent: accentColor !== primaryColor ? accentColor : null,
    background: backgroundColor,
    text: textColor,
    gradientFrom: gradient?.from || null,
    gradientTo: gradient?.to || null,
    gradientType: gradient?.type || null,
    gradientDirection: gradient?.direction || null,
  }

  return {
    colorPalette,
    typography: {
      fontFamily: fontFamily,
      headingFontFamily: null,
      baseFontSize: 16,
    },
  }
}

// ─── Helpers ─────────────────────────────────────────────────

function topEntry<T extends string>(
  map: Map<T, number>,
  filter?: (key: T) => boolean,
): T | null {
  let best: T | null = null
  let bestVal = 0

  for (const [key, val] of map) {
    if (filter && !filter(key)) continue
    if (val > bestVal) {
      bestVal = val
      best = key
    }
  }

  return best
}

function mostCommon(arr: string[]): string | null {
  if (arr.length === 0) return null
  const freq = new Map<string, number>()
  for (const v of arr) {
    freq.set(v, (freq.get(v) || 0) + 1)
  }
  let best = arr[0]
  let bestCount = 0
  for (const [k, c] of freq) {
    if (c > bestCount) {
      bestCount = c
      best = k
    }
  }
  return best
}

function parseGradient(
  raw: string | undefined,
): { from: string; to: string; type: 'linear' | 'radial'; direction: string } | null {
  if (!raw) return null

  const linearMatch = raw.match(
    /linear-gradient\(\s*([\d.]+deg|to\s+\w+)?\s*,?\s*(#[0-9a-f]+|rgba?\([^)]+\))\s*(?:[\d.]+%)?\s*,\s*(#[0-9a-f]+|rgba?\([^)]+\))/i,
  )
  if (linearMatch) {
    return {
      type: 'linear',
      direction: linearMatch[1] || '135deg',
      from: rgbToHex(linearMatch[2]) || linearMatch[2],
      to: rgbToHex(linearMatch[3]) || linearMatch[3],
    }
  }

  const radialMatch = raw.match(
    /radial-gradient\(\s*([^,]+)?\s*,?\s*(#[0-9a-f]+|rgba?\([^)]+\))\s*,\s*(#[0-9a-f]+|rgba?\([^)]+\))/i,
  )
  if (radialMatch) {
    return {
      type: 'radial',
      direction: radialMatch[1]?.trim() || 'circle at center',
      from: rgbToHex(radialMatch[2]) || radialMatch[2],
      to: rgbToHex(radialMatch[3]) || radialMatch[3],
    }
  }

  return null
}
