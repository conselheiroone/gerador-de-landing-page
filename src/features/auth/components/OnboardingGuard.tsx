import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/integrations/supabase/client'

export function OnboardingGuard() {
  const { session, isAdmin } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [onboardingCompleto, setOnboardingCompleto] = useState(false)

  useEffect(() => {
    async function checkOnboarding() {
      if (!session?.user?.id) {
        setIsChecking(false)
        return
      }

      // Admins não precisam fazer onboarding
      if (isAdmin) {
        setOnboardingCompleto(true)
        setIsChecking(false)
        return
      }

      const { data, error } = await supabase
        .from('perfil_empresa')
        .select('onboarding_completo')
        .eq('user_id', session.user.id)
        .single()

      // Se a tabela não existe ou houve erro de schema, deixa o usuário passar
      if (error && error.code !== 'PGRST116') {
        console.warn('[OnboardingGuard] Erro ao verificar onboarding:', error.message)
        setOnboardingCompleto(true)
        setIsChecking(false)
        return
      }

      setOnboardingCompleto(data?.onboarding_completo ?? false)
      setIsChecking(false)
    }

    checkOnboarding()
  }, [session?.user?.id, isAdmin])

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    )
  }

  if (!onboardingCompleto) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
