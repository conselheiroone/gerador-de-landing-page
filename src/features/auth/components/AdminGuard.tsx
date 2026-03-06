import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'

export function AdminGuard() {
  const { isAdmin, isLoading, session } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
