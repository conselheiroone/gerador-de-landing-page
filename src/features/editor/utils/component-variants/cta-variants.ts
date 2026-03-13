/**
 * Variantes da seção CTA.
 *
 * - default: CTA full-width com bg image + overlay gradiente
 * - simple: CTA simples sem badge, só título + botão
 * - boxed: CTA dentro de container arredondado (card sobre fundo claro)
 * - inline-strip: Faixa horizontal compacta (texto esquerda + botão direita)
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { CtaVariant } from '../layout-types'
import { ASSETS, CONTENT_MAX_WIDTH } from '../template-helpers'

// ─── Helpers ────────────────────────────────────────────────

function getCtaLinks(perfil: PerfilEmpresa): { whatsappHref: string | null; emailHref: string } {
  const whatsappHref = perfil.whatsapp
    ? `https://wa.me/55${perfil.whatsapp.replace(/\D/g, '')}`
    : null
  const emailHref = perfil.email_contato ? `mailto:${perfil.email_contato}` : '#contato'
  return { whatsappHref, emailHref }
}

function getContactLine(perfil: PerfilEmpresa): string {
  const parts: string[] = []
  if (perfil.telefone) parts.push(perfil.telefone)
  if (perfil.email_contato) parts.push(perfil.email_contato)
  return parts.join('  ·  ')
}

// ─── Dispatcher ─────────────────────────────────────────────

export function buildCta(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
  variant?: CtaVariant,
): TemplateNode {
  if (variant === 'simple') return buildCtaSimple(perfil, palette)
  if (variant === 'boxed') return buildCtaBoxed(perfil, palette)
  if (variant === 'inline-strip') return buildCtaInlineStrip(perfil, palette)
  return buildCtaDefault(perfil, palette)
}

// ─── DEFAULT: Full-width com bg image ───────────────────────

function buildCtaDefault(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const { whatsappHref, emailHref } = getCtaLinks(perfil)
  const contactLine = getContactLine(perfil)

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
        text: whatsappHref ? 'Falar pelo WhatsApp' : 'Fale Conosco', href: whatsappHref || emailHref,
        background: palette.cardBackground, color: palette.secondary,
        size: 'lg', buttonStyle: 'filled', borderRadius: 50,
        paddingX: 36, paddingY: 16,
        shadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
        icon: whatsappHref ? 'whatsapp' : undefined,
      },
    },
  ]

  if (contactLine) {
    ctaChildren.push({
      type: 'TextComponent', displayName: 'Contato',
      props: { text: contactLine, fontSize: '15', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark, margin: [24, 0, 0, 0] },
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

// ─── SIMPLE: Sem badge, mínimo ──────────────────────────────

function buildCtaSimple(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const { whatsappHref, emailHref } = getCtaLinks(perfil)
  const ctaOverlay = `linear-gradient(135deg, ${palette.primaryDarker} 0%, ${palette.secondaryDarker} 100%)`

  return {
    type: 'HeroSectionComponent', isCanvas: true, displayName: 'CTA',
    props: {
      background: palette.primaryDarker, gradientFrom: '', gradientTo: '',
      backgroundImage: ASSETS.ctaBg, overlayOpacity: 0.90, overlayColor: ctaOverlay,
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

// ─── BOXED: Card arredondado dentro de seção clara ──────────

function buildCtaBoxed(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const { whatsappHref, emailHref } = getCtaLinks(perfil)
  const contactLine = getContactLine(perfil)

  const innerChildren: TemplateNode[] = [
    {
      type: 'HeadingComponent', displayName: 'Título CTA',
      props: {
        text: 'Pronto para transformar seu negócio?', tagName: 'h2', fontSize: '36', fontWeight: '800',
        textAlign: 'center', color: palette.textOnDark, lineHeight: '1.2',
      },
    },
    {
      type: 'TextComponent', displayName: 'Subtítulo CTA',
      props: {
        text: 'Entre em contato agora e descubra como podemos ajudar o seu negócio a crescer.',
        fontSize: '17', fontWeight: '400', textAlign: 'center', color: palette.textMutedOnDark,
        lineHeight: '1.6', margin: [8, 0, 24, 0], maxWidth: '500px',
      },
    },
    {
      type: 'ButtonComponent', displayName: 'Botão CTA',
      props: {
        text: whatsappHref ? 'Falar pelo WhatsApp' : 'Fale Conosco', href: whatsappHref || emailHref,
        background: palette.cardBackground, color: palette.secondary,
        size: 'lg', buttonStyle: 'filled', borderRadius: 8,
        icon: whatsappHref ? 'whatsapp' : undefined,
      },
    },
  ]

  if (contactLine) {
    innerChildren.push({
      type: 'TextComponent', displayName: 'Contato',
      props: { text: contactLine, fontSize: '14', fontWeight: '500', textAlign: 'center', color: palette.textMutedOnDark, margin: [20, 0, 0, 0] },
    })
  }

  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'CTA Seção',
    props: {
      background: '#ffffff', padding: 0, paddingY: 80, paddingX: 40, gap: 0, width: '100%', height: 'auto',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
      sectionId: 'contato',
    },
    children: [{
      type: 'ContainerComponent', isCanvas: true, displayName: 'CTA Box',
      props: {
        background: `linear-gradient(135deg, ${palette.primaryDarker} 0%, ${palette.secondaryDarker} 100%)`,
        padding: 56, gap: 8, width: '100%', maxWidth: CONTENT_MAX_WIDTH, height: 'auto',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        shadow: 3, radius: 24,
      },
      children: innerChildren,
    }],
  }
}

// ─── INLINE-STRIP: Faixa compacta (texto + botão lado a lado) ──

function buildCtaInlineStrip(
  perfil: PerfilEmpresa,
  palette: ColorPalette,
): TemplateNode {
  const { whatsappHref, emailHref } = getCtaLinks(perfil)

  return {
    type: 'ContainerComponent', isCanvas: true, displayName: 'CTA Strip',
    props: {
      background: palette.primary, padding: 0, paddingY: 40, paddingX: 40, gap: 24, width: '100%', height: 'auto',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadow: 0, radius: 0,
      sectionId: 'contato',
    },
    children: [
      {
        type: 'HeadingComponent', displayName: 'Texto CTA',
        props: {
          text: 'Precisa de ajuda com sua contabilidade?', tagName: 'h3', fontSize: '22', fontWeight: '800',
          textAlign: 'left', color: palette.textOnPrimary,
        },
      },
      {
        type: 'ButtonComponent', displayName: 'Botão CTA',
        props: {
          text: whatsappHref ? 'Fale Conosco' : 'Entre em Contato', href: whatsappHref || emailHref,
          background: palette.cardBackground, color: palette.textOnLight,
          size: 'md', buttonStyle: 'filled', borderRadius: 4,
          icon: whatsappHref ? 'whatsapp' : undefined,
        },
      },
    ],
  }
}
