import { useState } from 'react'
import type { Campanha } from '../types/campanha'
import './EditarCampanhaModal.css'
import './NovoContatoModal.css'

export type DadosEdicaoCampanha = {
  nome: string
  mensagem: string
}

type EditarCampanhaModalProps = {
  campanha: Campanha
  onFechar: () => void
  onConfirmar: (dados: DadosEdicaoCampanha) => void | Promise<void>
}

export default function EditarCampanhaModal({
  campanha,
  onFechar,
  onConfirmar,
}: EditarCampanhaModalProps) {
  const [nome, setNome] = useState(campanha.nome)
  const [mensagem, setMensagem] = useState(campanha.mensagem ?? '')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    if (salvando || !nome.trim()) return

    setSalvando(true)
    try {
      await onConfirmar({
        nome: nome.trim(),
        mensagem: mensagem.trim(),
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="modal-overlay modal-overlay--editar-campanha" onClick={onFechar} role="presentation">
      <div
        className="modal modal--editar-campanha"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-campanha-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="editar-campanha-titulo" className="modal__titulo">
            Editar campanha
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo editar-campanha-modal__corpo">
          <label className="campo">
            <span className="campo__rotulo">Nome da campanha</span>
            <input
              type="text"
              className="campo__input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da campanha"
            />
          </label>

          <label className="campo">
            <span className="campo__rotulo">Mensagem da campanha</span>
            <textarea
              className="campo__input campo__textarea"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={5}
              placeholder="Olá [nome], tudo bem? ..."
            />
          </label>
          <p className="editar-campanha-modal__dica">
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
            disabled={salvando || !nome.trim()}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </footer>
      </div>
    </div>
  )
}
