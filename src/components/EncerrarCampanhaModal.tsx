import { useState } from 'react'
import './EncerrarCampanhaModal.css'
import './NovoContatoModal.css'

type EncerrarCampanhaModalProps = {
  quantidadeParticipantes: number
  onFechar: () => void
  onConfirmar: () => Promise<void>
}

export default function EncerrarCampanhaModal({
  quantidadeParticipantes,
  onFechar,
  onConfirmar,
}: EncerrarCampanhaModalProps) {
  const [encerrando, setEncerrando] = useState(false)

  async function confirmar() {
    if (encerrando) return

    setEncerrando(true)
    try {
      await onConfirmar()
    } finally {
      setEncerrando(false)
    }
  }

  const rotuloParticipantes =
    quantidadeParticipantes === 1 ? '1 participante' : `${quantidadeParticipantes} participantes`

  return (
    <div className="modal-overlay modal-overlay--encerrar-campanha" onClick={onFechar} role="presentation">
      <div
        className="modal modal--encerrar-campanha"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="encerrar-campanha-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="encerrar-campanha-titulo" className="modal__titulo">
            Encerrar campanha
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo encerrar-campanha-modal__corpo">
          <p className="encerrar-campanha-modal__pergunta">
            Encerrar esta campanha para {rotuloParticipantes}?
          </p>
          <p className="encerrar-campanha-modal__aviso">
            Os contatos continuarão no CRM. Apenas deixarão de estar vinculados a esta campanha.
          </p>
        </div>

        <footer className="modal__rodape">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={onFechar}
            disabled={encerrando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--perigo"
            onClick={() => void confirmar()}
            disabled={encerrando}
          >
            {encerrando ? 'Encerrando...' : 'Encerrar campanha'}
          </button>
        </footer>
      </div>
    </div>
  )
}
