import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Paintbrush, Loader2, X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTemplates, type TemplateItem } from '@/features/templates/hooks/useTemplates'
import { usePerfilEmpresa } from '@/features/onboarding/hooks/usePerfilEmpresa'
import { hydrarTemplateComPerfil } from '@/features/editor/utils/hydrate-template'
import type { PerfilEmpresa } from '@/features/onboarding/types/onboarding.types'

const categorias = [
  'Todos',
  'Negocios',
  'Portfolio',
  'Basico',
]

const categoriaCores: Record<string, string> = {
  Negocios: 'bg-blue-100 text-blue-700',
  Portfolio: 'bg-purple-100 text-purple-700',
  Basico: 'bg-gray-100 text-gray-600',
}

// ---------------------------------------------------------------------------
// Modal de escolha: Com meus dados vs. Em branco
// ---------------------------------------------------------------------------
interface HydratarTemplateModalProps {
  template: TemplateItem
  perfil: PerfilEmpresa | null
  onConfirmar: (comDados: boolean) => void
  onFechar: () => void
}

function HydratarTemplateModal({
  template,
  perfil,
  onConfirmar,
  onFechar,
}: HydratarTemplateModalProps) {
  const navigate = useNavigate()
  const perfilCompleto = perfil !== null && perfil.onboarding_completo === true

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-900">Como deseja começar?</h2>
          <button
            onClick={onFechar}
            className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Template: <span className="font-medium text-gray-700">"{template.nome}"</span>
        </p>

        {/* Opções */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Com meus dados */}
          <button
            disabled={!perfilCompleto}
            onClick={() => onConfirmar(true)}
            title={
              !perfilCompleto
                ? 'Complete seu perfil para usar esta opção'
                : 'Preencher template com dados do seu perfil'
            }
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
              perfilCompleto
                ? 'border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-pointer'
                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-sm font-semibold">Com meus dados</span>
            <span className="text-xs leading-snug">
              Preenche com seu perfil de empresa
            </span>
          </button>

          {/* Em branco */}
          <button
            onClick={() => onConfirmar(false)}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-gray-200 bg-white p-4 text-center hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer text-gray-600"
          >
            <Paintbrush className="w-6 h-6" />
            <span className="text-sm font-semibold">Em branco</span>
            <span className="text-xs leading-snug text-gray-400">
              Template vazio para editar
            </span>
          </button>
        </div>

        {/* Aviso perfil incompleto */}
        {!perfilCompleto && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Seu perfil está incompleto.{' '}
              <button
                onClick={() => navigate('/onboarding')}
                className="underline font-medium hover:text-amber-900"
              >
                Completar perfil →
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function TemplatesPage() {
  const navigate = useNavigate()
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null)
  const [templateParaUsar, setTemplateParaUsar] = useState<TemplateItem | null>(null)
  const { templates, loading } = useTemplates(categoriaAtiva)
  const { perfil, socios } = usePerfilEmpresa()

  // Abre o modal de escolha em vez de navegar diretamente
  const handleUseTemplate = (template: TemplateItem) => {
    setPreviewTemplate(null) // fecha preview se estiver aberto
    setTemplateParaUsar(template)
  }

  // Confirma a escolha do modal e navega para o editor
  const handleConfirmarHidratacao = (comDados: boolean) => {
    if (!templateParaUsar) return
    let json = templateParaUsar.json
    if (comDados && perfil) {
      json = hydrarTemplateComPerfil(json, perfil, socios)
    }
    setTemplateParaUsar(null)
    navigate('/editor/novo', {
      state: { templateJson: json, templateNome: templateParaUsar.nome },
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Selecione um modelo para comecar
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Escolha um template e personalize no editor visual
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filtros */}
        <aside className="w-48 shrink-0">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Categorias
          </h2>
          <nav className="space-y-1">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  categoriaAtiva === cat
                    ? 'bg-brand-50 text-brand-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Grid de templates */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-400">Carregando templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Paintbrush className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500">Nenhum template nesta categoria</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {templates.map((template) => (
                <motion.div key={template.id} variants={staggerItem}>
                  <Card className="cursor-pointer overflow-hidden transition-all hover:shadow-md group">
                    {/* Thumbnail / Placeholder */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Paintbrush className="h-8 w-8" />
                          <span className="text-xs">{template.nome}</span>
                        </div>
                      )}

                      {/* Overlay com botões */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewTemplate(template)
                          }}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseTemplate(template)
                          }}
                          className="text-xs"
                        >
                          Usar
                        </Button>
                      </div>
                    </div>

                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {template.nome}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {template.descricao}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            categoriaCores[template.categoria] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {template.categoria}
                        </span>
                      </div>
                      {template.isBuiltin && (
                        <span className="mt-2 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          Incluso
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de escolha de hidratação */}
      {templateParaUsar && (
        <HydratarTemplateModal
          template={templateParaUsar}
          perfil={perfil}
          onConfirmar={handleConfirmarHidratacao}
          onFechar={() => setTemplateParaUsar(null)}
        />
      )}

      {/* Modal de Preview */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {previewTemplate.nome}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {previewTemplate.descricao}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
              <span className={`rounded-full px-2 py-0.5 font-medium ${
                categoriaCores[previewTemplate.categoria] ?? 'bg-gray-100 text-gray-600'
              }`}>
                {previewTemplate.categoria}
              </span>
              {previewTemplate.isBuiltin && (
                <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">
                  Template incluso
                </span>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Fechar
              </Button>
              <Button onClick={() => handleUseTemplate(previewTemplate)}>
                <Paintbrush className="h-4 w-4 mr-1" />
                Usar Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
