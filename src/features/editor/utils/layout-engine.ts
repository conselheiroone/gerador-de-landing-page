/**
 * Motor de Variação de Layout.
 *
 * Gera landing pages com layouts variados a partir de blueprints,
 * garantindo que TODOS os dados do perfil sejam preservados.
 */

import type { PerfilEmpresa, Socio, Depoimento } from '@/features/onboarding/types/onboarding.types'
import { buildCraftJson, type TemplateNode } from './default-templates'
import { generatePalette, type ColorPalette } from './color-palette'
import type { LayoutBlueprint, SectionBackground, NavbarVariant, HeroVariant, StatsVariant, ServicesVariant, SegmentsVariant, TestimonialsVariant, AboutVariant, TeamVariant, CtaVariant, FooterVariant } from './layout-types'
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
    case 'dark': return palette.secondaryDarker
    case 'cream': return palette.primarySoft
    case 'creamSec': return palette.secondarySoft
    case 'primarySolid': return palette.primary
    case 'white':
    default: return '#ffffff'
  }
}

// ─── Transições de cor entre seções ──────────────────────────

/** Altura padrão das faixas de transição entre seções (px). */
const TRANSITION_HEIGHT = '157px'

/**
 * Extrai a cor de fundo efetiva de uma seção para calcular transições.
 * Retorna null apenas para navbar (fica colado ao hero).
 */
function extractEffectiveBg(node: TemplateNode, palette: ColorPalette): string | null {
  const props = node.props as Record<string, unknown>
  const type = node.type
  const displayName = node.displayName || ''

  // Navbar: pular — fica visualmente colado ao hero
  if (displayName === 'Navbar') return null

  // Hero/CTA (HeroSectionComponent): aproximar pela cor do overlay
  if (type === 'HeroSectionComponent') {
    const overlayColor = props?.overlayColor as string | undefined
    if (overlayColor) {
      // Extrair última cor hex do gradiente do overlay
      const hexMatches = overlayColor.match(/#[0-9a-fA-F]{6}/g)
      if (hexMatches && hexMatches.length > 0) {
        return hexMatches[hexMatches.length - 1]
      }
    }
    return palette.secondaryDarker
  }

  // Stats band: gradiente escuro, cor dominante na borda inferior ≈ secondary
  if (type === 'StatsBandComponent') return palette.secondary

  const bg = props?.background as string | undefined
  if (!bg) return null

  // Pular backgrounds com gradientes internos (ex: CTA boxed)
  if (bg.includes('gradient')) return null

  return bg
}

/**
 * Injeta faixas de transição gradiente entre seções com cores de fundo diferentes.
 * Cria uma transição visual suave entre toda a página.
 *
 * Regras:
 * - Injeta entre TODAS as seções com backgrounds diferentes
 * - Navbar retorna null (sem transição navbar↔hero)
 * - Hero/CTA: usa cor aproximada do overlay gradient
 * - Stats band: usa palette.secondary como cor de borda
 * - Seções com mesmo bg: sem transição (já são viualmente contínuas)
 */
function injectColorTransitions(sections: TemplateNode[], palette: ColorPalette): TemplateNode[] {
  if (sections.length < 2) return sections

  const result: TemplateNode[] = [sections[0]]

  for (let i = 1; i < sections.length; i++) {
    const prevBg = extractEffectiveBg(sections[i - 1], palette)
    const nextBg = extractEffectiveBg(sections[i], palette)

    // Pular transição hero↔stats (ambos escuros, visualmente contínuos)
    const prevType = sections[i - 1].type
    const nextType = sections[i].type
    const isHeroStats = (prevType === 'HeroSectionComponent' && nextType === 'StatsBandComponent')
      || (prevType === 'StatsBandComponent' && nextType === 'HeroSectionComponent')

    // Insere transição sempre que ambos têm bg resolvido
    // Cores diferentes → gradiente suave; mesma cor → spacer sólido (espaçamento consistente)
    if (prevBg && nextBg && !isHeroStats) {
      const bg = prevBg === nextBg
        ? prevBg
        : `linear-gradient(to bottom, ${prevBg}, ${nextBg})`

      result.push({
        type: 'ContainerComponent',
        isCanvas: false,
        displayName: 'Transição',
        props: {
          background: bg,
          padding: 0,
          paddingY: 0,
          paddingX: 0,
          gap: 0,
          width: '100%',
          height: TRANSITION_HEIGHT,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          shadow: 0,
          radius: 0,
        },
      })
    }

    result.push(sections[i])
  }

  return result
}

// ─── Aplica paddingY override nas seções ─────────────────────

/**
 * Percorre as seções de primeiro nível e ajusta paddingY.
 * Seções com paddingY >= 60 (seções de conteúdo) recebem o override.
 * Seções compactas (stats band, inline-strip) são preservadas.
 */
function applySectionPaddingY(sections: TemplateNode[], paddingY: number): TemplateNode[] {
  return sections.map(section => {
    const props = section.props as Record<string, unknown> | undefined
    if (!props) return section
    const currentPY = props.paddingY as number | undefined
    // Só ajusta seções com paddingY padrão (80) — preserva seções compactas e CTA hero
    if (currentPY === 80) {
      return { ...section, props: { ...props, paddingY } }
    }
    return section
  })
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

  let sections = buildSectionsFromBlueprint(
    blueprint,
    perfil,
    nome,
    slogan,
    socios,
    depoimentos,
    palette,
  )

  // Aplica sectionPaddingY do blueprint (override do padrão 80)
  if (blueprint.sectionPaddingY) {
    sections = applySectionPaddingY(sections, blueprint.sectionPaddingY)
  }

  // Injeta faixas de transição gradiente entre seções com cores diferentes
  sections = injectColorTransitions(sections, palette)

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
        sections.push(buildNavbar(perfil, nome, palette, sectionDef.variant as NavbarVariant))
        break

      case 'hero':
        sections.push(buildHero(perfil, nome, slogan, palette, sectionDef.variant as HeroVariant))
        break

      case 'stats': {
        const statsSection = buildStats(perfil, socios, palette, sectionDef.variant as StatsVariant)
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
          sections.push(buildSegmentos(perfil.segmentos, palette, bg, sectionDef.variant as SegmentsVariant))
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
          sections.push(buildEquipe(sociosVisiveis, palette, bg, sectionDef.variant as TeamVariant))
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
