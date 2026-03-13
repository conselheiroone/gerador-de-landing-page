/**
 * Variantes da seção Equipe.
 *
 * - default: Cards centralizados com avatar circular (padrão)
 * - horizontal: Card com avatar na esquerda e info na direita
 * - minimal: Linha compacta com avatar pequeno quadrado e dados inline
 */

import type { Socio } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { TeamVariant } from '../layout-types'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

// ─── Dispatcher ─────────────────────────────────────────────

export function buildEquipe(
  sociosVisiveis: Socio[],
  palette: ColorPalette,
  bgLight: string,
  variant?: TeamVariant,
): TemplateNode {
  if (variant === 'horizontal') return buildEquipeHorizontal(sociosVisiveis, palette, bgLight)
  if (variant === 'minimal') return buildEquipeMinimal(sociosVisiveis, palette, bgLight)
  return buildEquipeDefault(sociosVisiveis, palette, bgLight)
}

// ─── Header compartilhado ───────────────────────────────────

function buildTeamHeader(palette: ColorPalette): TemplateNode {
  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Cabeçalho Equipe',
    props: { background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
    children: [
      { type: 'TextComponent', displayName: 'Tag Equipe', props: { text: 'PROFISSIONAIS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
      { type: 'HeadingComponent', displayName: 'Título Equipe', props: { text: 'Nossa Equipe', tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
      { type: 'DividerComponent', displayName: 'Divisor', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
      { type: 'TextComponent', displayName: 'Subtítulo Equipe', props: { text: 'Especialistas comprometidos com o sucesso do seu negócio.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 0, 0] } },
    ],
  }
}

// ─── Avatar helper ──────────────────────────────────────────

function buildAvatar(socio: Socio, palette: ColorPalette, size: number, borderRadius: number): TemplateNode {
  if (socio.foto_url) {
    return {
      type: 'ImageComponent', displayName: 'Foto',
      props: { src: socio.foto_url, alt: socio.nome_completo, width: `${size}px`, height: `${size}px`, objectFit: 'cover', borderRadius },
    }
  }
  const initials = socio.nome_completo.split(' ').filter(p => p.length > 0).slice(0, 2).map(p => p[0].toUpperCase()).join('')
  return {
    type: 'ContainerComponent', isCanvas: false, displayName: 'Avatar',
    props: {
      background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
      padding: 0, gap: 0, width: `${size}px`, height: `${size}px`, minHeight: size, minWidth: `${size}px`,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: borderRadius,
    },
    children: [{
      type: 'TextComponent', displayName: 'Iniciais',
      props: { text: initials, fontSize: `${Math.round(size * 0.32)}`, fontWeight: '800', textAlign: 'center', color: palette.textOnSecondary, lineHeight: '1', margin: [0, 0, 0, 0] },
    }],
  }
}

// ─── Badges de especialidades ───────────────────────────────

function buildSpecialtyBadges(especialidades: string[], palette: ColorPalette, justify: string = 'center'): TemplateNode {
  return {
    type: 'ContainerComponent', isCanvas: false, displayName: 'Especialidades',
    props: {
      background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto',
      flexDirection: 'row', alignItems: justify as 'center' | 'flex-start', justifyContent: justify as 'center' | 'flex-start', flexWrap: 'wrap', shadow: 0, radius: 0,
    },
    children: especialidades.map((esp, idx) => ({
      type: 'BadgeComponent', displayName: `Tag ${idx + 1}`,
      props: {
        text: esp, background: palette.primarySoft, color: palette.primary,
        fontSize: 12, fontWeight: '500', borderRadius: 50, paddingX: 16, paddingY: 6,
        border: `1px solid ${palette.primaryAlpha15}`,
      },
    })),
  }
}

// ─── DEFAULT: Cards centralizados ───────────────────────────

function buildEquipeDefault(
  sociosVisiveis: Socio[],
  palette: ColorPalette,
  bgLight: string,
): TemplateNode {
  const columns = sociosVisiveis.length >= 3 ? 3 : sociosVisiveis.length

  const cards: TemplateNode[] = sociosVisiveis.map((socio, i) => {
    const cardChildren: TemplateNode[] = [buildAvatar(socio, palette, 100, 50)]

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
      cardChildren.push(buildSpecialtyBadges(socio.especialidades, palette, 'center'))
    }

    return {
      type: 'ContainerComponent', isCanvas: true, displayName: `Sócio ${i + 1}`,
      props: {
        background: palette.cardBackground, padding: 32, gap: 8, width: '100%', height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: 2, radius: 20,
      },
      children: cardChildren,
    }
  })

  return {
    type: 'FeaturesSectionComponent', isCanvas: true, displayName: 'Equipe',
    props: { background: bgLight, columns, gap: 24, paddingY: 80, contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'equipe' },
    children: [buildTeamHeader(palette), ...cards],
  }
}

// ─── HORIZONTAL: Avatar esquerda + info direita ─────────────

function buildEquipeHorizontal(
  sociosVisiveis: Socio[],
  palette: ColorPalette,
  bgLight: string,
): TemplateNode {
  const cards: TemplateNode[] = sociosVisiveis.map((socio, i) => {
    const infoChildren: TemplateNode[] = []

    infoChildren.push({
      type: 'HeadingComponent', displayName: 'Nome',
      props: { text: socio.nome_completo, tagName: 'h3', fontSize: '20', fontWeight: '800', textAlign: 'left', color: palette.textOnLight },
    })

    if (socio.cargo) {
      infoChildren.push({
        type: 'TextComponent', displayName: 'Cargo',
        props: { text: socio.cargo, fontSize: '12', fontWeight: '700', textAlign: 'left', color: palette.secondary, margin: [0, 0, 2, 0] },
      })
    }

    if (socio.crc_numero) {
      infoChildren.push({
        type: 'TextComponent', displayName: 'CRC',
        props: { text: `CRC ${socio.crc_estado || ''}  ${socio.crc_numero}`, fontSize: '12', fontWeight: '500', textAlign: 'left', color: palette.textMuted, margin: [0, 0, 8, 0] },
      })
    }

    if (socio.mini_bio) {
      infoChildren.push({
        type: 'TextComponent', displayName: 'Bio',
        props: { text: `"${socio.mini_bio}"`, fontSize: '14', fontWeight: '400', textAlign: 'left', color: palette.textMuted, lineHeight: '1.6', margin: [4, 0, 8, 0] },
      })
    }

    if (socio.especialidades && socio.especialidades.length > 0) {
      infoChildren.push(buildSpecialtyBadges(socio.especialidades, palette, 'flex-start'))
    }

    return {
      type: 'ContainerComponent', isCanvas: true, displayName: `Sócio ${i + 1}`,
      props: {
        background: palette.cardBackground, padding: 32, gap: 24, width: '100%', maxWidth: '700px', height: 'auto',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', shadow: 2, radius: 16,
      },
      children: [
        buildAvatar(socio, palette, 120, 60),
        {
          type: 'ContainerComponent', isCanvas: true, displayName: 'Info',
          props: {
            background: 'transparent', padding: 0, gap: 4, width: '100%', height: 'auto',
            flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0,
          },
          children: infoChildren,
        },
      ],
    }
  })

  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Equipe',
    props: {
      background: bgLight, padding: 0, paddingY: 80, gap: 0,
      width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0, sectionId: 'equipe',
    },
    children: [{
      type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Equipe',
      props: {
        background: 'transparent', padding: 0, paddingX: 24, gap: 24,
        width: CONTENT_MAX_WIDTH, height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        shadow: 0, radius: 0,
      },
      children: [buildTeamHeader(palette), ...cards],
    }],
  }
}

// ─── MINIMAL: Linha compacta com avatar quadrado ────────────

function buildEquipeMinimal(
  sociosVisiveis: Socio[],
  palette: ColorPalette,
  bgLight: string,
): TemplateNode {
  const cards: TemplateNode[] = sociosVisiveis.map((socio, i) => {
    const infoChildren: TemplateNode[] = []

    infoChildren.push({
      type: 'HeadingComponent', displayName: 'Nome',
      props: { text: socio.nome_completo, tagName: 'h3', fontSize: '18', fontWeight: '800', textAlign: 'left', color: palette.textOnLight },
    })

    const metaLine = [socio.cargo, socio.crc_numero ? `CRC ${socio.crc_estado || ''} ${socio.crc_numero}` : ''].filter(Boolean).join('  ·  ')
    if (metaLine) {
      infoChildren.push({
        type: 'TextComponent', displayName: 'Meta',
        props: { text: metaLine, fontSize: '12', fontWeight: '600', textAlign: 'left', color: palette.secondary, margin: [0, 0, 6, 0] },
      })
    }

    if (socio.especialidades && socio.especialidades.length > 0) {
      infoChildren.push(buildSpecialtyBadges(socio.especialidades, palette, 'flex-start'))
    }

    return {
      type: 'ContainerComponent', isCanvas: true, displayName: `Sócio ${i + 1}`,
      props: {
        background: palette.cardBackground, padding: 24, gap: 20, width: '100%', maxWidth: '700px', height: 'auto',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', shadow: 1, radius: 8,
      },
      children: [
        buildAvatar(socio, palette, 72, 8),
        {
          type: 'ContainerComponent', isCanvas: true, displayName: 'Info',
          props: {
            background: 'transparent', padding: 0, gap: 2, width: '100%', height: 'auto',
            flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0,
          },
          children: infoChildren,
        },
      ],
    }
  })

  // Header com estilo left-aligned para minimal
  const minimalHeader: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Cabeçalho Equipe',
    props: { background: 'transparent', padding: 0, gap: 8, width: '100%', maxWidth: '700px', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0 },
    children: [
      { type: 'TextComponent', displayName: 'Tag Equipe', props: { text: 'PROFISSIONAIS', fontSize: '12', fontWeight: '700', textAlign: 'left', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
      { type: 'HeadingComponent', displayName: 'Título Equipe', props: { text: 'Nossa Equipe', tagName: 'h2', fontSize: '36', fontWeight: '800', textAlign: 'left', color: palette.textOnLight } },
      { type: 'TextComponent', displayName: 'Subtítulo Equipe', props: { text: 'Especialistas comprometidos com o sucesso do seu negócio.', fontSize: '16', fontWeight: '400', textAlign: 'left', color: palette.textMuted, margin: [4, 0, 0, 0] } },
    ],
  }

  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Equipe',
    props: {
      background: bgLight, padding: 0, paddingY: 80, gap: 0,
      width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0, sectionId: 'equipe',
    },
    children: [{
      type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Equipe',
      props: {
        background: 'transparent', padding: 0, paddingX: 24, gap: 16,
        width: CONTENT_MAX_WIDTH, height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        shadow: 0, radius: 0,
      },
      children: [minimalHeader, ...cards],
    }],
  }
}
