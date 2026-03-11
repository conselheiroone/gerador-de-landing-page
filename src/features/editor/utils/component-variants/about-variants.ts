/**
 * Variantes da seção Sobre/História.
 *
 * Variantes disponíveis:
 * - mvv-cards: Cards Missão/Visão/Valores com imagem lateral (padrão)
 * - compact: Parágrafo único sem MVV separado
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { AboutVariant } from '../layout-types'
import { ASSETS, CONTENT_MAX_WIDTH } from '../template-helpers'

export function buildSobre(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
  sectionBg: string,
  variant?: AboutVariant,
): TemplateNode {
  if (variant === 'compact') {
    return buildSobreCompact(perfil, nome, palette, sectionBg)
  }
  return buildSobreMvvCards(perfil, nome, palette, sectionBg)
}

// ─── MVV-CARDS: Layout com imagem + MVV (padrão) ────────────

function buildSobreMvvCards(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const currentYear = new Date().getFullYear()
  const anosExp = perfil.ano_fundacao ? currentYear - perfil.ano_fundacao : null

  // Header
  const headerChildren: TemplateNode[] = [
    { type: 'TextComponent', displayName: 'Tag Sobre', props: { text: 'CONHEÇA-NOS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
    { type: 'HeadingComponent', displayName: 'Título Sobre', props: { text: `Sobre a ${nome}`, tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
    { type: 'DividerComponent', displayName: 'Divisor Sobre', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
    { type: 'TextComponent', displayName: 'Subtítulo Sobre', props: { text: 'Conheça nossa história e os valores que nos guiam.', fontSize: '16', fontWeight: '400', textAlign: 'center', color: palette.textMuted, margin: [0, 0, 0, 0] } },
  ]

  // Coluna imagem
  const imageColumnChildren: TemplateNode[] = [
    { type: 'ImageComponent', displayName: 'Imagem Escritório', props: { src: ASSETS.aboutOffice, alt: `Escritório ${nome}`, width: '100%', height: '400px', objectFit: 'cover', borderRadius: 16 } },
  ]

  if (anosExp && anosExp > 0) {
    imageColumnChildren.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Badge Experiência',
      props: {
        background: palette.primary, padding: 20, gap: 4, width: 'auto', height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        shadow: 3, radius: 16, position: 'absolute', bottom: '-24px', right: '-24px',
      },
      children: [
        { type: 'TextComponent', displayName: 'Número Anos', props: { text: `${anosExp}+`, fontSize: '40', fontWeight: '900', textAlign: 'center', color: palette.textOnPrimary, lineHeight: '1' } },
        { type: 'TextComponent', displayName: 'Label Anos', props: { text: 'Anos', fontSize: '12', fontWeight: '600', textAlign: 'center', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1' } },
      ],
    })
  }

  const imageColumn: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Coluna Imagem',
    props: {
      background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto',
      flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start',
      shadow: 0, radius: 0, position: 'relative', flex: '1 1 350px', minWidth: '300px', maxWidth: '500px',
    },
    children: imageColumnChildren,
  }

  // Coluna texto
  const textColumnChildren: TemplateNode[] = [
    { type: 'TextComponent', displayName: 'Tag Texto', props: { text: 'NOSSA HISTÓRIA', fontSize: '12', fontWeight: '700', textAlign: 'left', color: palette.secondary, letterSpacing: '2' } },
    { type: 'HeadingComponent', displayName: 'Título Texto', props: { text: 'Sua contabilidade em boas mãos', tagName: 'h3', fontSize: '36', fontWeight: '800', textAlign: 'left', color: palette.textOnLight, lineHeight: '1.2' } },
  ]

  if (perfil.historia) {
    textColumnChildren.push({
      type: 'TextComponent', displayName: 'História',
      props: { text: perfil.historia, fontSize: '16', fontWeight: '400', textAlign: 'left', color: palette.textMuted, lineHeight: '1.8', margin: [8, 0, 16, 0] },
    })
  }

  // Features
  const features = ['Atendimento 100% digital e personalizado', 'Equipe especializada e certificada', 'Suporte contínuo e proativo']
  textColumnChildren.push({
    type: 'ContainerComponent', isCanvas: true, displayName: 'Features Sobre',
    props: { background: 'transparent', padding: 0, gap: 12, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', shadow: 0, radius: 0 },
    children: features.map((feat, i) => ({
      type: 'ContainerComponent', isCanvas: true, displayName: `Feature ${i + 1}`,
      props: { background: 'transparent', padding: 0, gap: 12, width: '100%', height: 'auto', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'flex-start', shadow: 0, radius: 0 },
      children: [
        {
          type: 'ContainerComponent', isCanvas: false, displayName: 'Ícone',
          props: { background: palette.primary, padding: 0, gap: 0, width: '36px', height: '36px', minHeight: 36, minWidth: '36px', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 10, flex: '0 0 36px' },
          children: [{ type: 'TextComponent', displayName: 'Check', props: { text: '✓', fontSize: '16', fontWeight: '700', color: palette.textOnPrimary, textAlign: 'center', lineHeight: '1', margin: [0, 0, 0, 0] } }],
        },
        { type: 'TextComponent', displayName: 'Texto Feature', props: { text: feat, fontSize: '15', fontWeight: '600', textAlign: 'left', color: palette.textOnLight, margin: [0, 0, 0, 0] } },
      ],
    })),
  })

  const textColumn: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Coluna Texto',
    props: {
      background: 'transparent', padding: 0, gap: 16, width: 'auto', height: 'auto',
      flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
      shadow: 0, radius: 0, flex: '1 1 400px', minWidth: '300px',
    },
    children: textColumnChildren,
  }

  const mainGrid: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Grid Sobre',
    props: {
      background: 'transparent', padding: 0, gap: 48, width: '100%', height: 'auto',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      flexWrap: 'wrap', shadow: 0, radius: 0, marginTop: 48, marginBottom: 60,
    },
    children: [imageColumn, textColumn],
  }

  // MVV Cards
  const mvvDefs = [
    { label: 'Missão', icon: '🎯', value: perfil.missao, accentLight: palette.primaryLight },
    { label: 'Visão', icon: '🔭', value: perfil.visao, accentLight: palette.primaryMid },
    { label: 'Valores', icon: '💎', value: perfil.valores, accentLight: palette.primaryLighter },
  ].filter(item => item.value)

  let mvvSection: TemplateNode | null = null
  if (mvvDefs.length > 0) {
    const mvvCards: TemplateNode[] = mvvDefs.map((item) => ({
      type: 'ContainerComponent', isCanvas: true, displayName: item.label,
      props: {
        background: palette.cardBackground, padding: 32, gap: 12, width: 'auto', height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
        shadow: 1, radius: 16, borderAccent: palette.secondary, borderAccentPosition: 'top',
        flex: '1 1 280px', minWidth: '250px', maxWidth: '380px',
      },
      children: [
        {
          type: 'ContainerComponent', isCanvas: false, displayName: 'Ícone MVV',
          props: { background: item.accentLight, padding: 12, gap: 0, width: '56px', height: '56px', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 12 },
          children: [{ type: 'TextComponent', displayName: 'Emoji', props: { text: item.icon, fontSize: '24' } }],
        },
        { type: 'HeadingComponent', displayName: 'Título MVV', props: { text: item.label, tagName: 'h3', fontSize: '18', fontWeight: '700', textAlign: 'center', color: palette.textOnLight } },
        { type: 'TextComponent', displayName: 'Texto MVV', props: { text: item.value!, fontSize: '14', fontWeight: '400', textAlign: 'center', color: palette.textMuted, lineHeight: '1.7' } },
      ],
    }))

    mvvSection = {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Nossos Pilares',
      props: { background: 'transparent', padding: 0, gap: 16, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
      children: [
        { type: 'HeadingComponent', displayName: 'Título Pilares', props: { text: 'Nossos Pilares', tagName: 'h3', fontSize: '28', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
        {
          type: 'ContainerComponent', isCanvas: true, displayName: 'Grid MVV',
          props: { background: 'transparent', padding: 0, gap: 24, width: '100%', height: 'auto', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap', shadow: 0, radius: 0, marginTop: 24 },
          children: mvvCards,
        },
      ],
    }
  }

  const sectionChildren: TemplateNode[] = [
    {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Header Sobre',
      props: { background: 'transparent', padding: 0, gap: 8, width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0 },
      children: headerChildren,
    },
    mainGrid,
  ]

  if (mvvSection) sectionChildren.push(mvvSection)

  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Sobre',
    props: {
      background: sectionBg, padding: 0, paddingY: 80, paddingX: 40, gap: 0,
      width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0, sectionId: 'sobre',
    },
    children: [{
      type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Sobre',
      props: {
        background: 'transparent', padding: 0, gap: 0, width: '100%', maxWidth: CONTENT_MAX_WIDTH,
        height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
      },
      children: sectionChildren,
    }],
  }
}

// ─── COMPACT: Parágrafo único sem MVV separado ──────────────

function buildSobreCompact(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
  sectionBg: string,
): TemplateNode {
  const children: TemplateNode[] = [
    { type: 'TextComponent', displayName: 'Tag Sobre', props: { text: 'CONHEÇA-NOS', fontSize: '12', fontWeight: '700', textAlign: 'center', color: palette.secondary, letterSpacing: '2', margin: [0, 0, 8, 0] } },
    { type: 'HeadingComponent', displayName: 'Título Sobre', props: { text: `Sobre a ${nome}`, tagName: 'h2', fontSize: '40', fontWeight: '800', textAlign: 'center', color: palette.textOnLight } },
    { type: 'DividerComponent', displayName: 'Divisor Sobre', props: { color: palette.secondary, thickness: 4, marginY: 16, style: 'solid', width: '60px' } },
  ]

  if (perfil.historia) {
    children.push({
      type: 'TextComponent', displayName: 'História',
      props: { text: perfil.historia, fontSize: '17', fontWeight: '400', textAlign: 'center', color: palette.textMuted, lineHeight: '1.8', maxWidth: '700px', margin: [8, 0, 24, 0] },
    })
  }

  // MVV inline
  const mvvParts = [
    perfil.missao ? `**Missão:** ${perfil.missao}` : null,
    perfil.visao ? `**Visão:** ${perfil.visao}` : null,
    perfil.valores ? `**Valores:** ${perfil.valores}` : null,
  ].filter(Boolean)

  if (mvvParts.length > 0) {
    children.push({
      type: 'TextComponent', displayName: 'MVV Compacto',
      props: { text: mvvParts.join('\n\n'), fontSize: '15', fontWeight: '400', textAlign: 'center', color: palette.textMuted, lineHeight: '1.7', maxWidth: '700px' },
    })
  }

  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Sobre',
    props: {
      background: sectionBg, padding: 0, paddingY: 80, paddingX: 40, gap: 16,
      width: '100%', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 0, sectionId: 'sobre',
    },
    children: [{
      type: 'ContainerComponent', isCanvas: true, displayName: 'Conteúdo Sobre',
      props: {
        background: 'transparent', padding: 0, gap: 16, width: '100%', maxWidth: CONTENT_MAX_WIDTH,
        height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
      },
      children,
    }],
  }
}
