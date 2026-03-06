import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth/components/AuthProvider'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return <AuthProvider>{children}</AuthProvider>
}
