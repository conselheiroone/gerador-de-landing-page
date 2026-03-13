/**
 * Variantes da seção Segmentos.
 *
 * - default: SegmentsComponent com grid de cards (padrão)
 * - pills: Pills/chips horizontais com ícone + nome (sem descrição)
 * - icon-grid: Grid simples com ícone grande e nome centralizado
 */

import type { SegmentoItem } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { SegmentsVariant } from '../layout-types'
import { CONTENT_MAX_WIDTH, getSegmentIcon, getSegmentDescription } from '../template-helpers'

// ─── Dispatcher ─────────────────────────────────────────────

export function buildSegmentos(
  segmentos: SegmentoItem[],
  palette: ColorPalette,
  sectionBg: string,
  variant?: SegmentsVariant,
): TemplateNode {
  if (variant === 'pills') return buildSegmentosPills(segmentos, palette, sectionBg)
  if (variant === 'icon-grid') return buildSegmentosIconGrid(segmentos, palette, sectionBg)
  return buildSegmentosDefault(segmentos, palette, sectionBg)
}

// ─── DEFAULT: SegmentsComponent (padrão) ────────────────────

function buildSegmentosDefault(
  segmentos: SegmentoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const segments = segmentos.map((seg, i) => ({
    icon: getSegmentIcon(seg.nome, i),
    titulo: seg.nome,
    descricao: getSegmentDescription(seg.nome, seg.descricao),
  }))

  return {
    type: 'SegmentsComponent',
    displayName: 'Segmentos',
    props: {
      background: sectionBg,
      backgroundTo: palette.background,
      primaryColor: palette.primary,
      primaryLight: palette.primaryTint,
      primaryLighter: palette.primarySoft,
      primaryAlpha10: palette.primaryAlpha10,
      primaryAlpha15: palette.primaryAlpha15,
      primaryAlpha30: palette.primaryAlpha30,
      titleColor: palette.textOnLight,
      textColor: palette.textMuted,
      accentColor: palette.secondary,
      paddingY: 80,
      segments,
      sectionTag: 'QUEM ATENDEMOS',
      sectionTitle: 'Segmentos de Atuação',
      sectionDescription: 'Experiência comprovada em diversos setores da economia.',
      contentMaxWidth: CONTENT_MAX_WIDTH,
      sectionId: 'segmentos',
    },
  }
}

// ─── PILLS: Chips horizontais com flex-wrap ─────────────────

function buildSegmentosPills(
  segmentos: SegmentoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const pills: TemplateNode[] = segmentos.map((seg, i) => ({
    type: 'ContainerComponent',
    isCanvas: false,
    displayName: `Segmento ${i + 1}`,
    props: {
      background: palette.cardBackground,
      padding: 0,
      paddingX: 24,
      paddingY: 14,
      gap: 12,
      width: 'auto',
      height: 'auto',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 1,
      radius: 50,
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Ícone',
        props: {
          text: getSegmentIcon(seg.nome, i),
          fontSize: '22',
          fontWeight: '400',
          textAlign: 'center',
          color: palette.textOnLight,
          margin: [0, 0, 0, 0],
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Nome',
        props: {
          text: seg.nome,
          fontSize: '15',
          fontWeight: '600',
          textAlign: 'left',
          color: palette.textOnLight,
          margin: [0, 0, 0, 0],
        },
      },
    ],
  }))

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Segmentos',
    props: {
      background: sectionBg,
      padding: 0,
      paddingY: 80,
      paddingX: 40,
      gap: 16,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
      sectionId: 'segmentos',
    },
    children: [
      // Header
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Cabeçalho Segmentos',
        props: {
          background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
        },
        children: [
          { type: 'TextComponent', displayName: 'Tag', props: { text: 'QUEM ATENDEMOS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
          { type: 'HeadingComponent', displayName: 'Título', props: { text: 'Segmentos de Atuação', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
          { type: 'DividerComponent', displayName: 'Divisor', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
          { type: 'TextComponent', displayName: 'Subtítulo', props: { text: 'Experiência comprovada em diversos setores da economia.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 24, 0] } },
        ],
      },
      // Pills container
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Grid Pills',
        props: {
          background: 'transparent',
          padding: 0,
          gap: 14,
          width: '100%',
          maxWidth: '900px',
          height: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          shadow: 0,
          radius: 0,
        },
        children: pills,
      },
    ],
  }
}

// ─── ICON-GRID: Grid com ícone grande centralizado ──────────

function buildSegmentosIconGrid(
  segmentos: SegmentoItem[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const columns = segmentos.length <= 4 ? 2 : 3

  const cards: TemplateNode[] = segmentos.map((seg, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Segmento ${i + 1}`,
    props: {
      background: palette.cardBackground,
      padding: 28,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 1,
      radius: 16,
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Ícone',
        props: {
          text: getSegmentIcon(seg.nome, i),
          fontSize: '40',
          fontWeight: '400',
          textAlign: 'center',
          color: palette.textOnLight,
          margin: [0, 0, 4, 0],
        },
      },
      {
        type: 'HeadingComponent',
        displayName: 'Nome',
        props: {
          text: seg.nome,
          tagName: 'h3',
          fontSize: '16',
          fontWeight: '700',
          textAlign: 'center',
          color: palette.textOnLight,
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descrição',
        props: {
          text: getSegmentDescription(seg.nome, seg.descricao),
          fontSize: '13',
          fontWeight: '400',
          textAlign: 'center',
          color: palette.textMuted,
          lineHeight: '1.5',
          margin: [0, 0, 0, 0],
        },
      },
    ],
  }))

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Segmentos',
    props: {
      background: sectionBg,
      columns,
      gap: 20,
      paddingY: 80,
      contentMaxWidth: '900px',
      sectionId: 'segmentos',
    },
    children: [
      // Header
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Cabeçalho Segmentos',
        props: {
          background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
        },
        children: [
          { type: 'TextComponent', displayName: 'Tag', props: { text: 'QUEM ATENDEMOS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
          { type: 'HeadingComponent', displayName: 'Título', props: { text: 'Segmentos de Atuação', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
          { type: 'DividerComponent', displayName: 'Divisor', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
        ],
      },
      ...cards,
    ],
  }
}
