import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SEGMENTOS_SUGERIDOS, type PerfilEmpresa, type SegmentoItem } from '../../types/onboarding.types'
import type { SegmentosInput } from '../../schemas/onboarding.schemas'

interface SegmentosStepProps {
  perfil: PerfilEmpresa
  onSave: (dados: SegmentosInput) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function SegmentosStep({ perfil, onSave, onBack, isSaving }: SegmentosStepProps) {
  const segmentosIniciais = (perfil.segmentos as SegmentoItem[] | null) ?? []
  const [segmentos, setSegmentos] = useState<SegmentoItem[]>(segmentosIniciais)
  const [novoSegmento, setNovoSegmento] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  function adicionarSegmento(nome: string) {
    const trimmed = nome.trim()
    if (trimmed && !segmentos.some(s => s.nome === trimmed)) {
      setSegmentos(prev => [...prev, { nome: trimmed }])
      setNovoSegmento('')
    }
  }

  function removerSegmento(index: number) {
    setSegmentos(prev => prev.filter((_, i) => i !== index))
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
  }

  function updateDescricao(index: number, descricao: string) {
    setSegmentos(prev => prev.map((s, i) => i === index ? { ...s, descricao } : s))
  }

  function toggleSugerido(nome: string) {
    const exists = segmentos.some(s => s.nome === nome)
    if (exists) {
      setSegmentos(prev => prev.filter(s => s.nome !== nome))
    } else {
      setSegmentos(prev => [...prev, { nome }])
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({ segmentos })
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Segmentos de Atuação</h2>
          <p className="text-sm text-gray-500">Quais setores o escritório atende</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Segmentos sugeridos */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Segmentos Comuns (clique para adicionar)
          </label>
          <div className="flex flex-wrap gap-2">
            {SEGMENTOS_SUGERIDOS.map(nome => {
              const selected = segmentos.some(s => s.nome === nome)
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => toggleSugerido(nome)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    selected
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {selected ? '✓ ' : '+ '}{nome}
                </button>
              )
            })}
          </div>
        </div>

        {/* Adicionar customizado */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Adicionar segmento personalizado
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Cooperativas de Crédito"
              value={novoSegmento}
              onChange={(e) => setNovoSegmento(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  adicionarSegmento(novoSegmento)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => adicionarSegmento(novoSegmento)}
              disabled={!novoSegmento.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de segmentos selecionados */}
        {segmentos.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Segmentos selecionados ({segmentos.length})
            </label>
            <div className="space-y-1.5">
              <AnimatePresence>
                {segmentos.map((segmento, index) => (
                  <motion.div
                    key={segmento.nome}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-lg border border-gray-100 bg-white"
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <span className="flex-1 text-sm text-gray-900">{segmento.nome}</span>
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Adicionar descrição"
                      >
                        {expandedIndex === index ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removerSegmento(index)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {expandedIndex === index && (
                      <div className="border-t border-gray-50 px-3 pb-3 pt-2">
                        <textarea
                          value={segmento.descricao ?? ''}
                          onChange={(e) => updateDescricao(index, e.target.value)}
                          placeholder="Descreva este segmento para a landing page (opcional)"
                          rows={2}
                          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                        />
                        <p className="mt-1 text-[10px] text-gray-400">
                          Este texto aparecerá no card do segmento na landing page.
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Próximo
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
