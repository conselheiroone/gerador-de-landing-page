import { useEffect, useState } from 'react'
import { listarTemplates, type TemplateRow } from '../api/templates-api'
import { builtinTemplates, type BuiltinTemplate } from '@/features/editor/utils/default-templates'

export interface TemplateItem {
  id: string
  nome: string
  descricao: string
  categoria: string
  thumbnail_url: string | null
  isBuiltin: boolean
  json: string
}

function templateRowToItem(row: TemplateRow): TemplateItem {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao ?? '',
    categoria: row.categoria,
    thumbnail_url: row.thumbnail_url,
    isBuiltin: false,
    json: typeof row.dados_template === 'string'
      ? row.dados_template
      : JSON.stringify(row.dados_template),
  }
}

function builtinToItem(tmpl: BuiltinTemplate): TemplateItem {
  return {
    id: tmpl.id,
    nome: tmpl.nome,
    descricao: tmpl.descricao,
    categoria: tmpl.categoria,
    thumbnail_url: null,
    isBuiltin: true,
    json: tmpl.json,
  }
}

export function useTemplates(categoria?: string) {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        // Carregar templates do Supabase
        const dbTemplates = await listarTemplates(categoria)
        const dbItems = dbTemplates.map(templateRowToItem)

        // Filtrar built-in por categoria se necessário
        let builtinItems = builtinTemplates.map(builtinToItem)
        if (categoria && categoria !== 'Todos') {
          builtinItems = builtinItems.filter((t) => t.categoria === categoria)
        }

        if (!cancelled) {
          // Built-in primeiro, depois os do banco
          setTemplates([...builtinItems, ...dbItems])
        }
      } catch (err) {
        if (!cancelled) {
          // Se falhar ao carregar do Supabase, mostrar apenas built-in
          let builtinItems = builtinTemplates.map(builtinToItem)
          if (categoria && categoria !== 'Todos') {
            builtinItems = builtinItems.filter((t) => t.categoria === categoria)
          }
          setTemplates(builtinItems)
          setError(err instanceof Error ? err.message : 'Erro ao carregar templates')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [categoria])

  return { templates, loading, error }
}
