import { useState } from 'react'
import type { Contato } from '../types/contato'
import './NovoContatoModal.css'
import './RemoverContatoModal.css'

type RemoverContatoModalProps = {
  contato: Contato
  onFechar: () => void
  onConfirmar: () => Promise<void>
}

function mensagemErroRemocao(erro: unknown): string {
  if (erro instanceof Error && erro.message) {
    return erro.message
  }
  return 'Não foi possível remover o contato. Tente novamente.'
}

export default function RemoverContatoModal({
  contato,
  onFechar,
  onConfirmar,
}: RemoverContatoModalProps) {
  const [removendo, setRemovendo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const origemLiveClin = contato.origem.trim().toLowerCase() === 'liveclin'

  async function confirmar() {
    if (removendo) return

    if (!contato.id) {
      const mensagem = 'Contato sem identificador. Não é possível remover.'
      setErro(mensagem)
      console.error('[Remover contato]', mensagem, contato)
      return
    }

    setRemovendo(true)
    setErro(null)

    try {
      await onConfirmar()
    } catch (erroRemocao) {
      const mensagem = mensagemErroRemocao(erroRemocao)
      console.error('[Remover contato] Falha ao remover:', mensagem, erroRemocao)
      setErro(mensagem)
    } finally {
      setRemovendo(false)
    }
  }

  return (
    <div className="modal-overlay modal-overlay--remover" onClick={onFechar} role="presentation">
      <div
        className="modal modal--remover"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remover-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="remover-titulo" className="modal__titulo">
            Remover contato
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo remover-modal__corpo">
          <p>Tem certeza que deseja remover este contato?</p>
          <p>Esta ação não poderá ser desfeita.</p>
          {origemLiveClin && (
            <p className="remover-modal__aviso-liveclin" role="note">
              Atenção: este paciente poderá ser recriado na próxima sincronização do LiveClin.
            </p>
          )}
          {erro && (
            <p className="remover-modal__erro" role="alert">
              {erro}
            </p>
          )}
        </div>

        <footer className="modal__rodape">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={onFechar}
            disabled={removendo}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--perigo"
            onClick={() => void confirmar()}
            disabled={removendo}
          >
            {removendo ? 'Removendo...' : 'Remover contato'}
          </button>
        </footer>
      </div>
    </div>
  )
}
