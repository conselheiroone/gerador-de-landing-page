/**
 * Tipos para o sistema de variação de layouts.
 *
 * Define blueprints, seções e variantes que permitem gerar
 * landing pages com estruturas visuais diversas a partir do mesmo perfil.
 */

// ─── Tipos de Seção ─────────────────────────────────────────

export type SectionType =
  | 'navbar'
  | 'hero'
  | 'stats'
  | 'services'
  | 'segments'
  | 'about'
  | 'differentials'
  | 'team'
  | 'testimonials'
  | 'cta'
  | 'footer'

// ─── Variantes de Componente ────────────────────────────────

export type NavbarVariant = 'default' | 'minimal-white' | 'bold-dark'
export type HeroVariant = 'split' | 'centered' | 'full-image' | 'minimal'
export type StatsVariant = 'band' | 'floating-cards' | 'inline-minimal'
export type ServicesVariant = 'cards-grid' | 'bento' | 'icon-list'
export type SegmentsVariant = 'default' | 'pills' | 'icon-grid'
export type TestimonialsVariant = 'grid' | 'quote-highlight'
export type AboutVariant = 'mvv-cards' | 'compact'
export type TeamVariant = 'default' | 'horizontal' | 'minimal'
export type CtaVariant = 'default' | 'simple' | 'boxed' | 'inline-strip'
export type FooterVariant = 'centered' | 'columns' | 'compact'

// ─── Background de Seção ────────────────────────────────────

export type SectionBackground = 'white' | 'tintPri' | 'tintSec' | 'transparent' | 'dark' | 'cream' | 'creamSec' | 'primarySolid'

// ─── Blueprint Section ──────────────────────────────────────

export interface BlueprintSection {
  type: SectionType
  required: boolean
  variant: string
  backgroundStyle: SectionBackground
}

// ─── Layout Blueprint ───────────────────────────────────────

export interface LayoutBlueprint {
  id: string
  name: string
  description: string
  sections: BlueprintSection[]
  /** Padding vertical padrão das seções (override do padrão 80). */
  sectionPaddingY?: number
}

// ─── Parâmetros compartilhados pelos builders ───────────────

export interface BuilderContext {
  contentMaxWidth: string
}

export const DEFAULT_CONTENT_MAX_WIDTH = '1200px'
