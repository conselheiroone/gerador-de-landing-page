// ─── Section Types ──────────────────────────────────────────

export type SectionType =
  | 'hero'
  | 'navbar'
  | 'features'
  | 'testimonials'
  | 'about'
  | 'faq'
  | 'logos'
  | 'gallery'
  | 'cta'
  | 'contact'
  | 'footer'
  | 'generic'

// ─── Layout Detection ───────────────────────────────────────

export interface SectionLayout {
  type: 'stack' | 'grid' | 'two-column' | 'single'
  columns: number
  contentAlignment: 'left' | 'center' | 'right'
}

// ─── Content Inventory ──────────────────────────────────────

export interface ContentInventory {
  headingCount: number
  headingLevels: number[]
  paragraphCount: number
  imageCount: number
  buttonCount: number
  listCount: number
  formCount: number
  hasIcon: boolean
  statNumbers: number
}

// ─── Repeated Items ─────────────────────────────────────────

export interface RepeatedItemStructure {
  hasImage: boolean
  hasHeading: boolean
  hasText: boolean
  hasButton: boolean
  hasIcon: boolean
  hasList: boolean
  estimatedHeight: 'compact' | 'medium' | 'tall'
}

export interface RepeatedItemInfo {
  count: number
  itemStructure: RepeatedItemStructure
}

// ─── Color Palette ──────────────────────────────────────────

export interface ColorPalette {
  /** Cor principal/base do site (geralmente o fundo do header/hero) */
  primary: string | null
  /** Cor de destaque usada em botões CTA e acentos */
  accent: string | null
  /** Cor de fundo geral da página */
  background: string | null
  /** Cor de texto geral */
  text: string | null
  /** Cor inicial do gradiente do hero */
  gradientFrom: string | null
  /** Cor final do gradiente do hero */
  gradientTo: string | null
  /** Tipo do gradiente detectado */
  gradientType: 'linear' | 'radial' | null
  /** Direção/posição do gradiente */
  gradientDirection: string | null
}

// ─── DOM Layout Tree ────────────────────────────────────────

/** Subset de CSSStyleDeclaration relevante para layout e design */
export interface ElementStyle {
  // Layout
  display?: string
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  gap?: string
  gridTemplateColumns?: string
  // Box model
  padding?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  margin?: string
  marginTop?: string
  marginBottom?: string
  width?: string
  height?: string
  minHeight?: string
  maxWidth?: string
  // Visual
  background?: string
  backgroundColor?: string
  backgroundImage?: string
  color?: string
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  lineHeight?: string
  textAlign?: string
  borderRadius?: string
  border?: string
  boxShadow?: string
  // Misc
  position?: string
  visibility?: string
  opacity?: string
  objectFit?: string
  overflow?: string
}

/** Nó do DOM extraído server-side (sem bounding boxes — apenas estilos CSS) */
export interface DomLayoutNode {
  id: string
  /** Tag HTML: 'div', 'section', 'h1', 'p', 'img', 'a', etc. */
  tag: string
  /** Estilos resolvidos (inline + classes CSS) */
  style: ElementStyle
  children: DomLayoutNode[]
  /** Texto de elementos folha (h1-h6, p, span, etc.) */
  text?: string
  /** src de elementos img */
  src?: string
  /** alt de elementos img */
  alt?: string
  /** href de links */
  href?: string
  depth: number
}

// ─── Parsed Section ─────────────────────────────────────────

export interface ParsedSection {
  sectionType: SectionType
  childCount: number
  hasHeading: boolean
  /** Primeiro heading da seção (compat. legada) */
  headingText: string | null
  /** Primeiro parágrafo da seção (compat. legada) */
  paragraphText: string | null
  /** Todos os headings relevantes da seção (h1, h2, h3) */
  headingTexts: string[]
  /** Textos reais dos botões CTA da seção */
  ctaTexts: string[]

  layout: SectionLayout
  backgroundTone: 'dark' | 'light' | 'accent' | 'unknown'
  /** Cor de fundo real extraída do HTML (inline style) */
  actualBgColor: string | null

  contentInventory: ContentInventory
  repeatedItems: RepeatedItemInfo | null
  displayNameHint: string | null

  hasVideo: boolean
  videoType: 'youtube' | 'vimeo' | 'native' | null

  /** Árvore DOM da seção para clonagem fiel da estrutura visual */
  domTree?: DomLayoutNode
}

// ─── API Response ───────────────────────────────────────────

export interface FetchHtmlResponse {
  success: boolean
  title: string | null
  sections: ParsedSection[]
  /** Paleta de cores extraída do site (null se não detectável) */
  colorPalette: ColorPalette | null
  /** Família de fonte principal detectada */
  fontFamily: string | null
  error?: string
}

// ─── Import Result ──────────────────────────────────────────

export interface ImportResult {
  craftJson: string
  nomeSugerido: string
  totalSecoes: number
}
