// ─── Utilitarios de cor ──────────────────────────────────────

/** Parse rgb(a) string para { r, g, b, a } */
export function parseRgb(color: string): { r: number; g: number; b: number; a: number } | null {
  // rgb(R, G, B) ou rgba(R, G, B, A)
  const rgbMatch = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  )
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    }
  }

  // Hex: #RGB, #RRGGBB
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i)
  if (hexMatch) {
    const hex = hexMatch[1]
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      }
    }
    if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      }
    }
  }

  return null
}

/** Converte RGB para hex */
export function rgbToHex(color: string): string | null {
  const parsed = parseRgb(color)
  if (!parsed) return null
  const { r, g, b } = parsed
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** Verifica se uma cor e escura (luminancia < 0.5) */
export function isDark(color: string): boolean {
  const parsed = parseRgb(color)
  if (!parsed) return false
  // Luminancia relativa simplificada
  const luminance = (0.299 * parsed.r + 0.587 * parsed.g + 0.114 * parsed.b) / 255
  return luminance < 0.5
}

/** Verifica se uma cor e transparente */
export function isTransparent(color: string): boolean {
  if (!color) return true
  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return true
  const parsed = parseRgb(color)
  if (!parsed) return false
  return parsed.a < 0.05
}

/** Verifica se uma cor e branca ou quase branca */
export function isWhiteish(color: string): boolean {
  const parsed = parseRgb(color)
  if (!parsed) return false
  return parsed.r > 240 && parsed.g > 240 && parsed.b > 240 && parsed.a > 0.9
}

/** Contraste entre texto e fundo */
export function textColorForBg(bgColor: string): string {
  return isDark(bgColor) ? '#ffffff' : '#111827'
}
