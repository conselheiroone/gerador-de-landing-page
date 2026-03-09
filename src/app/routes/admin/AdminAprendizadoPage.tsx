import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  BookOpen,
  Image,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useLearningAdmin } from '@/features/admin/hooks/use-learning-admin'
import type { LearningModule } from '@/features/admin/types/admin.types'

export function AdminAprendizadoPage() {
  const navigate = useNavigate()
  const {
    modules,
    loading,
    loadModules,
    createModule,
    updateModule,
    deleteModule,
    uploadModuleThumbnail,
  } = useLearningAdmin()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    loadModules()
  }, [loadModules])

  const openCreate = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setDialogOpen(true)
  }

  const openEdit = (m: LearningModule) => {
    setEditingId(m.id)
    setTitle(m.title)
    setDescription(m.description ?? '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title) return
    setSaving(true)

    if (editingId) {
      await updateModule(editingId, { title, description: description || null })
    } else {
      await createModule({ title, description: description || undefined })
    }

    setSaving(false)
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await deleteModule(confirmDelete)
    setConfirmDelete(null)
  }

  const handleThumbnail = async (moduleId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagem deve ter no máximo 5MB')
        return
      }
      await uploadModuleThumbnail(moduleId, file)
    }
    input.click()
  }

  const handleReorder = async (moduleId: string, direction: 'up' | 'down') => {
    const idx = modules.findIndex((m) => m.id === moduleId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= modules.length) return

    const current = modules[idx]
    const swap = modules[swapIdx]
    await updateModule(current.id, { sort_order: swap.sort_order })
    await updateModule(swap.id, { sort_order: current.sort_order })
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aprendizado</h1>
              <p className="text-sm text-gray-500">Gerencie módulos e aulas</p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Módulo
          </Button>
        </div>
      </motion.div>

      {/* Modules grid */}
      {modules.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
              <p>Nenhum módulo criado ainda</p>
              <Button onClick={openCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar primeiro módulo
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {modules.map((m, idx) => (
            <motion.div key={m.id} variants={staggerItem}>
              <Card className="overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div
                    className="flex h-20 w-28 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-100"
                    onClick={() => handleThumbnail(m.id)}
                  >
                    {m.thumbnail_url ? (
                      <img src={m.thumbnail_url} alt={m.title} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-lg font-medium text-gray-900">{m.title}</p>
                      <Badge variant={m.is_published ? 'success' : 'secondary'}>
                        {m.is_published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    {m.description && (
                      <p className="truncate text-sm text-gray-500">{m.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() => handleReorder(m.id, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={idx === modules.length - 1}
                      onClick={() => handleReorder(m.id, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        checked={m.is_published}
                        onCheckedChange={(v) => updateModule(m.id, { is_published: v })}
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(m.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/aprendizado/modulo/${m.id}`)}
                    >
                      Aulas <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dialog: Create/Edit Module */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Módulo' : 'Novo Módulo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do módulo"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Descrição (opcional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do módulo"
                rows={3}
              />
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
            <DialogTitle className="text-red-600">Excluir Módulo</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Tem certeza? Todas as aulas e anexos deste módulo serão excluídos.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
