import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  LayoutDashboard,
  FileText,
  Import,
  Settings,
  Users,
  Megaphone,
  GraduationCap,
  HelpCircle,
  Headphones,
  Scale,
  ChevronLeft,
  ChevronRight,
  PlusSquare,
  Eye,
  BookOpen,
  User,
  LayoutGrid,
  Sparkles,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Templates', href: '/admin/templates', icon: <FileText className="h-5 w-5" /> },
  { label: 'Seções', href: '/admin/secoes', icon: <LayoutGrid className="h-5 w-5" /> },
  { label: 'Importar Layout', href: '/admin/importar', icon: <Import className="h-5 w-5" /> },
  { label: 'Usuários', href: '/admin/usuarios', icon: <Users className="h-5 w-5" /> },
  { label: 'Comunicados', href: '/admin/comunicados', icon: <Megaphone className="h-5 w-5" /> },
  { label: 'Aprendizado', href: '/admin/aprendizado', icon: <GraduationCap className="h-5 w-5" /> },
  { label: 'Dicas de Ajuda', href: '/admin/ajuda', icon: <HelpCircle className="h-5 w-5" /> },
  { label: 'Suporte', href: '/admin/suporte', icon: <Headphones className="h-5 w-5" /> },
  { label: 'Páginas Legais', href: '/admin/paginas-legais', icon: <Scale className="h-5 w-5" /> },
  { label: 'Configurações de IA', href: '/admin/ia', icon: <Sparkles className="h-5 w-5" /> },
]

const baseClienteNavItems: NavItem[] = [
  { label: 'Início', href: '/', icon: <PlusSquare className="h-5 w-5" /> },
  { label: 'Meus Projetos', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Meu Perfil', href: '/perfil', icon: <User className="h-5 w-5" /> },
  { label: 'Minha Conta', href: '/minha-conta', icon: <Settings className="h-5 w-5" /> },
  { label: 'Aprendizado', href: '/aprendizado', icon: <BookOpen className="h-5 w-5" /> },
]

const templatesNavItem: NavItem = { label: 'Templates', href: '/templates', icon: <Eye className="h-5 w-5" /> }

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { isAdmin, isAvancado } = useAuth()
  const location = useLocation()

  const isAdminRoute = location.pathname.startsWith('/admin')
  const clienteNavItems = isAvancado
    ? [baseClienteNavItems[0], templatesNavItem, ...baseClienteNavItems.slice(1)]
    : baseClienteNavItems
  const navItems = isAdminRoute ? adminNavItems : clienteNavItems

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-[var(--z-sticky)] flex h-screen flex-col bg-[#1A1A1A] text-white transition-all duration-200',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]',
      )}
    >
      {/* Logo */}
      <div className="flex h-[var(--header-height)] items-center justify-between px-4">
        {!collapsed && (
          <span className="text-lg font-bold text-brand-500">LandingGen</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500/10 text-brand-500'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              )
            }
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Admin/Cliente toggle */}
      {isAdmin && (
        <div className="border-t border-white/10 p-3">
          <NavLink
            to={isAdminRoute ? '/' : '/admin/dashboard'}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-5 w-5" />
            {!collapsed && (
              <span>{isAdminRoute ? 'Painel Cliente' : 'Painel Admin'}</span>
            )}
          </NavLink>
        </div>
      )}
    </aside>
  )
}
