import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/components/AuthProvider'
import { router } from './router'

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
