import { Editor, Frame, Element } from '@craftjs/core'
import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { EditorViewport } from './viewport/EditorViewport'
import { RenderNode } from './render/RenderNode'
import { KeyboardShortcuts } from './KeyboardShortcuts'
import { EditorSaveProvider } from '../hooks/EditorSaveContext'
import {
  resolverMap,
  ContainerComponent,
  HeadingComponent,
  TextComponent,
  ButtonComponent,
} from './user-components'
import { carregarProjeto } from '../api/editor-api'
import { buscarTemplate } from '@/features/templates/api/templates-api'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getBuiltinTemplate } from '../utils/default-templates'

interface LocationState {
  templateJson?: string
  templateNome?: string
  fromProfile?: boolean
}

export const EditorPage = () => {
  const { projetoId, templateId } = useParams<{ projetoId?: string; templateId?: string }>()
  const location = useLocation()
  const { session } = useAuth()

  // Ler location.state de forma sincrona para evitar que o <Frame> inicialize
  // com conteudo default antes do useEffect setar o JSON do template
  const locationState = location.state as LocationState | null
  const initialJson = locationState?.templateJson ?? null
  const initialNome = locationState?.templateNome ?? 'Novo Projeto'
  const fromProfile = locationState?.fromProfile ?? false

  const [savedJson, setSavedJson] = useState<string | null>(initialJson)
  const [loading, setLoading] = useState(!!(projetoId || templateId))
  const [projetoNome, setProjetoNome] = useState(initialNome)

  // Injetar Google Fonts quando o template especifica uma fontFamily no nó raiz
  useEffect(() => {
    if (!savedJson) return
    try {
      const parsed = JSON.parse(savedJson) as Record<string, { props?: Record<string, unknown> }>
      const rootNode = parsed['ROOT']
      const fontFamily = rootNode?.props?.fontFamily as string | undefined
      if (!fontFamily) return

      const linkId = 'gfonts-editor-inject'
      if (document.getElementById(linkId)) return

      const safeName = fontFamily.trim().replace(/\s+/g, '+')
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${safeName}:wght@400;500;600;700;800&display=swap`
      document.head.appendChild(link)
    } catch { /* JSON malformado ou sem fontFamily */ }

    return () => {
      document.getElementById('gfonts-editor-inject')?.remove()
    }
  }, [savedJson])

  // Carregar projeto existente ou template via query param
  useEffect(() => {
    // Se tem projetoId, carregar do Supabase (tabela projetos)
    if (projetoId) {
      const load = async () => {
        try {
          const projeto = await carregarProjeto(projetoId)
          setSavedJson(
            typeof projeto.dados_pagina === 'string'
              ? projeto.dados_pagina
              : JSON.stringify(projeto.dados_pagina)
          )
          setProjetoNome(projeto.nome)
        } catch (err) {
          console.error('Erro ao carregar projeto:', err)
          const backup = localStorage.getItem('editor_backup')
          if (backup) setSavedJson(backup)
        } finally {
          setLoading(false)
        }
      }
      load()
      return
    }

    // Se tem templateId, carregar do Supabase (tabela templates)
    if (templateId) {
      const load = async () => {
        try {
          const template = await buscarTemplate(templateId)
          setSavedJson(
            typeof template.dados_template === 'string'
              ? template.dados_template
              : JSON.stringify(template.dados_template)
          )
          setProjetoNome(template.nome)
        } catch (err) {
          console.error('Erro ao carregar template:', err)
        } finally {
          setLoading(false)
        }
      }
      load()
      return
    }

    // Checar query param ?template=builtin-xxx (state ja foi lido sincronamente)
    if (!initialJson) {
      const params = new URLSearchParams(location.search)
      const builtinId = params.get('template')
      if (builtinId) {
        const builtin = getBuiltinTemplate(builtinId)
        if (builtin) {
          setSavedJson(builtin.json)
          setProjetoNome(builtin.nome)
        }
      }
    }

    setLoading(false)
  }, [projetoId, templateId, location.search, initialJson])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Carregando editor...</p>
        </div>
      </div>
    )
  }

  return (
    <Editor
      resolver={resolverMap}
      onRender={RenderNode}
      indicator={{ success: '#2563eb', error: '#ef4444' }}
    >
      <KeyboardShortcuts />
      <EditorSaveProvider
        projetoId={projetoId ?? null}
        templateId={templateId ?? null}
        usuarioId={session?.user?.id ?? null}
        allowAutoCreate={!fromProfile}
      >
        <EditorViewport pageTitle={projetoNome}>
          {savedJson ? (
            <Frame json={savedJson} />
          ) : (
            <Frame>
              <Element
                canvas
                is={ContainerComponent}
                background="#ffffff"
                padding={40}
                gap={20}
                width="800px"
                height="auto"
                custom={{ displayName: 'Pagina' }}
              >
                {/* Hero Section */}
                <Element
                  canvas
                  is={ContainerComponent}
                  background="#f8fafc"
                  padding={40}
                  gap={16}
                  width="100%"
                  height="auto"
                  alignItems="center"
                  justifyContent="center"
                  radius={12}
                  custom={{ displayName: 'Hero' }}
                >
                  <HeadingComponent
                    text="Crie sua Landing Page"
                    fontSize="42"
                    fontWeight="800"
                    textAlign="center"
                    color="#111827"
                  />
                  <TextComponent
                    text="Arraste componentes da barra lateral para construir sua pagina. Clique em qualquer elemento para editar suas propriedades."
                    fontSize="18"
                    textAlign="center"
                    color="#6b7280"
                  />
                  <ButtonComponent
                    text="Comece Agora"
                    background="#2563eb"
                    color="#ffffff"
                    size="lg"
                    borderRadius={10}
                  />
                </Element>
              </Element>
            </Frame>
          )}
        </EditorViewport>
      </EditorSaveProvider>
    </Editor>
  )
}
