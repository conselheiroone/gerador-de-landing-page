import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface UserModelOverride {
  id: string
  user_id: string
  image_model: string
  reason: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // join fields
  user_email: string
  user_nome: string | null
}

export function useUserModelOverrides() {
  const [overrides, setOverrides] = useState<UserModelOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listOverrides = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Buscar overrides ativos
    const { data: overrideRows, error: fetchError } = await supabase
      .from('openrouter_user_overrides')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    if (!overrideRows || overrideRows.length === 0) {
      setOverrides([])
      setLoading(false)
      return
    }

    // Buscar perfis dos usuarios para pegar email/nome
    const userIds = overrideRows.map((o) => o.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, nome')
      .in('id', userIds)

    const profileMap = new Map<string, { email: string; nome: string | null }>()
    if (profiles) {
      profiles.forEach((p) => {
        profileMap.set(p.id, { email: p.email, nome: p.nome })
      })
    }

    const mapped: UserModelOverride[] = overrideRows.map((o) => {
      const profile = profileMap.get(o.user_id)
      return {
        id: o.id,
        user_id: o.user_id,
        image_model: o.image_model,
        reason: o.reason,
        is_active: o.is_active,
        created_at: o.created_at,
        updated_at: o.updated_at,
        user_email: profile?.email ?? 'Desconhecido',
        user_nome: profile?.nome ?? null,
      }
    })

    setOverrides(mapped)
    setLoading(false)
  }, [])

  const saveOverride = useCallback(
    async (userId: string, imageModel: string, reason?: string) => {
      setSaving(true)
      setError(null)

      const { data, error: upsertError } = await supabase
        .from('openrouter_user_overrides')
        .upsert(
          {
            user_id: userId,
            image_model: imageModel,
            reason: reason || null,
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )
        .select()

      if (upsertError) {
        setError(upsertError.message)
        setSaving(false)
        return { error: upsertError }
      }

      if (!data || data.length === 0) {
        const rslError = { message: 'Falha ao salvar: permissão negada (RLS). Verifique se você é admin.' }
        setError(rslError.message)
        setSaving(false)
        return { error: rslError }
      }

      setSaving(false)
      await listOverrides()
      return { error: null }
    },
    [listOverrides],
  )

  const removeOverride = useCallback(
    async (userId: string) => {
      setSaving(true)
      setError(null)

      const { error: deleteError } = await supabase
        .from('openrouter_user_overrides')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        setError(deleteError.message)
        setSaving(false)
        return { error: deleteError }
      }

      setSaving(false)
      await listOverrides()
      return { error: null }
    },
    [listOverrides],
  )

  useEffect(() => {
    listOverrides()
  }, [listOverrides])

  return { overrides, loading, saving, error, listOverrides, saveOverride, removeOverride }
}
