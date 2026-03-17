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

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Faz upload de um arquivo de imagem do editor para o Supabase Storage.
 * Valida tipo (image/*) e tamanho (5MB max).
 * Retorna a URL pública.
 */
export async function uploadEditorImage(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo deve ser uma imagem.')
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('Imagem deve ter no máximo 5MB.')
  }

  const ext = file.name.split('.').pop() || 'png'
  const path = `${userId}/editor-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`)

  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
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
