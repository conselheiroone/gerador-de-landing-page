/**
 * Sistema de Micro-Variações.
 *
 * Randomiza detalhes visuais que não afetam a estrutura:
 * - Tipografia (font-family)
 * - Border radius (sharp, rounded, pill)
 * - Shadow style (flat, soft, elevated)
 * - Espaçamento vertical (compact, normal, spacious)
 * - Alternância de backgrounds entre seções
 */

// ─── Tipos ───────────────────────────────────────────────────

export type FontCombination = {
  id: string
  name: string
  heading: string
  body: string
  /** Google Fonts URL para carregar */
  googleFontsUrl: string
}

export type BorderRadiusStyle = 'sharp' | 'rounded' | 'pill'
export type ShadowStyle = 'flat' | 'soft' | 'elevated'
export type SpacingScale = 'compact' | 'normal' | 'spacious'

export interface MicroVariations {
  font: FontCombination
  borderRadius: BorderRadiusStyle
  shadowStyle: ShadowStyle
  spacing: SpacingScale
}

// ─── Combinações de Tipografia ───────────────────────────────

export const FONT_COMBINATIONS: FontCombination[] = [
  {
    id: 'inter',
    name: 'Inter (Padrão)',
    heading: 'Inter',
    body: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    heading: 'Poppins',
    body: 'Poppins',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    heading: 'Montserrat',
    body: 'Montserrat',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    heading: 'DM Sans',
    body: 'DM Sans',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap',
  },
  {
    id: 'playfair-inter',
    name: 'Playfair + Inter',
    heading: 'Playfair Display',
    body: 'Inter',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'merriweather-source',
    name: 'Merriweather + Source Sans',
    heading: 'Merriweather',
    body: 'Source Sans 3',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&family=Source+Sans+3:wght@300;400;500;600;700&display=swap',
  },
  {
    id: 'raleway',
    name: 'Raleway',
    heading: 'Raleway',
    body: 'Raleway',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&display=swap',
  },
]

// ─── Valores concretos ───────────────────────────────────────

export const BORDER_RADIUS_VALUES: Record<BorderRadiusStyle, { card: number; button: number; badge: number; image: number }> = {
  sharp: { card: 4, button: 4, badge: 4, image: 4 },
  rounded: { card: 16, button: 10, badge: 50, image: 16 },
  pill: { card: 24, button: 50, badge: 50, image: 20 },
}

export const SHADOW_VALUES: Record<ShadowStyle, { card: number; elevated: number }> = {
  flat: { card: 0, elevated: 0 },
  soft: { card: 1, elevated: 2 },
  elevated: { card: 2, elevated: 3 },
}

export const SPACING_VALUES: Record<SpacingScale, { sectionPaddingY: number; gap: number; cardPadding: number }> = {
  compact: { sectionPaddingY: 50, gap: 10, cardPadding: 18 },
  normal: { sectionPaddingY: 80, gap: 18, cardPadding: 28 },
  spacious: { sectionPaddingY: 110, gap: 28, cardPadding: 40 },
}

// ─── Gerador de micro-variações ──────────────────────────────

/** PRNG simples para reprodutibilidade com seed */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

/**
 * Gera um conjunto de micro-variações.
 * Com seed, o resultado é reprodutível.
 */
export function generateMicroVariations(seed?: number): MicroVariations {
  const rng = seed !== undefined ? seededRandom(seed) : Math.random

  return {
    font: pickRandom(FONT_COMBINATIONS, rng),
    borderRadius: pickRandom<BorderRadiusStyle>(['sharp', 'rounded', 'pill'], rng),
    shadowStyle: pickRandom<ShadowStyle>(['flat', 'soft', 'elevated'], rng),
    spacing: pickRandom<SpacingScale>(['compact', 'normal', 'spacious'], rng),
  }
}

/**
 * Aplica micro-variações ao JSON serializado do template.
 *
 * Percorre todos os nós e ajusta border-radius, shadow, padding
 * e font-family de acordo com as variações selecionadas.
 */
export function applyMicroVariations(
  templateJson: string,
  variations: MicroVariations,
): string {
  const tree = JSON.parse(templateJson)
  const radii = BORDER_RADIUS_VALUES[variations.borderRadius]
  const shadows = SHADOW_VALUES[variations.shadowStyle]
  const spacing = SPACING_VALUES[variations.spacing]

  for (const nodeId of Object.keys(tree)) {
    const node = tree[nodeId]
    if (!node.props) continue

    const componentName = node.type?.resolvedName || ''

    // Aplica fontFamily no root container
    if (nodeId === 'ROOT') {
      node.props.fontFamily = variations.font.body
    }

    // Ajusta border-radius em cards (ContainerComponent com shadow > 0)
    if (componentName === 'ContainerComponent') {
      if (node.props.shadow > 0 || node.props.borderAccent) {
        node.props.radius = radii.card
        node.props.shadow = shadows.card
      }
      // Ajusta padding de seções (paddingY em containers com sectionId ou paddingY >= 60)
      if (node.props.paddingY && node.props.paddingY >= 60) {
        node.props.paddingY = spacing.sectionPaddingY
      }
      // Ajusta padding de cards (padding 20-36)
      if (node.props.padding >= 20 && node.props.padding <= 36 && node.props.shadow >= 0) {
        node.props.padding = spacing.cardPadding
      }
    }

    // Ajusta border-radius em botões
    if (componentName === 'ButtonComponent') {
      node.props.borderRadius = radii.button
    }

    // Ajusta border-radius em badges
    if (componentName === 'BadgeComponent') {
      node.props.borderRadius = radii.badge
    }

    // Aplica fontFamily de heading em HeadingComponent (quando heading ≠ body)
    if (componentName === 'HeadingComponent' && variations.font.heading !== variations.font.body) {
      node.props.fontFamily = variations.font.heading
    }

    // Ajusta border-radius em imagens
    if (componentName === 'ImageComponent' && node.props.borderRadius > 0) {
      node.props.borderRadius = radii.image
    }

    // Ajusta gap em FeaturesSectionComponent
    if (componentName === 'FeaturesSectionComponent') {
      node.props.gap = spacing.gap
      if (node.props.paddingY) {
        node.props.paddingY = spacing.sectionPaddingY
      }
    }
  }

  return JSON.stringify(tree)
}
