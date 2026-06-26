import type { ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import type { TelaAtiva } from '../components/Sidebar'
import './AppLayout.css'

type AppLayoutProps = {
  telaAtiva: TelaAtiva
  onNavegar: (tela: TelaAtiva) => void
  onSair: () => void
  children: ReactNode
}

export default function AppLayout({ telaAtiva, onNavegar, onSair, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <Sidebar telaAtiva={telaAtiva} onNavegar={onNavegar} onSair={onSair} />
      <main className="app-shell__conteudo">{children}</main>
    </div>
  )
}
