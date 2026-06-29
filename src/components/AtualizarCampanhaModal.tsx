import { useState } from 'react'
import type { Contato } from '../types/contato'
import {
  type DadosAtualizacaoCampanha,
  valoresIniciaisAtualizacaoCampanha,
} from '../utils/iniciarCampanhaLote'
import './AtualizarCampanhaModal.css'
import './NovoContatoModal.css'

type AtualizarCampanhaModalProps = {
  contatos: Contato[]
  onFechar: () => void
  onConfirmar: (dados: DadosAtualizacaoCampanha) => void | Promise<void>
}

export default function AtualizarCampanhaModal({
  contatos,
  onFechar,
  onConfirmar,
}: AtualizarCampanhaModalProps) {
  const valoresIniciais = valoresIniciaisAtualizacaoCampanha(contatos)
  const [campanhaNome, setCampanhaNome] = useState(valoresIniciais.campanhaNome)
  const [campanhaMensagem, setCampanhaMensagem] = useState(valoresIniciais.campanhaMensagem)
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    if (salvando || !campanhaNome.trim()) return

    setSalvando(true)
    try {
      await onConfirmar({
        campanhaNome: campanhaNome.trim(),
        campanhaMensagem: campanhaMensagem.trim(),
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onFechar} role="presentation">
      <div
        className="modal modal--atualizar-campanha"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="atualizar-campanha-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="atualizar-campanha-titulo" className="modal__titulo">
            Atualizar campanha
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo atualizar-campanha-modal__corpo">
          <p className="atualizar-campanha-modal__texto">
            Os contatos selecionados já possuem uma campanha ativa.
          </p>
          <p className="atualizar-campanha-modal__texto">
            Você pode atualizar as informações da campanha existente sem reiniciar o processo de
            follow-up.
          </p>

          <label className="campo">
            <span className="campo__rotulo">Nome da campanha</span>
            <input
              type="text"
              className="campo__input"
              value={campanhaNome}
              onChange={(e) => setCampanhaNome(e.target.value)}
              placeholder="Nome da campanha"
            />
          </label>

          <label className="campo">
            <span className="campo__rotulo">Mensagem da campanha</span>
            <textarea
              className="campo__input campo__textarea"
              value={campanhaMensagem}
              onChange={(e) => setCampanhaMensagem(e.target.value)}
              rows={5}
              placeholder="Olá [nome], tudo bem? ..."
            />
          </label>
          <p className="atualizar-campanha-modal__dica">
            Use <code>[nome]</code> para inserir o primeiro nome do contato ao visualizar ou copiar.
          </p>
        </div>

        <footer className="modal__rodape">
          <button type="button" className="btn btn--secundario" onClick={onFechar} disabled={salvando}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primario"
            onClick={() => void salvar()}
            disabled={salvando || !campanhaNome.trim()}
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </footer>
      </div>
    </div>
  )
}
