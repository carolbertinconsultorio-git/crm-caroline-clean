import type { Contato } from '../types/contato'
import type { Urgencia } from '../utils/agruparContatos'
import { OBJETIVO_FOLLOW_UP_LABELS } from '../types/objetivoFollowUp'
import { STATUS_FRASES } from '../utils/statusHumano'
import { formatarData } from '../utils/contatoHelpers'
import BotaoConversar from './BotaoConversar'
import './ContatoCard.css'

type ContatoCardProps = {
  contato: Contato
  urgencia?: Urgencia
  onAbrirContato?: (id: string) => void
  onConcluirFollowUp?: (id: string) => void
  onAdiar?: (id: string) => void
  compacto?: boolean
  selecionavel?: boolean
  selecionado?: boolean
  onAlternarSelecao?: (id: string) => void
}

export default function ContatoCard({
  contato,
  urgencia = 'semana',
  onAbrirContato,
  onConcluirFollowUp,
  onAdiar,
  compacto = false,
  selecionavel = false,
  selecionado = false,
  onAlternarSelecao,
}: ContatoCardProps) {
  return (
    <article
      className={`contato-card contato-card--${urgencia}${compacto ? ' contato-card--compacto' : ''}${selecionado ? ' contato-card--selecionado' : ''}`}
    >
      {selecionavel && (
        <label className="contato-card__selecao">
          <input
            type="checkbox"
            className="contato-card__checkbox"
            checked={selecionado}
            aria-label={`Selecionar ${contato.nome}`}
            onChange={() => onAlternarSelecao?.(contato.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </label>
      )}
      <button
        type="button"
        className="contato-card__corpo"
        onClick={() => onAbrirContato?.(contato.id)}
      >
        <div className="contato-card__cabecalho">
          <h3 className="contato-card__nome">{contato.nome}</h3>
          <span className="contato-card__origem">{contato.origem}</span>
        </div>
        <div className="contato-card__etiquetas">
          <span className="contato-card__status">{STATUS_FRASES[contato.status]}</span>
          {contato.objetivoFollowUp && (
            <span className="contato-card__objetivo">
              {OBJETIVO_FOLLOW_UP_LABELS[contato.objetivoFollowUp]}
            </span>
          )}
        </div>
        <dl className="contato-card__datas">
          <div>
            <dt>Último contato</dt>
            <dd>{formatarData(contato.dataUltimoContato)}</dd>
          </div>
          <div>
            <dt>Próximo follow-up</dt>
            <dd>{formatarData(contato.dataProximoFollowUp)}</dd>
          </div>
        </dl>
      </button>
      <div className="contato-card__acoes">
        <BotaoConversar telefone={contato.telefone} />
        <button
          type="button"
          className="btn btn--primario"
          onClick={() => onConcluirFollowUp?.(contato.id)}
        >
          Concluir follow-up
        </button>
        {!compacto && (
          <button
            type="button"
            className="btn btn--secundario"
            onClick={() => onAdiar?.(contato.id)}
          >
            Adiar
          </button>
        )}
      </div>
    </article>
  )
}
