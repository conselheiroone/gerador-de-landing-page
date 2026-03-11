/**
 * Motor de Variação de Layout.
 *
 * Gera landing pages com layouts variados a partir de blueprints,
 * garantindo que TODOS os dados do perfil sejam preservados.
 */

import type { PerfilEmpresa, Socio, Depoimento } from '@/features/onboarding/types/onboarding.types'
import { buildCraftJson, type TemplateNode } from './default-templates'
import { generatePalette, type ColorPalette } from './color-palette'
import type { LayoutBlueprint, SectionBackground, HeroVariant, ServicesVariant, TestimonialsVariant, AboutVariant, CtaVariant, FooterVariant } from './layout-types'
import { BLUEPRINTS, getBlueprintById } from './layout-blueprints'
import {
  buildNavbar,
  buildHero,
  buildStats,
  buildServicos,
  buildSegmentos,
  buildSobre,
  buildDiferenciais,
  buildEquipe,
  buildDepoimentos,
  buildCta,
  buildFooter,
} from './component-variants'
import { generateMicroVariations, applyMicroVariations, type MicroVariations } from './micro-variations'

// ─── Resolve background de seção ─────────────────────────────

function resolveSectionBg(style: SectionBackground, palette: ColorPalette): string {
  switch (style) {
    case 'tintPri': return palette.primaryTint
    case 'tintSec': return palette.secondaryTint
    case 'transparent': return 'transparent'
    case 'white':
    default: return '#ffffff'
  }
}

// ─── Seleciona blueprint aleatório ───────────────────────────

function selectRandomBlueprint(seed?: number): LayoutBlueprint {
  const rng = seed !== undefined ? seededRandom(seed) : Math.random
  const index = Math.floor(rng() * BLUEPRINTS.length)
  return BLUEPRINTS[index]
}

/** PRNG simples para reprodutibilidade com seed */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── Builder principal ───────────────────────────────────────

interface GenerateOptions {
  blueprintId?: string
  seed?: number
  /** Aplicar micro-variações (tipografia, spacing, shadows). Default: false para 'classico' */
  microVariations?: boolean | MicroVariations
}

/**
 * Gera um template com layout variado baseado em um blueprint.
 *
 * REGRA CRÍTICA: Todos os dados do perfil são preservados integralmente.
 * A variação é EXCLUSIVAMENTE estrutural/visual — nunca de conteúdo.
 */
export function generateVariedTemplate(
  perfil: PerfilEmpresa,
  socios: Socio[],
  depoimentos?: Depoimento[],
  options?: GenerateOptions,
): string {
  const nome = perfil.nome_empresa || 'Minha Empresa'
  const slogan = perfil.slogan || 'Soluções profissionais para o seu negócio'
  const primary = perfil.cor_primaria || '#2563eb'
  const secondary = perfil.cor_secundaria || '#1A1A1A'

  const palette = generatePalette(primary, secondary)

  // Seleciona blueprint
  const blueprint = options?.blueprintId
    ? (getBlueprintById(options.blueprintId) ?? selectRandomBlueprint(options?.seed))
    : selectRandomBlueprint(options?.seed)

  const sections = buildSectionsFromBlueprint(
    blueprint,
    perfil,
    nome,
    slogan,
    socios,
    depoimentos,
    palette,
  )

  // Resolve micro-variações
  const shouldApplyMicro = options?.microVariations !== undefined
    ? options.microVariations
    : blueprint.id !== 'classico' // Aplica por padrão em blueprints não-clássicos

  const microVars = typeof shouldApplyMicro === 'object'
    ? shouldApplyMicro
    : shouldApplyMicro
      ? generateMicroVariations(options?.seed)
      : null

  let result = buildCraftJson({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Página',
    props: {
      background: '#ffffff',
      padding: 0,
      gap: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
      ...(microVars ? { fontFamily: microVars.font.body } : {}),
    },
    custom: { displayName: 'Página', blueprintId: blueprint.id },
    children: sections,
  })

  // Aplica micro-variações ao JSON final
  if (microVars) {
    result = applyMicroVariations(result, microVars)
  }

  return result
}

/**
 * Gera N variações de template para seleção pelo usuário.
 */
export function generateTemplateVariations(
  perfil: PerfilEmpresa,
  socios: Socio[],
  depoimentos?: Depoimento[],
  count: number = 4,
): Array<{ blueprint: LayoutBlueprint; template: string }> {
  const results: Array<{ blueprint: LayoutBlueprint; template: string }> = []

  // Seleciona blueprints priorizando diversidade visual no hero
  // Agrupa por tipo de hero para garantir que os 4 tenham heroes diferentes
  const heroGroups: Record<string, LayoutBlueprint[]> = {}
  for (const bp of BLUEPRINTS) {
    const heroVariant = bp.sections.find(s => s.type === 'hero')?.variant || 'split'
    if (!heroGroups[heroVariant]) heroGroups[heroVariant] = []
    heroGroups[heroVariant].push(bp)
  }

  // Pega um de cada grupo de hero diferente (garante diversidade visual máxima)
  const groups = Object.values(heroGroups)
  const shuffledGroups = groups.sort(() => Math.random() - 0.5)

  for (const group of shuffledGroups) {
    if (results.length >= count) break
    const bp = group[Math.floor(Math.random() * group.length)]
    results.push({
      blueprint: bp,
      template: generateVariedTemplate(perfil, socios, depoimentos, { blueprintId: bp.id }),
    })
  }

  // Se ainda precisar de mais, completa com blueprints aleatórios
  const remaining = BLUEPRINTS.filter(bp => !results.some(r => r.blueprint.id === bp.id))
  const shuffledRemaining = remaining.sort(() => Math.random() - 0.5)
  let seedCounter = Date.now()

  for (const bp of shuffledRemaining) {
    if (results.length >= count) break
    results.push({
      blueprint: bp,
      template: generateVariedTemplate(perfil, socios, depoimentos, { blueprintId: bp.id, seed: seedCounter++ }),
    })
  }

  return results
}

// ─── Monta seções a partir do blueprint ──────────────────────

function buildSectionsFromBlueprint(
  blueprint: LayoutBlueprint,
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  socios: Socio[],
  depoimentos: Depoimento[] | undefined,
  palette: ColorPalette,
): TemplateNode[] {
  const sections: TemplateNode[] = []
  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  const depoimentosAtivos = depoimentos?.filter(d => d.ativo) ?? []

  for (const sectionDef of blueprint.sections) {
    const bg = resolveSectionBg(sectionDef.backgroundStyle, palette)

    switch (sectionDef.type) {
      case 'navbar':
        sections.push(buildNavbar(perfil, nome, palette))
        break

      case 'hero':
        sections.push(buildHero(perfil, nome, slogan, palette, sectionDef.variant as HeroVariant))
        break

      case 'stats': {
        const statsSection = buildStats(perfil, socios, palette)
        if (statsSection) sections.push(statsSection)
        break
      }

      case 'services':
        if (perfil.servicos && perfil.servicos.length > 0) {
          sections.push(buildServicos(perfil.servicos, palette, bg, sectionDef.variant as ServicesVariant))
        }
        break

      case 'segments':
        if (perfil.segmentos && perfil.segmentos.length > 0) {
          sections.push(buildSegmentos(perfil.segmentos, palette, bg))
        }
        break

      case 'about':
        if (perfil.historia || perfil.missao || perfil.visao || perfil.valores) {
          sections.push(buildSobre(perfil, nome, palette, bg, sectionDef.variant as AboutVariant))
        }
        break

      case 'differentials':
        if (perfil.diferenciais && perfil.diferenciais.length > 0) {
          sections.push(buildDiferenciais(perfil.diferenciais, palette, bg))
        }
        break

      case 'team':
        if (sociosVisiveis.length > 0) {
          sections.push(buildEquipe(sociosVisiveis, palette, bg))
        }
        break

      case 'testimonials':
        sections.push(buildDepoimentos(depoimentosAtivos, palette, bg, sectionDef.variant as TestimonialsVariant))
        break

      case 'cta':
        sections.push(buildCta(perfil, palette, sectionDef.variant as CtaVariant))
        break

      case 'footer':
        sections.push(buildFooter(perfil, nome, palette, sectionDef.variant as FooterVariant))
        break
    }
  }

  return sections
}
