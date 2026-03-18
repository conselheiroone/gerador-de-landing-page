/**
 * Variantes de Hero para o sistema de layout variado.
 *
 * Variantes disponíveis:
 * - split: Texto esquerda + imagem/logo direita (padrão com logo)
 * - centered: Texto centralizado + gradiente (padrão sem logo)
 * - full-image: Imagem full-bleed com overlay forte + texto sobreposto
 * - minimal: Split limpo com stats inline + imagem, overlay pesado (mais cor da marca)
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { HeroVariant } from '../layout-types'
import { ASSETS, CONTENT_MAX_WIDTH } from '../template-helpers'

// ─── Dispatcher principal ────────────────────────────────────

export function buildHero(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  palette: ColorPalette,
  variant?: HeroVariant,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  // Se variante explícita, usa ela
  if (variant === 'full-image') {
    return buildHeroFullImage(perfil, nome, slogan, palette, whatsappHref, emailHref, null)
  }
  if (variant === 'minimal') {
    return buildHeroMinimal(perfil, nome, slogan, palette, whatsappHref, emailHref)
  }
  if (variant === 'centered') {
    return buildHeroCentered(nome, slogan, palette, whatsappHref, emailHref)
  }
  if (variant === 'split') {
    return buildHeroSplit(perfil, nome, slogan, palette, whatsappHref, emailHref, null)
  }

  // Auto-detect baseado no perfil
  if (perfil.logo_url) {
    return buildHeroSplit(perfil, nome, slogan, palette, whatsappHref, emailHref, null)
  }
  return buildHeroCentered(nome, slogan, palette, whatsappHref, emailHref)
}

// ─── SPLIT: Texto esquerda + imagem direita ─────────────────

export function buildHeroSplit(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  palette: ColorPalette,
  whatsappHref: string | null,
  _emailHref: string,
  _heroImage: string | null,
): TemplateNode {
  const gradientFrom = palette.primaryDark
  const textChildren: TemplateNode[] = []

  // Badge: "Desde {ano} · {CIDADE}, {ESTADO}"
  const badgeParts: string[] = []
  if (perfil.ano_fundacao) badgeParts.push(`Desde ${perfil.ano_fundacao}`)
  if (perfil.cidade && perfil.estado) badgeParts.push(`${perfil.cidade}, ${perfil.estado}`)
  if (badgeParts.length > 0) {
    textChildren.push({
      type: 'BadgeComponent',
      displayName: 'Badge Hero',
      props: {
        text: badgeParts.join('  ·  '),
        badgeStyle: 'filled',
        color: palette.secondaryAlpha90,
        backgroundColor: palette.secondaryAlpha90,
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 50,
        paddingX: 20,
        paddingY: 10,
        textTransform: 'none',
        letterSpacing: 0,
        marginBottom: 28,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${palette.borderOnDark}`,
      },
    })
  }

  // Título
  textChildren.push({
    type: 'HeadingComponent',
    displayName: 'Nome da Empresa',
    props: {
      text: nome,
      tagName: 'h1',
      fontSize: '56',
      fontWeight: '900',
      textAlign: 'left',
      color: palette.textOnDark,
      lineHeight: '1.1',
      letterSpacing: '-2',
      margin: [0, 0, 20, 0],
    },
  })

  // Slogan
  textChildren.push({
    type: 'TextComponent',
    displayName: 'Slogan',
    props: {
      text: slogan,
      fontSize: '20',
      fontWeight: '400',
      textAlign: 'left',
      color: palette.textMutedOnDark,
      lineHeight: '1.5',
      maxWidth: '480px',
      margin: [0, 0, 16, 0],
    },
  })

  // Contato
  const contactParts: TemplateNode[] = []
  if (perfil.telefone) {
    contactParts.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Telefone',
      props: {
        background: 'transparent', padding: 0, gap: 6, width: '100%', height: 'auto',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
        shadow: 0, radius: 0, minHeight: 0, flexWrap: 'nowrap',
      },
      children: [
        { type: 'IconComponent', displayName: 'Ícone Telefone', props: { icon: 'phone', size: 15, color: palette.textMutedOnDark, weight: 'regular', backgroundColor: 'transparent', shape: 'none', padding: 0 } },
        { type: 'TextComponent', displayName: 'Texto Telefone', props: { text: perfil.telefone, fontSize: '15', fontWeight: '400', textAlign: 'left', color: palette.textMutedOnDark } },
      ],
    })
  }
  if (perfil.email_contato) {
    contactParts.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Email',
      props: {
        background: 'transparent', padding: 0, gap: 6, width: '100%', height: 'auto',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
        shadow: 0, radius: 0, minHeight: 0, flexWrap: 'nowrap',
      },
      children: [
        { type: 'IconComponent', displayName: 'Ícone Email', props: { icon: 'mail', size: 15, color: palette.textMutedOnDark, weight: 'regular', backgroundColor: 'transparent', shape: 'none', padding: 0 } },
        { type: 'TextComponent', displayName: 'Texto Email', props: { text: perfil.email_contato, fontSize: '15', fontWeight: '400', textAlign: 'left', color: palette.textMutedOnDark } },
      ],
    })
  }
  if (contactParts.length > 0) {
    textChildren.push({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: 'Contato Hero',
      props: {
        background: 'transparent', padding: 0, gap: 8, width: 'auto', height: 'auto',
        flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start',
        shadow: 0, radius: 0, marginBottom: 32,
      },
      children: contactParts,
    })
  }

  // WhatsApp
  if (whatsappHref) {
    textChildren.push({
      type: 'ButtonComponent',
      displayName: 'WhatsApp',
      props: {
        text: 'Falar no WhatsApp',
        href: whatsappHref,
        background: palette.secondary,
        color: palette.textOnSecondary,
        size: 'lg',
        buttonStyle: 'filled',
        borderRadius: 50,
        icon: 'whatsapp',
      },
    })
  }

  // Features badges
  const currentYear = new Date().getFullYear()
  const anosExp = perfil.ano_fundacao ? currentYear - perfil.ano_fundacao : null
  const features: string[] = []
  if (anosExp && anosExp > 0) features.push(`${anosExp}+ anos`)
  features.push('100% digital')
  features.push('Atendimento nacional')

  textChildren.push({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Features Hero',
    props: {
      background: 'transparent', padding: 0, gap: 32, width: 'auto', height: 'auto',
      flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start',
      flexWrap: 'wrap', shadow: 0, radius: 0, marginTop: 40,
    },
    children: features.map((feat, i) => ({
      type: 'ContainerComponent',
      isCanvas: false,
      displayName: `Feature ${i + 1}`,
      props: {
        background: 'transparent', padding: 0, gap: 8, width: 'auto', height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', shadow: 0, radius: 0,
      },
      children: [
        {
          type: 'ContainerComponent',
          isCanvas: false,
          displayName: 'Ícone Feature',
          props: {
            background: 'rgba(255, 255, 255, 0.15)', padding: 0, gap: 0,
            width: '32px', height: '32px', minHeight: 32,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 8,
          },
          children: [{
            type: 'TextComponent', displayName: 'Check',
            props: { text: '✓', fontSize: '14', fontWeight: '700', color: palette.textOnDark, textAlign: 'center', lineHeight: '1', margin: [0, 0, 0, 0] },
          }],
        },
        {
          type: 'TextComponent', displayName: 'Texto Feature',
          props: { text: feat, fontSize: '13', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark },
        },
      ],
    })),
  })

  const leftColumn: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Texto Hero',
    props: {
      background: 'transparent', padding: 0, gap: 16, width: 'auto', height: 'auto',
      flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
      shadow: 0, radius: 0, flex: '1 1 400px', minWidth: '320px',
    },
    children: textChildren,
  }

  // Coluna direita: Imagem + cards flutuantes
  const floatingCards: TemplateNode[] = []

  if (anosExp && anosExp > 0) {
    floatingCards.push({
      type: 'ContainerComponent', isCanvas: true, displayName: 'Card Experiência',
      props: {
        background: 'rgba(255, 255, 255, 0.95)', padding: 16, paddingX: 20, gap: 4,
        width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        shadow: 0, radius: 12, position: 'absolute', bottom: '60px', left: '-30px', zIndex: 3,
        backdropFilter: 'blur(10px)', boxShadowCustom: '0 10px 30px rgba(0, 0, 0, 0.15)', animationPreset: 'float',
      },
      children: [
        { type: 'TextComponent', displayName: 'Número Experiência', props: { text: `${anosExp}+`, fontSize: '28', fontWeight: '800', textAlign: 'center', color: palette.primary, lineHeight: '1' } },
        { type: 'TextComponent', displayName: 'Label Experiência', props: { text: 'Anos de experiência', fontSize: '12', fontWeight: '600', textAlign: 'center', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.5' } },
      ],
    })
  }

  floatingCards.push({
    type: 'ContainerComponent', isCanvas: true, displayName: 'Card Clientes',
    props: {
      background: 'rgba(255, 255, 255, 0.95)', padding: 16, paddingX: 20, gap: 4,
      width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      shadow: 0, radius: 12, position: 'absolute', top: '100px', right: '-20px', zIndex: 3,
      backdropFilter: 'blur(10px)', boxShadowCustom: '0 10px 30px rgba(0, 0, 0, 0.15)', animationPreset: 'float',
    },
    children: [
      { type: 'TextComponent', displayName: 'Número Clientes', props: { text: '500+', fontSize: '28', fontWeight: '800', textAlign: 'center', color: palette.primary, lineHeight: '1' } },
      { type: 'TextComponent', displayName: 'Label Clientes', props: { text: 'Clientes atendidos', fontSize: '12', fontWeight: '600', textAlign: 'center', color: palette.textMuted, textTransform: 'uppercase', letterSpacing: '0.5' } },
    ],
  })

  const rightColumn: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Imagem Hero',
    props: {
      background: 'transparent', padding: 0, gap: 0, width: 'auto', height: '100%',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
      shadow: 0, radius: 0, position: 'relative', flex: '1 1 400px', minWidth: '320px',
    },
    children: [{
      type: 'ContainerComponent', isCanvas: false, displayName: 'Wrapper Imagem Hero',
      props: {
        background: 'transparent', padding: 0, gap: 0, width: '100%', maxWidth: '550px',
        height: '690px', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
        shadow: 0, radius: 0, position: 'relative',
        decorativeFrame: {
          width: '70%',
          height: '75%',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px 20px 0 0',
          borderBottom: 'none',
        },
      },
      children: [
        {
          type: 'ImageComponent', displayName: 'Imagem Hero',
          props: { src: ASSETS.heroProfessional, alt: 'Profissional', width: '100%', maxWidth: '550px', height: '690px', objectFit: 'contain', borderRadius: '20px 20px 0 0', boxShadow: '0 -10px 60px rgba(0, 0, 0, 0.3)', zIndex: 2 },
        },
        ...floatingCards,
      ],
    }],
  }

  const heroGrid: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Hero Grid',
    props: {
      background: 'transparent', padding: 0, gap: 40, width: '100%', height: '100%',
      flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between',
      flexWrap: 'wrap', shadow: 0, radius: 0, flex: '1 1 auto',
    },
    children: [leftColumn, rightColumn],
  }

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'Hero',
    props: {
      background: gradientFrom, gradientFrom: '', gradientTo: '', gradientDirection: '135deg',
      backgroundImage: ASSETS.heroBg, overlayOpacity: 0.85, overlayColor: palette.heroOverlay,
      paddingY: 70, paddingTop: 70, paddingBottom: 0,
      minHeight: 600, minHeightCalc: 'calc(100vh - 156px)',
      textAlign: 'left', contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: [heroGrid],
  }
}

// ─── CENTERED: Texto centralizado ───────────────────────────

export function buildHeroCentered(
  nome: string,
  slogan: string,
  palette: ColorPalette,
  whatsappHref: string | null,
  emailHref: string,
): TemplateNode {
  const gradientFrom = palette.primaryDarker

  const children: TemplateNode[] = [
    {
      type: 'BadgeComponent', displayName: 'Badge Hero',
      props: {
        text: 'CONTABILIDADE & ASSESSORIA',
        badgeStyle: 'soft',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: palette.secondary,
        fontSize: 12, fontWeight: 700, borderRadius: 50,
        paddingX: 24, paddingY: 10,
        border: `1px solid ${palette.secondaryAlpha90}`,
        backdropFilter: 'blur(10px)',
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16,
      },
    },
    {
      type: 'HeadingComponent', displayName: 'Nome da Empresa',
      props: {
        text: nome, tagName: 'h1', fontSize: '64', fontWeight: '900',
        textAlign: 'center', color: palette.textOnDark,
        lineHeight: '1.05', letterSpacing: '-2',
        textShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        maxWidth: '750px',
      },
    },
    {
      type: 'TextComponent', displayName: 'Slogan',
      props: {
        text: slogan, fontSize: '22', fontWeight: '300',
        textAlign: 'center', color: palette.textMutedOnDark,
        lineHeight: '1.6', maxWidth: '550px',
        margin: [12, 0, 32, 0],
      },
    },
    {
      type: 'ButtonComponent', displayName: 'CTA Orçamento',
      props: {
        text: whatsappHref ? 'Falar no WhatsApp' : 'Solicite um Orçamento',
        href: whatsappHref || emailHref,
        background: palette.secondary, color: palette.textOnSecondary,
        size: 'lg', buttonStyle: 'filled', borderRadius: 50,
        paddingX: 36, paddingY: 16,
        shadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        icon: whatsappHref ? 'whatsapp' : undefined,
      },
    },
  ]

  // Cards de stats flutuantes para criar profundidade visual
  const statsRow: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Stats Hero',
    props: {
      background: 'transparent', padding: 0, gap: 40, width: 'auto', height: 'auto',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      flexWrap: 'wrap', shadow: 0, radius: 0, marginTop: 48,
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Stat 1',
        props: {
          background: 'rgba(255, 255, 255, 0.08)', padding: 20, paddingX: 28, gap: 4,
          width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', shadow: 0, radius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
        },
        children: [
          { type: 'TextComponent', displayName: 'Valor Stat', props: { text: '500+', fontSize: '32', fontWeight: '800', textAlign: 'center', color: palette.secondary, lineHeight: '1' } },
          { type: 'TextComponent', displayName: 'Label Stat', props: { text: 'Clientes ativos', fontSize: '12', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1' } },
        ],
      },
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Stat 2',
        props: {
          background: 'rgba(255, 255, 255, 0.08)', padding: 20, paddingX: 28, gap: 4,
          width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', shadow: 0, radius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
        },
        children: [
          { type: 'TextComponent', displayName: 'Valor Stat', props: { text: '100%', fontSize: '32', fontWeight: '800', textAlign: 'center', color: palette.secondary, lineHeight: '1' } },
          { type: 'TextComponent', displayName: 'Label Stat', props: { text: 'Digital', fontSize: '12', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1' } },
        ],
      },
      {
        type: 'ContainerComponent', isCanvas: true, displayName: 'Stat 3',
        props: {
          background: 'rgba(255, 255, 255, 0.08)', padding: 20, paddingX: 28, gap: 4,
          width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', shadow: 0, radius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
        },
        children: [
          { type: 'TextComponent', displayName: 'Valor Stat', props: { text: '⭐ 5.0', fontSize: '32', fontWeight: '800', textAlign: 'center', color: palette.secondary, lineHeight: '1' } },
          { type: 'TextComponent', displayName: 'Label Stat', props: { text: 'Avaliação', fontSize: '12', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1' } },
        ],
      },
    ],
  }

  children.push(statsRow)

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'Hero',
    props: {
      background: gradientFrom,
      gradientFrom: '', gradientTo: '',
      gradientDirection: '135deg',
      backgroundImage: ASSETS.heroBg,
      overlayOpacity: 0.85,
      overlayColor: palette.heroOverlay,
      parallax: true,
      paddingY: 100, minHeight: 550, textAlign: 'center', contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children,
  }
}

// ─── FULL-IMAGE: Imagem full-bleed com overlay forte ────────

export function buildHeroFullImage(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  palette: ColorPalette,
  whatsappHref: string | null,
  emailHref: string,
  heroImage: string | null,
): TemplateNode {
  const bgImage = heroImage || ASSETS.heroBg

  // Badge localização
  const badgeParts: string[] = []
  if (perfil.ano_fundacao) badgeParts.push(`Desde ${perfil.ano_fundacao}`)
  if (perfil.cidade && perfil.estado) badgeParts.push(`${perfil.cidade}, ${perfil.estado}`)

  const children: TemplateNode[] = []

  if (badgeParts.length > 0) {
    children.push({
      type: 'BadgeComponent', displayName: 'Badge Hero',
      props: {
        text: badgeParts.join('  ·  '),
        badgeStyle: 'soft',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        color: palette.textOnDark,
        fontSize: 13, fontWeight: 600, borderRadius: 50,
        paddingX: 24, paddingY: 10,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        textTransform: 'none', letterSpacing: 0, marginBottom: 24,
      },
    })
  }

  // Logo (se existir)
  if (perfil.logo_url) {
    children.push({
      type: 'ImageComponent', displayName: 'Logo Hero',
      props: {
        src: perfil.logo_url, alt: nome,
        width: '180px', height: 'auto', objectFit: 'contain',
        filter: 'brightness(0) invert(1)',
        marginBottom: 24,
      },
    })
  }

  // Título grande
  children.push({
    type: 'HeadingComponent', displayName: 'Nome da Empresa',
    props: {
      text: nome, tagName: 'h1', fontSize: '64', fontWeight: '900',
      textAlign: 'center', color: palette.textOnDark,
      lineHeight: '1.05', letterSpacing: '-2',
      textShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
      maxWidth: '800px',
    },
  })

  // Slogan
  children.push({
    type: 'TextComponent', displayName: 'Slogan',
    props: {
      text: slogan, fontSize: '22', fontWeight: '300',
      textAlign: 'center', color: palette.textMutedOnDark,
      lineHeight: '1.6', maxWidth: '600px',
      margin: [16, 0, 32, 0],
    },
  })

  // CTA
  children.push({
    type: 'ButtonComponent', displayName: 'CTA Hero',
    props: {
      text: whatsappHref ? 'Falar no WhatsApp' : 'Solicite um Orçamento',
      href: whatsappHref || emailHref,
      background: palette.secondary, color: palette.textOnSecondary,
      size: 'lg', buttonStyle: 'filled', borderRadius: 50,
      paddingX: 36, paddingY: 16,
      shadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      icon: whatsappHref ? 'whatsapp' : undefined,
    },
  })

  // Contato inline
  const contactParts: string[] = []
  if (perfil.telefone) contactParts.push(perfil.telefone)
  if (perfil.email_contato) contactParts.push(perfil.email_contato)
  if (contactParts.length > 0) {
    children.push({
      type: 'TextComponent', displayName: 'Contato Hero',
      props: {
        text: contactParts.join('  ·  '),
        fontSize: '15', fontWeight: '500',
        textAlign: 'center', color: palette.textMutedOnDark,
        margin: [24, 0, 0, 0],
      },
    })
  }

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'Hero',
    props: {
      background: palette.primaryDarker,
      gradientFrom: '', gradientTo: '',
      backgroundImage: bgImage,
      overlayOpacity: 0.7,
      overlayColor: `linear-gradient(180deg, ${palette.primaryDarker} 0%, rgba(0,0,0,0.6) 50%, ${palette.primaryDarker} 100%)`,
      parallax: true,
      paddingY: 120, minHeight: 650,
      textAlign: 'center', contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children,
  }
}

// ─── MINIMAL: Split limpo + overlay pesado — texto esquerda + imagem direita ──

export function buildHeroMinimal(
  perfil: PerfilEmpresa,
  nome: string,
  slogan: string,
  palette: ColorPalette,
  whatsappHref: string | null,
  emailHref: string,
): TemplateNode {
  // Hero minimal = overlay pesado (0.92) sobre heroBg — mais cor da marca visível, textura sutil
  // Diferenciação: layout split com stats inline, sem cards flutuantes, botões retos

  const currentYear = new Date().getFullYear()
  const anosExp = perfil.ano_fundacao ? currentYear - perfil.ano_fundacao : null

  // Coluna esquerda: texto sobre fundo escuro
  const textChildren: TemplateNode[] = [
    {
      type: 'TextComponent', displayName: 'Área de Atuação',
      props: {
        text: 'CONTABILIDADE & ASSESSORIA', fontSize: '11', fontWeight: '800',
        textAlign: 'left', color: palette.secondary, letterSpacing: '4', margin: [0, 0, 16, 0],
      },
    },
    {
      type: 'HeadingComponent', displayName: 'Nome da Empresa',
      props: {
        text: nome, tagName: 'h1', fontSize: '52', fontWeight: '900',
        textAlign: 'left', color: palette.textOnDark,
        lineHeight: '1.08', letterSpacing: '-2',
      },
    },
    {
      type: 'TextComponent', displayName: 'Slogan',
      props: {
        text: slogan, fontSize: '17', fontWeight: '400',
        textAlign: 'left', color: palette.textMutedOnDark,
        lineHeight: '1.7', maxWidth: '420px',
        margin: [12, 0, 32, 0],
      },
    },
    {
      type: 'ContainerComponent', isCanvas: true, displayName: 'Botões Hero',
      props: {
        background: 'transparent', padding: 0, gap: 12, width: 'auto', height: 'auto',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
        flexWrap: 'wrap', shadow: 0, radius: 0,
      },
      children: [
        {
          type: 'ButtonComponent', displayName: 'CTA Hero',
          props: {
            text: whatsappHref ? 'Falar no WhatsApp' : 'Solicite um Orçamento',
            href: whatsappHref || emailHref,
            background: palette.secondary, color: palette.textOnSecondary,
            size: 'lg', buttonStyle: 'filled', borderRadius: 4,
            paddingX: 32, paddingY: 16,
            icon: whatsappHref ? 'whatsapp' : undefined,
          },
        },
        {
          type: 'ButtonComponent', displayName: 'CTA Secundário',
          props: {
            text: 'Ver Serviços',
            href: '#servicos',
            background: 'transparent', color: palette.textOnDark,
            size: 'lg', buttonStyle: 'outlined', borderRadius: 4,
            paddingX: 32, paddingY: 16,
            border: `2px solid ${palette.borderOnDark}`,
          },
        },
      ],
    },
  ]

  // Mini stats inline
  const miniStats: TemplateNode[] = []
  if (anosExp && anosExp > 0) {
    miniStats.push({
      type: 'ContainerComponent', isCanvas: false, displayName: 'Stat Anos',
      props: { background: 'transparent', padding: 0, gap: 4, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', shadow: 0, radius: 0 },
      children: [
        { type: 'TextComponent', displayName: 'Valor', props: { text: `${anosExp}+`, fontSize: '32', fontWeight: '900', textAlign: 'left', color: palette.secondary, lineHeight: '1', letterSpacing: '-1' } },
        { type: 'TextComponent', displayName: 'Label', props: { text: 'ANOS', fontSize: '11', fontWeight: '600', textAlign: 'left', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1.5' } },
      ],
    })
  }
  miniStats.push({
    type: 'ContainerComponent', isCanvas: false, displayName: 'Stat Clientes',
    props: { background: 'transparent', padding: 0, gap: 4, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', shadow: 0, radius: 0 },
    children: [
      { type: 'TextComponent', displayName: 'Valor', props: { text: '500+', fontSize: '32', fontWeight: '900', textAlign: 'left', color: palette.secondary, lineHeight: '1', letterSpacing: '-1' } },
      { type: 'TextComponent', displayName: 'Label', props: { text: 'CLIENTES', fontSize: '11', fontWeight: '600', textAlign: 'left', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1.5' } },
    ],
  })
  miniStats.push({
    type: 'ContainerComponent', isCanvas: false, displayName: 'Stat Digital',
    props: { background: 'transparent', padding: 0, gap: 4, width: 'auto', height: 'auto', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', shadow: 0, radius: 0 },
    children: [
      { type: 'TextComponent', displayName: 'Valor', props: { text: '100%', fontSize: '32', fontWeight: '900', textAlign: 'left', color: palette.secondary, lineHeight: '1', letterSpacing: '-1' } },
      { type: 'TextComponent', displayName: 'Label', props: { text: 'DIGITAL', fontSize: '11', fontWeight: '600', textAlign: 'left', color: palette.textMutedOnDark, textTransform: 'uppercase', letterSpacing: '1.5' } },
    ],
  })

  textChildren.push({
    type: 'ContainerComponent', isCanvas: true, displayName: 'Mini Stats',
    props: {
      background: 'transparent', padding: 0, gap: 40, width: '100%', height: 'auto',
      flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start',
      flexWrap: 'wrap', shadow: 0, radius: 0, marginTop: 48,
    },
    children: miniStats,
  })

  const leftColumn: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Texto Hero',
    props: {
      background: 'transparent', padding: 0, gap: 0, width: 'auto', height: 'auto',
      flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
      shadow: 0, radius: 0, flex: '1 1 400px', minWidth: '320px',
    },
    children: textChildren,
  }

  // Coluna direita: imagem profissional com contorno geométrico
  const rightColumn: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Imagem Hero',
    props: {
      background: 'transparent', padding: 0, gap: 0, width: 'auto', height: '100%',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
      shadow: 0, radius: 0, position: 'relative', flex: '1 1 400px', minWidth: '320px',
    },
    children: [
      {
        type: 'ContainerComponent', isCanvas: false, displayName: 'Wrapper Imagem Hero',
        props: {
          background: 'transparent', padding: 0, gap: 0, width: '100%', maxWidth: '500px',
          height: '650px', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          shadow: 0, radius: 0, position: 'relative',
          decorativeFrame: {
            width: '80%',
            height: '70%',
            border: `2px solid ${palette.secondaryAlpha30}`,
            borderRadius: '24px',
          },
        },
        children: [
          {
            type: 'ImageComponent', displayName: 'Imagem Hero',
            props: {
              src: ASSETS.heroProfessional, alt: 'Profissional',
              width: '100%', maxWidth: '500px', height: '650px',
              objectFit: 'contain', zIndex: 2,
            },
          },
        ],
      },
    ],
  }

  const heroGrid: TemplateNode = {
    type: 'ContainerComponent', isCanvas: true, displayName: 'Hero Grid',
    props: {
      background: 'transparent', padding: 0, gap: 40, width: '100%', height: '100%',
      flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between',
      flexWrap: 'wrap', shadow: 0, radius: 0, flex: '1 1 auto',
    },
    children: [leftColumn, rightColumn],
  }

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'Hero',
    props: {
      background: palette.primaryDark,
      gradientFrom: '', gradientTo: '',
      backgroundImage: ASSETS.heroBg,
      overlayOpacity: 0.92,
      overlayColor: palette.heroOverlay,
      paddingY: 70, paddingTop: 70, paddingBottom: 0,
      minHeight: 550, minHeightCalc: 'calc(100vh - 156px)',
      textAlign: 'left', contentMaxWidth: CONTENT_MAX_WIDTH,
    },
    children: [heroGrid],
  }
}
