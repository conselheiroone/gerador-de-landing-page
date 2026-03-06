import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Play,
  Paperclip,
  Upload,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  FileText,
  X,
} from 'lucide-react'
import { useLearningAdmin } from '@/features/admin/hooks/use-learning-admin'
import type { LearningLesson } from '@/features/admin/types/admin.types'

export function AdminAprendizadoModuloPage() {
  const { moduloId } = useParams<{ moduloId: string }>()
  const navigate = useNavigate()
  const {
    modules,
    lessons,
    attachments,
    loadModules,
    loadLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    loadAttachments,
    uploadAttachment,
    deleteAttachment,
  } = useLearningAdmin()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [durationMin, setDurationMin] = useState(0)
  const [durationSec, setDurationSec] = useState(0)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)

  const module = modules.find((m) => m.id === moduloId)

  useEffect(() => {
    loadModules()
  }, [loadModules])

  useEffect(() => {
    if (moduloId) loadLessons(moduloId)
  }, [moduloId, loadLessons])

  useEffect(() => {
    if (expandedLesson) loadAttachments(expandedLesson)
  }, [expandedLesson, loadAttachments])

  const openCreate = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setYoutubeUrl('')
    setDurationMin(0)
    setDurationSec(0)
    setDialogOpen(true)
  }

  const openEdit = (l: LearningLesson) => {
    setEditingId(l.id)
    setTitle(l.title)
    setDescription(l.description ?? '')
    setYoutubeUrl(l.youtube_url ?? '')
    setDurationMin(Math.floor(l.duration_seconds / 60))
    setDurationSec(l.duration_seconds % 60)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title || !moduloId) return
    setSaving(true)

    const durationSeconds = durationMin * 60 + durationSec

    if (editingId) {
      await updateLesson(editingId, moduloId, {
        title,
        description: description || null,
        youtube_url: youtubeUrl || null,
        duration_seconds: durationSeconds,
      })
    } else {
      await createLesson({
        module_id: moduloId,
        title,
        description: description || undefined,
        youtube_url: youtubeUrl || undefined,
        duration_seconds: durationSeconds,
      })
    }

    setSaving(false)
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete || !moduloId) return
    await deleteLesson(confirmDelete, moduloId)
    setConfirmDelete(null)
  }

  const handleUploadAttachment = async (lessonId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo deve ter no maximo 10MB')
        return
      }
      await uploadAttachment(lessonId, file)
    }
    input.click()
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}min ${sec > 0 ? `${sec}s` : ''}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={staggerItem} className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/aprendizado')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar aos modulos
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{module?.title ?? 'Modulo'}</h1>
            <p className="text-sm text-gray-500">{module?.description ?? 'Gerencie as aulas deste modulo'}</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nova Aula
          </Button>
        </div>
      </motion.div>

      {/* Lessons */}
      {lessons.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Play className="mb-3 h-12 w-12 text-gray-300" />
              <p>Nenhuma aula neste modulo</p>
              <Button onClick={openCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar primeira aula
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {lessons.map((l, idx) => (
            <motion.div key={l.id} variants={staggerItem}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* YouTube preview */}
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      {l.youtube_url ? (
                        <Play className="h-6 w-6 text-red-500" />
                      ) : (
                        <Play className="h-6 w-6 text-gray-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-gray-900">{l.title}</p>
                        <Badge variant={l.is_published ? 'success' : 'secondary'}>
                          {l.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        {l.duration_seconds > 0 && (
                          <span className="text-xs text-gray-500">{formatDuration(l.duration_seconds)}</span>
                        )}
                      </div>
                      {l.description && (
                        <p className="truncate text-sm text-gray-500">{l.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" disabled={idx === 0}
                        onClick={() => moduloId && updateLesson(l.id, moduloId, { sort_order: lessons[idx - 1].sort_order })}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled={idx === lessons.length - 1}
                        onClick={() => moduloId && updateLesson(l.id, moduloId, { sort_order: lessons[idx + 1].sort_order })}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={l.is_published}
                        onCheckedChange={(v) => moduloId && updateLesson(l.id, moduloId, { is_published: v })}
                      />
                      <Button variant="ghost" size="sm" onClick={() => openEdit(l)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedLesson(expandedLesson === l.id ? null : l.id)}
                      >
                        <Paperclip className="h-4 w-4" />
                        {expandedLesson === l.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(l.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Attachments */}
                  {expandedLesson === l.id && (
                    <div className="mt-4 rounded-lg border border-gray-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Anexos</p>
                        <Button variant="outline" size="sm" onClick={() => handleUploadAttachment(l.id)}>
                          <Upload className="mr-1 h-4 w-4" /> Upload
                        </Button>
                      </div>
                      {attachments.filter((a) => a.lesson_id === l.id).length === 0 ? (
                        <p className="text-sm text-gray-400">Nenhum anexo</p>
                      ) : (
                        <div className="space-y-2">
                          {attachments
                            .filter((a) => a.lesson_id === l.id)
                            .map((a) => (
                              <div key={a.id} className="flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="flex-1 truncate text-sm text-gray-700">{a.file_name}</span>
                                <span className="text-xs text-gray-400">
                                  {a.file_size ? formatFileSize(a.file_size) : ''}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteAttachment(a.id, a.storage_path, l.id)}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog: Create/Edit Lesson */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titulo</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da aula" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Descricao (opcional)</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descricao da aula" rows={2} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">URL do YouTube</label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </div>
            {youtubeUrl && getYoutubeEmbedUrl(youtubeUrl) && (
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={getYoutubeEmbedUrl(youtubeUrl)!}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Duracao (minutos)</label>
                <Input type="number" min={0} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Segundos</label>
                <Input type="number" min={0} max={59} value={durationSec} onChange={(e) => setDurationSec(Number(e.target.value))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !title}>
              {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Aula</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Tem certeza? Os anexos desta aula tambem serao excluidos.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
