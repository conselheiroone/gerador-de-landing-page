import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fadeIn } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { listarProjetos, deletarProjeto, atualizarNomeProjeto, type ProjetoRow } from '@/features/editor/api/editor-api'

export function DashboardPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [projetos, setProjetos] = useState<ProjetoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deletando, setDeletando] = useState<string | null>(null)
  const [editandoNome, setEditandoNome] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return

    listarProjetos(userId)
      .then(setProjetos)
      .catch((err) => console.error('Erro ao listar projetos:', err))
      .finally(() => setLoading(false))
  }, [session?.user?.id])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    setDeletando(id)
    try {
      await deletarProjeto(id)
      setProjetos((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Erro ao deletar:', err)
    } finally {
      setDeletando(null)
    }
  }

  const handleRename = async (id: string) => {
    if (!novoNome.trim()) {
      setEditandoNome(null)
      return
    }
    try {
      await atualizarNomeProjeto(id, novoNome.trim())
      setProjetos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, nome: novoNome.trim() } : p))
      )
    } catch (err) {
      console.error('Erro ao renomear:', err)
    } finally {
      setEditandoNome(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
          <p className="text-sm text-gray-500">
            Gerencie suas landing pages
          </p>
        </div>
        <Button onClick={() => navigate('/')}>
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : projetos.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-500">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhum projeto ainda
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie seu primeiro projeto para começar
          </p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Criar Projeto
          </Button>
        </div>
      ) : (
        /* Project list */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                {editandoNome === projeto.id ? (
                  <input
                    autoFocus
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    onBlur={() => handleRename(projeto.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(projeto.id)
                      if (e.key === 'Escape') setEditandoNome(null)
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h3 className="text-base font-semibold text-gray-900 truncate pr-2">
                    {projeto.nome}
                  </h3>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditandoNome(projeto.id)
                      setNovoNome(projeto.nome)
                    }}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    title="Renomear"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(projeto.id)
                    }}
                    disabled={deletando === projeto.id}
                    className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletando === projeto.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Meta */}
              <p className="text-xs text-gray-400 mb-4">
                Atualizado em {formatDate(projeto.updated_at)}
              </p>

              {/* Action */}
              <button
                onClick={() => navigate(`/editor/${projeto.id}`)}
                className="w-full rounded-lg bg-gray-50 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Abrir no Editor
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
