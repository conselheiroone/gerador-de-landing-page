import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 p-6">
          <div className="mx-auto max-w-[var(--content-max-width)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
