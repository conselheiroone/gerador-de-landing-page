import type { Json } from '@/integrations/supabase/types'

export const SECAO_CATEGORIAS = [
  'Hero',
  'Sobre',
  'Servicos',
  'Features',
  'CTA',
  'Depoimentos',
  'Precos',
  'FAQ',
  'Equipe',
  'Rodape',
  'Contato',
] as const

export type SecaoCategoria = (typeof SECAO_CATEGORIAS)[number]

export interface SecaoPresetRow {
  id: string
  nome: string
  categoria: string
  descricao: string | null
  thumbnail_url: string | null
  dados_componente: Json
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface SecaoPresetItem {
  id: string
  nome: string
  categoria: string
  descricao: string
  thumbnail_url: string | null
  isBuiltin: boolean
  json: string
}
