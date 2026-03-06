import { useState } from 'react'
import { X, FileText, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { starterTemplates, type StarterTemplate } from '../data/starter-templates'

interface StarterTemplateModalProps {
  open: boolean
  onClose: () => void
}

export function StarterTemplateModal({ open, onClose }: StarterTemplateModalProps) {
  const navigate = useNavigate()
  const [selectedStarter, setSelectedStarter] = useState<StarterTemplate | null>(null)
  const [titulo, setTitulo] = useState('')
  const [step, setStep] = useState<'select' | 'title'>('select')

  if (!open) return null

  const handleSelectStarter = (starter: StarterTemplate) => {
    setSelectedStarter(starter)
    setStep('title')
    setTitulo('')
  }

  const handleConfirm = () => {
    if (!selectedStarter) return

    const pageTitle = titulo.trim() || 'Novo Template'

    if (selectedStarter.id === 'starter-blank' || !selectedStarter.json) {
      // Blank template
      navigate('/editor/novo')
    } else {
      // Navegar com o JSON do starter
      navigate('/editor/novo', {
        state: {
          templateJson: selectedStarter.json,
          templateNome: pageTitle,
        },
      })
    }

    onClose()
    setStep('select')
    setSelectedStarter(null)
  }

  const handleBack = () => {
    setStep('select')
    setSelectedStarter(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'select' ? 'Escolha um Template Inicial' : 'Defina o Título'}
          </h2>
          <button
            onClick={() => { onClose(); setStep('select'); setSelectedStarter(null) }}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'select' ? (
          /* Step 1: Galeria de starters */
          <div className="p-6">
            <p className="mb-4 text-sm text-gray-500">
              Selecione um modelo base para começar. Você poderá personalizar tudo no editor.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {starterTemplates.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => handleSelectStarter(starter)}
                  className="group rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
                >
                  {/* Thumbnail placeholder */}
                  <div className="mb-3 flex h-24 items-center justify-center rounded-md bg-gradient-to-br from-gray-50 to-gray-100">
                    <FileText className="h-8 w-8 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {starter.nome}
                  </h3>
                  <p className="mt-1 text-[11px] text-gray-400 line-clamp-2">
                    {starter.descricao}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-500">
                    {starter.categoria}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Título */
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
              <FileText className="h-5 w-5 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {selectedStarter?.nome}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedStarter?.descricao}
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Título da Página
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Landing Page Consultoria ABC"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
              }}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          {step === 'title' ? (
            <button
              onClick={handleBack}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); setStep('select'); setSelectedStarter(null) }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            {step === 'title' && (
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Criar Página
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
