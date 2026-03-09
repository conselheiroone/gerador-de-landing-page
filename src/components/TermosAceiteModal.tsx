import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Scale, CheckSquare, Square } from 'lucide-react'

interface TermosAceiteModalProps {
  conteudo: string
  versao: number
  atualizadoEm: string | null
  onAceitar: () => Promise<void>
}

export function TermosAceiteModal({
  conteudo,
  versao,
  atualizadoEm,
  onAceitar,
}: TermosAceiteModalProps) {
  const [aceitou, setAceitou] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const handleAceitar = async () => {
    setSalvando(true)
    await onAceitar()
    setSalvando(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <Scale className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Termos de Uso</h2>
            <p className="text-xs text-gray-500">
              Versão {versao}
              {atualizadoEm && (
                <> — Atualizado em {new Date(atualizadoEm).toLocaleDateString('pt-BR')}</>
              )}
            </p>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="px-6 py-4">
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {conteudo}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <label
            className="mb-4 flex cursor-pointer items-start gap-3"
            onClick={() => setAceitou((v) => !v)}
          >
            {aceitou ? (
              <CheckSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <Square className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            )}
            <span className="text-sm text-gray-700">
              Li e concordo com os Termos de Uso apresentados acima.
            </span>
          </label>

          <Button
            onClick={handleAceitar}
            disabled={!aceitou || salvando}
            className="w-full"
          >
            {salvando ? 'Salvando...' : 'Aceitar e Continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
