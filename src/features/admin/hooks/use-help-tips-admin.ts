import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { HelpTip } from '../types/admin.types'

export function useHelpTipsAdmin() {
  const [tips, setTips] = useState<HelpTip[]>([])
  const [loading, setLoading] = useState(true)

  const loadTips = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('help_tips')
      .select('*')
      .order('page_path', { ascending: true })

    if (!error && data) {
      setTips(data)
    }
    setLoading(false)
  }, [])

  const updateTip = useCallback(async (id: string, values: Partial<HelpTip>) => {
    const { error } = await supabase
      .from('help_tips')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) await loadTips()
    return { error }
  }, [loadTips])

  const deleteTip = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('help_tips')
      .delete()
      .eq('id', id)

    if (!error) await loadTips()
    return { error }
  }, [loadTips])

  const createTip = useCallback(async (values: {
    page_path: string
    page_name: string
    section_title?: string
    anchor_key?: string
    title?: string
    description?: string
    video_url?: string
  }) => {
    const { error } = await supabase
      .from('help_tips')
      .insert(values)

    if (!error) await loadTips()
    return { error }
  }, [loadTips])

  useEffect(() => {
    loadTips()
  }, [loadTips])

  // Agrupar por page_path
  const tipsByPage = tips.reduce<Record<string, HelpTip[]>>((acc, tip) => {
    const key = tip.page_path
    if (!acc[key]) acc[key] = []
    acc[key].push(tip)
    return acc
  }, {})

  const totalPages = Object.keys(tipsByPage).length
  const totalTips = tips.length
  const tipsWithContent = tips.filter((t) => t.video_url || t.description).length
  const activeTips = tips.filter((t) => t.is_active).length

  return {
    tips,
    tipsByPage,
    loading,
    totalPages,
    totalTips,
    tipsWithContent,
    activeTips,
    loadTips,
    updateTip,
    deleteTip,
    createTip,
  }
}
