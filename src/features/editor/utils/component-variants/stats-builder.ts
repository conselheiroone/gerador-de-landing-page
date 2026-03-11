/**
 * Builder da seção Stats.
 */

import type { PerfilEmpresa, Socio } from '@/features/onboarding/types/onboarding.types'
import type { ColorPalette } from '../color-palette'
import type { TemplateNode } from '../default-templates'

export function buildStats(
  perfil: PerfilEmpresa,
  socios: Socio[],
  palette: ColorPalette,
): TemplateNode | null {
  const currentYear = new Date().getFullYear()
  const stats: Array<{ valor: string; label: string }> = []

  if (perfil.ano_fundacao && perfil.ano_fundacao < currentYear) {
    const anos = currentYear - perfil.ano_fundacao
    stats.push({ valor: `${anos}`, label: 'Anos de Experiência' })
  }

  if (perfil.servicos && perfil.servicos.length > 0) {
    const n = perfil.servicos.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'Serviço Oferecido' : 'Serviços Oferecidos' })
  }

  const sociosVisiveis = socios.filter(s => s.exibir_landing_page)
  if (sociosVisiveis.length > 0) {
    const n = sociosVisiveis.length
    stats.push({ valor: `${n}`, label: n === 1 ? 'Especialista Dedicado' : 'Especialistas Dedicados' })
  }

  if (stats.length < 3) {
    stats.push({ valor: '500+', label: 'Clientes Atendidos' })
  }

  if (stats.length < 2) return null

  return {
    type: 'StatsBandComponent',
    displayName: 'Números',
    props: {
      background: palette.statsBg,
      textColor: palette.textOnDark,
      accentColor: palette.textOnDark,
      labelColor: palette.textMutedOnDark,
      paddingY: 40,
      showDivider: true,
      stats,
      fontSize: 56,
      labelFontSize: 12,
      fontWeight: '900',
      labelTextTransform: 'uppercase',
      labelLetterSpacing: 2,
      showGlow: true,
    },
  }
}
