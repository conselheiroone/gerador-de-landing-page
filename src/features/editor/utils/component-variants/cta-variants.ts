/**
 * Variantes da seção CTA.
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { CtaVariant } from '../layout-types'
import { ASSETS, CONTENT_MAX_WIDTH } from '../template-helpers'

export function buildCta(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
  variant?: CtaVariant,
): TemplateNode {
  if (variant === 'simple') {
    return buildCtaSimple(perfil, palette)
  }
  return buildCtaDefault(perfil, palette)
}

// ─── DEFAULT: CTA com background image ──────────────────────

function buildCtaDefault(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  let ctaBtnText = 'Fale Conosco'
  if (whatsappHref) ctaBtnText = 'Falar pelo WhatsApp'

  const ctaChildren: TemplateNode[] = [
    {
      type: 'BadgeComponent', displayName: 'Tag CTA',
      props: {
        text: 'Fale Conosco', badgeStyle: 'soft',
        backgroundColor: 'rgba(255, 255, 255, 0.15)', color: palette.textOnDark,
        fontSize: 13, fontWeight: 600, borderRadius: 50, paddingX: 24, paddingY: 10,
        border: '1px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 24,
      },
    },
    {
      type: 'HeadingComponent', displayName: 'Título CTA',
      props: {
        text: 'Pronto para transformar seu negócio?', tagName: 'h2', fontSize: '48', fontWeight: '800',
        textAlign: 'center', color: palette.textOnDark, lineHeight: '1.2', maxWidth: '700px',
        textShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
    },
    {
      type: 'TextComponent', displayName: 'Subtítulo CTA',
      props: {
        text: 'Entre em contato agora e descubra como podemos ajudar o seu negócio a crescer com segurança e eficiência.',
        fontSize: '18', fontWeight: '400', textAlign: 'center', color: palette.textMutedOnDark,
        lineHeight: '1.7', margin: [8, 0, 28, 0], maxWidth: '550px',
      },
    },
    {
      type: 'ButtonComponent', displayName: 'Botão CTA',
      props: {
        text: ctaBtnText, href: whatsappHref || emailHref,
        background: palette.cardBackground, color: palette.secondary,
        size: 'lg', buttonStyle: 'filled', borderRadius: 50,
        paddingX: 36, paddingY: 16,
        shadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        icon: whatsappHref ? 'whatsapp' : undefined,
      },
    },
  ]

  // Contato inline
  const contactParts: string[] = []
  if (perfil.telefone) contactParts.push(perfil.telefone)
  if (perfil.email_contato) contactParts.push(perfil.email_contato)
  if (contactParts.length > 0) {
    ctaChildren.push({
      type: 'TextComponent', displayName: 'Informações de Contato',
      props: { text: contactParts.join('  ·  '), fontSize: '15', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark, margin: [24, 0, 0, 0] },
    })
  }

  const ctaOverlay = `linear-gradient(135deg, ${palette.primaryDarker} 0%, ${palette.secondaryDarker} 100%)`

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'CTA',
    props: {
      background: palette.primaryDarker, gradientFrom: '', gradientTo: '',
      backgroundImage: ASSETS.ctaBg, overlayOpacity: 0.88, overlayColor: ctaOverlay,
      parallax: true, paddingY: 100, minHeight: 400, textAlign: 'center',
      contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'contato',
    },
    children: ctaChildren,
  }
}

// ─── SIMPLE: CTA sem background image ───────────────────────

function buildCtaSimple(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'

  const ctaOverlay = `linear-gradient(135deg, ${palette.primaryDarker} 0%, ${palette.secondaryDarker} 100%)`

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'CTA',
    props: {
      background: palette.primaryDarker,
      gradientFrom: '', gradientTo: '',
      backgroundImage: ASSETS.ctaBg,
      overlayOpacity: 0.90,
      overlayColor: ctaOverlay,
      paddingY: 80, minHeight: 300, textAlign: 'center',
      contentMaxWidth: CONTENT_MAX_WIDTH, sectionId: 'contato',
    },
    children: [
      {
        type: 'HeadingComponent', displayName: 'Título CTA',
        props: {
          text: 'Pronto para transformar seu negócio?', tagName: 'h2', fontSize: '40', fontWeight: '800',
          textAlign: 'center', color: palette.textOnDark, lineHeight: '1.2', maxWidth: '600px',
        },
      },
      {
        type: 'TextComponent', displayName: 'Subtítulo CTA',
        props: {
          text: 'Fale conosco e descubra como podemos ajudar.',
          fontSize: '18', fontWeight: '400', textAlign: 'center', color: palette.textMutedOnDark,
          lineHeight: '1.6', margin: [8, 0, 28, 0],
        },
      },
      {
        type: 'ButtonComponent', displayName: 'Botão CTA',
        props: {
          text: whatsappHref ? 'Falar no WhatsApp' : 'Entre em Contato',
          href: whatsappHref || emailHref,
          background: palette.cardBackground, color: palette.secondary,
          size: 'lg', buttonStyle: 'filled', borderRadius: 8,
          icon: whatsappHref ? 'whatsapp' : undefined,
        },
      },
    ],
  }
}
