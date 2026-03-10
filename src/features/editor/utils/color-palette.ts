/**
 * Sistema de Paleta de Cores Harmônica
 *
 * Gera uma paleta completa de cores derivadas das cores primária e secundária
 * definidas pelo usuário, garantindo consistência visual em toda a landing page.
 *
 * REGRAS:
 * - Todas as cores de UI devem ser derivadas de primary ou secondary
 * - Cores neutras (branco, preto, cinzas) são permitidas como base
 * - Cores de texto devem considerar contraste com o fundo
 */

// ─── Conversões básicas ─────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  // Suporta formato curto (#fff) e longo (#ffffff)
  const fullHex = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h
  return [
    parseInt(fullHex.substring(0, 2), 16),
    parseInt(fullHex.substring(2, 4), 16),
    parseInt(fullHex.substring(4, 6), 16),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${[r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('')}`
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ─── Manipulação de cores ───────────────────────────────────────

/** Clareia uma cor por uma quantidade (0-1) */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount,
  )
}

/** Escurece uma cor por uma quantidade (0-1) */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

/** Verifica se a cor é clara (para decidir cor de texto sobre ela) */
export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex)
  // Fórmula de luminância relativa
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

/** Retorna cor de texto apropriada para contraste */
export function getContrastText(bgColor: string): string {
  return isLightColor(bgColor) ? '#0f172a' : '#ffffff'
}

/** Retorna cor de texto secundária apropriada para contraste */
export function getContrastTextMuted(bgColor: string): string {
  return isLightColor(bgColor) ? '#64748b' : 'rgba(255, 255, 255, 0.7)'
}

/** Mistura duas cores */
export function mix(color1: string, color2: string, weight: number = 0.5): string {
  const [r1, g1, b1] = hexToRgb(color1)
  const [r2, g2, b2] = hexToRgb(color2)
  return rgbToHex(
    r1 * weight + r2 * (1 - weight),
    g1 * weight + g2 * (1 - weight),
    b1 * weight + b2 * (1 - weight),
  )
}

/** Ajusta a saturação de uma cor */
export function saturate(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const gray = 0.2989 * r + 0.587 * g + 0.114 * b
  return rgbToHex(
    Math.min(255, r + (r - gray) * amount),
    Math.min(255, g + (g - gray) * amount),
    Math.min(255, b + (b - gray) * amount),
  )
}

// ─── Gerador de Paleta Harmônica ────────────────────────────────

export interface ColorPalette {
  // ── Cores base ──
  primary: string
  secondary: string

  // ── Variações da primária ──
  primaryDark: string       // darken(primary, 0.3)
  primaryDarker: string     // darken(primary, 0.5)
  primaryLight: string      // lighten(primary, 0.3)
  primaryMid: string        // lighten(primary, 0.38)
  primaryLighter: string    // lighten(primary, 0.6)
  primaryTint: string       // lighten(primary, 0.88) - fundo suave
  primarySoft: string       // lighten(primary, 0.92) - fundo muito suave
  primaryAlpha10: string    // rgba(primary, 0.1)
  primaryAlpha15: string    // rgba(primary, 0.15)
  primaryAlpha30: string    // rgba(primary, 0.3)
  primaryAlpha50: string    // rgba(primary, 0.5)
  primaryAlpha90: string    // rgba(primary, 0.9)

  // ── Variações da secundária ──
  secondaryDark: string     // darken(secondary, 0.2)
  secondaryDarker: string   // darken(secondary, 0.4)
  secondaryLight: string    // lighten(secondary, 0.3)
  secondaryLighter: string  // lighten(secondary, 0.55)
  secondaryTint: string     // lighten(secondary, 0.88)
  secondaryAlpha10: string  // rgba(secondary, 0.1)
  secondaryAlpha30: string  // rgba(secondary, 0.3)
  secondaryAlpha90: string  // rgba(secondary, 0.9)

  // ── Cores de texto (baseadas em contraste) ──
  textOnPrimary: string     // branco ou escuro dependendo do contraste
  textOnSecondary: string
  textOnLight: string       // texto escuro para fundos claros
  textOnDark: string        // texto claro para fundos escuros
  textMuted: string         // texto secundário/cinza
  textMutedOnDark: string   // texto secundário em fundos escuros

  // ── Cores de UI ──
  background: string        // fundo padrão da página
  backgroundAlt: string     // fundo alternativo (seções)
  cardBackground: string    // fundo de cards
  border: string            // bordas sutis
  borderOnDark: string      // bordas em fundos escuros
  divider: string           // divisores
  dividerOnDark: string     // divisores em fundos escuros

  // ── Cores especiais ──
  heroOverlay: string       // gradiente para overlay do hero
  navbarBg: string          // fundo do navbar
  statsBg: string           // fundo da faixa de stats
  ctaBg: string             // fundo do CTA
  glowPrimary: string       // text-shadow glow baseado na primária
  glowLight: string         // text-shadow glow claro
}

/**
 * Gera uma paleta completa de cores harmônicas a partir das cores primária e secundária
 */
export function generatePalette(primary: string, secondary: string): ColorPalette {
  return {
    // Cores base
    primary,
    secondary,

    // Variações da primária
    primaryDark: darken(primary, 0.3),
    primaryDarker: darken(primary, 0.5),
    primaryLight: lighten(primary, 0.3),
    primaryMid: lighten(primary, 0.38),
    primaryLighter: lighten(primary, 0.6),
    primaryTint: lighten(primary, 0.88),
    primarySoft: lighten(primary, 0.92),
    primaryAlpha10: hexToRgba(primary, 0.1),
    primaryAlpha15: hexToRgba(primary, 0.15),
    primaryAlpha30: hexToRgba(primary, 0.3),
    primaryAlpha50: hexToRgba(primary, 0.5),
    primaryAlpha90: hexToRgba(primary, 0.9),

    // Variações da secundária
    secondaryDark: darken(secondary, 0.2),
    secondaryDarker: darken(secondary, 0.4),
    secondaryLight: lighten(secondary, 0.3),
    secondaryLighter: lighten(secondary, 0.55),
    secondaryTint: lighten(secondary, 0.88),
    secondaryAlpha10: hexToRgba(secondary, 0.1),
    secondaryAlpha30: hexToRgba(secondary, 0.3),
    secondaryAlpha90: hexToRgba(secondary, 0.9),

    // Cores de texto
    textOnPrimary: getContrastText(primary),
    textOnSecondary: getContrastText(secondary),
    textOnLight: '#0f172a',
    textOnDark: '#ffffff',
    textMuted: '#64748b',
    textMutedOnDark: 'rgba(255, 255, 255, 0.7)',

    // Cores de UI
    background: '#ffffff',
    backgroundAlt: lighten(primary, 0.96),
    cardBackground: '#ffffff',
    border: 'rgba(0, 0, 0, 0.08)',
    borderOnDark: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(0, 0, 0, 0.06)',
    dividerOnDark: 'rgba(255, 255, 255, 0.18)',

    // Cores especiais
    heroOverlay: `linear-gradient(135deg, ${darken(primary, 0.5)} 0%, ${darken(primary, 0.25)} 50%, ${hexToRgba(darken(secondary, 0.2), 0.9)} 100%)`,
    navbarBg: darken(secondary, 0.2),
    statsBg: `linear-gradient(135deg, ${darken(secondary, 0.3)} 0%, ${secondary} 100%)`,
    ctaBg: primary,
    glowPrimary: `0 0 30px ${hexToRgba(primary, 0.5)}, 0 0 60px ${hexToRgba(primary, 0.3)}`,
    glowLight: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)',
  }
}

/**
 * Gera CSS variables a partir de uma paleta para uso em componentes
 */
export function paletteToCSS(palette: ColorPalette): string {
  return `
    --color-primary: ${palette.primary};
    --color-secondary: ${palette.secondary};
    --color-primary-dark: ${palette.primaryDark};
    --color-primary-light: ${palette.primaryLight};
    --color-primary-tint: ${palette.primaryTint};
    --color-primary-soft: ${palette.primarySoft};
    --color-secondary-dark: ${palette.secondaryDark};
    --color-secondary-light: ${palette.secondaryLight};
    --color-secondary-tint: ${palette.secondaryTint};
    --color-text: ${palette.textOnLight};
    --color-text-muted: ${palette.textMuted};
  `.trim()
}
