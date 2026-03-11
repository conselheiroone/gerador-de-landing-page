/**
 * Definição dos Layout Blueprints.
 *
 * Cada blueprint define a ordem das seções, quais são obrigatórias,
 * qual variante visual usar e o estilo de fundo.
 */

import type { LayoutBlueprint } from './layout-types'

// ─── 4 Blueprints iniciais (Fase 1 MVP) ─────────────────────

export const BLUEPRINT_CLASSICO: LayoutBlueprint = {
  id: 'classico',
  name: 'Clássico',
  description: 'Estrutura tradicional com hero split, stats e serviços em destaque.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'split', backgroundStyle: 'white' },
    { type: 'stats', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'cards-grid', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'about', required: false, variant: 'mvv-cards', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'columns', backgroundStyle: 'white' },
  ],
}

export const BLUEPRINT_STORY_FIRST: LayoutBlueprint = {
  id: 'story-first',
  name: 'Narrativa Primeiro',
  description: 'Começa com a história da empresa, criando conexão emocional antes dos serviços.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'full-image', backgroundStyle: 'white' },
    { type: 'about', required: false, variant: 'mvv-cards', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'icon-list', backgroundStyle: 'tintPri' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'stats', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'centered', backgroundStyle: 'white' },
  ],
}

export const BLUEPRINT_SOCIAL_PROOF: LayoutBlueprint = {
  id: 'social-proof',
  name: 'Prova Social',
  description: 'Depoimentos logo após o hero para criar confiança imediata.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'centered', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'tintPri' },
    { type: 'stats', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintSec' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'tintPri' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'compact', backgroundStyle: 'white' },
  ],
}

export const BLUEPRINT_SERVICES_HERO: LayoutBlueprint = {
  id: 'services-hero',
  name: 'Serviços em Destaque',
  description: 'Hero minimalista seguido de serviços como protagonista em layout bento.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'minimal', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintPri' },
    { type: 'stats', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'tintSec' },
    { type: 'cta', required: true, variant: 'simple', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'columns', backgroundStyle: 'white' },
  ],
}

// ─── 4 Blueprints adicionais (Fase 3) ───────────────────────

export const BLUEPRINT_MODERN_MINIMAL: LayoutBlueprint = {
  id: 'modern-minimal',
  name: 'Moderno Minimalista',
  description: 'Menos seções, mais impacto. Hero grande, serviços e CTA direto.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'full-image', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintPri' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'white' },
    { type: 'cta', required: true, variant: 'simple', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'compact', backgroundStyle: 'white' },
  ],
}

export const BLUEPRINT_FULL_SHOWCASE: LayoutBlueprint = {
  id: 'full-showcase',
  name: 'Vitrine Completa',
  description: 'Todas as seções visíveis, intercaladas para máximo impacto.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'split', backgroundStyle: 'white' },
    { type: 'stats', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'cards-grid', backgroundStyle: 'tintPri' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'about', required: false, variant: 'mvv-cards', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'columns', backgroundStyle: 'white' },
  ],
}

export const BLUEPRINT_CTA_DRIVEN: LayoutBlueprint = {
  id: 'cta-driven',
  name: 'Foco em Conversão',
  description: 'Múltiplos CTAs entre seções para maximizar conversões.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'centered', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'icon-list', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'simple', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'tintSec' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'compact', backgroundStyle: 'white' },
  ],
}

export const BLUEPRINT_BENTO_GRID: LayoutBlueprint = {
  id: 'bento-grid',
  name: 'Bento Grid',
  description: 'Layout moderno com grid bento para serviços e visual contemporâneo.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'minimal', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintPri' },
    { type: 'stats', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'centered', backgroundStyle: 'white' },
  ],
}

// ─── Registry ────────────────────────────────────────────────

export const BLUEPRINTS: LayoutBlueprint[] = [
  BLUEPRINT_CLASSICO,
  BLUEPRINT_STORY_FIRST,
  BLUEPRINT_SOCIAL_PROOF,
  BLUEPRINT_SERVICES_HERO,
  BLUEPRINT_MODERN_MINIMAL,
  BLUEPRINT_FULL_SHOWCASE,
  BLUEPRINT_CTA_DRIVEN,
  BLUEPRINT_BENTO_GRID,
]

export function getBlueprintById(id: string): LayoutBlueprint | undefined {
  return BLUEPRINTS.find(b => b.id === id)
}
