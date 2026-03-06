import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { LearningModule, LearningLesson, LearningAttachment } from '../types/admin.types'

export function useLearningAdmin() {
  const [modules, setModules] = useState<LearningModule[]>([])
  const [lessons, setLessons] = useState<LearningLesson[]>([])
  const [attachments, setAttachments] = useState<LearningAttachment[]>([])
  const [loading, setLoading] = useState(true)

  // === Modules ===
  const loadModules = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('learning_modules')
      .select('*')
      .order('sort_order', { ascending: true })

    if (data) setModules(data)
    setLoading(false)
  }, [])

  const createModule = useCallback(async (values: { title: string; description?: string }) => {
    const maxOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.sort_order)) + 1 : 0
    const { error } = await supabase
      .from('learning_modules')
      .insert({ ...values, sort_order: maxOrder })

    if (!error) await loadModules()
    return { error }
  }, [loadModules, modules])

  const updateModule = useCallback(async (id: string, values: Partial<LearningModule>) => {
    const { error } = await supabase
      .from('learning_modules')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) await loadModules()
    return { error }
  }, [loadModules])

  const deleteModule = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('learning_modules')
      .delete()
      .eq('id', id)

    if (!error) await loadModules()
    return { error }
  }, [loadModules])

  const uploadModuleThumbnail = useCallback(async (moduleId: string, file: File) => {
    const ext = file.name.split('.').pop()
    const path = `${moduleId}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('module-thumbnails')
      .upload(path, file)

    if (uploadError) return { error: uploadError }

    const { data: urlData } = supabase.storage
      .from('module-thumbnails')
      .getPublicUrl(path)

    const { error } = await supabase
      .from('learning_modules')
      .update({ thumbnail_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('id', moduleId)

    if (!error) await loadModules()
    return { error }
  }, [loadModules])

  // === Lessons ===
  const loadLessons = useCallback(async (moduleId: string) => {
    const { data } = await supabase
      .from('learning_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: true })

    if (data) setLessons(data)
  }, [])

  const createLesson = useCallback(async (values: {
    module_id: string
    title: string
    description?: string
    youtube_url?: string
    duration_seconds?: number
  }) => {
    const currentLessons = lessons.filter((l) => l.module_id === values.module_id)
    const maxOrder = currentLessons.length > 0
      ? Math.max(...currentLessons.map((l) => l.sort_order)) + 1
      : 0

    const { error } = await supabase
      .from('learning_lessons')
      .insert({ ...values, sort_order: maxOrder })

    if (!error) await loadLessons(values.module_id)
    return { error }
  }, [loadLessons, lessons])

  const updateLesson = useCallback(async (id: string, moduleId: string, values: Partial<LearningLesson>) => {
    const { error } = await supabase
      .from('learning_lessons')
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) await loadLessons(moduleId)
    return { error }
  }, [loadLessons])

  const deleteLesson = useCallback(async (id: string, moduleId: string) => {
    const { error } = await supabase
      .from('learning_lessons')
      .delete()
      .eq('id', id)

    if (!error) await loadLessons(moduleId)
    return { error }
  }, [loadLessons])

  // === Attachments ===
  const loadAttachments = useCallback(async (lessonId: string) => {
    const { data } = await supabase
      .from('learning_attachments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true })

    if (data) setAttachments(data)
  }, [])

  const uploadAttachment = useCallback(async (lessonId: string, file: File) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${lessonId}/${crypto.randomUUID()}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('lesson-attachments')
      .upload(path, file)

    if (uploadError) return { error: uploadError }

    const { error } = await supabase
      .from('learning_attachments')
      .insert({
        lesson_id: lessonId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: path,
      })

    if (!error) await loadAttachments(lessonId)
    return { error }
  }, [loadAttachments])

  const deleteAttachment = useCallback(async (id: string, storagePath: string, lessonId: string) => {
    await supabase.storage.from('lesson-attachments').remove([storagePath])

    const { error } = await supabase
      .from('learning_attachments')
      .delete()
      .eq('id', id)

    if (!error) await loadAttachments(lessonId)
    return { error }
  }, [loadAttachments])

  return {
    modules, lessons, attachments, loading,
    loadModules, createModule, updateModule, deleteModule, uploadModuleThumbnail,
    loadLessons, createLesson, updateLesson, deleteLesson,
    loadAttachments, uploadAttachment, deleteAttachment,
  }
}
