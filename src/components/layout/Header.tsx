import { Search, Bell } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function Header() {
  const { profile, signOut, isAdmin } = useAuth()

  return (
    <header className="flex h-[var(--header-height)] items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar..."
          className="h-9 w-80 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <span className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
            Admin
          </span>
        )}

        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar
            src={profile?.avatar_url ?? profile?.logo_url}
            fallback={profile?.nome ?? profile?.email ?? 'U'}
            size="sm"
          />
          <span className="text-sm font-medium text-gray-700">
            {profile?.nome ?? profile?.email?.split('@')[0] ?? ''}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}
