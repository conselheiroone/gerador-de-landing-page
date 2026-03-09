import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Paperclip,
  Download,
  GraduationCap,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { LearningModule, LearningLesson, LearningAttachment } from '@/features/admin/types/admin.types'

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`
  }
  return null
}

function formatDuration(seconds: number): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AprendizadoModuloPage() {
  const { moduloId } = useParams<{ moduloId: string }>()
  const navigate = useNavigate()
  const { session } = useAuth()

  const [modulo, setModulo] = useState<LearningModule | null>(null)
  const [lessons, setLessons] = useState<LearningLesson[]>([])
  const [attachments, setAttachments] = useState<Record<string, LearningAttachment[]>>({})
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!moduloId) return
    setLoading(true)

    const [{ data: mod }, { data: less }] = await Promise.all([
      supabase
        .from('learning_modules')
        .select('*')
        .eq('id', moduloId)
        .single(),
      supabase
        .from('learning_lessons')
        .select('*')
        .eq('module_id', moduloId)
        .eq('is_published', true)
        .order('sort_order', { ascending: true }),
    ])

    if (mod) setModulo(mod)
    if (less) {
      setLessons(less)
      if (less.length > 0) setSelectedLesson(less[0])

      // Busca anexos de todas as aulas
      const allAttachments: Record<string, LearningAttachment[]> = {}
      await Promise.all(
        less.map(async (l) => {
          const { data: att } = await supabase
            .from('learning_attachments')
            .select('*')
            .eq('lesson_id', l.id)
            .order('sort_order', { ascending: true })
          allAttachments[l.id] = att ?? []
        }),
      )
      setAttachments(allAttachments)
    }

    // Progresso do usuário
    if (session?.user?.id) {
      const { data: progress } = await supabase
        .from('learning_progress')
        .select('lesson_id')
        .eq('user_id', session.user.id)
        .eq('completed', true)
      setCompletedIds(new Set((progress ?? []).map((p) => p.lesson_id)))
    }

    setLoading(false)
  }, [moduloId, session?.user?.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleComplete = async (lessonId: string) => {
    if (!session?.user?.id) return
    const wasCompleted = completedIds.has(lessonId)

    if (wasCompleted) {
      await supabase
        .from('learning_progress')
        .delete()
        .eq('user_id', session.user.id)
        .eq('lesson_id', lessonId)
      setCompletedIds((prev) => {
        const next = new Set(prev)
        next.delete(lessonId)
        return next
      })
    } else {
      await supabase.from('learning_progress').upsert({
        user_id: session.user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      setCompletedIds((prev) => new Set([...prev, lessonId]))
    }
  }

  const downloadAttachment = async (att: LearningAttachment) => {
    const { data } = await supabase.storage
      .from('lesson-attachments')
      .createSignedUrl(att.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!modulo) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <GraduationCap className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Módulo não encontrado.</p>
        <Button variant="ghost" onClick={() => navigate('/aprendizado')}>
          Voltar
        </Button>
      </div>
    )
  }

  const embedUrl = selectedLesson?.youtube_url
    ? getYoutubeEmbedUrl(selectedLesson.youtube_url)
    : null

  const selectedAttachments = selectedLesson ? (attachments[selectedLesson.id] ?? []) : []
  const completedCount = lessons.filter((l) => completedIds.has(l.id)).length

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-4"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/aprendizado')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{modulo.title}</h1>
          {modulo.description && (
            <p className="text-sm text-gray-500">{modulo.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0">
          {completedCount}/{lessons.length} concluídas
        </Badge>
      </motion.div>

      {lessons.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Play className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">Nenhuma aula disponível neste módulo.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Sidebar: lista de aulas */}
          <div className="space-y-1">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Aulas
            </p>
            {lessons.map((lesson, index) => {
              const isSelected = selectedLesson?.id === lesson.id
              const isDone = completedIds.has(lesson.id)
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="mt-0.5 shrink-0 text-sm font-medium text-gray-400 w-5">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight line-clamp-2">
                      {lesson.title}
                    </p>
                    {lesson.duration_seconds > 0 && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDuration(lesson.duration_seconds)}
                      </p>
                    )}
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-gray-300" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Painel principal: vídeo + info */}
          <div className="space-y-4">
            {embedUrl ? (
              <div className="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  src={embedUrl}
                  title={selectedLesson?.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : selectedLesson?.youtube_url ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <Play className="h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">URL de vídeo inválida.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <Play className="h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">Esta aula não possui vídeo.</p>
                </CardContent>
              </Card>
            )}

            {selectedLesson && (
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedLesson.title}</h2>
                      {selectedLesson.description && (
                        <p className="mt-1 text-sm text-gray-500">{selectedLesson.description}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={completedIds.has(selectedLesson.id) ? 'primary' : 'outline'}
                      className="shrink-0 gap-2"
                      onClick={() => toggleComplete(selectedLesson.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {completedIds.has(selectedLesson.id) ? 'Concluída' : 'Marcar concluída'}
                    </Button>
                  </div>

                  {/* Anexos */}
                  {selectedAttachments.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        Materiais
                      </p>
                      <div className="space-y-1">
                        {selectedAttachments.map((att) => (
                          <button
                            key={att.id}
                            onClick={() => downloadAttachment(att)}
                            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="flex-1 text-left truncate">{att.file_name}</span>
                            {att.file_size && (
                              <span className="text-xs text-gray-400 shrink-0">
                                {(att.file_size / 1024).toFixed(0)} KB
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
