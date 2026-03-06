import { useEditorSave } from '../hooks/useEditorSave'

interface SaveIndicatorProps {
  projetoId: string | null
  templateId?: string | null
  usuarioId: string | null
  projetoNome: string
  allowAutoCreate?: boolean
}

/**
 * Componente invisivel que gerencia o auto-save.
 * Expoe o status via DOM data-attribute para o EditorHeader consumir.
 */
export const SaveIndicator = ({ projetoId, templateId, usuarioId, allowAutoCreate = true }: SaveIndicatorProps) => {
  const { status, lastSavedAt, error } = useEditorSave({
    projetoId,
    templateId,
    usuarioId,
    debounceMs: 3000,
    allowAutoCreate,
  })

  return (
    <div
      data-save-status={status}
      data-save-last={lastSavedAt?.toISOString() ?? ''}
      data-save-error={error ?? ''}
      className="hidden"
    />
  )
}
