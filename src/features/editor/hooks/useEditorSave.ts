import { useEditor } from '@craftjs/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { salvarProjeto, criarProjeto } from '../api/editor-api'
import { atualizarTemplate } from '@/features/templates/api/templates-api'

interface UseEditorSaveOptions {
  projetoId: string | null
  templateId?: string | null
  usuarioId: string | null
  debounceMs?: number
  allowAutoCreate?: boolean
}

interface UseEditorSaveReturn {
  status: 'idle' | 'saving' | 'saved' | 'error'
  projetoId: string | null
  lastSavedAt: Date | null
  saveNow: () => Promise<void>
  error: string | null
}

export function useEditorSave({
  projetoId: initialProjetoId,
  templateId,
  usuarioId,
  debounceMs = 3000,
  allowAutoCreate = true,
}: UseEditorSaveOptions): UseEditorSaveReturn {
  const { query } = useEditor()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [currentProjetoId, setCurrentProjetoId] = useState<string | null>(initialProjetoId)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastJsonRef = useRef<string>('')

  const doSave = useCallback(async () => {
    if (!usuarioId) return

    try {
      const json = query.serialize()

      // Evitar salvar se nada mudou
      if (json === lastJsonRef.current) return

      setStatus('saving')
      setError(null)

      if (templateId) {
        await atualizarTemplate(templateId, { dados_template: json })
      } else if (currentProjetoId) {
        await salvarProjeto(currentProjetoId, json)
      } else if (allowAutoCreate) {
        const projeto = await criarProjeto('Novo Projeto', usuarioId, json)
        setCurrentProjetoId(projeto.id)
        // Atualizar URL sem reload
        window.history.replaceState(null, '', `/editor/${projeto.id}`)
      } else {
        // allowAutoCreate = false: salvar apenas em localStorage sem criar projeto
        localStorage.setItem('editor_backup', json)
        lastJsonRef.current = json
        setLastSavedAt(new Date())
        setStatus('saved')
        return
      }

      lastJsonRef.current = json
      setLastSavedAt(new Date())
      setStatus('saved')

      // Fallback localStorage
      localStorage.setItem('editor_backup', json)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      // Salvar em localStorage como fallback
      try {
        const json = query.serialize()
        localStorage.setItem('editor_backup', json)
      } catch {
        // silenciar erro de localStorage
      }
    }
  }, [currentProjetoId, templateId, usuarioId, query])

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    await doSave()
  }, [doSave])

  // Auto-save com debounce via onNodesChange
  useEffect(() => {
    if (!usuarioId) return

    const handleChange = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => {
        doSave()
      }, debounceMs)
    }

    // Registrar listener no editor
    // O Craft.js dispara o onNodesChange via o <Editor> component prop
    // Aqui usamos um interval como fallback para detectar mudancas
    const checkInterval = setInterval(() => {
      try {
        const currentJson = query.serialize()
        if (currentJson !== lastJsonRef.current && lastJsonRef.current !== '') {
          handleChange()
        }
      } catch {
        // Editor pode nao estar pronto
      }
    }, 5000)

    return () => {
      clearInterval(checkInterval)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [usuarioId, debounceMs, doSave, query])

  return {
    status,
    projetoId: currentProjetoId,
    lastSavedAt,
    saveNow,
    error,
  }
}
