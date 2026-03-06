import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, Loader2, Pencil, LayoutGrid } from 'lucide-react'
import { fadeIn } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { deletarSecaoPreset } from '@/features/secao-presets/api/secao-presets-api'
import { useSecaoPresets } from '@/features/secao-presets/hooks/useSecaoPresets'
import { SECAO_CATEGORIAS } from '@/features/secao-presets/types/secao-presets.types'

export function AdminSecoesPage() {
  const navigate = useNavigate()
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas')
  const { presets, loading, refetch } = useSecaoPresets(categoriaAtiva)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta seção?')) return
    try {
      await deletarSecaoPreset(id)
      refetch()
    } catch (err) {
      console.error('Erro ao deletar seção:', err)
    }
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seções Prontas</h1>
          <p className="text-sm text-gray-500">
            Crie e gerencie seções reutilizáveis para os templates
          </p>
        </div>
        <Button onClick={() => navigate('/editor/novo?mode=secao')}>
          <Plus className="h-4 w-4" />
          Nova Seção
        </Button>
      </div>

      {/* Filtro de categorias */}
      <div className="mb-4 flex flex-wrap gap-2">
        {['Todas', ...SECAO_CATEGORIAS].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoriaAtiva === cat
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <LayoutGrid className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Nenhuma seção encontrada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {categoriaAtiva !== 'Todas'
              ? `Nenhuma seção na categoria "${categoriaAtiva}"`
              : 'Crie seções reutilizáveis no editor visual'}
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/editor/novo?mode=secao')}
          >
            <Plus className="h-4 w-4" />
            Criar Seção
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              {/* Thumbnail */}
              {preset.thumbnail_url ? (
                <div className="mb-3 overflow-hidden rounded-md">
                  <img
                    src={preset.thumbnail_url}
                    alt={preset.nome}
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-3 flex h-32 items-center justify-center rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
                  <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {preset.categoria}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {preset.nome}
                    </h3>
                    {preset.isBuiltin && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-500">
                        Incluso
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {preset.descricao}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                    {preset.categoria}
                  </span>
                </div>
                {!preset.isBuiltin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        navigate(`/editor/novo?mode=secao&secaoId=${preset.id}`)
                      }
                      className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                      title="Editar seção"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(preset.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Excluir seção"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
