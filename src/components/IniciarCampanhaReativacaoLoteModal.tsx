import { useMemo, useState } from 'react'
import type { Contato } from '../types/contato'
import {
  classificarContatosParaCampanhaReativacaoLote,
  type ResultadoCampanhaReativacaoLote,
} from '../utils/iniciarCampanhaLote'
import './IniciarCampanhaModal.css'
import './IniciarCampanhaReativacaoLoteModal.css'
import './NovoContatoModal.css'

type IniciarCampanhaReativacaoLoteModalProps = {
  contatos: Contato[]
  onFechar: () => void
  onConfirmar: () => Promise<ResultadoCampanhaReativacaoLote>
}

export default function IniciarCampanhaReativacaoLoteModal({
  contatos,
  onFechar,
  onConfirmar,
}: IniciarCampanhaReativacaoLoteModalProps) {
  const classificacao = useMemo(
    () => classificarContatosParaCampanhaReativacaoLote(contatos),
    [contatos],
  )

  const [resultado, setResultado] = useState<ResultadoCampanhaReativacaoLote | null>(null)
  const [processando, setProcessando] = useState(false)

  async function confirmar() {
    if (processando) return

    setProcessando(true)
    try {
      const resultadoConfirmacao = await onConfirmar()
      setResultado(resultadoConfirmacao)
    } finally {
      setProcessando(false)
    }
  }

  const emResultado = resultado !== null

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
        aria-labelledby="iniciar-campanha-lote-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="iniciar-campanha-lote-titulo" className="modal__titulo">
            {emResultado ? 'Campanhas iniciadas' : 'Iniciar campanha de reativação'}
          </h2>
          <button type="button" className="modal__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo iniciar-campanha-lote-modal__corpo">
          {emResultado ? (
            <>
              <p className="iniciar-campanha-lote-modal__destaque">
                Campanhas iniciadas: {resultado.iniciados}
              </p>
              <div className="iniciar-campanha-lote-modal__secao">
                <p className="iniciar-campanha-lote-modal__subtitulo">Ignorados:</p>
                <ul className="iniciar-campanha-lote-modal__lista">
                  <li>já possuem campanha: {resultado.ignoradosCampanhaAtiva}</li>
                  <li>status incompatível: {resultado.ignoradosStatusIncompativel}</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="iniciar-campanha-modal__texto">
                Iniciar campanha de reativação para:
              </p>
              <ul className="iniciar-campanha-lote-modal__lista iniciar-campanha-lote-modal__lista--confirmacao">
                <li>{classificacao.validos.length} contato(s) serão iniciados</li>
                <li>
                  {classificacao.ignoradosCampanhaAtiva.length} serão ignorados por já terem
                  campanha ativa
                </li>
                <li>
                  {classificacao.ignoradosStatusIncompativel.length} serão ignorados por não serem
                  pacientes inativos
                </li>
              </ul>
              <p className="iniciar-campanha-lote-modal__pergunta">Deseja continuar?</p>
            </>
          )}
        </div>

        <footer className="modal__rodape">
          {emResultado ? (
            <button type="button" className="btn btn--primario" onClick={onFechar}>
              Fechar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--secundario"
                onClick={onFechar}
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primario"
                onClick={() => void confirmar()}
                disabled={processando}
              >
                {processando ? 'Iniciando...' : 'Confirmar'}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
