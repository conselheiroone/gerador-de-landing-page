/**
 * Variantes da seção Stats.
 *
 * - band: Faixa escura com números grandes (padrão atual)
 * - floating-cards: Cards individuais com sombra e borda colorida
 * - inline-minimal: Linha compacta com números menores, fundo claro
 */

import type { PerfilEmpresa, Socio } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { StatsVariant } from '../layout-types'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

// ─── Helpers ────────────────────────────────────────────────

function getStatsData(perfil: PerfilEmpresa, socios: Socio[]): Array<{ valor: string; label: string }> {
  const currentYear = new Date().getFullYear()
  const stats: Array<{ valor: string; label: string }> = []

  if (perfil.ano_fundacao && perfil.ano_fundacao < currentYear) {
    const anos = currentYear - perfil.ano_fundacao
    stats.push({ valor: `${anos}`, label: 'Anos de Experiência' })
  }

  if (perfil.servicos && perfil.servicos.length > 0) {
    const n = perfil.servicos.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'Serviço Oferecido' : 'Serviços Oferecidos' })
  }

  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  if (sociosVisiveis.length > 0) {
    const n = sociosVisiveis.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'Especialista Dedicado' : 'Especialistas Dedicados' })
  }

  if (stats.length < 3) {
    stats.push({ valor: '500+', label: 'Clientes Atendidos' })
  }

  return stats
}

// ─── Dispatcher ─────────────────────────────────────────────

export function buildStats(
  perfil: PerfilEmpresa,
  socios: Socio[],
  palette: ColorPalette,
  variant?: StatsVariant,
): TemplateNode | null {
  const stats = getStatsData(perfil, socios)
  if (stats.length < 2) return null

  if (variant === 'floating-cards') return buildStatsFloatingCards(stats, palette)
  if (variant === 'inline-minimal') return buildStatsInlineMinimal(stats, palette)
  return buildStatsBand(stats, palette)
}

// ─── BAND: Faixa escura com números grandes (padrão) ────────

function buildStatsBand(
  stats: Array<{ valor: string; label: string }>,
  palette: ColorPalette,
): TemplateNode {
  return {
    type: 'StatsBandComponent',
    displayName: 'Números',
    props: {
      background: palette.statsBg,
      textColor: palette.textOnDark,
      accentColor: palette.textOnDark,
      labelColor: palette.textMutedOnDark,
      paddingY: 40,
      showDivider: true,
      stats,
      fontSize: 56,
      labelFontSize: 12,
      fontWeight: '900',
      labelTextTransform: 'uppercase',
      labelLetterSpacing: 2,
      showGlow: true,
    },
  }
}

// ─── FLOATING-CARDS: Cards individuais com sombra ───────────

function buildStatsFloatingCards(
  stats: Array<{ valor: string; label: string }>,
  palette: ColorPalette,
): TemplateNode {
  const accentColors = [palette.primary, palette.secondary, palette.primaryLight]

  const cards: TemplateNode[] = stats.map((stat, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Stat ${i + 1}`,
    props: {
      background: palette.cardBackground,
      padding: 32,
      gap: 8,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 1,
      radius: 16,
      borderAccent: accentColors[i % accentColors.length],
      borderAccentPosition: 'bottom',
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Número',
        props: {
          text: stat.valor,
          tagName: 'h3',
          fontSize: '48',
          fontWeight: '900',
          textAlign: 'center',
          color: accentColors[i % accentColors.length],
          letterSpacing: '-2',
          lineHeight: '1',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Label',
        props: {
          text: stat.label,
          fontSize: '13',
          fontWeight: '600',
          textAlign: 'center',
          color: palette.textMuted,
          letterSpacing: '1.5',
          margin: [4, 0, 0, 0],
        },
      },
    ],
  }))

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Números',
    props: {
      background: palette.background,
      columns: stats.length,
      gap: 24,
      paddingY: 60,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: cards,
  }
}

// ─── INLINE-MINIMAL: Compacto em linha, fundo claro ─────────

function buildStatsInlineMinimal(
  stats: Array<{ valor: string; label: string }>,
  palette: ColorPalette,
): TemplateNode {
  const statItems: TemplateNode[] = stats.flatMap((stat, i) => {
    const items: TemplateNode[] = []

    if (i > 0) {
      items.push({
        type: 'DividerComponent',
        displayName: 'Separador',
        props: {
          color: '#e2e8f0',
          thickness: 1,
          marginY: 0,
          style: 'solid',
          width: '1px',
          height: '40px',
          orientation: 'vertical',
        },
      })
    }

    items.push({
      type: 'ContainerComponent',
      isCanvas: false,
      displayName: `Stat ${i + 1}`,
      props: {
        background: 'transparent',
        padding: 16,
        gap: 4,
        width: 'auto',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 0,
        radius: 0,
      },
      children: [
        {
          type: 'HeadingComponent',
          displayName: 'Número',
          props: {
            text: stat.valor,
            tagName: 'h3',
            fontSize: '32',
            fontWeight: '900',
            textAlign: 'center',
            color: palette.primary,
            letterSpacing: '-1',
            lineHeight: '1',
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Label',
          props: {
            text: stat.label,
            fontSize: '12',
            fontWeight: '500',
            textAlign: 'center',
            color: palette.textMuted,
            margin: [2, 0, 0, 0],
          },
        },
      ],
    })

    return items
  })

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Números',
    props: {
      background: palette.primaryTint,
      padding: 24,
      gap: 24,
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
      borderAccent: palette.primary,
      borderAccentPosition: 'top',
    },
    children: statItems,
  }
}
