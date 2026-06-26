import { useState } from 'react'
import type { Contato } from '../types/contato'
import { aplicarTransicao } from '../features/contatos/fluxo/aplicarTransicao'
import { dataRelativa, formatarData } from '../utils/contatoHelpers'
import { STATUS_FRASES } from '../utils/statusHumano'
import './AdiarFollowUpModal.css'

type AdiarFollowUpModalProps = {
  contato: Contato
  onFechar: () => void
  onConfirmar: (contatoAtualizado: Contato) => void
}

export function aplicarAdiarAoContato(contato: Contato, novaData: string): Contato {
  const sugestao = aplicarTransicao(contato, 'CHAMAR_DEPOIS', novaData)

  return {
    ...contato,
    status: sugestao.novoStatus,
    dataProximoFollowUp: sugestao.dataProximoFollowUp ?? contato.dataProximoFollowUp,
  }
}

export default function AdiarFollowUpModal({
  contato,
  onFechar,
  onConfirmar,
}: AdiarFollowUpModalProps) {
  const [novaData, setNovaData] = useState(
    contato.dataProximoFollowUp || dataRelativa(1),
  )

  function confirmar() {
    onConfirmar(aplicarAdiarAoContato(contato, novaData))
  }

  return (
    <div className="modal-overlay" onClick={onFechar} role="presentation">
      <div
        className="modal modal--adiar"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adiar-titulo"
      >
        <header className="modal__cabecalho">
          <div>
            <p className="adiar-modal__contato">{contato.nome}</p>
            <h2 id="adiar-titulo" className="modal__titulo">
              Adiar follow-up
            </h2>
          </div>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="adiar-modal__corpo">
          <p className="adiar-modal__info">
            O status permanece: <strong>{STATUS_FRASES[contato.status]}</strong>
          </p>
          <p className="adiar-modal__info">
            Follow-up atual: <strong>{formatarData(contato.dataProximoFollowUp)}</strong>
          </p>

          <label className="campo">
            <span className="campo__rotulo">Nova data do follow-up</span>
            <input
              type="date"
              className="campo__input"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
            />
          </label>
        </div>

        <footer className="modal__rodape">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primario" onClick={confirmar}>
            Confirmar
          </button>
        </footer>
      </div>
    </div>
  )
}
