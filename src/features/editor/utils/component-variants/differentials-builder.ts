/**
 * Builder da seção Diferenciais.
 */

import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

export function buildDiferenciais(
  diferenciais: string[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const cards: TemplateNode[] = diferenciais.slice(0, 6).map((diff, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Diferencial ${i + 1}`,
    props: {
      background: palette.cardBackground, padding: 28, gap: 8,
      width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start',
      shadow: 1, radius: 16,
    },
    children: [
      { type: 'TextComponent', displayName: 'Índice', props: { text: String(i + 1).padStart(2, '0'), fontSize: '36', fontWeight: '900', textAlign: 'left', color: palette.secondaryLighter, margin: [0, 0, 0, 0] } },
      { type: 'DividerComponent', displayName: 'Linha Diferencial', props: { color: palette.secondary, thickness: 2, marginY: 4, style: 'solid' } },
      { type: 'TextComponent', displayName: 'Diferencial', props: { text: diff, fontSize: '15', fontWeight: '600', textAlign: 'left', color: palette.textOnLight, margin: [0, 0, 0, 0], lineHeight: '1.5' } },
    ],
  }))

  const columns = cards.length <= 2 ? 2 : 3

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Diferenciais',
    props: { background: sectionBg, columns, gap: 16, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Cabeçalho Diferenciais',
        props: { background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
        children: [
          { type: 'TextComponent', displayName: 'Tag Diferenciais', props: { text: 'POR QUE NOS ESCOLHER', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
          { type: 'HeadingComponent', displayName: 'Título', props: { text: 'Nossos Diferenciais', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
          { type: 'DividerComponent', displayName: 'Divisor', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
          { type: 'TextComponent', displayName: 'Subtítulo Diferenciais', props: { text: 'O que nos torna a escolha certa para o seu negócio.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 0, 0] } },
        ],
      },
      ...cards,
    ],
  }
}
