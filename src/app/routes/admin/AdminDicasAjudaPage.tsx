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
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Video,
  FileText,
  Plus,
} from 'lucide-react'
import { useHelpTipsAdmin } from '@/features/admin/hooks/use-help-tips-admin'
import type { HelpTip } from '@/features/admin/types/admin.types'

const PAGE_ICONS: Record<string, { label: string; color: string }> = {
  'templates': { label: 'Templates', color: 'bg-brand-100 text-brand-600' },
  'dashboard': { label: 'Dashboard', color: 'bg-blue-100 text-blue-600' },
  'editor': { label: 'Editor', color: 'bg-purple-100 text-purple-600' },
  'onboarding': { label: 'Onboarding', color: 'bg-cyan-100 text-cyan-600' },
  'projetos': { label: 'Projetos', color: 'bg-amber-100 text-amber-600' },
}

export function AdminDicasAjudaPage() {
  const {
    tipsByPage,
    loading,
    totalPages,
    totalTips,
    tipsWithContent,
    activeTips,
    updateTip,
    deleteTip,
    createTip,
  } = useHelpTipsAdmin()

  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [editingTip, setEditingTip] = useState<HelpTip | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formVideoUrl, setFormVideoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Create form state
  const [newPagePath, setNewPagePath] = useState('')
  const [newPageName, setNewPageName] = useState('')
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newAnchorKey, setNewAnchorKey] = useState('')

  const openEdit = (tip: HelpTip) => {
    setEditingTip(tip)
    setFormTitle(tip.title ?? '')
    setFormDescription(tip.description ?? '')
    setFormVideoUrl(tip.video_url ?? '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingTip) return
    setSaving(true)
    await updateTip(editingTip.id, {
      title: formTitle || null,
      description: formDescription || null,
      video_url: formVideoUrl || null,
    })
    setSaving(false)
    setDialogOpen(false)
  }

  const handleCreate = async () => {
    if (!newPagePath || !newPageName) return
    setSaving(true)
    await createTip({
      page_path: newPagePath,
      page_name: newPageName,
      section_title: newSectionTitle || undefined,
      anchor_key: newAnchorKey || undefined,
    })
    setSaving(false)
    setCreateDialogOpen(false)
    setNewPagePath('')
    setNewPageName('')
    setNewSectionTitle('')
    setNewAnchorKey('')
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await deleteTip(confirmDelete)
    setConfirmDelete(null)
  }

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Carregando...</div>
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div variants={staggerItem} className="mb-6 rounded-lg bg-purple-50 border border-purple-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <HelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dicas de Ajuda</h1>
              <p className="text-sm text-gray-500">Gerencie dicas contextuais por pagina</p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Dica
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} className="mb-6 grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalPages}</p>
            <p className="text-sm text-gray-500">Paginas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalTips}</p>
            <p className="text-sm text-gray-500">Total Dicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{tipsWithContent}</p>
            <p className="text-sm text-gray-500">Com Conteudo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{activeTips}</p>
            <p className="text-sm text-gray-500">Ativas</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pages accordion */}
      {Object.keys(tipsByPage).length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <HelpCircle className="mb-3 h-12 w-12 text-gray-300" />
              <p>Nenhuma dica de ajuda cadastrada</p>
              <Button onClick={() => setCreateDialogOpen(true)} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Criar primeira dica
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {Object.entries(tipsByPage).map(([pagePath, pageTips]) => {
            const isExpanded = expandedPage === pagePath
            const pageConf = PAGE_ICONS[pagePath] ?? { label: pagePath, color: 'bg-gray-100 text-gray-600' }
            const contentCount = pageTips.filter((t) => t.video_url || t.description).length

            return (
              <motion.div key={pagePath} variants={staggerItem}>
                <Card>
                  <CardContent className="p-0">
                    {/* Page header */}
                    <button
                      onClick={() => setExpandedPage(isExpanded ? null : pagePath)}
                      className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${pageConf.color}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{pageTips[0]?.page_name ?? pageConf.label}</p>
                        <p className="text-xs text-gray-500">/{pagePath}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{pageTips.length} dicas</Badge>
                        <Badge variant={contentCount > 0 ? 'success' : 'warning'}>
                          {contentCount} com conteudo
                        </Badge>
                      </div>
                    </button>

                    {/* Tips list */}
                    {isExpanded && (
                      <div className="border-t border-gray-100">
                        {pageTips.map((tip) => (
                          <div key={tip.id} className="flex items-center gap-3 border-b border-gray-50 px-6 py-3 last:border-0">
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {tip.title ?? tip.section_title ?? tip.anchor_key ?? 'Sem titulo'}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                {tip.video_url && (
                                  <Badge variant="primary" className="flex items-center gap-1">
                                    <Video className="h-3 w-3" /> Video
                                  </Badge>
                                )}
                                {tip.description && (
                                  <Badge variant="secondary" className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> Texto
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={tip.is_active}
                                onCheckedChange={(v) => updateTip(tip.id, { is_active: v })}
                              />
                              <Button variant="ghost" size="sm" onClick={() => openEdit(tip)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDelete(tip.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Dialog: Edit Tip */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Dica de Ajuda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titulo personalizado</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titulo da dica (opcional)"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">URL do Video (YouTube)</label>
              <Input
                value={formVideoUrl}
                onChange={(e) => setFormVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            {formVideoUrl && getYoutubeEmbedUrl(formVideoUrl) && (
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={getYoutubeEmbedUrl(formVideoUrl)!}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Descricao</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Texto de ajuda..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Create Tip */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Dica de Ajuda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Caminho da pagina</label>
              <Input
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value)}
                placeholder="ex: templates, editor, dashboard"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nome da pagina</label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="ex: Templates, Editor de Paginas"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Titulo da secao (opcional)</label>
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="ex: Como criar um template"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Chave ancora (opcional)</label>
              <Input
                value={newAnchorKey}
                onChange={(e) => setNewAnchorKey(e.target.value)}
                placeholder="ex: criar-template, configurar-cores"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving || !newPagePath || !newPageName}>
              {saving ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Dica</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Tem certeza que deseja excluir esta dica de ajuda?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
