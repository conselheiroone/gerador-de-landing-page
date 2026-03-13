/**
 * Variantes do Navbar.
 *
 * - default: Glass dark com blur (padrão atual)
 * - minimal-white: Fundo branco, links escuros, CTA com cor primária
 * - bold-dark: Fundo sólido escuro, links uppercase, estilo forte
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import type { NavbarVariant } from '../layout-types'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

// ─── Dispatcher ─────────────────────────────────────────────

export function buildNavbar(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
  variant?: NavbarVariant,
): TemplateNode {
  if (variant === 'minimal-white') return buildNavbarMinimalWhite(perfil, nome, palette)
  if (variant === 'bold-dark') return buildNavbarBoldDark(perfil, nome, palette)
  return buildNavbarDefault(perfil, nome, palette)
}

// ─── Links compartilhados ───────────────────────────────────

function getNavLinks(perfil: PerfilEmpresa) {
  return [
    { label: 'Início', href: '#' },
    ...(perfil.servicos?.length ? [{ label: 'Serviços', href: '#servicos' }] : []),
    ...(perfil.segmentos?.length ? [{ label: 'Segmentos', href: '#segmentos' }] : []),
    { label: 'Sobre', href: '#sobre' },
    { label: 'Equipe', href: '#equipe' },
  ]
}

// ─── DEFAULT: Glass dark com blur ───────────────────────────

function buildNavbarDefault(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const hasLogo = !!perfil.logo_url

  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: palette.navbarBg,
      backdropBlur: 0,
      borderBottom: 'none',
      logoText: nome,
      logoSrc: perfil.logo_url || '',
      logoWidth: hasLogo ? 140 : undefined,
      logoHeight: hasLogo ? 48 : 44,
      logoBg: hasLogo ? palette.cardBackground : 'transparent',
      logoShape: hasLogo ? 'pill' : 'pill',
      showLogoText: false,
      links: getNavLinks(perfil),
      ctaText: 'Fale Conosco',
      ctaBg: palette.primary,
      ctaColor: palette.textOnPrimary,
      ctaBorderRadius: 8,
      linkColor: palette.textOnDark,
      linkFontSize: 14,
      paddingX: 40,
      paddingY: 16,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
  }
}

// ─── MINIMAL-WHITE: Fundo branco, links escuros ─────────────

function buildNavbarMinimalWhite(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const hasLogo = !!perfil.logo_url

  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: '#ffffff',
      backdropBlur: 0,
      borderBottom: `1px solid ${'#e2e8f0'}`,
      logoText: nome,
      logoSrc: perfil.logo_url || '',
      logoWidth: hasLogo ? 120 : undefined,
      logoHeight: hasLogo ? 36 : 36,
      logoBg: 'transparent',
      logoShape: 'none',
      showLogoText: !hasLogo,
      links: getNavLinks(perfil),
      ctaText: 'Fale Conosco',
      ctaBg: palette.secondary,
      ctaColor: palette.textOnSecondary,
      ctaBorderRadius: 6,
      linkColor: palette.textMuted,
      linkFontSize: 14,
      paddingX: 40,
      paddingY: 12,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
  }
}

// ─── BOLD-DARK: Sólido escuro, uppercase ────────────────────

function buildNavbarBoldDark(
  perfil: PerfilEmpresa,
  nome: string,
  palette: ColorPalette,
): TemplateNode {
  const hasLogo = !!perfil.logo_url

  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: palette.secondaryDarker,
      backdropBlur: 0,
      borderBottom: 'none',
      logoText: nome,
      logoSrc: perfil.logo_url || '',
      logoWidth: hasLogo ? 100 : undefined,
      logoHeight: hasLogo ? 28 : 28,
      logoBg: 'transparent',
      logoShape: 'none',
      showLogoText: true,
      links: getNavLinks(perfil),
      ctaText: 'WhatsApp',
      ctaBg: palette.primary,
      ctaColor: palette.textOnPrimary,
      ctaBorderRadius: 4,
      linkColor: 'rgba(255,255,255,0.6)',
      linkFontSize: 12,
      paddingX: 40,
      paddingY: 12,
      contentMaxWidth: CONTENT_MAX_WIDTH,
    },
  }
}
