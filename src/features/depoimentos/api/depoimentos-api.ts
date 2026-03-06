/**
 * API client para depoimentos:
 * - CRUD via Supabase (tabela `depoimentos`)
 * - Busca de reviews do Google via Edge Function `fetch-google-reviews`
 */

import { supabase } from '@/integrations/supabase/client'
import type { Depoimento } from '@/features/onboarding/types/onboarding.types'

// ─── CRUD Supabase ────────────────────────────────────────────

export async function fetchDepoimentos(perfilEmpresaId: string): Promise<Depoimento[]> {
  const { data, error } = await supabase
    .from('depoimentos')
    .select('*')
    .eq('perfil_empresa_id', perfilEmpresaId)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Depoimento[]
}

export async function upsertDepoimento(
  depoimento: Omit<Depoimento, 'id' | 'created_at' | 'updated_at'> & { id?: string },
): Promise<Depoimento> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('depoimentos')
    .upsert(depoimento, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Depoimento
}

export async function deleteDepoimento(id: string): Promise<void> {
  const { error } = await supabase
    .from('depoimentos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Google Reviews via Edge Function ────────────────────────

export interface GoogleReviewsResponse {
  nomeEmpresa: string
  notaMedia: number | null
  totalAvaliacoes: number
  reviews: Array<{
    nomeCliente: string
    cargo: string
    citacao: string
    nota: number
    fotoUrl: string | null
    googleReviewId: string | null
  }>
}

export async function fetchGoogleReviews(placeId: string): Promise<GoogleReviewsResponse> {
  const { data, error } = await supabase.functions.invoke('fetch-google-reviews', {
    body: { place_id: placeId },
  })

  if (error) throw new Error('Não foi possível conectar à função de busca. Verifique se o servidor Supabase está rodando.')
  if (data?.error) throw new Error(data.error)

  return data as GoogleReviewsResponse
}

/**
 * Importa reviews do Google e salva como depoimentos no Supabase.
 * Faz deduplicação pelo google_review_id.
 */
export async function importarReviewsDoGoogle(
  perfilEmpresaId: string,
  placeId: string,
): Promise<{ importados: number; duplicados: number }> {
  const result = await fetchGoogleReviews(placeId)

  let importados = 0
  let duplicados = 0

  for (const review of result.reviews) {
    if (!review.citacao || review.citacao.length < 20) continue

    // Verifica se já existe
    const { data: existing } = await supabase
      .from('depoimentos')
      .select('id')
      .eq('perfil_empresa_id', perfilEmpresaId)
      .eq('google_review_id', review.googleReviewId ?? '')
      .maybeSingle()

    if (existing) {
      duplicados++
      continue
    }

    await upsertDepoimento({
      perfil_empresa_id: perfilEmpresaId,
      nome_cliente: review.nomeCliente,
      cargo: review.cargo,
      citacao: review.citacao,
      nota: Math.max(1, Math.min(5, Math.round(review.nota))),
      foto_url: review.fotoUrl,
      source: 'google',
      google_review_id: review.googleReviewId,
      ativo: true,
      ordem: importados,
    })
    importados++
  }

  return { importados, duplicados }
}
