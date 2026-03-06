import { supabase } from '@/integrations/supabase/client'

export type ImageSize = '1024x1024' | '1024x1792' | '1792x1024'

export interface GenerateImageRequest {
  prompt: string
  size?: ImageSize
}

export interface GenerateImageResponse {
  imageUrl: string
}

/**
 * Chama a Edge Function generate-image para gerar uma imagem via OpenRouter/DALL-E 3.
 */
export async function generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
  const { data, error } = await supabase.functions.invoke('generate-image', {
    body: request,
  })

  if (error) throw new Error('Falha ao conectar com o serviço de geração de imagem.')
  if (data?.error) throw new Error(data.error)
  if (!data?.imageUrl) throw new Error('Resposta inesperada do serviço.')

  return data as GenerateImageResponse
}

/**
 * Baixa uma imagem gerada (URL remota ou data URL) e faz upload para o Supabase Storage.
 * Retorna a URL pública persistente.
 */
export async function uploadGeneratedImage(userId: string, imageUrl: string): Promise<string> {
  let blob: Blob

  if (imageUrl.startsWith('data:')) {
    // Base64 data URL
    const response = await fetch(imageUrl)
    blob = await response.blob()
  } else {
    // URL remota
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Falha ao baixar imagem gerada.')
    blob = await response.blob()
  }

  const path = `${userId}/ai-generated-${Date.now()}.png`

  const { error } = await supabase.storage
    .from('logos')
    .upload(path, blob, { upsert: true, contentType: 'image/png' })

  if (error) throw new Error(`Falha ao salvar imagem: ${error.message}`)

  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}
