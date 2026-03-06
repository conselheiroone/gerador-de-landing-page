import { useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  Wrench,
  Rocket,
} from 'lucide-react'
import {
  useAnnouncementsAdmin,
  getAnnouncementStatus,
} from '@/features/admin/hooks/use-announcements-admin'
import type { Announcement, AnnouncementType } from '@/features/admin/types/admin.types'

const TYPE_CONFIG: Record<AnnouncementType, { icon: typeof Info; color: string; label: string }> = {
  info: { icon: Info, color: 'text-blue-600 bg-blue-100', label: 'Informacao' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-100', label: 'Aviso' },
  maintenance: { icon: Wrench, color: 'text-orange-600 bg-orange-100', label: 'Manutencao' },
  update: { icon: Rocket, color: 'text-emerald-600 bg-emerald-100', label: 'Novidade' },
}

const INITIAL_FORM = {
  title: '',
  content: '',
  type: 'info' as string,
  priority: 'normal' as string,
  is_published: false,
  has_detail: false,
  detail_body: '',
  external_url: '',
  internal_path: '',
  expires_at: '',
}

export function AdminComunicadosPage() {
  const {
    announcements,
    loading,
    activeCount,
    draftCount,
    expiredCount,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePublish,
  } = useAnnouncementsAdmin()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const openCreate = () => {
    setEditingId(null)
    setForm(INITIAL_FORM)
    setDialogOpen(true)
  }

  const openEdit = (a: Announcement) => {
    setEditingId(a.id)
    setForm({
      title: a.title,
      content: a.content,
      type: a.type,
      priority: a.priority,
      is_published: a.is_published,
      has_detail: a.has_detail,
      detail_body: a.detail_body ?? '',
      external_url: a.external_url ?? '',
      internal_path: a.internal_path ?? '',
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return
    setSaving(true)

    if (editingId) {
      await updateAnnouncement(editingId, {
        title: form.title,
        content: form.content,
        type: form.type,
        priority: form.priority,
        is_published: form.is_published,
        has_detail: form.has_detail,
        expires_at: form.expires_at || null,
        detail_body: form.has_detail ? form.detail_body || null : null,
        external_url: form.has_detail ? form.external_url || null : null,
        internal_path: form.has_detail ? form.internal_path || null : null,
      })
    } else {
      await createAnnouncement({
        title: form.title,
        content: form.content,
        type: form.type,
        priority: form.priority,
        is_published: form.is_published,
        has_detail: form.has_detail,
        detail_body: form.has_detail ? form.detail_body || undefined : undefined,
        external_url: form.has_detail ? form.external_url || undefined : undefined,
        internal_path: form.has_detail ? form.internal_path || undefined : undefined,
        expires_at: form.expires_at || undefined,
      })
    }

    setSaving(false)
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await deleteAnnouncement(confirmDelete)
    setConfirmDelete(null)
  }

  const getStatusBadge = (a: Announcement) => {
    const status = getAnnouncementStatus(a)
    switch (status) {
      case 'published': return <Badge variant="success">Publicado</Badge>
      case 'draft': return <Badge variant="secondary">Rascunho</Badge>
      case 'expired': return <Badge variant="error">Expirado</Badge>
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Megaphone className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
              <p className="text-sm text-gray-500">Gerencie anuncios e notificacoes</p>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Comunicado
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
            <p className="text-sm text-gray-500">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{draftCount}</p>
            <p className="text-sm text-gray-500">Rascunhos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
            <p className="text-sm text-gray-500">Expirados</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* List */}
      <motion.div variants={staggerItem} className="space-y-3">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-gray-500">
              Nenhum comunicado criado ainda
            </CardContent>
          </Card>
        ) : (
          announcements.map((a) => {
            const typeConf = TYPE_CONFIG[a.type as AnnouncementType] ?? TYPE_CONFIG.info
            const Icon = typeConf.icon
            return (
              <Card key={a.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeConf.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-gray-900">{a.title}</p>
                      {getStatusBadge(a)}
                      {a.priority === 'high' && <Badge variant="warning">Urgente</Badge>}
                    </div>
                    <p className="truncate text-sm text-gray-500">{a.content}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(a.id, a.is_published)}
                    >
                      {a.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(a.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </motion.div>

      {/* Dialog: Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Comunicado' : 'Novo Comunicado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titulo</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titulo do comunicado"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mensagem</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Conteudo do comunicado"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informacao</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="maintenance">Manutencao</SelectItem>
                    <SelectItem value="update">Novidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Prioridade</label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data de expiracao (opcional)</label>
              <Input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm({ ...form, is_published: v })}
              />
              <label className="text-sm font-medium text-gray-700">Publicar imediatamente</label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.has_detail}
                onCheckedChange={(v) => setForm({ ...form, has_detail: v })}
              />
              <label className="text-sm font-medium text-gray-700">Comunicado detalhado</label>
            </div>
            {form.has_detail && (
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Conteudo detalhado</label>
                  <Textarea
                    value={form.detail_body}
                    onChange={(e) => setForm({ ...form, detail_body: e.target.value })}
                    placeholder="Conteudo completo do comunicado..."
                    rows={5}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">URL externa (opcional)</label>
                  <Input
                    value={form.external_url}
                    onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Caminho interno (opcional)</label>
                  <Input
                    value={form.internal_path}
                    onChange={(e) => setForm({ ...form, internal_path: e.target.value })}
                    placeholder="/aprendizado/modulo/..."
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.content}>
              {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Comunicado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir este comunicado? Esta acao nao pode ser desfeita.
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
