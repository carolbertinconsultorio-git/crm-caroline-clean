import { useMemo } from 'react'
import type { Campanha, StatusCampanha, TipoCampanha } from '../types/campanha'
import type { Contato } from '../types/contato'
import { formatarData } from '../utils/contatoHelpers'
import { STATUS_FRASES } from '../utils/statusHumano'
import './CampanhaDetalheDrawer.css'

type CampanhaDetalheDrawerProps = {
  campanha: Campanha
  contatos: Contato[]
  onFechar: () => void
  onEditar?: () => void
  onEncerrar?: () => void
}

const TIPO_LABELS: Record<TipoCampanha, string> = {
  REATIVACAO: 'Reativação',
  INDICACAO: 'Indicação',
  PERSONALIZADA: 'Personalizada',
}

const STATUS_LABELS: Record<StatusCampanha, string> = {
  RASCUNHO: 'Rascunho',
  ATIVA: 'Ativa',
  ENCERRADA: 'Encerrada',
}

export default function CampanhaDetalheDrawer({
  campanha,
  contatos,
  onFechar,
  onEditar,
  onEncerrar,
}: CampanhaDetalheDrawerProps) {
  const participantes = useMemo(
    () =>
      contatos
        .filter((contato) => contato.campanhaId === campanha.id)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [contatos, campanha.id],
  )

  const podeEditar =
    (campanha.status === 'ATIVA' || campanha.status === 'RASCUNHO') && Boolean(onEditar)
  const podeEncerrar = campanha.status === 'ATIVA' && Boolean(onEncerrar)

  return (
    <div className="campanha-drawer-overlay" onClick={onFechar} role="presentation">
      <aside
        className="campanha-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="campanha-drawer-titulo"
      >
        <header className="campanha-drawer__cabecalho">
          <div>
            <h2 id="campanha-drawer-titulo" className="campanha-drawer__titulo">
              {campanha.nome}
            </h2>
            <div className="campanha-drawer__etiquetas">
              <span className="campanha-drawer__tipo">{TIPO_LABELS[campanha.tipo]}</span>
              <span className={`campanha-drawer__status campanha-drawer__status--${campanha.status.toLowerCase()}`}>
                {STATUS_LABELS[campanha.status]}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="campanha-drawer__fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="campanha-drawer__corpo">
          <dl className="campanha-drawer__detalhes">
            <div>
              <dt>Início</dt>
              <dd>{campanha.dataInicio ? formatarData(campanha.dataInicio) : '—'}</dd>
            </div>
            {campanha.dataFim && (
              <div>
                <dt>Fim</dt>
                <dd>{formatarData(campanha.dataFim)}</dd>
              </div>
            )}
            <div className="campanha-drawer__detalhe-largo">
              <dt>Mensagem</dt>
              <dd>{campanha.mensagem?.trim() || '—'}</dd>
            </div>
          </dl>

          <section className="campanha-drawer__participantes">
            <h3 className="campanha-drawer__secao-titulo">
              Participantes
              <span className="campanha-drawer__participantes-contagem">
                ({participantes.length})
              </span>
            </h3>

            {participantes.length === 0 ? (
              <p className="campanha-drawer__participantes-vazio">
                Nenhum participante vinculado a esta campanha.
              </p>
            ) : (
              <ul className="campanha-drawer__participantes-lista">
                {participantes.map((contato) => (
                  <li key={contato.id} className="campanha-drawer__participante">
                    <span className="campanha-drawer__participante-nome">{contato.nome}</span>
                    <span className="campanha-drawer__participante-telefone">
                      {contato.telefone}
                    </span>
                    <span className="campanha-drawer__participante-status">
                      {STATUS_FRASES[contato.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {(podeEditar || podeEncerrar) && (
          <footer className="campanha-drawer__rodape">
            {podeEditar && (
              <button type="button" className="btn btn--secundario" onClick={onEditar}>
                Editar campanha
              </button>
            )}
            {podeEncerrar && (
              <button type="button" className="btn btn--perigo" onClick={onEncerrar}>
                Encerrar campanha
              </button>
            )}
          </footer>
        )}
      </aside>
    </div>
  )
}
