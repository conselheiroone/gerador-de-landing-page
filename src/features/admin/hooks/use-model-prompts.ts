import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface ModelPrompt {
  model_id: string
  prompt_template: string
}

export function useModelPrompts() {
  const [prompts, setPrompts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPrompts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('ai_model_prompts')
      .select('model_id, prompt_template')

    if (fetchError) {
      setError(fetchError.message)
    } else if (data) {
      const map: Record<string, string> = {}
      ;(data as ModelPrompt[]).forEach((row) => {
        map[row.model_id] = row.prompt_template
      })
      setPrompts(map)
    }

    setLoading(false)
  }, [])

  const savePrompt = useCallback(
    async (modelId: string, promptTemplate: string) => {
      setSaving(true)
      setError(null)

      const { error: upsertError } = await supabase
        .from('ai_model_prompts')
        .upsert(
          {
            model_id: modelId,
            prompt_template: promptTemplate,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'model_id' },
        )

      if (upsertError) {
        setError(upsertError.message)
        setSaving(false)
        return { error: upsertError }
      }

      setPrompts((prev) => ({ ...prev, [modelId]: promptTemplate }))
      setSaving(false)
      return { error: null }
    },
    [],
  )

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  return { prompts, loading, saving, error, loadPrompts, savePrompt }
}
