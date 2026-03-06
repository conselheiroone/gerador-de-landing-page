import { useEditor } from '@craftjs/core'
import { Undo2, Redo2, Eye, Pencil, Save, Loader2, Check, ArrowLeft, Monitor, Tablet, Smartphone, Code, LayoutGrid } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEditorSaveContext } from '../../hooks/EditorSaveContext'
import { useViewportSize, type ViewportMode } from '../../hooks/useViewportSize'
import { ExportModal } from '../ExportModal'
import { SalvarSecaoModal } from '../SalvarSecaoModal'

const viewportButtons: { mode: ViewportMode; icon: typeof Monitor; label: string }[] = [
  { mode: 'desktop', icon: Monitor, label: 'Desktop' },
  { mode: 'tablet', icon: Tablet, label: 'Tablet' },
  { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
]

interface EditorHeaderProps {
  pageTitle?: string
}

export const EditorHeader = ({ pageTitle = 'Minha Landing Page' }: EditorHeaderProps) => {
  const { templateId } = useParams<{ projetoId?: string; templateId?: string }>()
  const [searchParams] = useSearchParams()
  const isModeSecao = searchParams.get('mode') === 'secao'
  const secaoId = searchParams.get('secaoId')
  const navigate = useNavigate()
  const { mode, setMode } = useViewportSize()
  const [showExport, setShowExport] = useState(false)
  const [showSalvarSecao, setShowSalvarSecao] = useState(false)

  const { enabled, canUndo, canRedo, actions, query } = useEditor(
    (state, query) => ({
      enabled: state.options.enabled,
      canUndo: query.history.canUndo(),
      canRedo: query.history.canRedo(),
    })
  )

  const { status, saveNow, lastSavedAt } = useEditorSaveContext()

  const savedLabel = lastSavedAt ? `${lastSavedAt.toLocaleTimeString('pt-BR')}` : ''
  const statusLabel = {
    idle: '',
    saving: 'Salvando...',
    saved: templateId
      ? `Template salvo${savedLabel ? ` ${savedLabel}` : ''}`
      : `Salvo${savedLabel ? ` ${savedLabel}` : ''}`,
    error: 'Erro ao salvar',
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      {/* Esquerda: Voltar + Undo/Redo */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(templateId ? '/admin/templates' : '/')}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="w-px h-6 bg-gray-200" />

        {enabled && (
          <div className="flex items-center gap-1">
            <button
              disabled={!canUndo}
              onClick={() => actions.history.undo()}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              disabled={!canRedo}
              onClick={() => actions.history.redo()}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Centro: Viewport Toggle + Status */}
      <div className="flex items-center gap-4">
        {/* Viewport Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {viewportButtons.map(({ mode: m, icon: Icon, label }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-1.5 rounded-md transition-colors ${
                mode === m
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Status de save */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          {status === 'saving' && <Loader2 className="w-3 h-3 animate-spin" />}
          {status === 'saved' && <Check className="w-3 h-3 text-green-500" />}
          <span className={status === 'error' ? 'text-red-400' : ''}>
            {statusLabel[status]}
          </span>
        </div>
      </div>

      {/* Direita: Exportar + Salvar + Preview/Editar */}
      <div className="flex items-center gap-2">
        {isModeSecao && (
          <button
            onClick={() => setShowSalvarSecao(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            title="Salvar como seção reutilizável"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Salvar Seção</span>
          </button>
        )}

        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Exportar HTML"
        >
          <Code className="w-4 h-4" />
          <span>Exportar</span>
        </button>

        <button
          onClick={saveNow}
          disabled={status === 'saving'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50 ${
            status === 'error'
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={status === 'error' ? 'Erro ao salvar — clique para tentar novamente' : 'Salvar agora'}
        >
          <Save className="w-4 h-4" />
          <span>{status === 'error' ? 'Erro — Tentar de novo' : 'Salvar'}</span>
        </button>

        <button
          onClick={() => {
            actions.setOptions((options) => {
              options.enabled = !enabled
            })
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded transition-colors ${
            enabled
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {enabled ? (
            <>
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              <span>Editar</span>
            </>
          )}
        </button>
      </div>

      <ExportModal
        open={showExport}
        onClose={() => setShowExport(false)}
        pageTitle={pageTitle}
      />

      <SalvarSecaoModal
        open={showSalvarSecao}
        onClose={() => setShowSalvarSecao(false)}
        getEditorJson={() => query.serialize()}
        secaoId={secaoId}
      />
    </header>
  )
}
