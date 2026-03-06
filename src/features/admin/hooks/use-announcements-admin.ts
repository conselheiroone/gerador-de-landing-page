import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { Announcement, AnnouncementStatus } from '../types/admin.types'

export function getAnnouncementStatus(a: Announcement): AnnouncementStatus {
  if (a.expires_at && new Date(a.expires_at) <= new Date()) return 'expired'
  if (!a.is_published) return 'draft'
  return 'published'
}

export function useAnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const { session } = useAuth()

  const loadAnnouncements = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAnnouncements(data)
    }
    setLoading(false)
  }, [])

  const createAnnouncement = useCallback(async (values: {
    title: string
    content: string
    type: string
    priority: string
    is_published: boolean
    has_detail?: boolean
    detail_body?: string
    external_url?: string
    internal_path?: string
    expires_at?: string | null
  }) => {
    const { error } = await supabase
      .from('announcements')
      .insert({
        ...values,
        created_by: session?.user?.id ?? null,
      })

    if (!error) await loadAnnouncements()
    return { error }
  }, [loadAnnouncements, session])

  const updateAnnouncement = useCallback(async (id: string, values: Partial<Announcement>) => {
    const { error } = await supabase
      .from('announcements')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) await loadAnnouncements()
    return { error }
  }, [loadAnnouncements])

  const deleteAnnouncement = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (!error) await loadAnnouncements()
    return { error }
  }, [loadAnnouncements])

  const togglePublish = useCallback(async (id: string, current: boolean) => {
    return updateAnnouncement(id, { is_published: !current })
  }, [updateAnnouncement])

  useEffect(() => {
    loadAnnouncements()
  }, [loadAnnouncements])

  const activeCount = announcements.filter((a) => getAnnouncementStatus(a) === 'published').length
  const draftCount = announcements.filter((a) => getAnnouncementStatus(a) === 'draft').length
  const expiredCount = announcements.filter((a) => getAnnouncementStatus(a) === 'expired').length

  return {
    announcements,
    loading,
    activeCount,
    draftCount,
    expiredCount,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePublish,
    reload: loadAnnouncements,
  }
}
