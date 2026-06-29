import { useState } from 'react'
import type { ConfiguracaoNovaCampanha, TipoNovaCampanha } from '../types/configuracaoCampanha'
import { NOME_CAMPANHA_REATIVACAO } from '../utils/iniciarCampanhaLote'
import './NovaCampanhaModal.css'
import './NovoContatoModal.css'

type NovaCampanhaModalProps = {
  onFechar: () => void
  onConfirmar: (config: ConfiguracaoNovaCampanha) => void
}

const NOME_PADRAO_POR_TIPO: Record<Exclude<TipoNovaCampanha, 'INDICACAO'>, string> = {
  REATIVACAO: NOME_CAMPANHA_REATIVACAO,
  PERSONALIZADA: '',
}

export default function NovaCampanhaModal({ onFechar, onConfirmar }: NovaCampanhaModalProps) {
  const [tipo, setTipo] = useState<TipoNovaCampanha>('REATIVACAO')
  const [campanhaNome, setCampanhaNome] = useState(NOME_CAMPANHA_REATIVACAO)
  const [campanhaMensagem, setCampanhaMensagem] = useState('')

  function alterarTipo(novoTipo: TipoNovaCampanha) {
    if (novoTipo === 'INDICACAO') return

    setTipo(novoTipo)
    setCampanhaNome(NOME_PADRAO_POR_TIPO[novoTipo])
  }

  function confirmar() {
    if (tipo === 'INDICACAO') return

    const nome =
      campanhaNome.trim() ||
      (tipo === 'REATIVACAO' ? NOME_CAMPANHA_REATIVACAO : 'Campanha personalizada')

    onConfirmar({
      tipo,
      campanhaNome: nome,
      campanhaMensagem: campanhaMensagem.trim(),
    })
  }

  const podeConfirmar = tipo === 'REATIVACAO' || tipo === 'PERSONALIZADA'

  return (
    <div className="modal-overlay" onClick={onFechar} role="presentation">
      <div
        className="modal modal--nova-campanha"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-campanha-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="nova-campanha-titulo" className="modal__titulo">
            Nova campanha
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo nova-campanha-modal__corpo">
          <p className="nova-campanha-modal__texto">
            Defina a campanha que deseja iniciar para os contatos selecionados.
          </p>

          <label className="campo">
            <span className="campo__rotulo">Nome da campanha</span>
            <input
              type="text"
              className="campo__input"
              value={campanhaNome}
              onChange={(e) => setCampanhaNome(e.target.value)}
              placeholder={
                tipo === 'REATIVACAO' ? NOME_CAMPANHA_REATIVACAO : 'Ex.: Black Friday 2026'
              }
            />
          </label>

          <label className="campo">
            <span className="campo__rotulo">Tipo / objetivo</span>
            <select
              className="campo__input"
              value={tipo}
              onChange={(e) => alterarTipo(e.target.value as TipoNovaCampanha)}
            >
              <option value="REATIVACAO">Reativação</option>
              <option value="INDICACAO" disabled>
                Indicação (Em breve)
              </option>
              <option value="PERSONALIZADA">Personalizada</option>
            </select>
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
          <p className="nova-campanha-modal__dica">
            Use <code>[nome]</code> para inserir o primeiro nome do contato ao visualizar ou copiar.
          </p>
        </div>

        <footer className="modal__rodape">
          <button type="button" className="btn btn--secundario" onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primario"
            onClick={confirmar}
            disabled={!podeConfirmar}
          >
            Continuar
          </button>
        </footer>
      </div>
    </div>
  )
}
