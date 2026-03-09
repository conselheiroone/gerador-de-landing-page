import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  Save,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAdminSettings } from '@/features/admin/hooks/use-admin-settings'
import { useModelPrompts } from '@/features/admin/hooks/use-model-prompts'
import {
  useUserModelOverrides,
  type UserModelOverride,
} from '@/features/admin/hooks/use-user-model-overrides'
import {
  OPENROUTER_MODELS,
  type OpenRouterModelId,
} from '@/features/admin/constants/openrouter-models'
import { supabase } from '@/integrations/supabase/client'

// ── Feedback inline ─────────────────────────────────────────────
type FeedbackType = 'success' | 'error'

function InlineFeedback({
  type,
  message,
}: {
  type: FeedbackType
  message: string
}) {
  return (
    <div
      className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
        type === 'success'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      {message}
    </div>
  )
}

// ── Prompt placeholders por modelo ──────────────────────────────
const PROMPT_PLACEHOLDERS: Record<string, string> = {
  'google/gemini-flash-3.1-image-preview': `## Instruções de Geração

Crie uma imagem profissional para o site da empresa **{{nome_empresa}}**.

### Contexto
- Segmento: {{segmento}}
- Serviços: {{servicos}}
- Diferenciais: {{diferenciais}}
- Localização: {{cidade}}/{{estado}}

### Estilo Visual
- Cores predominantes: {{cor_primaria}} e {{cor_secundaria}}
- Estilo: fotografia corporativa moderna, clean, alta resolução
- Sem texto na imagem
- Aspecto profissional e confiável`,

  'black-forest-labs/flux-2-klein-4b': `Professional corporate photography for {{nome_empresa}}, a {{segmento}} company.
Clean modern style, colors {{cor_primaria}} and {{cor_secundaria}}.
High quality, no text overlay, business-oriented.
Located in {{cidade}}, {{estado}}, Brazil.`,

  'openai/gpt-5-image-mini': `Generate a high-quality professional image for the website of {{nome_empresa}}.

**Company Profile:**
- Industry: {{segmento}}
- Services: {{servicos}}
- Differentials: {{diferenciais}}
- Tagline: "{{slogan}}"

**Visual Requirements:**
- Primary color: {{cor_primaria}}
- Secondary color: {{cor_secundaria}}
- Style: Modern corporate photography
- No text in the image
- Clean, trustworthy, professional aesthetic
- Suitable for a hero banner (16:9 aspect ratio)`,
}

// ── Variaveis disponiveis ───────────────────────────────────────
const AVAILABLE_VARIABLES = [
  '{{nome_empresa}}',
  '{{slogan}}',
  '{{segmento}}',
  '{{servicos}}',
  '{{diferenciais}}',
  '{{cor_primaria}}',
  '{{cor_secundaria}}',
  '{{cidade}}',
  '{{estado}}',
]

// ── Componente Principal ────────────────────────────────────────
export function AdminIAPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Banner */}
      <motion.div
        variants={staggerItem}
        className="mb-6 rounded-lg border border-violet-200 bg-violet-50 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
            <Sparkles className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configurações de IA
            </h1>
            <p className="text-sm text-gray-500">
              Gerencie modelos, prompts e overrides de geração de imagens
            </p>
          </div>
        </div>
      </motion.div>

      {/* Seção 1: Modelo Global */}
      <motion.div variants={staggerItem} className="mb-6">
        <ModeloGlobalSection />
      </motion.div>

      {/* Seção 2: Overrides por Usuário */}
      <motion.div variants={staggerItem} className="mb-6">
        <OverridesSection />
      </motion.div>

      {/* Seção 3: System Prompt Global */}
      <motion.div variants={staggerItem} className="mb-6">
        <SystemPromptSection />
      </motion.div>

      {/* Seção 4: Prompts por Modelo */}
      <motion.div variants={staggerItem}>
        <PromptsPorModeloSection />
      </motion.div>
    </motion.div>
  )
}

// ── SEÇÃO 1: Modelo Global ──────────────────────────────────────
function ModeloGlobalSection() {
  const { settings, loading, saveSetting } = useAdminSettings()
  const [selected, setSelected] = useState<OpenRouterModelId>(
    OPENROUTER_MODELS[0].id,
  )
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: FeedbackType
    message: string
  } | null>(null)

  useEffect(() => {
    const current = settings['openrouter_default_image_model']
    if (current) {
      const valid = OPENROUTER_MODELS.find((m) => m.id === current)
      if (valid) setSelected(valid.id)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    const { error } = await saveSetting(
      'openrouter_default_image_model',
      selected,
    )
    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', message: `Erro ao salvar: ${error.message}` })
    } else {
      setFeedback({ type: 'success', message: 'Modelo global salvo com sucesso!' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          Modelo Global
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Selecione o modelo padrão para geração de imagens em toda a plataforma.
        </p>

        <div className="space-y-3">
          {OPENROUTER_MODELS.map((model) => {
            const isSelected = selected === model.id
            const isActive =
              settings['openrouter_default_image_model'] === model.id

            return (
              <button
                key={model.id}
                type="button"
                onClick={() => setSelected(model.id)}
                className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {/* Radio visual */}
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? 'border-violet-500'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {model.alias}
                    </span>
                    {isActive && (
                      <Badge variant="success">ATIVO</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {model.description}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-gray-400">
                    {model.id}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Modelo'}
          </Button>
        </div>

        {feedback && (
          <InlineFeedback type={feedback.type} message={feedback.message} />
        )}
      </CardContent>
    </Card>
  )
}

// ── SEÇÃO 2: System Prompt Global ───────────────────────────────
function SystemPromptSection() {
  const { settings, loading, saveSetting } = useAdminSettings()
  const [prompt, setPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: FeedbackType
    message: string
  } | null>(null)

  useEffect(() => {
    const current = settings['ai_image_system_prompt']
    if (current !== undefined) {
      setPrompt(current)
    }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    const { error } = await saveSetting('ai_image_system_prompt', prompt)
    setSaving(false)
    if (error) {
      setFeedback({ type: 'error', message: `Erro ao salvar: ${error.message}` })
    } else {
      setFeedback({
        type: 'success',
        message: 'System prompt global salvo com sucesso!',
      })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          System Prompt Global
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Prefixo aplicado a todos os modelos. Este texto é concatenado antes do
          prompt específico de cada modelo.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Você é um assistente especializado em gerar imagens profissionais para landing pages..."
          className="w-full rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          rows={6}
        />

        <div className="mt-4 flex items-center justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Prompt'}
          </Button>
        </div>

        {feedback && (
          <InlineFeedback type={feedback.type} message={feedback.message} />
        )}
      </CardContent>
    </Card>
  )
}

// ── SEÇÃO 3: Prompts por Modelo ─────────────────────────────────
function PromptsPorModeloSection() {
  const { settings } = useAdminSettings()
  const { prompts, loading, savePrompt } = useModelPrompts()
  const [activeTab, setActiveTab] = useState(0)
  const [localPrompts, setLocalPrompts] = useState<Record<string, string>>({})
  const [savingModel, setSavingModel] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    type: FeedbackType
    message: string
  } | null>(null)

  const activeGlobalModel = settings['openrouter_default_image_model']

  // Sincronizar prompts do banco para estado local
  useEffect(() => {
    if (Object.keys(prompts).length > 0) {
      setLocalPrompts((prev) => {
        const merged = { ...prev }
        for (const [modelId, template] of Object.entries(prompts)) {
          if (!(modelId in merged)) {
            merged[modelId] = template
          }
        }
        return merged
      })
    }
  }, [prompts])

  const handleLocalChange = (modelId: string, value: string) => {
    setLocalPrompts((prev) => ({ ...prev, [modelId]: value }))
  }

  const handleSavePrompt = async (modelId: string) => {
    setSavingModel(modelId)
    setFeedback(null)
    const template = localPrompts[modelId] ?? ''
    const { error } = await savePrompt(modelId, template)
    setSavingModel(null)
    if (error) {
      setFeedback({ type: 'error', message: `Erro ao salvar: ${error.message}` })
    } else {
      setFeedback({ type: 'success', message: 'Prompt salvo com sucesso!' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">Carregando prompts...</p>
        </CardContent>
      </Card>
    )
  }

  const currentModel = OPENROUTER_MODELS[activeTab]

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          Prompts por Modelo
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Configure o prompt otimizado para cada modelo. Cada modelo responde
          diferente ao mesmo prompt.
        </p>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {OPENROUTER_MODELS.map((model, idx) => {
            const isActive = idx === activeTab
            const isGlobal = model.id === activeGlobalModel

            return (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  setActiveTab(idx)
                  setFeedback(null)
                }}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-violet-500 text-violet-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {model.alias}
                {isGlobal && (
                  <Badge variant="success" className="text-[10px]">
                    ATIVO
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Conteúdo da tab ativa */}
        <div className="mt-4">
          {/* Referência de variáveis */}
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Variáveis disponíveis
            </p>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_VARIABLES.map((v) => (
                <code
                  key={v}
                  className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs text-gray-700"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>

          {/* Editor textarea */}
          <textarea
            value={localPrompts[currentModel.id] ?? ''}
            onChange={(e) =>
              handleLocalChange(currentModel.id, e.target.value)
            }
            placeholder={PROMPT_PLACEHOLDERS[currentModel.id] ?? ''}
            className="min-h-[300px] w-full rounded-lg border border-gray-300 bg-white p-4 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />

          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-xs text-gray-400">
              {currentModel.id}
            </p>
            <Button
              onClick={() => handleSavePrompt(currentModel.id)}
              disabled={savingModel === currentModel.id}
            >
              <Save className="mr-2 h-4 w-4" />
              {savingModel === currentModel.id ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

          {feedback && (
            <InlineFeedback type={feedback.type} message={feedback.message} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── SEÇÃO 4: Overrides por Usuário ──────────────────────────────
function OverridesSection() {
  const { overrides, loading, saving, saveOverride, removeOverride } =
    useUserModelOverrides()
  const [modalOpen, setModalOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: FeedbackType
    message: string
  } | null>(null)

  // Modal state
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<
    { id: string; email: string; nome: string | null }[]
  >([])
  const [searching, setSearching] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedUserEmail, setSelectedUserEmail] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>(
    OPENROUTER_MODELS[0].id,
  )
  const [reason, setReason] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)

  const handleSearchUsers = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, email, nome')
      .ilike('email', `%${term}%`)
      .limit(10)

    if (data) {
      setSearchResults(
        data as { id: string; email: string; nome: string | null }[],
      )
    }
    setSearching(false)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearchUsers(searchEmail)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchEmail, handleSearchUsers])

  const handleAddOverride = async () => {
    if (!selectedUserId) return
    setModalError(null)
    setFeedback(null)
    const { error } = await saveOverride(
      selectedUserId,
      selectedModel,
      reason || undefined,
    )
    if (error) {
      setModalError(error.message)
    } else {
      setModalOpen(false)
      resetModal()
      setFeedback({
        type: 'success',
        message: 'Override adicionado com sucesso!',
      })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const handleRemove = async (override: UserModelOverride) => {
    setFeedback(null)
    const { error } = await removeOverride(override.user_id)
    if (error) {
      setFeedback({ type: 'error', message: `Erro ao remover: ${error.message}` })
    } else {
      setFeedback({ type: 'success', message: 'Override removido.' })
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const resetModal = () => {
    setSearchEmail('')
    setSearchResults([])
    setSelectedUserId('')
    setSelectedUserEmail('')
    setSelectedModel(OPENROUTER_MODELS[0].id)
    setReason('')
    setModalError(null)
  }

  const getModelAlias = (modelId: string) => {
    return (
      OPENROUTER_MODELS.find((m) => m.id === modelId)?.alias ?? modelId
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Overrides por Usuário
            </h2>
            <p className="text-sm text-gray-500">
              Atribua um modelo específico a um usuário (invisível para o
              usuário).
            </p>
          </div>
          <Button
            onClick={() => {
              resetModal()
              setModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Override
          </Button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Carregando...
          </p>
        ) : overrides.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Nenhum override ativo. Todos os usuários usam o modelo global.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Usuário
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Modelo
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Motivo
                  </th>
                  <th className="pb-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overrides.map((ov) => (
                  <tr key={ov.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">
                        {ov.user_nome ?? 'Sem nome'}
                      </p>
                      <p className="text-xs text-gray-500">{ov.user_email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">
                        {getModelAlias(ov.image_model)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {ov.reason ?? '-'}
                    </td>
                    <td className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(ov)}
                        disabled={saving}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {feedback && (
          <InlineFeedback type={feedback.type} message={feedback.message} />
        )}

        {/* Modal: Adicionar Override */}
        <Dialog
          open={modalOpen}
          onOpenChange={(o) => {
            setModalOpen(o)
            if (!o) resetModal()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Adicionar Override de Modelo
              </DialogTitle>
              <DialogDescription>
                Atribua um modelo específico a um usuário. O usuário não será
                notificado.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Busca de usuário */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  Buscar usuário por e-mail
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={searchEmail}
                    onChange={(e) => {
                      setSearchEmail(e.target.value)
                      setSelectedUserId('')
                      setSelectedUserEmail('')
                    }}
                    placeholder="Digite o e-mail do usuário..."
                    className="pl-10"
                  />
                </div>

                {/* Resultados da busca */}
                {searchResults.length > 0 && !selectedUserId && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(user.id)
                          setSelectedUserEmail(user.email)
                          setSearchEmail(user.email)
                          setSearchResults([])
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      >
                        <span className="font-medium text-gray-900">
                          {user.email}
                        </span>
                        {user.nome && (
                          <span className="text-gray-500">
                            ({user.nome})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {searching && (
                  <p className="text-xs text-gray-400">Buscando...</p>
                )}

                {selectedUserId && (
                  <p className="text-xs text-emerald-600">
                    Usuário selecionado: {selectedUserEmail}
                  </p>
                )}
              </div>

              {/* Modelo */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">Modelo</p>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPENROUTER_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.alias}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Motivo */}
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  Motivo (opcional)
                </p>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Teste A/B, plano premium..."
                />
              </div>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {modalError}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddOverride}
                disabled={!selectedUserId || saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
