import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TermosAceiteModal } from '@/components/TermosAceiteModal'
import { useTermosAceite } from '@/hooks/use-termos-aceite'

export function AppLayout() {
  const { precisaAceitar, loading, termosConteudo, termosVersao, termosAtualizadoEm, aceitarTermos } =
    useTermosAceite()

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

      {!loading && precisaAceitar && (
        <TermosAceiteModal
          conteudo={termosConteudo}
          versao={termosVersao}
          atualizadoEm={termosAtualizadoEm}
          onAceitar={aceitarTermos}
        />
      )}
    </div>
  )
}
