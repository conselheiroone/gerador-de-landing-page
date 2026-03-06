import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Paintbrush, Sparkles, Loader2 } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getPerfilEmpresa, getSocios } from '@/features/onboarding/api/onboarding'
import { generateProfileTemplate } from '@/features/editor/utils/profile-template'
import { fetchDepoimentos } from '@/features/depoimentos/api/depoimentos-api'

export function HomePage() {
  const navigate = useNavigate()
  const { session, isAvancado, isAdmin } = useAuth()
  const [generating, setGenerating] = useState(false)

  async function handleGenerateFromProfile() {
    const userId = session?.user?.id
    if (!userId) return

    setGenerating(true)
    try {
      const perfil = await getPerfilEmpresa(userId)
      if (!perfil) {
        setGenerating(false)
        return
      }

      const socios = await getSocios(perfil.id)
      const depoimentos = await fetchDepoimentos(perfil.id).catch(() => [])
      const templateJson = generateProfileTemplate(perfil, socios, depoimentos)
      const templateNome = `${perfil.nome_empresa || 'Minha Empresa'} - Landing Page`

      navigate('/editor/novo', { state: { templateJson, templateNome, fromProfile: true } })
    } catch (err) {
      console.error('Erro ao gerar template do perfil:', err)
      setGenerating(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
    >
      <h1 className="text-3xl font-bold text-gray-900">
        Crie sua Landing Page
      </h1>
      <p className="text-gray-500">
        {isAvancado ? 'Escolha como deseja comecar' : 'Gere automaticamente com os dados do seu escritorio'}
      </p>

      <div className="mt-4 grid w-full max-w-lg gap-4">
        {/* Gerar do perfil — sempre disponível */}
        <motion.button
          variants={staggerItem}
          onClick={handleGenerateFromProfile}
          disabled={generating}
          className="relative flex items-center gap-4 rounded-xl border-2 border-brand-500 bg-brand-50 p-6 text-left transition-colors hover:bg-brand-100 disabled:opacity-70"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white">
            {generating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {generating ? 'Gerando...' : 'Gerar do meu perfil'}
            </h3>
            <p className="text-xs text-gray-500">
              Crie automaticamente com os dados do seu escritorio
            </p>
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Recomendado
          </span>
        </motion.button>

        {/* Começar do zero — apenas avancado e admin */}
        {isAvancado && (
          <motion.button
            variants={staggerItem}
            onClick={() => navigate('/editor/novo')}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 text-left transition-colors hover:border-brand-500 hover:bg-brand-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Comece do zero
              </h3>
              <p className="text-xs text-gray-500">
                Projete seu site do zero com nossos componentes
              </p>
            </div>
          </motion.button>
        )}

        {/* Templates — apenas admin */}
        {isAdmin && (
          <motion.button
            variants={staggerItem}
            onClick={() => navigate('/templates')}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 text-left transition-colors hover:border-brand-500 hover:bg-brand-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
              <Paintbrush className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Comece com um modelo
              </h3>
              <p className="text-xs text-gray-500">
                Use modelos cadastrados por administradores
              </p>
            </div>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
