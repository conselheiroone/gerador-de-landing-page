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

export type HeroVariant = 'split' | 'centered' | 'full-image' | 'minimal'
export type ServicesVariant = 'cards-grid' | 'bento' | 'icon-list'
export type TestimonialsVariant = 'grid' | 'quote-highlight'
export type AboutVariant = 'mvv-cards' | 'compact'
export type CtaVariant = 'default' | 'simple'
export type FooterVariant = 'centered' | 'columns' | 'compact'

// ─── Background de Seção ────────────────────────────────────

export type SectionBackground = 'white' | 'tintPri' | 'tintSec' | 'transparent'

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
}

// ─── Parâmetros compartilhados pelos builders ───────────────

export interface BuilderContext {
  contentMaxWidth: string
}

export const DEFAULT_CONTENT_MAX_WIDTH = '1200px'
