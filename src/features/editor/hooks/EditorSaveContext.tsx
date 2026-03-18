import { createContext, useContext, type ReactNode } from 'react'
import { useEditorSave } from './useEditorSave'

interface EditorSaveContextValue {
  status: 'idle' | 'saving' | 'saved' | 'error'
  projetoId: string | null
  lastSavedAt: Date | null
  saveNow: () => Promise<void>
  error: string | null
}

const EditorSaveCtx = createContext<EditorSaveContextValue>({
  status: 'idle',
  projetoId: null,
  lastSavedAt: null,
  saveNow: async () => {},
  error: null,
})

interface EditorSaveProviderProps {
  projetoId: string | null
  templateId?: string | null
  usuarioId: string | null
  nomeProjeto?: string
  children: ReactNode
}

export function EditorSaveProvider({
  projetoId,
  templateId,
  usuarioId,
  nomeProjeto = 'Novo Projeto',
  children,
}: EditorSaveProviderProps) {
  const save = useEditorSave({
    projetoId,
    templateId,
    usuarioId,
    debounceMs: 3000,
    nomeProjeto,
  })

  return (
    <EditorSaveCtx.Provider value={save}>
      {children}
    </EditorSaveCtx.Provider>
  )
}

export function useEditorSaveContext() {
  return useContext(EditorSaveCtx)
}
