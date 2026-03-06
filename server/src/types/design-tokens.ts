// ─── Design Tokens extraidos do site ─────────────────────────

/** Compativel com ColorPalette do frontend (importar-layout.types.ts) */
export interface ColorPalette {
  primary: string | null
  accent: string | null
  background: string | null
  text: string | null
  gradientFrom: string | null
  gradientTo: string | null
  gradientType: 'linear' | 'radial' | null
  gradientDirection: string | null
}

export interface TypographyTokens {
  fontFamily: string | null
  headingFontFamily: string | null
  baseFontSize: number
}

export interface DesignTokens {
  colorPalette: ColorPalette
  typography: TypographyTokens
}
