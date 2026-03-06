import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { AdminSetting } from '../types/admin.types'

export function useAdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')

    if (!error && data) {
      const map: Record<string, string> = {}
      data.forEach((s: AdminSetting) => {
        map[s.key] = s.value ?? ''
      })
      setSettings(map)
    }
    setLoading(false)
  }, [])

  const saveSetting = useCallback(async (key: string, value: string) => {
    const { error } = await supabase
      .from('admin_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      )

    if (!error) {
      setSettings((prev) => ({ ...prev, [key]: value }))
    }
    return { error }
  }, [])

  const saveMultiple = useCallback(async (entries: Record<string, string>) => {
    const rows = Object.entries(entries).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('admin_settings')
      .upsert(rows, { onConflict: 'key' })

    if (!error) {
      setSettings((prev) => ({ ...prev, ...entries }))
    }
    return { error }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return { settings, loading, loadSettings, saveSetting, saveMultiple }
}

export function useSupportSettings() {
  const [phone, setPhone] = useState('')
  const [days, setDays] = useState('Segunda a Sexta')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('admin_settings')
        .select('*')
        .in('key', [
          'support_whatsapp',
          'support_hours_days',
          'support_hours_start',
          'support_hours_end',
          'support_hours_note',
        ])

      if (data) {
        data.forEach((s: AdminSetting) => {
          switch (s.key) {
            case 'support_whatsapp': setPhone(s.value ?? ''); break
            case 'support_hours_days': setDays(s.value ?? 'Segunda a Sexta'); break
            case 'support_hours_start': setStart(s.value ?? '09:00'); break
            case 'support_hours_end': setEnd(s.value ?? '18:00'); break
            case 'support_hours_note': setNote(s.value ?? ''); break
          }
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  return { phone, days, start, end, note, loading }
}
