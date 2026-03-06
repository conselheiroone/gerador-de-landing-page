import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'
import type { SecaoPresetRow } from '../types/secao-presets.types'

export async function listarSecaoPresets(
  categoria?: string,
): Promise<SecaoPresetRow[]> {
  let query = supabase
    .from('componentes_biblioteca')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  if (categoria && categoria !== 'Todas') {
    query = query.eq('categoria', categoria)
  }

  const { data, error } = await query

  if (error) throw new Error(`Erro ao listar seções: ${error.message}`)
  return (data ?? []) as SecaoPresetRow[]
}

export async function buscarSecaoPreset(
  id: string,
): Promise<SecaoPresetRow> {
  const { data, error } = await supabase
    .from('componentes_biblioteca')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Erro ao buscar seção: ${error.message}`)
  return data as SecaoPresetRow
}

export async function criarSecaoPreset(params: {
  nome: string
  categoria: string
  descricao?: string
  thumbnail_url?: string
  dados_componente: string
}): Promise<SecaoPresetRow> {
  const { data, error } = await supabase
    .from('componentes_biblioteca')
    .insert({
      nome: params.nome,
      categoria: params.categoria,
      descricao: params.descricao ?? null,
      thumbnail_url: params.thumbnail_url ?? null,
      dados_componente: JSON.parse(params.dados_componente) as Json,
    })
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar seção: ${error.message}`)
  return data as SecaoPresetRow
}

export async function atualizarSecaoPreset(
  id: string,
  updates: {
    nome?: string
    categoria?: string
    descricao?: string
    thumbnail_url?: string
    dados_componente?: string
    ativo?: boolean
  },
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.nome !== undefined) updateData.nome = updates.nome
  if (updates.categoria !== undefined) updateData.categoria = updates.categoria
  if (updates.descricao !== undefined) updateData.descricao = updates.descricao
  if (updates.thumbnail_url !== undefined) updateData.thumbnail_url = updates.thumbnail_url
  if (updates.dados_componente !== undefined) {
    updateData.dados_componente = JSON.parse(updates.dados_componente) as Json
  }
  if (updates.ativo !== undefined) updateData.ativo = updates.ativo

  const { error } = await supabase
    .from('componentes_biblioteca')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(`Erro ao atualizar seção: ${error.message}`)
}

export async function deletarSecaoPreset(id: string): Promise<void> {
  const { error } = await supabase
    .from('componentes_biblioteca')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Erro ao deletar seção: ${error.message}`)
}
