import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { LogOut, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useOnboarding } from '../hooks/useOnboarding'
import { StepIndicator } from './StepIndicator'
import { WhatsAppSupportButton } from './WhatsAppSupportButton'
import { DadosEscritorioStep } from './steps/DadosEscritorioStep'
import { SociosContadoresStep } from './steps/SociosContadoresStep'
import { ContatoLocalizacaoStep } from './steps/ContatoLocalizacaoStep'
import { IdentidadeVisualStep } from './steps/IdentidadeVisualStep'
import { SobreEscritorioStep } from './steps/SobreEscritorioStep'
import { ServicosStep } from './steps/ServicosStep'
import { RedesSociaisStep } from './steps/RedesSociaisStep'
import { RevisaoStep } from './steps/RevisaoStep'

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { session, profile, signOut } = useAuth()
  const userId = session?.user?.id ?? ''

  const {
    perfil,
    socios,
    currentStep,
    isLoading,
    isSaving,
    error,
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    saveStep5,
    saveStep6,
    saveStep7,
    finalizar,
    goToStep,
  } = useOnboarding()

  async function handleFinalizar() {
    await finalizar()
    navigate('/', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="mx-auto h-3 w-32" />
        </div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center space-y-3">
          <p className="text-gray-700 font-medium">Erro ao carregar perfil</p>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3 border border-red-200">
              {error}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Verifique se a migration do onboarding foi aplicada ao banco de dados.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Recarregar
            </button>
            <button
              onClick={async () => {
                await signOut()
                navigate('/login', { replace: true })
              }}
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair e reconectar
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderStep() {
    if (!perfil) return null

    switch (currentStep) {
      case 1:
        return (
          <DadosEscritorioStep
            key="step-1"
            perfil={perfil}
            onSave={saveStep1}
            isSaving={isSaving}
          />
        )
      case 2:
        return (
          <SociosContadoresStep
            key="step-2"
            perfilId={perfil.id}
            userId={userId}
            sociosIniciais={socios}
            onSave={saveStep2}
            onBack={() => goToStep(1)}
            isSaving={isSaving}
          />
        )
      case 3:
        return (
          <ContatoLocalizacaoStep
            key="step-3"
            perfil={perfil}
            onSave={saveStep3}
            onBack={() => goToStep(2)}
            isSaving={isSaving}
          />
        )
      case 4:
        return (
          <IdentidadeVisualStep
            key="step-4"
            perfil={perfil}
            userId={userId}
            onSave={saveStep4}
            onBack={() => goToStep(3)}
            isSaving={isSaving}
          />
        )
      case 5:
        return (
          <SobreEscritorioStep
            key="step-5"
            perfil={perfil}
            onSave={saveStep5}
            onBack={() => goToStep(4)}
            isSaving={isSaving}
          />
        )
      case 6:
        return (
          <ServicosStep
            key="step-6"
            perfil={perfil}
            onSave={saveStep6}
            onBack={() => goToStep(5)}
            isSaving={isSaving}
          />
        )
      case 7:
        return (
          <RedesSociaisStep
            key="step-7"
            perfil={perfil}
            onSave={saveStep7}
            onBack={() => goToStep(6)}
            isSaving={isSaving}
          />
        )
      case 8:
        return (
          <RevisaoStep
            key="step-8"
            perfil={perfil}
            socios={socios}
            onFinalizar={handleFinalizar}
            onBack={() => goToStep(7)}
            onEditStep={goToStep}
            isSaving={isSaving}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-brand-500">LandingGen</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Etapa {currentStep} de 8
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {profile?.nome || profile?.email?.split('@')[0] || ''}
              </span>
            </div>
            <button
              onClick={async () => {
                await signOut()
                navigate('/login', { replace: true })
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar de Steps (desktop) */}
          <aside className="md:w-64 md:shrink-0">
            <StepIndicator
              currentStep={currentStep}
              onStepClick={(step) => {
                if (step <= currentStep) goToStep(step)
              }}
            />
          </aside>

          {/* Conteúdo do Step */}
          <main className="flex-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Botão WhatsApp flutuante */}
      <WhatsAppSupportButton currentStep={currentStep} />
    </div>
  )
}
