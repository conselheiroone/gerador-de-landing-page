/**
 * Edge Function: generate-image
 *
 * Gera imagens via OpenRouter API (DALL-E 3).
 * Requer OPENROUTER_API_KEY nos secrets do Supabase.
 *
 * Body: { prompt: string, size?: '1024x1024' | '1024x1792' | '1792x1024' }
 * Response: { imageUrl: string }
 */

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

const VALID_SIZES = ['1024x1024', '1024x1792', '1792x1024'] as const

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return respond({ error: 'Método não permitido' }, 405)
  }

  // Parse body
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return respond({ error: 'Body JSON inválido' }, 400)
  }

  const prompt = body.prompt as string | undefined
  const size = (body.size as string) || '1024x1024'

  // Validações
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return respond({ error: 'Prompt é obrigatório (mínimo 3 caracteres)' }, 400)
  }

  if (!VALID_SIZES.includes(size as typeof VALID_SIZES[number])) {
    return respond({ error: `Tamanho inválido. Use: ${VALID_SIZES.join(', ')}` }, 400)
  }

  // API Key
  const apiKey = Deno.env.get('OPENROUTER_API_KEY')
  if (!apiKey) {
    return respond({
      error: 'Chave da API OpenRouter não configurada. Configure o secret OPENROUTER_API_KEY no Supabase.',
    }, 500)
  }

  // Chamar OpenRouter
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000) // 60s para geração de imagem

  try {
    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://landinggen.app',
        'X-Title': 'LandingGen - Gerador de Landing Pages',
      },
      body: JSON.stringify({
        model: 'openai/dall-e-3',
        prompt: prompt.trim().slice(0, 1000),
        n: 1,
        size,
      }),
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)

      if (response.status === 429) {
        return respond({ error: 'Limite de requisições atingido. Tente novamente em alguns minutos.' }, 429)
      }
      if (response.status === 401 || response.status === 403) {
        return respond({ error: 'Chave da API OpenRouter inválida ou sem permissão.' }, 403)
      }
      if (response.status === 400) {
        // Content policy ou prompt inválido
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

    // OpenRouter retorna no formato OpenAI: { data: [{ url?, b64_json? }] }
    const imageData = data?.data?.[0]
    if (!imageData) {
      return respond({ error: 'Resposta inesperada da API de geração de imagem.' }, 502)
    }

    const imageUrl = imageData.url || (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null)
    if (!imageUrl) {
      return respond({ error: 'Nenhuma imagem foi gerada.' }, 502)
    }

    return respond({ imageUrl })
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === 'AbortError') {
      return respond({ error: 'A geração de imagem demorou demais. Tente com um prompt mais simples.' }, 504)
    }
    console.error('Erro inesperado:', err)
    return respond({ error: 'Erro interno ao gerar imagem.' }, 500)
  }
})
