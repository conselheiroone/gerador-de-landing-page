import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Import, Loader2, Check, AlertCircle, Globe, LayoutTemplate, X, RotateCcw, Zap, FileCode } from 'lucide-react'
import { z } from 'zod'
import { fadeIn } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { buscarHtmlExterno } from '@/features/importar-layout/api/importar-layout-api'
import { buscarLayoutPlaywright, checkPlaywrightServer, type PlaywrightLayoutResponse } from '@/features/importar-layout/api/playwright-api'
import { converterParaTemplate } from '@/features/importar-layout/utils/html-to-template'
import { criarTemplate } from '@/features/templates/api/templates-api'
import type { FetchHtmlResponse } from '@/features/importar-layout/types/importar-layout.types'

const urlSchema = z
  .string()
  .min(1, 'URL obrigatoria')
  .url('URL invalida')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL deve comecar com http:// ou https://',
  )

type Step = 'input' | 'loading' | 'preview' | 'saving' | 'success' | 'error'
type ExtractionMode = 'playwright' | 'edge-function'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero / Banner',
  features: 'Servicos / Features',
  testimonials: 'Depoimentos',
  about: 'Sobre / Quem Somos',
  faq: 'Perguntas Frequentes',
  logos: 'Logos / Parceiros',
  gallery: 'Galeria',
  cta: 'Call to Action',
  contact: 'Contato',
  footer: 'Rodape',
  generic: 'Secao',
}

export function AdminImportarLayoutPage() {
  const navigate = useNavigate()
  const { session } = useAuth()

  const [url, setUrl] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [error, setError] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>('playwright')
  const [playwrightAvailable, setPlaywrightAvailable] = useState<boolean | null>(null)

  const [htmlResponse, setHtmlResponse] = useState<FetchHtmlResponse | null>(null)
  const [playwrightResult, setPlaywrightResult] = useState<PlaywrightLayoutResponse | null>(null)
  const [excludedSections, setExcludedSections] = useState<Set<number>>(new Set())

  // Verificar se o servidor Playwright esta disponivel
  useEffect(() => {
    checkPlaywrightServer().then((available) => {
      setPlaywrightAvailable(available)
      if (!available) setExtractionMode('edge-function')
    })
  }, [])

  const toggleSection = useCallback((index: number) => {
    setExcludedSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }, [])

  const restoreAll = useCallback(() => {
    setExcludedSections(new Set())
  }, [])

  /** Build the template from only the selected sections */
  const buildFromSelected = useCallback(() => {
    if (!htmlResponse) return null
    const filtered: FetchHtmlResponse = {
      ...htmlResponse,
      sections: htmlResponse.sections.filter((_, i) => !excludedSections.has(i)),
    }
    return converterParaTemplate(filtered)
  }, [htmlResponse, excludedSections])

  const handleAnalyze = async () => {
    setError('')

    const validation = urlSchema.safeParse(url)
    if (!validation.success) {
      setError(validation.error.issues[0].message)
      return
    }

    setStep('loading')
    setHtmlResponse(null)
    setPlaywrightResult(null)

    try {
      if (extractionMode === 'playwright') {
        const result = await buscarLayoutPlaywright(url)
        setPlaywrightResult(result)
        setTemplateName(result.title || 'Layout Importado')
      } else {
        const response = await buscarHtmlExterno(url)
        setHtmlResponse(response)
        setTemplateName('Layout Importado')
      }
      setExcludedSections(new Set())
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStep('error')
    }
  }

  /** Obtem o craftJson final (Playwright retorna pronto, Edge Function precisa converter) */
  const getCraftJson = useCallback((): string | null => {
    if (playwrightResult) {
      return playwrightResult.craftJson
    }
    if (htmlResponse) {
      const result = buildFromSelected()
      return result?.craftJson || null
    }
    return null
  }, [playwrightResult, htmlResponse, buildFromSelected])

  const handleSaveTemplate = async () => {
    if (!session?.user?.id) return

    const craftJson = getCraftJson()
    if (!craftJson) return

    setStep('saving')
    try {
      await criarTemplate(
        templateName || 'Layout Importado',
        'Layout importado de site externo',
        'Importado',
        craftJson,
        session.user.id,
      )
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar template')
      setStep('error')
    }
  }

  const handleOpenEditor = () => {
    const craftJson = getCraftJson()
    if (!craftJson) return

    navigate('/editor/novo', {
      state: {
        templateJson: craftJson,
        templateNome: templateName || 'Layout Importado',
      },
    })
  }

  const handleReset = () => {
    setStep('input')
    setError('')
    setHtmlResponse(null)
    setPlaywrightResult(null)
    setExcludedSections(new Set())
    setTemplateName('')
  }

  const totalSections = playwrightResult
    ? playwrightResult.sectionCount
    : (htmlResponse?.sections.length ?? 0)
  const selectedCount = playwrightResult
    ? playwrightResult.sectionCount
    : totalSections - excludedSections.size

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Importar Layout</h1>
        <p className="text-sm text-gray-500">
          Importe a estrutura de um site externo como template
        </p>
      </div>

      {/* Input Step */}
      {(step === 'input' || step === 'loading') && (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="mx-auto max-w-xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-500 mx-auto">
              <Globe className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-center text-lg font-semibold text-gray-900">
              Cole a URL do site
            </h2>
            <p className="mb-6 text-center text-sm text-gray-500">
              O sistema analisara a estrutura do site e criara um layout semelhante com placeholders editaveis.
            </p>

            <div className="flex gap-3">
              <Input
                placeholder="https://exemplo.com.br"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={step === 'loading'}
                onKeyDown={(e) => e.key === 'Enter' && step !== 'loading' && handleAnalyze()}
              />
              <Button
                onClick={handleAnalyze}
                disabled={step === 'loading' || !url.trim()}
              >
                {step === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Import className="h-4 w-4" />
                    Analisar
                  </>
                )}
              </Button>
            </div>

            {error && step === 'input' && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}

            {/* Toggle modo de extracao */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setExtractionMode('playwright')}
                disabled={!playwrightAvailable || step === 'loading'}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  extractionMode === 'playwright'
                    ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                    : 'text-gray-500 hover:bg-gray-100'
                } ${!playwrightAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Zap className="h-3.5 w-3.5" />
                Playwright
                {playwrightAvailable === false && (
                  <span className="text-[10px] text-red-400">(offline)</span>
                )}
              </button>
              <button
                onClick={() => setExtractionMode('edge-function')}
                disabled={step === 'loading'}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  extractionMode === 'edge-function'
                    ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                Edge Function
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              {extractionMode === 'playwright'
                ? 'Modo Playwright: renderizacao real com browser headless (alta fidelidade, suporta SPAs).'
                : 'Funciona melhor com sites estaticos. Sites que dependem de JavaScript (SPAs) podem nao ser analisados corretamente.'}
            </p>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && (htmlResponse || playwrightResult) && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Estrutura analisada com sucesso
                  </h3>
                  <p className="text-sm text-gray-500">
                    {playwrightResult
                      ? `${playwrightResult.sectionCount} secao(oes) detectada(s) via Playwright`
                      : `${selectedCount} de ${totalSections} secao(oes) selecionada(s)`}
                  </p>
                </div>
              </div>
              {!playwrightResult && excludedSections.size > 0 && (
                <button
                  onClick={restoreAll}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restaurar todas
                </button>
              )}
            </div>

            {/* Playwright: resumo compacto (nao tem sections editaveis) */}
            {playwrightResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <Zap className="h-4 w-4 text-brand-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700">
                      Template gerado com alta fidelidade
                    </span>
                    <span className="ml-2 text-sm text-gray-400">
                      — {playwrightResult.sectionCount} secoes
                      {playwrightResult.fontFamily && `, fonte: ${playwrightResult.fontFamily}`}
                    </span>
                  </div>
                  {playwrightResult.colorPalette?.primary && (
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-5 w-5 rounded-full border border-gray-200"
                        style={{ backgroundColor: playwrightResult.colorPalette.primary }}
                        title={`Primary: ${playwrightResult.colorPalette.primary}`}
                      />
                      {playwrightResult.colorPalette.accent && (
                        <div
                          className="h-5 w-5 rounded-full border border-gray-200"
                          style={{ backgroundColor: playwrightResult.colorPalette.accent }}
                          title={`Accent: ${playwrightResult.colorPalette.accent}`}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edge Function: lista de secoes com toggle */}
            {htmlResponse && !playwrightResult && (
              <div className="space-y-2">
                {htmlResponse.sections.map((section, i) => {
                  const isExcluded = excludedSections.has(i)
                  const details: string[] = []
                  if (section.repeatedItems && section.repeatedItems.count >= 2) {
                    details.push(`${section.repeatedItems.count} itens`)
                  }
                  if (section.layout && section.layout.columns > 1) {
                    details.push(`${section.layout.columns} colunas`)
                  }
                  if (section.contentInventory?.imageCount > 0) {
                    details.push(`${section.contentInventory.imageCount} img`)
                  }
                  if (section.contentInventory?.statNumbers > 0) {
                    details.push(`${section.contentInventory.statNumbers} metricas`)
                  }
                  if (details.length === 0 && section.childCount > 0) {
                    details.push(`${section.childCount} elemento(s)`)
                  }

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                        isExcluded
                          ? 'border-red-100 bg-red-50/50 opacity-50'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <LayoutTemplate className={`h-4 w-4 ${isExcluded ? 'text-red-300' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${
                          isExcluded ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}>
                          {SECTION_LABELS[section.sectionType] || section.sectionType}
                        </span>
                        {details.length > 0 && (
                          <span className="ml-2 text-sm text-gray-400">
                            — {details.join(', ')}
                          </span>
                        )}
                      </div>
                      {section.backgroundTone && section.backgroundTone !== 'unknown' && !isExcluded && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          section.backgroundTone === 'dark'
                            ? 'bg-gray-800 text-gray-200'
                            : section.backgroundTone === 'accent'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {section.backgroundTone}
                        </span>
                      )}
                      <button
                        onClick={() => toggleSection(i)}
                        className={`shrink-0 flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
                          isExcluded
                            ? 'text-green-600 hover:bg-green-100'
                            : 'text-gray-400 hover:bg-red-100 hover:text-red-500'
                        }`}
                        title={isExcluded ? 'Restaurar secao' : 'Remover secao'}
                      >
                        {isExcluded ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Salvar como Template</h3>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nome do template
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nome do template"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveTemplate} disabled={!getCraftJson()}>
                <Import className="h-4 w-4" />
                Salvar como Template
              </Button>
              <Button variant="outline" onClick={handleOpenEditor} disabled={!getCraftJson()}>
                <LayoutTemplate className="h-4 w-4" />
                Abrir no Editor
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                Importar outro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saving Step */}
      {step === 'saving' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="mt-4 text-sm text-gray-500">Salvando template...</p>
        </div>
      )}

      {/* Success Step */}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Template salvo com sucesso!
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            O template &quot;{templateName}&quot; esta disponivel na lista de templates.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/templates')}>
              Ver Templates
            </Button>
            <Button variant="outline" onClick={handleOpenEditor}>
              Abrir no Editor
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Importar outro
            </Button>
          </div>
        </div>
      )}

      {/* Error Step */}
      {step === 'error' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Erro ao importar
          </h3>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <Button onClick={handleReset}>Tentar Novamente</Button>
        </div>
      )}
    </motion.div>
  )
}
