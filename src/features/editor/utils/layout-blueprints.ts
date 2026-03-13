/**
 * Definição dos Layout Blueprints.
 *
 * Cada blueprint define a ordem das seções, quais são obrigatórias,
 * qual variante visual usar e o estilo de fundo.
 *
 * REGRA: Cada blueprint deve usar combinações VISUALMENTE DISTINTAS
 * de navbar + hero + services + stats + segments + team + cta + footer.
 */

import type { LayoutBlueprint } from './layout-types'

// ─── Blueprint 1: CLÁSSICO ─────────────────────────────────
// Glass dark navbar + Split hero + Band stats + Cards grid + Default segments + MVV cards + Centered cards + Grid depoimentos + Default CTA + Columns footer

export const BLUEPRINT_CLASSICO: LayoutBlueprint = {
  id: 'classico',
  name: 'Clássico',
  description: 'Estrutura tradicional com hero split, stats e serviços em destaque.',
  sectionPaddingY: 100,
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'split', backgroundStyle: 'white' },
    { type: 'stats', required: false, variant: 'band', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'cards-grid', backgroundStyle: 'cream' },
    { type: 'segments', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'about', required: false, variant: 'mvv-cards', backgroundStyle: 'cream' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'creamSec' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'cream' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'columns', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 2: NARRATIVA PRIMEIRO ────────────────────────
// White navbar + Centered hero + MVV sobre primeiro + Icon-list serviços + Pills segmentos + Horizontal equipe + Quote depoimentos + Boxed CTA

export const BLUEPRINT_STORY_FIRST: LayoutBlueprint = {
  id: 'story-first',
  name: 'Narrativa Primeiro',
  description: 'Começa com a história da empresa, criando conexão emocional antes dos serviços.',
  sections: [
    { type: 'navbar', required: true, variant: 'minimal-white', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'centered', backgroundStyle: 'white' },
    { type: 'about', required: false, variant: 'mvv-cards', backgroundStyle: 'tintPri' },
    { type: 'services', required: true, variant: 'icon-list', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'pills', backgroundStyle: 'cream' },
    { type: 'team', required: false, variant: 'horizontal', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'tintSec' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'stats', required: false, variant: 'inline-minimal', backgroundStyle: 'white' },
    { type: 'cta', required: true, variant: 'boxed', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'centered', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 3: PROVA SOCIAL ──────────────────────────────
// Glass dark navbar + Full-image hero + Grid depoimentos logo + Floating cards stats + Bento serviços + Icon-grid segmentos + Compact sobre + Default CTA

export const BLUEPRINT_SOCIAL_PROOF: LayoutBlueprint = {
  id: 'social-proof',
  name: 'Prova Social',
  description: 'Depoimentos logo após o hero para criar confiança imediata.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'full-image', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'cream' },
    { type: 'stats', required: false, variant: 'floating-cards', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintPri' },
    { type: 'segments', required: false, variant: 'icon-grid', backgroundStyle: 'white' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'tintSec' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'compact', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 4: SERVIÇOS EM DESTAQUE ──────────────────────
// Bold dark navbar + Minimal hero + Bento serviços + Inline stats + Pills segmentos + Minimal equipe + Quote depoimentos + Simple CTA

export const BLUEPRINT_SERVICES_HERO: LayoutBlueprint = {
  id: 'services-hero',
  name: 'Serviços em Destaque',
  description: 'Hero minimalista seguido de serviços como protagonista em layout bento.',
  sections: [
    { type: 'navbar', required: true, variant: 'bold-dark', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'minimal', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintPri' },
    { type: 'stats', required: false, variant: 'inline-minimal', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'pills', backgroundStyle: 'cream' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintSec' },
    { type: 'team', required: false, variant: 'minimal', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'simple', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'columns', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 5: MODERNO MINIMALISTA ───────────────────────
// Bold dark navbar + Full-image hero + Icon-list serviços + Inline-strip CTA + Quote depoimentos + Boxed CTA + Compact footer

export const BLUEPRINT_MODERN_MINIMAL: LayoutBlueprint = {
  id: 'modern-minimal',
  name: 'Moderno Minimalista',
  description: 'Menos seções, mais impacto. Hero grande, serviços e CTA direto.',
  sections: [
    { type: 'navbar', required: true, variant: 'bold-dark', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'full-image', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'icon-list', backgroundStyle: 'white' },
    { type: 'cta', required: true, variant: 'inline-strip', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'cream' },
    { type: 'cta', required: true, variant: 'boxed', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'compact', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 6: VITRINE COMPLETA ──────────────────────────
// White navbar + Split hero + Band stats + Cards grid + Grid depoimentos + Default segmentos + MVV cards + Horizontal equipe + Default CTA + Columns footer

export const BLUEPRINT_FULL_SHOWCASE: LayoutBlueprint = {
  id: 'full-showcase',
  name: 'Vitrine Completa',
  description: 'Todas as seções visíveis, intercaladas para máximo impacto.',
  sections: [
    { type: 'navbar', required: true, variant: 'minimal-white', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'split', backgroundStyle: 'white' },
    { type: 'stats', required: false, variant: 'band', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'cards-grid', backgroundStyle: 'tintPri' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'icon-grid', backgroundStyle: 'tintSec' },
    { type: 'about', required: false, variant: 'mvv-cards', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'team', required: false, variant: 'horizontal', backgroundStyle: 'white' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'columns', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 7: FOCO EM CONVERSÃO ─────────────────────────
// Glass navbar + Centered hero + Icon-list serviços + Inline-strip CTA + Grid depoimentos + Compact sobre + Pills segmentos + Default CTA + Centered footer

export const BLUEPRINT_CTA_DRIVEN: LayoutBlueprint = {
  id: 'cta-driven',
  name: 'Foco em Conversão',
  description: 'Múltiplos CTAs entre seções para maximizar conversões.',
  sections: [
    { type: 'navbar', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'centered', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'icon-list', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'inline-strip', backgroundStyle: 'white' },
    { type: 'testimonials', required: true, variant: 'grid', backgroundStyle: 'cream' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'pills', backgroundStyle: 'tintSec' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'default', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'centered', backgroundStyle: 'white' },
  ],
}

// ─── Blueprint 8: BENTO GRID ────────────────────────────────
// Bold dark navbar + Minimal hero + Bento serviços + Floating cards stats + Icon-grid segmentos + Compact sobre + Minimal equipe + Quote depoimentos + Boxed CTA

export const BLUEPRINT_BENTO_GRID: LayoutBlueprint = {
  id: 'bento-grid',
  name: 'Bento Grid',
  description: 'Layout moderno com grid bento para serviços e visual contemporâneo.',
  sections: [
    { type: 'navbar', required: true, variant: 'minimal-white', backgroundStyle: 'white' },
    { type: 'hero', required: true, variant: 'minimal', backgroundStyle: 'white' },
    { type: 'services', required: true, variant: 'bento', backgroundStyle: 'tintPri' },
    { type: 'stats', required: false, variant: 'floating-cards', backgroundStyle: 'white' },
    { type: 'segments', required: false, variant: 'icon-grid', backgroundStyle: 'cream' },
    { type: 'about', required: false, variant: 'compact', backgroundStyle: 'white' },
    { type: 'team', required: false, variant: 'minimal', backgroundStyle: 'tintSec' },
    { type: 'testimonials', required: true, variant: 'quote-highlight', backgroundStyle: 'white' },
    { type: 'differentials', required: false, variant: 'default', backgroundStyle: 'tintPri' },
    { type: 'cta', required: true, variant: 'boxed', backgroundStyle: 'white' },
    { type: 'footer', required: true, variant: 'compact', backgroundStyle: 'white' },
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
