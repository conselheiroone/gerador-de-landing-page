import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'

export interface TemplateRow {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  thumbnail_url: string | null
  dados_template: Json
  ativo: boolean
  criado_por: string
  created_at: string
  updated_at: string
}

export async function listarTemplates(
  categoria?: string
): Promise<TemplateRow[]> {
  let query = supabase
    .from('templates')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  if (categoria && categoria !== 'Todos') {
    query = query.eq('categoria', categoria)
  }

  const { data, error } = await query

  if (error) throw new Error(`Erro ao listar templates: ${error.message}`)
  return (data ?? []) as TemplateRow[]
}

export async function buscarTemplate(
  templateId: string
): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw new Error(`Erro ao buscar template: ${error.message}`)
  return data as TemplateRow
}

export async function criarTemplate(
  nome: string,
  descricao: string,
  categoria: string,
  dadosTemplate: string,
  criadoPor: string
): Promise<TemplateRow> {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      nome,
      descricao,
      categoria,
      dados_template: JSON.parse(dadosTemplate) as Json,
      criado_por: criadoPor,
    })
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar template: ${error.message}`)
  return data as TemplateRow
}

export async function atualizarTemplate(
  templateId: string,
  updates: {
    nome?: string
    descricao?: string
    categoria?: string
    dados_template?: string
    ativo?: boolean
  }
): Promise<void> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.nome !== undefined) updateData.nome = updates.nome
  if (updates.descricao !== undefined) updateData.descricao = updates.descricao
  if (updates.categoria !== undefined) updateData.categoria = updates.categoria
  if (updates.dados_template !== undefined) {
    updateData.dados_template = JSON.parse(updates.dados_template) as Json
  }
  if (updates.ativo !== undefined) updateData.ativo = updates.ativo

  const { error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', templateId)

  if (error) throw new Error(`Erro ao atualizar template: ${error.message}`)
}

export async function deletarTemplate(
  templateId: string
): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId)

  if (error) throw new Error(`Erro ao deletar template: ${error.message}`)
}
