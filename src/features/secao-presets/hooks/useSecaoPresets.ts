import { useEffect, useState, useCallback } from 'react'
import { listarSecaoPresets } from '../api/secao-presets-api'
import { builtinSecaoPresets } from '../data/builtin-secao-presets'
import type { SecaoPresetItem } from '../types/secao-presets.types'

export function useSecaoPresets(categoria?: string) {
  const [presets, setPresets] = useState<SecaoPresetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Built-in presets (filtrados por categoria se necessário)
    let builtins: SecaoPresetItem[] = builtinSecaoPresets.map((b) => ({
      id: b.id,
      nome: b.nome,
      categoria: b.categoria,
      descricao: b.descricao,
      thumbnail_url: null,
      isBuiltin: true,
      json: b.json,
    }))

    if (categoria && categoria !== 'Todas') {
      builtins = builtins.filter((b) => b.categoria === categoria)
    }

    // Database presets
    try {
      const dbRows = await listarSecaoPresets(categoria)
      const dbPresets: SecaoPresetItem[] = dbRows.map((row) => ({
        id: row.id,
        nome: row.nome,
        categoria: row.categoria,
        descricao: row.descricao ?? '',
        thumbnail_url: row.thumbnail_url,
        isBuiltin: false,
        json:
          typeof row.dados_componente === 'string'
            ? row.dados_componente
            : JSON.stringify(row.dados_componente),
      }))

      setPresets([...builtins, ...dbPresets])
    } catch (err) {
      console.error('Erro ao carregar seções do banco:', err)
      setError('Erro ao carregar seções do banco')
      setPresets(builtins)
    } finally {
      setLoading(false)
    }
  }, [categoria])

  useEffect(() => {
    load()
  }, [load])

  return { presets, loading, error, refetch: load }
}
