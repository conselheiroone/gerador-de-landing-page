/**
 * Builder do Navbar.
 */

import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'
import { CONTENT_MAX_WIDTH } from '../template-helpers'

export function buildNavbar(
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
      links: [
        { label: 'Início', href: '#' },
        ...(perfil.servicos?.length ? [{ label: 'Serviços', href: '#servicos' }] : []),
        ...(perfil.segmentos?.length ? [{ label: 'Segmentos', href: '#segmentos' }] : []),
        { label: 'Sobre', href: '#sobre' },
        { label: 'Equipe', href: '#equipe' },
      ],
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
