import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { OnboardingGuard } from '@/features/auth/components/OnboardingGuard'
import { AdminGuard } from '@/features/auth/components/AdminGuard'
import { AdvancedGuard } from '@/features/auth/components/AdvancedGuard'

// Pages
import { LoginPage } from './routes/LoginPage'
import { RegistroPage } from './routes/RegistroPage'
import { OnboardingPage } from './routes/OnboardingPage'
import { HomePage } from './routes/HomePage'
import { TemplatesPage } from './routes/TemplatesPage'
import { DashboardPage } from './routes/DashboardPage'
import { AdminDashboardPage } from './routes/admin/AdminDashboardPage'
import { AdminTemplatesPage } from './routes/admin/AdminTemplatesPage'
import { AdminSuportePage } from './routes/admin/AdminSuportePage'
import { AdminPaginasLegaisPage } from './routes/admin/AdminPaginasLegaisPage'
import { AdminUsuariosPage } from './routes/admin/AdminUsuariosPage'
import { AdminComunicadosPage } from './routes/admin/AdminComunicadosPage'
import { AdminAprendizadoPage } from './routes/admin/AdminAprendizadoPage'
import { AdminAprendizadoModuloPage } from './routes/admin/AdminAprendizadoModuloPage'
import { AdminDicasAjudaPage } from './routes/admin/AdminDicasAjudaPage'
import { AdminImportarLayoutPage } from './routes/admin/AdminImportarLayoutPage'
import { AdminSecoesPage } from './routes/admin/AdminSecoesPage'
import { AdminIAPage } from './routes/admin/AdminIAPage'
import { EditorNovoPage } from './routes/EditorNovoPage'
import { PerfilEmpresaPage } from './routes/PerfilEmpresaPage'
import { AprendizadoPage } from './routes/AprendizadoPage'
import { AprendizadoModuloPage } from './routes/AprendizadoModuloPage'
import { MinhaContaPage } from './routes/MinhaContaPage'

export const router = createBrowserRouter([
  // Public routes (no layout)
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegistroPage /> },

  // Onboarding (authenticated, sem layout — tela cheia)
  {
    element: <AuthGuard />,
    children: [
      { path: '/onboarding', element: <OnboardingPage /> },
    ],
  },

  // Editor (authenticated, sem layout — tela cheia propria)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <OnboardingGuard />,
        children: [
          { path: '/editor/novo', element: <EditorNovoPage /> },
          { path: '/editor/:projetoId', element: <EditorNovoPage /> },
        ],
      },
    ],
  },

  // Authenticated client routes (com verificação de onboarding)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <OnboardingGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/perfil', element: <PerfilEmpresaPage /> },
              { path: '/minha-conta', element: <MinhaContaPage /> },
              { path: '/aprendizado', element: <AprendizadoPage /> },
              { path: '/aprendizado/modulo/:moduloId', element: <AprendizadoModuloPage /> },
            ],
          },
        ],
      },
    ],
  },

  // Rotas para usuarios avancados e admin (avancado + admin)
  {
    element: <AdvancedGuard />,
    children: [
      {
        element: <OnboardingGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/templates', element: <TemplatesPage /> },
            ],
          },
          { path: '/editor/template/:templateId', element: <EditorNovoPage /> },
        ],
      },
    ],
  },

  // Admin routes
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/templates', element: <AdminTemplatesPage /> },
          { path: '/admin/secoes', element: <AdminSecoesPage /> },
          { path: '/admin/suporte', element: <AdminSuportePage /> },
          { path: '/admin/paginas-legais', element: <AdminPaginasLegaisPage /> },
          { path: '/admin/usuarios', element: <AdminUsuariosPage /> },
          { path: '/admin/comunicados', element: <AdminComunicadosPage /> },
          { path: '/admin/aprendizado', element: <AdminAprendizadoPage /> },
          { path: '/admin/aprendizado/modulo/:moduloId', element: <AdminAprendizadoModuloPage /> },
          { path: '/admin/ajuda', element: <AdminDicasAjudaPage /> },
          { path: '/admin/importar', element: <AdminImportarLayoutPage /> },
          { path: '/admin/ia', element: <AdminIAPage /> },
        ],
      },
    ],
  },
])
