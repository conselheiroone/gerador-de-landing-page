/**
 * Variantes de Serviços para o sistema de layout variado.
 *
 * Variantes disponíveis:
 * - cards-grid: Cards em grid 2-3 colunas (padrão)
 * - bento: BentoFeaturesComponent com items mistos
 * - icon-list: Lista vertical com ícones grandes à esquerda
 */

import type { PerfilEmpresa, ServicoItem } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { ServicesVariant } from '../layout-types'
import { CONTENT_MAX_WIDTH, getServiceDescription, getServiceIcon, iconToEmoji } from '../template-helpers'

// ─── Dispatcher principal ────────────────────────────────────

export function buildServicos(
  servicos: PerfilEmpresa['servicos'],
  palette: ColorPalette,
  sectionBg: string,
  variant?: ServicesVariant,
): TemplateNode {
  const items = servicos as ServicoItem[]

  if (variant === 'bento') {
    return buildServicosBento(items, palette, sectionBg)
  }
  if (variant === 'icon-list') {
    return buildServicosIconList(items, palette, sectionBg)
  }
  return buildServicosCardsGrid(items, palette, sectionBg)
}

// ─── Header reutilizável ─────────────────────────────────────

function buildServicosHeader(palette: ColorPalette): TemplateNode {
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Cabeçalho Serviços',
    props: {
      background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
    },
    children: [
      {
        type: 'TextComponent', displayName: 'Tag Serviços',
        props: { text: 'O QUE FAZEMOS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] },
      },
      {
        type: 'HeadingComponent', displayName: 'Título Serviços',
        props: { text: 'Nossos Serviços', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight },
      },
      {
        type: 'DividerComponent', displayName: 'Divisor Serviços',
        props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' },
      },
      {
        type: 'TextComponent', displayName: 'Subtítulo Serviços',
        props: { text: 'Soluções contábeis completas para empresas de todos os segmentos e portes.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 0, 0] },
      },
    ],
  }
}

// ─── CARDS-GRID: Cards em grid (padrão) ─────────────────────

export function buildServicosCardsGrid(
  items: ServicoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const columns = items.length <= 2 ? 2 : 3

  const cards: TemplateNode[] = items.map((servico, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Serviço ${i + 1}`,
    props: {
      background: palette.cardBackground, padding: 28, gap: 12,
      width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      shadow: 2, radius: 16,
      borderAccent: palette.secondary, borderAccentPosition: 'top',
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: false, displayName: 'Wrapper Ícone',
        props: {
          background: 'transparent', padding: 0, gap: 0, width: '100%', height: 'auto',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          shadow: 0, radius: 0, marginBottom: 16,
        },
        children: [{
          type: 'IconComponent', displayName: 'Ícone Serviço',
          props: { icon: getServiceIcon(servico.nome, i), size: 28, color: palette.textOnSecondary, backgroundColor: palette.secondary, shape: 'rounded', padding: 14, weight: 'regular' },
        }],
      },
      {
        type: 'HeadingComponent', displayName: 'Título Serviço',
        props: { text: servico.nome, tagName: 'h3', fontSize: '18', fontWeight: '700', textAlign: 'center', color: palette.textOnLight, lineHeight: '1.4' },
      },
      {
        type: 'TextComponent', displayName: 'Descrição Serviço',
        props: { text: getServiceDescription(servico.nome, servico.descricao), fontSize: '15', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 0, 0], lineHeight: '1.6' },
      },
    ],
  }))

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Serviços',
    props: { background: sectionBg, columns, gap: 18, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'servicos' },
    children: [buildServicosHeader(palette), ...cards],
  }
}

// ─── BENTO: BentoFeaturesComponent com items mistos ─────────

export function buildServicosBento(
  items: ServicoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const bentoItems = items.map((servico, i) => ({
    icon: iconToEmoji(getServiceIcon(servico.nome, i)),
    titulo: servico.nome,
    descricao: getServiceDescription(servico.nome, servico.descricao),
    // Primeiro e último item são 'wide', restante 'normal'
    size: (i === 0 || (items.length > 3 && i === items.length - 1)) ? 'wide' : 'normal',
    accentColor: palette.secondary,
  }))

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Serviços',
    props: {
      background: sectionBg, padding: 0, paddingY: 80, paddingX: 40,
      gap: 0, width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0, sectionId: 'servicos',
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Serviços',
        props: {
          background: 'transparent', padding: 0, gap: 40, width: '100%', maxWidth: CONTENT_MAX_WIDTH,
          height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          shadow: 0, radius: 0,
        },
        children: [
          buildServicosHeader(palette),
          {
            type: 'BentoFeaturesComponent',
            displayName: 'Bento Serviços',
            props: {
              background: 'transparent',
              cardBackground: palette.cardBackground,
              cardRadius: 16,
              paddingY: 0,
              items: bentoItems,
              accentColor: palette.secondary,
              titleColor: palette.textOnLight,
              textColor: palette.textMuted,
              iconColor: palette.textOnSecondary,
              iconBg: palette.secondary,
            },
          },
        ],
      },
    ],
  }
}

// ─── ICON-LIST: Lista vertical com ícones grandes ───────────

export function buildServicosIconList(
  items: ServicoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const rows: TemplateNode[] = items.map((servico, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Serviço ${i + 1}`,
    props: {
      background: palette.cardBackground, padding: 24, gap: 20,
      width: '100%', height: 'auto',
      flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start',
      flexWrap: 'nowrap', shadow: 1, radius: 12,
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: false, displayName: 'Ícone Container',
        props: {
          background: palette.primarySoft, padding: 0, gap: 0,
          width: '56px', height: '56px', minWidth: '56px', minHeight: 56,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          shadow: 0, radius: 14, flex: '0 0 56px',
        },
        children: [{
          type: 'IconComponent', displayName: 'Ícone Serviço',
          props: { icon: getServiceIcon(servico.nome, i), size: 24, color: palette.primary, backgroundColor: 'transparent', shape: 'none', padding: 0, weight: 'regular' },
        }],
      },
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Texto Serviço',
        props: {
          background: 'transparent', padding: 0, gap: 6,
          width: 'auto', height: 'auto',
          flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
          shadow: 0, radius: 0, flex: '1 1 0%',
        },
        children: [
          {
            type: 'HeadingComponent', displayName: 'Título Serviço',
            props: { text: servico.nome, tagName: 'h3', fontSize: '17', fontWeight: '700', textAlign: 'left', color: palette.textOnLight, lineHeight: '1.3' },
          },
          {
            type: 'TextComponent', displayName: 'Descrição Serviço',
            props: { text: getServiceDescription(servico.nome, servico.descricao), fontSize: '14', fontWeight: '400', textAlign: 'left', color: palette.textMuted, lineHeight: '1.6' },
          },
        ],
      },
    ],
  }))

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Serviços',
    props: {
      background: sectionBg, padding: 0, paddingY: 80, paddingX: 40,
      gap: 0, width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0, sectionId: 'servicos',
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Serviços',
        props: {
          background: 'transparent', padding: 0, gap: 40, width: '100%', maxWidth: CONTENT_MAX_WIDTH,
          height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          shadow: 0, radius: 0,
        },
        children: [
          buildServicosHeader(palette),
          {
            type: 'ContainerComponent', isCanvas: true, displayName: 'Lista Serviços',
            props: {
              background: 'transparent', padding: 0, gap: 12,
              width: '100%', maxWidth: '700px', height: 'auto',
              flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start',
              shadow: 0, radius: 0,
            },
            children: rows,
          },
        ],
      },
    ],
  }
}
