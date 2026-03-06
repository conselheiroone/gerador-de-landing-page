import { supabase } from '@/integrations/supabase/client'
import type { Json } from '@/integrations/supabase/types'

export interface ProjetoRow {
  id: string
  nome: string
  descricao: string | null
  template_id: string | null
  dados_pagina: Json
  usuario_id: string
  publicado: boolean
  created_at: string
  updated_at: string
}

export async function criarProjeto(
  nome: string,
  usuarioId: string,
  dadosPagina: string,
  templateId?: string
): Promise<ProjetoRow> {
  const { data, error } = await supabase
    .from('projetos')
    .insert({
      nome,
      usuario_id: usuarioId,
      dados_pagina: JSON.parse(dadosPagina) as Json,
      template_id: templateId ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(`Erro ao criar projeto: ${error.message}`)
  return data as ProjetoRow
}

export async function salvarProjeto(
  projetoId: string,
  dadosPagina: string
): Promise<void> {
  const { error } = await supabase
    .from('projetos')
    .update({
      dados_pagina: JSON.parse(dadosPagina) as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projetoId)

  if (error) throw new Error(`Erro ao salvar projeto: ${error.message}`)
}

export async function carregarProjeto(
  projetoId: string
): Promise<ProjetoRow> {
  const { data, error } = await supabase
    .from('projetos')
    .select('*')
    .eq('id', projetoId)
    .single()

  if (error) throw new Error(`Erro ao carregar projeto: ${error.message}`)
  return data as ProjetoRow
}

export async function listarProjetos(
  usuarioId: string
): Promise<ProjetoRow[]> {
  const { data, error } = await supabase
    .from('projetos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Erro ao listar projetos: ${error.message}`)
  return (data ?? []) as ProjetoRow[]
}

export async function deletarProjeto(
  projetoId: string
): Promise<void> {
  const { error } = await supabase
    .from('projetos')
    .delete()
    .eq('id', projetoId)

  if (error) throw new Error(`Erro ao deletar projeto: ${error.message}`)
}

export async function atualizarNomeProjeto(
  projetoId: string,
  nome: string
): Promise<void> {
  const { error } = await supabase
    .from('projetos')
    .update({ nome, updated_at: new Date().toISOString() })
    .eq('id', projetoId)

  if (error) throw new Error(`Erro ao atualizar nome: ${error.message}`)
}
