import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, Loader2, Pencil } from 'lucide-react'
import { fadeIn } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { listarTemplates, deletarTemplate, type TemplateRow } from '@/features/templates/api/templates-api'
import { StarterTemplateModal } from '@/features/templates/components/StarterTemplateModal'

export function AdminTemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showStarter, setShowStarter] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await listarTemplates()
      setTemplates(data)
    } catch (err) {
      console.error('Erro ao carregar templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    try {
      await deletarTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('Erro ao deletar template:', err)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-sm text-gray-500">
            Crie e gerencie templates para os clientes
          </p>
        </div>
        <Button onClick={() => setShowStarter(true)}>
          <Plus className="h-4 w-4" />
          Novo Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-500">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhum template ainda
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie o primeiro template usando o editor visual
          </p>
          <Button className="mt-4" onClick={() => setShowStarter(true)}>
            <Plus className="h-4 w-4" />
            Criar Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {template.nome}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {template.descricao}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {template.categoria}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/editor/template/${template.id}`)}
                    className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                    title="Editar no Editor"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Excluir template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <StarterTemplateModal
        open={showStarter}
        onClose={() => setShowStarter(false)}
      />
    </motion.div>
  )
}
