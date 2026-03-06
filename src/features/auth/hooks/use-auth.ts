import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'

export interface AuthContextValue {
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
  isAvancado: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isAvancado: false,
  signOut: async () => {},
})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
