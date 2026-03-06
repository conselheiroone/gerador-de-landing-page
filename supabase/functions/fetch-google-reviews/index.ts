/**
 * Edge Function: fetch-google-reviews
 *
 * Busca avaliações do Google Places API v1 (New) para um negócio.
 * Requer GOOGLE_PLACES_API_KEY nos secrets do Supabase.
 *
 * Body: { place_id: string }
 * Response: { nomeEmpresa, notaMedia, totalAvaliacoes, reviews: Depoimento[] }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleReviewAuthor {
  displayName?: string
  photoUri?: string
  uri?: string
}

interface GoogleReviewText {
  text: string
  languageCode?: string
}

interface GoogleReview {
  name?: string
  rating: number
  text?: GoogleReviewText
  authorAttribution?: GoogleReviewAuthor
  relativePublishTimeDescription?: string
}

interface PlaceDetailsResponse {
  displayName?: { text: string }
  rating?: number
  userRatingCount?: number
  reviews?: GoogleReview[]
}

interface NormalizedReview {
  nomeCliente: string
  cargo: string
  citacao: string
  nota: number
  fotoUrl: string | null
  googleReviewId: string | null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { place_id } = body as { place_id?: string }

    if (!place_id || typeof place_id !== 'string') {
      return new Response(JSON.stringify({ error: 'place_id é obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chave da API do Google não configurada. Configure o secret GOOGLE_PLACES_API_KEY no Supabase.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Google Places API v1 — campo `reviews` requer REVIEWS_AND_EDITORIAL fieldMask
    const fieldMask = 'displayName,rating,userRatingCount,reviews'
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(place_id)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
        'Content-Type': 'application/json',
        'Accept-Language': 'pt-BR',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Places API error:', response.status, errorText)

      let userMessage = 'Erro ao consultar Google Places API.'
      if (response.status === 404) {
        userMessage = 'Place ID não encontrado. Verifique se o ID está correto (formato: ChIJ...).'
      } else if (response.status === 403) {
        userMessage = 'Acesso negado pela API do Google. Verifique se a API Places está habilitada no projeto.'
      } else if (response.status === 400) {
        userMessage = 'Place ID inválido. Use o formato correto (ex: ChIJN1t_tDeuEmsR...).'
      }

      return new Response(
        JSON.stringify({ error: userMessage, details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const data = (await response.json()) as PlaceDetailsResponse

    // Normaliza reviews para formato interno
    const reviews: NormalizedReview[] = (data.reviews || [])
      .filter((r) => r.text?.text && r.text.text.length >= 30) // exclui reviews muito curtas
      .slice(0, 5) // máximo 5 depoimentos
      .map((r) => ({
        nomeCliente: r.authorAttribution?.displayName || 'Cliente',
        cargo: 'Cliente verificado no Google',
        citacao: r.text!.text,
        nota: Math.round(r.rating) as 1 | 2 | 3 | 4 | 5,
        fotoUrl: r.authorAttribution?.photoUri || null,
        googleReviewId: r.name || null,
      }))

    return new Response(
      JSON.stringify({
        nomeEmpresa: data.displayName?.text || '',
        notaMedia: data.rating || null,
        totalAvaliacoes: data.userRatingCount || 0,
        reviews,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error('fetch-google-reviews error:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar a requisição.', details: String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
