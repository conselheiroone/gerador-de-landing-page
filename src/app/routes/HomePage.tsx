import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, RefreshCw, Check } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getPerfilEmpresa, getSocios } from '@/features/onboarding/api/onboarding'
import { generateVariedTemplate, BLUEPRINTS } from '@/features/editor/utils/profile-template'
import type { LayoutBlueprint } from '@/features/editor/utils/layout-types'
import { fetchDepoimentos } from '@/features/depoimentos/api/depoimentos-api'
import type { PerfilEmpresa, Socio, Depoimento } from '@/features/onboarding/types/onboarding.types'
import { LayoutPreview } from '@/features/editor/components/LayoutPreview'

interface LayoutOption {
  blueprint: LayoutBlueprint
  templateJson: string
}

export function HomePage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [generating, setGenerating] = useState(false)

  // Estado para seleção de layout
  const [layoutOptions, setLayoutOptions] = useState<LayoutOption[] | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [profileData, setProfileData] = useState<{ perfil: PerfilEmpresa; socios: Socio[]; depoimentos: Depoimento[] } | null>(null)

  const fetchProfileData = useCallback(async () => {
    const userId = session?.user?.id
    if (!userId) return null

    const perfil = await getPerfilEmpresa(userId)
    if (!perfil) return null

    const socios = await getSocios(perfil.id)
    const depoimentos = await fetchDepoimentos(perfil.id).catch(() => [])
    return { perfil, socios, depoimentos }
  }, [session])

  // Gera variações de layout (4 por vez, embaralhadas dos 8 blueprints)
  async function handleGenerateVariations() {
    setGenerating(true)
    try {
      const data = profileData || await fetchProfileData()
      if (!data) {
        setGenerating(false)
        return
      }
      setProfileData(data)
      generateNewBatch(data)
    } catch (err) {
      console.error('Erro ao gerar variações:', err)
    } finally {
      setGenerating(false)
    }
  }

  function generateNewBatch(data: { perfil: PerfilEmpresa; socios: Socio[]; depoimentos: Depoimento[] }) {
    const seed = Date.now()

    // Clássico sempre fixo como primeira opção
    const classico = BLUEPRINTS.find(bp => bp.id === 'classico')!
    const options: LayoutOption[] = [{
      blueprint: classico,
      templateJson: generateVariedTemplate(data.perfil, data.socios, data.depoimentos, {
        blueprintId: classico.id,
        seed,
        microVariations: false,
      }),
    }]

    // Outros 3: diversidade de hero (um de cada tipo diferente)
    const remaining = BLUEPRINTS.filter(bp => bp.id !== 'classico')
    const heroGroups: Record<string, LayoutBlueprint[]> = {}
    for (const bp of remaining) {
      const heroVariant = bp.sections.find(s => s.type === 'hero')?.variant || 'split'
      if (!heroGroups[heroVariant]) heroGroups[heroVariant] = []
      heroGroups[heroVariant].push(bp)
    }
    const groups = Object.values(heroGroups).sort(() => Math.random() - 0.5)
    for (const group of groups) {
      if (options.length >= 4) break
      const bp = group[Math.floor(Math.random() * group.length)]
      options.push({
        blueprint: bp,
        templateJson: generateVariedTemplate(data.perfil, data.socios, data.depoimentos, {
          blueprintId: bp.id,
          seed: seed + options.length,
          microVariations: true,
        }),
      })
    }

    setLayoutOptions(options)
    setSelectedIndex(0)
  }

  // Re-gera com novos 4 blueprints aleatórios + micro-variações diferentes
  function handleRegenerate() {
    if (!profileData) return
    generateNewBatch(profileData)
  }

  // Confirma seleção e vai para o editor
  function handleConfirmLayout() {
    if (!layoutOptions || !profileData) return
    const selected = layoutOptions[selectedIndex]
    const templateNome = `${profileData.perfil.nome_empresa || 'Minha Empresa'} - Landing Page`
    navigate('/editor/novo', { state: { templateJson: selected.templateJson, templateNome, fromProfile: true } })
  }

  // Dispara geração automaticamente ao montar
  useEffect(() => {
    if (!layoutOptions && !generating && session?.user?.id) {
      handleGenerateVariations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  // ─── Tela de seleção de layout ───────────────────────────────

  if (layoutOptions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Escolha o Estilo
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Selecione o layout que mais combina com seu escritório
          </p>
        </div>

        {/* Grid de opções com preview */}
        <div className="mt-2 grid w-full max-w-3xl grid-cols-2 gap-4">
          {layoutOptions.map((option, i) => (
            <motion.button
              key={option.blueprint.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedIndex(i)}
              className={`relative flex flex-col gap-0 overflow-hidden rounded-xl border-2 text-left transition-all ${
                selectedIndex === i
                  ? 'border-brand-500 shadow-lg ring-2 ring-brand-200'
                  : 'border-gray-200 bg-white hover:border-brand-300 hover:shadow-md'
              }`}
            >
              {selectedIndex === i && (
                <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
              {/* Preview em miniatura */}
              <LayoutPreview
                templateJson={option.templateJson}
                height={180}
                className="border-b border-gray-100"
              />
              {/* Info do blueprint */}
              <div className="flex items-center gap-2 px-4 py-3">
                <span className="text-base">{getLayoutEmoji(option.blueprint.id)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {option.blueprint.name}
                  </h3>
                  <p className="truncate text-xs text-gray-500">
                    {option.blueprint.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Gerar outra versão
          </button>
          <button
            onClick={handleConfirmLayout}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <Sparkles className="h-4 w-4" />
            Usar este layout
          </button>
        </div>
      </motion.div>
    )
  }

  // ─── Loading enquanto gera variações ─────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Gerando layouts...
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Criando variações personalizadas com os dados do seu escritório
        </p>
      </div>
    </motion.div>
  )
}

// Emoji por blueprint para a UI
function getLayoutEmoji(id: string): string {
  switch (id) {
    case 'classico': return '🏛️'
    case 'story-first': return '📖'
    case 'social-proof': return '⭐'
    case 'services-hero': return '🚀'
    case 'modern-minimal': return '✨'
    case 'full-showcase': return '🎪'
    case 'cta-driven': return '🎯'
    case 'bento-grid': return '🧩'
    default: return '💎'
  }
}
