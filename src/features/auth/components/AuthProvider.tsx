import { useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { UserProfile } from '@/types'
import { AuthContext } from '../hooks/use-auth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, nome, empresa, logo_url, avatar_url, telefone, cargo, status, role')
      .eq('id', userId)
      .single()

    if (error && !data) {
      console.warn('[AuthProvider] Perfil não encontrado para userId:', userId, '— sessão pode estar inválida')
      return false
    }

    if (data) {
      setProfile(data)
      return true
    }
    return false
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        const found = await fetchProfile(currentSession.user.id)
        if (!found) {
          // Sessão órfã: JWT válido mas usuário não existe mais no banco (ex: db reset)
          console.warn('[AuthProvider] Sessão órfã detectada — fazendo signOut automático')
          await supabase.auth.signOut()
          setSession(null)
          setProfile(null)
        } else {
          setSession(currentSession)
        }
      }
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const isAdmin = profile?.role === 'admin'
  const isAvancado = profile?.role === 'avancado' || profile?.role === 'admin'

  return (
    <AuthContext value={{ session, profile, isLoading, isAdmin, isAvancado, signOut }}>
      {children}
    </AuthContext>
  )
}
