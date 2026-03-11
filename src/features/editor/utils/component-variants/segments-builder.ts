/**
 * Builder da seção Segmentos.
 */

import type { SegmentoItem } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import { CONTENT_MAX_WIDTH, getSegmentIcon, getSegmentDescription } from '../template-helpers'

export function buildSegmentos(
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
