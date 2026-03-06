import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Sempre retorna HTTP 200 — erros são indicados pelo campo { error } no body
function respond(body: object) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return respond({ error: 'Não autorizado' })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verificar que o chamador é admin
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) return respond({ error: 'Não autorizado' })

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return respond({ error: 'Apenas administradores podem excluir usuários' })
    }

    const { userId: targetUserId } = await req.json()

    if (!targetUserId) return respond({ error: 'userId é obrigatório' })

    // Impedir auto-exclusão
    if (targetUserId === user.id) {
      return respond({ error: 'Não é possível excluir sua própria conta' })
    }

    // Excluir da auth (o profile é deletado em cascata pela FK ou pelo trigger)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (deleteError) return respond({ error: deleteError.message })

    return respond({ success: true })
  } catch (err) {
    return respond({ error: String(err) })
  }
})
