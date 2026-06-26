import { useState } from 'react'
import type { Contato } from '../types/contato'
import type { ObjetivoFollowUp } from '../types/objetivoFollowUp'
import { OBJETIVO_FOLLOW_UP_LABELS } from '../types/objetivoFollowUp'
import './IniciarCampanhaModal.css'
import './NovoContatoModal.css'

export type TipoCampanhaDisponivel = Extract<ObjetivoFollowUp, 'REATIVACAO' | 'INDICACAO'>

type IniciarCampanhaModalProps = {
  contato: Contato
  onFechar: () => void
  onConfirmar: (tipo: TipoCampanhaDisponivel) => void | Promise<void>
}

const OPCOES_CAMPANHA: { valor: TipoCampanhaDisponivel; descricao: string }[] = [
  {
    valor: 'REATIVACAO',
    descricao: 'Entrar em contato para reativar o acompanhamento nutricional.',
  },
  {
    valor: 'INDICACAO',
    descricao: 'Pedir indicação de novos pacientes ou contatos.',
  },
]

export default function IniciarCampanhaModal({
  contato,
  onFechar,
  onConfirmar,
}: IniciarCampanhaModalProps) {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoCampanhaDisponivel>('REATIVACAO')
  const [salvando, setSalvando] = useState(false)

  async function confirmar() {
    if (salvando) return

    setSalvando(true)
    try {
      await onConfirmar(tipoSelecionado)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      className="modal-overlay modal-overlay--iniciar-campanha"
      onClick={onFechar}
      role="presentation"
    >
      <div
        className="modal modal--iniciar-campanha"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="iniciar-campanha-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="iniciar-campanha-titulo" className="modal__titulo">
            Iniciar campanha
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo iniciar-campanha-modal__corpo">
          <p className="iniciar-campanha-modal__texto">
            Escolha o objetivo do follow-up para <strong>{contato.nome}</strong>.
          </p>

          <fieldset className="iniciar-campanha-modal__opcoes">
            <legend className="iniciar-campanha-modal__legenda">Tipo de campanha</legend>
            {OPCOES_CAMPANHA.map((opcao) => (
              <label key={opcao.valor} className="iniciar-campanha-modal__opcao">
                <input
                  type="radio"
                  name="tipo-campanha"
                  value={opcao.valor}
                  checked={tipoSelecionado === opcao.valor}
                  onChange={() => setTipoSelecionado(opcao.valor)}
                />
                <span className="iniciar-campanha-modal__opcao-conteudo">
                  <span className="iniciar-campanha-modal__opcao-titulo">
                    {OBJETIVO_FOLLOW_UP_LABELS[opcao.valor]}
                  </span>
                  <span className="iniciar-campanha-modal__opcao-descricao">
                    {opcao.descricao}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <footer className="modal__rodape">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={onFechar}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primario"
            onClick={() => void confirmar()}
            disabled={salvando}
          >
            {salvando ? 'Iniciando...' : 'Iniciar campanha'}
          </button>
        </footer>
      </div>
    </div>
  )
}
