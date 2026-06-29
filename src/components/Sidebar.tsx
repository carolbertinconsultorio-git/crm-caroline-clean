export type TelaAtiva = 'hoje' | 'contatos' | 'campanhas' | 'oportunidades'

type SidebarProps = {
  telaAtiva: TelaAtiva
  onNavegar: (tela: TelaAtiva) => void
  onSair: () => void
}

export default function Sidebar({ telaAtiva, onNavegar, onSair }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <button
        type="button"
        className="sidebar__logo"
        onClick={() => onNavegar('hoje')}
        aria-label="Ir para o Painel do Dia"
      >
        C
      </button>
      <nav className="sidebar__nav">
        <button
          type="button"
          className={`sidebar__item${telaAtiva === 'hoje' ? ' sidebar__item--ativo' : ''}`}
          onClick={() => onNavegar('hoje')}
          aria-current={telaAtiva === 'hoje' ? 'page' : undefined}
        >
          <span className="sidebar__icone" aria-hidden="true">
            ◉
          </span>
          <span className="sidebar__rotulo">Hoje</span>
        </button>
        <button
          type="button"
          className={`sidebar__item${telaAtiva === 'contatos' ? ' sidebar__item--ativo' : ''}`}
          onClick={() => onNavegar('contatos')}
          aria-current={telaAtiva === 'contatos' ? 'page' : undefined}
        >
          <span className="sidebar__icone" aria-hidden="true">
            ◎
          </span>
          <span className="sidebar__rotulo">Contatos</span>
        </button>
        <button
          type="button"
          className={`sidebar__item${telaAtiva === 'campanhas' ? ' sidebar__item--ativo' : ''}`}
          onClick={() => onNavegar('campanhas')}
          aria-current={telaAtiva === 'campanhas' ? 'page' : undefined}
        >
          <span className="sidebar__icone" aria-hidden="true">
            📣
          </span>
          <span className="sidebar__rotulo">Campanhas</span>
        </button>
        <button
          type="button"
          className={`sidebar__item${telaAtiva === 'oportunidades' ? ' sidebar__item--ativo' : ''}`}
          onClick={() => onNavegar('oportunidades')}
          aria-current={telaAtiva === 'oportunidades' ? 'page' : undefined}
        >
          <span className="sidebar__icone" aria-hidden="true">
            ◈
          </span>
          <span className="sidebar__rotulo">Oportunidades</span>
        </button>
      </nav>
      <button
        type="button"
        className="sidebar__item sidebar__sair"
        onClick={onSair}
        aria-label="Sair"
      >
        <span className="sidebar__icone" aria-hidden="true">
          ⎋
        </span>
        <span className="sidebar__rotulo">Sair</span>
      </button>
    </aside>
  )
}
