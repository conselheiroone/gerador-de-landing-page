import { useState } from 'react'
import { useEditor } from '@craftjs/core'
import { Plus, Loader2 } from 'lucide-react'
import { useSecaoPresets } from '@/features/secao-presets/hooks/useSecaoPresets'
import { SECAO_CATEGORIAS } from '@/features/secao-presets/types/secao-presets.types'
import { injectSectionPreset } from '../../utils/inject-section-preset'

const CATEGORIAS_OPTIONS = ['Todas', ...SECAO_CATEGORIAS] as const

export const SecoesPanel = () => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas')
  const { presets, loading } = useSecaoPresets(categoriaAtiva)
  const { actions, query } = useEditor()

  const handleInserir = (json: string) => {
    injectSectionPreset(actions, query, json)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filtro de categoria */}
      <div className="px-3 pt-3 pb-2">
        <select
          value={categoriaAtiva}
          onChange={(e) => setCategoriaAtiva(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CATEGORIAS_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de presets */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : presets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-gray-400">Nenhuma seção encontrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleInserir(preset.json)}
                className="group w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-sm"
              >
                {/* Thumbnail placeholder */}
                <div className="mb-2 flex h-20 items-center justify-center rounded-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100">
                  {preset.thumbnail_url ? (
                    <img
                      src={preset.thumbnail_url}
                      alt={preset.nome}
                      className="h-full w-full rounded-md object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">
                      {preset.categoria}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {preset.nome}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400 line-clamp-2">
                      {preset.descricao}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-full bg-blue-50 p-1 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                    <Plus className="h-3 w-3" />
                  </div>
                </div>

                {/* Badge */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                    {preset.categoria}
                  </span>
                  {preset.isBuiltin && (
                    <span className="inline-block rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-500">
                      Incluso
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
