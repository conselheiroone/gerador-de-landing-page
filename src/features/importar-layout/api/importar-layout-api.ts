import { supabase } from '@/integrations/supabase/client'
import type { FetchHtmlResponse } from '../types/importar-layout.types'

export async function buscarHtmlExterno(url: string): Promise<FetchHtmlResponse> {
  const { data, error } = await supabase.functions.invoke<FetchHtmlResponse>(
    'fetch-html',
    { body: { url } },
  )

  if (error) {
    throw new Error(`Erro ao comunicar com o servidor: ${error.message}`)
  }

  if (!data) {
    throw new Error('Resposta vazia do servidor')
  }

  if (!data.success) {
    throw new Error(data.error ?? 'Erro desconhecido ao processar URL')
  }

  return data
}
