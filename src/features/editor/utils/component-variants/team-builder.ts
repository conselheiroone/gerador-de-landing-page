/**
 * Builder da seção Equipe.
 */

import type { Socio } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

export function buildEquipe(
  sociosVisiveis: Socio[],
  palette: ColorPalette,
  bgLight: string,
): TemplateNode {
  const columns = sociosVisiveis.length >= 3 ? 3 : sociosVisiveis.length

  const cards: TemplateNode[] = sociosVisiveis.map((socio, i) => {
    const cardChildren: TemplateNode[] = []

    if (socio.foto_url) {
      cardChildren.push({
        type: 'ImageComponent', displayName: 'Foto',
        props: { src: socio.foto_url, alt: socio.nome_completo, width: '100px', height: '100px', objectFit: 'cover', borderRadius: 50 },
      })
    } else {
      // Avatar placeholder com gradiente + iniciais (como nas demos)
      const initials = socio.nome_completo
        .split(' ')
        .filter(p => p.length > 0)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join('')
      cardChildren.push({
        type: 'ContainerComponent', isCanvas: false, displayName: 'Avatar Placeholder',
        props: {
          background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
          padding: 0, gap: 0, width: '100px', height: '100px', minHeight: 100, minWidth: '100px',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          shadow: 0, radius: 50,
        },
        children: [{
          type: 'TextComponent', displayName: 'Iniciais',
          props: { text: initials, fontSize: '32', fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: '1', margin: [0, 0, 0, 0] },
        }],
      })
    }

    cardChildren.push({
      type: 'HeadingComponent', displayName: 'Nome',
      props: { text: socio.nome_completo, tagName: 'h3', fontSize: '19', fontWeight: '700', textAlign: 'center', color: palette.textOnLight },
    })

    if (socio.cargo) {
      cardChildren.push({
        type: 'TextComponent', displayName: 'Cargo',
        props: { text: socio.cargo, fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, margin: [0, 0, 4, 0] },
      })
    }

    if (socio.crc_numero) {
      cardChildren.push({
        type: 'TextComponent', displayName: 'CRC',
        props: { text: `CRC ${socio.crc_estado || ''}  ${socio.crc_numero}`, fontSize: '12', fontWeight: '500', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 8, 0] },
      })
    }

    if (socio.mini_bio) {
      cardChildren.push({
        type: 'TextComponent', displayName: 'Bio',
        props: { text: `"${socio.mini_bio}"`, fontSize: '14', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [4, 0, 8, 0] },
      })
    }

    if (socio.especialidades && socio.especialidades.length > 0) {
      cardChildren.push({
        type: 'ContainerComponent', isCanvas: false, displayName: 'Especialidades',
        props: {
          background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', shadow: 0, radius: 0,
        },
        children: socio.especialidades.map((esp, idx) => ({
          type: 'BadgeComponent', displayName: `Tag ${idx + 1}`,
          props: {
            text: esp, background: palette.primarySoft, color: palette.primary,
            fontSize: 12, fontWeight: '500', borderRadius: 50, paddingX: 16, paddingY: 6,
            border: `1px solid ${palette.primaryAlpha15}`,
          },
        })),
      })
    }

    return {
      type: 'ContainerComponent', isCanvas: true, displayName: `Sócio ${i + 1}`,
      props: {
        background: palette.cardBackground, padding: 32, gap: 8,
        width: '100%', height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
        shadow: 2, radius: 20,
      },
      children: cardChildren,
    }
  })

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Equipe',
    props: { background: bgLight, columns, gap: 24, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'equipe' },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Cabeçalho Equipe',
        props: { background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
        children: [
          { type: 'TextComponent', displayName: 'Tag Equipe', props: { text: 'PROFISSIONAIS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
          { type: 'HeadingComponent', displayName: 'Título Equipe', props: { text: 'Nossa Equipe', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
          { type: 'DividerComponent', displayName: 'Divisor', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
          { type: 'TextComponent', displayName: 'Subtítulo Equipe', props: { text: 'Especialistas comprometidos com o sucesso do seu negócio.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 0, 0] } },
        ],
      },
      ...cards,
    ],
  }
}
