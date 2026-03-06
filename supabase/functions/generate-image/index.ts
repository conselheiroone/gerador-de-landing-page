/**
 * Edge Function: generate-image
 *
 * Gera imagens via OpenRouter API com suporte a multiplos modelos.
 * Resolve modelo dinamicamente: body override > user override > default global > fallback.
 *
 * Requer secrets no Supabase:
 *   - OPENROUTER_API_KEY
 *   - SUPABASE_URL (automatico)
 *   - SUPABASE_SERVICE_ROLE_KEY (automatico)
 *
 * Body: { prompt: string, size?: '1024x1024' | '1024x1792' | '1792x1024', model?: string }
 * Response: { imageUrl: string }
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const AVAILABLE_MODELS = [
  {
    id: 'google/gemini-3.1-flash-image-preview',
    alias: 'Gemini Flash',
    apiType: 'chat' as const, // usa /chat/completions
  },
  {
    id: 'black-forest-labs/flux-2-klein-4b',
    alias: 'FLUX.2 Klein',
    apiType: 'image' as const, // usa /images/generations
  },
  {
    id: 'openai/gpt-5-image-mini',
    alias: 'GPT-5 Image Mini',
    apiType: 'chat' as const, // usa /chat/completions
  },
] as const

type AvailableModel = (typeof AVAILABLE_MODELS)[number]

const VALID_SIZES = ['1024x1024', '1024x1792', '1792x1024'] as const

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

/** Timeout para chamadas a API (90s — modelos chat podem ser mais lentos) */
const API_TIMEOUT_MS = 90_000

// ---------------------------------------------------------------------------
// CORS e utilitarios de resposta
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ---------------------------------------------------------------------------
// Supabase client (service role — bypassa RLS)
// ---------------------------------------------------------------------------

function getSupabaseAdmin(): SupabaseClient | null {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    console.warn('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao configurados. Resolucao de modelo via banco indisponivel.')
    return null
  }
  return createClient(url, key)
}

// ---------------------------------------------------------------------------
// Extrair user_id do JWT
// ---------------------------------------------------------------------------

async function extractUserId(
  supabase: SupabaseClient | null,
  authHeader: string | null,
): Promise<string | null> {
  if (!supabase || !authHeader) return null

  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user?.id) return null
    return data.user.id
  } catch (err) {
    console.warn('Nao foi possivel extrair user_id do JWT:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Resolver modelo (cadeia de prioridade)
// ---------------------------------------------------------------------------

/**
 * Cadeia de resolucao:
 *   1. Override explicito no body (model) — se estiver na whitelist
 *   2. Override do usuario (openrouter_user_overrides)
 *   3. Default global (admin_settings.openrouter_default_image_model)
 *   4. Fallback: primeiro modelo da lista
 */
async function resolveModel(
  supabase: SupabaseClient | null,
  userId: string | null,
  bodyModelOverride?: string | null,
): Promise<AvailableModel> {
  const fallback = AVAILABLE_MODELS[0]

  // Helper: busca modelo na whitelist
  const findModel = (modelId: string): AvailableModel | undefined =>
    AVAILABLE_MODELS.find((m) => m.id === modelId)

  // 1. Override explicito no body
  if (bodyModelOverride) {
    const found = findModel(bodyModelOverride)
    if (found) {
      console.log(`Modelo resolvido via body override: ${found.id}`)
      return found
    }
    console.warn(`Modelo do body "${bodyModelOverride}" nao esta na whitelist. Ignorando.`)
  }

  // Se nao temos client Supabase, vai direto pro fallback
  if (!supabase) {
    console.log(`Modelo resolvido via fallback (sem Supabase client): ${fallback.id}`)
    return fallback
  }

  // 2. Override do usuario
  if (userId) {
    try {
      const { data } = await supabase
        .from('openrouter_user_overrides')
        .select('image_model')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      if (data?.image_model) {
        const found = findModel(data.image_model)
        if (found) {
          console.log(`Modelo resolvido via user override (${userId}): ${found.id}`)
          return found
        }
        console.warn(`Modelo do user override "${data.image_model}" nao esta na whitelist. Ignorando.`)
      }
    } catch (err) {
      console.warn('Erro ao buscar user override:', err)
    }
  }

  // 3. Default global
  try {
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'openrouter_default_image_model')
      .maybeSingle()

    if (data?.value) {
      const found = findModel(data.value)
      if (found) {
        console.log(`Modelo resolvido via default global: ${found.id}`)
        return found
      }
      console.warn(`Modelo global "${data.value}" nao esta na whitelist. Ignorando.`)
    }
  } catch (err) {
    console.warn('Erro ao buscar default global:', err)
  }

  // 4. Fallback
  console.log(`Modelo resolvido via fallback: ${fallback.id}`)
  return fallback
}

// ---------------------------------------------------------------------------
// Extrair imagem de resposta chat/completions (modelos multimodais)
// ---------------------------------------------------------------------------

/**
 * Modelos chat multimodais podem retornar imagem de diversas formas:
 *   - Base64 data URL inline no content (string)
 *   - URL de imagem (http/https) no content (string)
 *   - Content parts com type 'image_url'
 */
// deno-lint-ignore no-explicit-any
function extractImageFromChatResponse(data: any): string | null {
  try {
    const message = data?.choices?.[0]?.message
    if (!message) return null

    const content = message.content

    // Caso 1: content e array de parts (multimodal)
    if (Array.isArray(content)) {
      for (const part of content) {
        // Part com type image_url
        if (part.type === 'image_url' && part.image_url?.url) {
          return part.image_url.url
        }
        // Part com type image (algumas APIs usam esse formato)
        if (part.type === 'image' && part.source?.data) {
          const mediaType = part.source.media_type || 'image/png'
          return `data:${mediaType};base64,${part.source.data}`
        }
        // Part com inline_data (formato Gemini)
        if (part.inline_data?.data) {
          const mimeType = part.inline_data.mime_type || 'image/png'
          return `data:${mimeType};base64,${part.inline_data.data}`
        }
      }
      return null
    }

    // Caso 2: content e string
    if (typeof content === 'string') {
      // 2a. Data URL base64
      const base64Match = content.match(/(data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+)/)
      if (base64Match) {
        return base64Match[1]
      }

      // 2b. URL de imagem (http/https)
      const urlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|gif|webp|svg)(?:\?[^\s"'<>]*)?)/)
      if (urlMatch) {
        return urlMatch[1]
      }

      // 2c. URL generica de imagem (CDN, storage, etc — sem extensao obrigatoria)
      const genericUrlMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/)
      if (genericUrlMatch) {
        return genericUrlMatch[1]
      }

      // 2d. URL solta no texto
      const looseUrlMatch = content.match(/(https?:\/\/[^\s"'<>]+)/)
      if (looseUrlMatch) {
        return looseUrlMatch[1]
      }
    }

    return null
  } catch (err) {
    console.error('Erro ao extrair imagem da resposta chat:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Chamada a API do OpenRouter
// ---------------------------------------------------------------------------

async function callOpenRouter(
  model: AvailableModel,
  prompt: string,
  size: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://landinggen.app',
    'X-Title': 'LandingGen - Gerador de Landing Pages',
  }

  if (model.apiType === 'image') {
    // Endpoint de geracao de imagem (FLUX.2, DALL-E, etc.)
    return fetch(`${OPENROUTER_BASE}/images/generations`, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model: model.id,
        prompt,
        n: 1,
        size,
      }),
    })
  }

  // Endpoint chat/completions (Gemini, GPT-5 multimodal)
  return fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: model.id,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })
}

/**
 * Processa a resposta da API e extrai a URL da imagem.
 * Lida com ambos os formatos: images/generations e chat/completions.
 */
// deno-lint-ignore no-explicit-any
function extractImageUrl(data: any, model: AvailableModel): string | null {
  if (model.apiType === 'image') {
    // Formato OpenAI images: { data: [{ url?, b64_json? }] }
    const imageData = data?.data?.[0]
    if (!imageData) return null
    return imageData.url || (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null)
  }

  // Formato chat/completions multimodal
  return extractImageFromChatResponse(data)
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return respond({ error: 'Metodo nao permitido' }, 405)
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return respond({ error: 'Body JSON invalido' }, 400)
  }

  const prompt = body.prompt as string | undefined
  const size = (body.size as string) || '1024x1024'
  const bodyModelOverride = (body.model as string) || null

  // Validacoes
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return respond({ error: 'Prompt e obrigatorio (minimo 3 caracteres)' }, 400)
  }

  if (!VALID_SIZES.includes(size as (typeof VALID_SIZES)[number])) {
    return respond({ error: `Tamanho invalido. Use: ${VALID_SIZES.join(', ')}` }, 400)
  }

  // API Key
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) {
    return respond({
      error: 'Chave da API OpenRouter nao configurada. Configure o secret OPENROUTER_API_KEY no Supabase.',
    }, 500)
  }

  // Criar client Supabase (service role — bypassa RLS)
  const supabase = getSupabaseAdmin()

  // Extrair user_id do JWT (para resolver override por usuario)
  const authHeader = req.headers.get('Authorization')
  const userId = await extractUserId(supabase, authHeader)

  // Resolver modelo (cadeia de prioridade)
  const model = await resolveModel(supabase, userId, bodyModelOverride)
  console.log(`Modelo selecionado: ${model.alias} (${model.id}) — apiType: ${model.apiType}`)

  // Chamar OpenRouter com timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const response = await callOpenRouter(
      model,
      prompt.trim().slice(0, 4000),
      size,
      apiKey,
      controller.signal,
    )

    clearTimeout(timeout)

    // Tratamento de erros da API
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenRouter API error (${model.id}):`, response.status, errorText)

      if (response.status === 429) {
        return respond({ error: 'Limite de requisicoes atingido. Tente novamente em alguns minutos.' }, 429)
      }
      if (response.status === 401 || response.status === 403) {
        return respond({ error: 'Chave da API OpenRouter invalida ou sem permissao.' }, 403)
      }
      if (response.status === 400) {
        // Content policy ou prompt invalido
        try {
          const err = JSON.parse(errorText)
          return respond({ error: err.error?.message || 'Prompt rejeitado pela API. Tente com outro texto.' }, 400)
        } catch {
          return respond({ error: 'Prompt rejeitado pela API. Tente com outro texto.' }, 400)
        }
      }

      return respond({ error: 'Erro ao gerar imagem. Tente novamente.' }, 502)
    }

    const data = await response.json()

    // Extrair URL da imagem (formato depende do apiType do modelo)
    const imageUrl = extractImageUrl(data, model)
    if (!imageUrl) {
      console.error(`Nao foi possivel extrair imagem da resposta (${model.id}):`, JSON.stringify(data).slice(0, 500))
      return respond({ error: 'Nenhuma imagem foi gerada. Tente com outro prompt.' }, 502)
    }

    return respond({ imageUrl })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return respond({ error: 'A geracao de imagem demorou demais. Tente com um prompt mais simples.' }, 504)
    }
    console.error('Erro inesperado:', err)
    return respond({ error: 'Erro interno ao gerar imagem.' }, 500)
  }
})
