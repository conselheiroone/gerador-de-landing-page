/**
 * Variantes da seção Depoimentos.
 *
 * Variantes disponíveis:
 * - grid: TestimonialsGridComponent (padrão)
 * - quote-highlight: QuoteHighlightComponent (1 destaque)
 */

import type { Depoimento } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { TestimonialsVariant } from '../layout-types'
import { PLACEHOLDER_DEPOIMENTOS, CONTENT_MAX_WIDTH } from '../template-helpers'

export function buildDepoimentos(
  depoimentos: Depoimento[],
  palette: ColorPalette,
  sectionBg: string,
  variant?: TestimonialsVariant,
): TemplateNode {
  const itens = depoimentos.length > 0 ? depoimentos : PLACEHOLDER_DEPOIMENTOS

  if (variant === 'quote-highlight') {
    return buildDepoimentosQuoteHighlight(itens, palette, sectionBg)
  }
  return buildDepoimentosGrid(itens, palette, sectionBg)
}

// ─── GRID: TestimonialsGridComponent (padrão) ───────────────

function buildDepoimentosGrid(
  itens: Depoimento[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const columns = itens.length >= 3 ? 3 : (itens.length as 1 | 2 | 3)

  return {
    type: 'TestimonialsGridComponent',
    displayName: 'Depoimentos',
    props: {
      depoimentos: itens.map(d => ({
        nomeCliente: d.nome_cliente,
        cargo: d.cargo || 'Cliente',
        citacao: d.citacao,
        nota: d.nota,
        accentColor: palette.secondary,
      })),
      background: sectionBg,
      cardBackground: palette.cardBackground,
      accentColor: palette.secondary,
      textColor: palette.textOnLight,
      paddingY: 80,
      columns,
      showStars: true,
      sectionTag: 'DEPOIMENTOS',
      sectionTitle: 'O que nossos clientes dizem',
      sectionDescription: 'A satisfação dos nossos clientes é o nosso maior orgulho.',
    },
  }
}

// ─── QUOTE-HIGHLIGHT: 1 depoimento destaque ────────────────

function buildDepoimentosQuoteHighlight(
  itens: Depoimento[],
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  // Depoimento principal (primeiro ou maior nota)
  const principal = [...itens].sort((a, b) => b.nota - a.nota)[0]

  const children: TemplateNode[] = [
    {
      type: 'QuoteHighlightComponent',
      displayName: 'Depoimento Destaque',
      props: {
        quote: principal.citacao,
        author: principal.nome_cliente,
        role: principal.cargo || 'Cliente',
        background: 'transparent',
        textColor: palette.textOnLight,
        accentColor: palette.secondary,
        paddingY: 0,
      },
    },
  ]

  // Se houver mais depoimentos, adiciona grid com os restantes
  const restantes = itens.filter(d => d.id !== principal.id)
  if (restantes.length > 0) {
    const columns = restantes.length >= 3 ? 3 : (restantes.length as 1 | 2 | 3)
    children.push({
      type: 'TestimonialsGridComponent',
      displayName: 'Mais Depoimentos',
      props: {
        depoimentos: restantes.map(d => ({
          nomeCliente: d.nome_cliente,
          cargo: d.cargo || 'Cliente',
          citacao: d.citacao,
          nota: d.nota,
          accentColor: palette.secondary,
        })),
        background: 'transparent',
        cardBackground: palette.cardBackground,
        accentColor: palette.secondary,
        textColor: palette.textOnLight,
        paddingY: 40,
        columns,
        showStars: true,
        sectionTag: '',
        sectionTitle: '',
      },
    })
  }

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Depoimentos',
    props: {
      background: sectionBg, padding: 0, paddingY: 80, paddingX: 40, gap: 24,
      width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0,
    },
    children: [{
      type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Depoimentos',
      props: {
        background: 'transparent', padding: 0, gap: 40, width: '100%', maxWidth: CONTENT_MAX_WIDTH,
        height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
      },
      children: [
        {
          type: 'ContainerComponent', isCanvas: true, displayName: 'Header Depoimentos',
          props: { background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
          children: [
            { type: 'TextComponent', displayName: 'Tag', props: { text: 'DEPOIMENTOS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
            { type: 'HeadingComponent', displayName: 'Título', props: { text: 'O que nossos clientes dizem', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
            { type: 'DividerComponent', displayName: 'Divisor', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
          ],
        },
        ...children,
      ],
    }],
  }
}
