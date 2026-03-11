/**
 * Gerador de template Craft.js baseado nos dados do perfil da empresa.
 *
 * Este arquivo agora delega para o sistema de variação de layouts (layout-engine.ts)
 * enquanto mantém retrocompatibilidade total com o código existente.
 *
 * REGRAS:
 * - Somente dados reais do perfil são exibidos (nada inventado)
 * - Português pt-BR correto com acentuação
 * - Usa as cores do perfil exatamente como o usuário definiu
 * - A variação é EXCLUSIVAMENTE estrutural/visual — nunca de conteúdo
 */

import type { PerfilEmpresa, Socio, Depoimento } from '@/features/onboarding/types/onboarding.types'
import {
  // Re-exporta funções de cor para compatibilidade
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
  isLightColor,
} from './color-palette'
import { generateVariedTemplate, generateTemplateVariations } from './layout-engine'

// Re-exporta para compatibilidade com código existente
export { hexToRgb, rgbToHex, lighten, darken, isLightColor }

// Re-exporta funções do novo engine
export { generateVariedTemplate, generateTemplateVariations }

// Re-exporta blueprints para uso na UI
export { BLUEPRINTS, getBlueprintById } from './layout-blueprints'

// Re-exporta tipos
export type { LayoutBlueprint, HeroVariant, ServicesVariant } from './layout-types'

/**
 * Gera o template padrão (blueprint 'classico') para retrocompatibilidade.
 *
 * Código existente que chama generateProfileTemplate() continua funcionando
 * exatamente como antes — produz o layout clássico.
 */
export function generateProfileTemplate(
  perfil: PerfilEmpresa,
  socios: Socio[],
  depoimentos?: Depoimento[],
): string {
  return generateVariedTemplate(perfil, socios, depoimentos, { blueprintId: 'classico' })
}
