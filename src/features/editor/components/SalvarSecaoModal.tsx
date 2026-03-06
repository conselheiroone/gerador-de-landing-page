import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { SECAO_CATEGORIAS } from '@/features/secao-presets/types/secao-presets.types'
import { criarSecaoPreset, atualizarSecaoPreset } from '@/features/secao-presets/api/secao-presets-api'

interface SalvarSecaoModalProps {
  open: boolean
  onClose: () => void
  getEditorJson: () => string
  secaoId?: string | null
}

export function SalvarSecaoModal({ open, onClose, getEditorJson, secaoId }: SalvarSecaoModalProps) {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<string>(SECAO_CATEGORIAS[0])
  const [descricao, setDescricao] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setError('Informe o nome da seção')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const json = getEditorJson()

      if (secaoId) {
        await atualizarSecaoPreset(secaoId, {
          nome: nome.trim(),
          categoria,
          descricao: descricao.trim() || undefined,
          thumbnail_url: thumbnailUrl.trim() || undefined,
          dados_componente: json,
        })
      } else {
        await criarSecaoPreset({
          nome: nome.trim(),
          categoria,
          descricao: descricao.trim() || undefined,
          thumbnail_url: thumbnailUrl.trim() || undefined,
          dados_componente: json,
        })
      }

      onClose()
    } catch (err) {
      console.error('Erro ao salvar seção:', err)
      setError('Erro ao salvar seção. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {secaoId ? 'Atualizar Seção' : 'Salvar como Seção'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Nome *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Hero Centralizado"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Categoria *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SECAO_CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição da seção..."
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              URL Thumbnail (opcional)
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {secaoId ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
