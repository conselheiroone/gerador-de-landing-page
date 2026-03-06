// ─── LayoutNode: Estrutura semantica inferida ────────────────

export interface LayoutStyle {
  backgroundColor?: string
  backgroundImage?: string
  color?: string
  fontSize?: number
  fontWeight?: string
  fontFamily?: string
  textAlign?: string
  lineHeight?: string
  letterSpacing?: string
  padding?: number
  paddingY?: number
  paddingX?: number
  gap?: number
  borderRadius?: number
  border?: string
  boxShadow?: string
  width?: string
  height?: string
  minHeight?: number
  maxWidth?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  gridTemplateColumns?: string
  opacity?: number
  // Gradiente
  gradientFrom?: string
  gradientTo?: string
  gradientType?: 'linear' | 'radial' | ''
  gradientDirection?: string
}

export type SectionKind =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'footer'
  | 'about'
  | 'contact'
  | 'generic'

export type LayoutNode =
  | { kind: 'Page'; children: LayoutNode[] }
  | { kind: 'Section'; sectionKind: SectionKind; style: LayoutStyle; children: LayoutNode[] }
  | { kind: 'Container'; style: LayoutStyle; children: LayoutNode[] }
  | { kind: 'Row'; style: LayoutStyle; children: LayoutNode[] }
  | { kind: 'Column'; style: LayoutStyle; children: LayoutNode[] }
  | { kind: 'Grid'; style: LayoutStyle; columns: number; children: LayoutNode[] }
  | { kind: 'Text'; style: LayoutStyle; text: string; variant: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' }
  | { kind: 'Button'; style: LayoutStyle; text: string }
  | { kind: 'Image'; style: LayoutStyle; placeholder: true }
  | { kind: 'NavBar'; style: LayoutStyle; logoChildren: LayoutNode[]; linkCount: number; hasCta: boolean }
