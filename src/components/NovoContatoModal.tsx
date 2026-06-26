import { useRef, useState } from 'react'
import type { Contato } from '../types/contato'
import type { ContatoStatus } from '../types/contatoStatus'
import { STATUS_LABELS, TODOS_OS_STATUS, dataRelativa } from '../utils/contatoHelpers'
import './NovoContatoModal.css'

type NovoContatoModalProps = {
  onFechar: () => void
  onCriar: (dados: Omit<Contato, 'id'>) => void | Promise<void>
}

type FormularioContato = {
  nome: string
  telefone: string
  origem: string
  status: ContatoStatus
  dataPrimeiroContato: string
  dataUltimoContato: string
  dataProximoFollowUp: string
  plano: string
  observacoes: string
}

function formularioParaDadosContato(
  formulario: FormularioContato,
): Omit<Contato, 'id'> {
  return {
    nome: formulario.nome.trim(),
    telefone: formulario.telefone.trim(),
    origem: formulario.origem.trim(),
    status: formulario.status,
    dataPrimeiroContato: formulario.dataPrimeiroContato,
    dataUltimoContato: formulario.dataUltimoContato,
    dataProximoFollowUp: formulario.dataProximoFollowUp,
    plano: formulario.plano.trim() || undefined,
    observacoes: formulario.observacoes.trim() || undefined,
  }
}

const formularioInicial = (): FormularioContato => ({
  nome: '',
  telefone: '',
  origem: '',
  status: 'NOVO',
  dataPrimeiroContato: dataRelativa(0),
  dataUltimoContato: dataRelativa(0),
  dataProximoFollowUp: dataRelativa(1),
  plano: '',
  observacoes: '',
})

export default function NovoContatoModal({ onFechar, onCriar }: NovoContatoModalProps) {
  const [formulario, setFormulario] = useState<FormularioContato>(formularioInicial)
  const [salvando, setSalvando] = useState(false)
  const salvandoRef = useRef(false)

  function atualizarCampo<K extends keyof FormularioContato>(
    campo: K,
    valor: FormularioContato[K],
  ) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  function cancelar() {
    if (salvando) return
    setFormulario(formularioInicial())
    onFechar()
  }

  async function salvar() {
    if (salvandoRef.current) return

    salvandoRef.current = true
    setSalvando(true)

    try {
      await Promise.resolve(onCriar(formularioParaDadosContato(formulario)))
    } catch {
      salvandoRef.current = false
      setSalvando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={cancelar} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="modal-titulo" className="modal__titulo">
            Novo Contato
          </h2>
          <button type="button" className="modal__fechar" onClick={cancelar} aria-label="Fechar">
            ×
          </button>
        </header>

        <form
          className="modal__formulario"
          onSubmit={(e) => {
            e.preventDefault()
            void salvar()
          }}
        >
          <div className="modal__grid">
            <label className="campo">
              <span className="campo__rotulo">Nome</span>
              <input
                type="text"
                className="campo__input"
                value={formulario.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                placeholder="Nome completo"
              />
            </label>

            <label className="campo">
              <span className="campo__rotulo">Telefone</span>
              <input
                type="tel"
                className="campo__input"
                value={formulario.telefone}
                onChange={(e) => atualizarCampo('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </label>

            <label className="campo">
              <span className="campo__rotulo">Origem</span>
              <input
                type="text"
                className="campo__input"
                value={formulario.origem}
                onChange={(e) => atualizarCampo('origem', e.target.value)}
                placeholder="Instagram, indicação..."
              />
            </label>

            <label className="campo">
              <span className="campo__rotulo">Status</span>
              <select
                className="campo__input"
                value={formulario.status}
                onChange={(e) => atualizarCampo('status', e.target.value as ContatoStatus)}
              >
                {TODOS_OS_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="campo">
              <span className="campo__rotulo">Primeiro contato</span>
              <input
                type="date"
                className="campo__input"
                value={formulario.dataPrimeiroContato}
                onChange={(e) => atualizarCampo('dataPrimeiroContato', e.target.value)}
              />
            </label>

            <label className="campo">
              <span className="campo__rotulo">Último contato</span>
              <input
                type="date"
                className="campo__input"
                value={formulario.dataUltimoContato}
                onChange={(e) => atualizarCampo('dataUltimoContato', e.target.value)}
              />
            </label>

            <label className="campo">
              <span className="campo__rotulo">Próximo follow-up</span>
              <input
                type="date"
                className="campo__input"
                value={formulario.dataProximoFollowUp}
                onChange={(e) => atualizarCampo('dataProximoFollowUp', e.target.value)}
              />
            </label>

            <label className="campo">
              <span className="campo__rotulo">Plano</span>
              <input
                type="text"
                className="campo__input"
                value={formulario.plano}
                onChange={(e) => atualizarCampo('plano', e.target.value)}
                placeholder="Opcional"
              />
            </label>

            <label className="campo campo--largo">
              <span className="campo__rotulo">Observações</span>
              <textarea
                className="campo__input campo__textarea"
                value={formulario.observacoes}
                onChange={(e) => atualizarCampo('observacoes', e.target.value)}
                placeholder="Notas sobre o contato"
                rows={3}
              />
            </label>
          </div>

          <footer className="modal__rodape">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={cancelar}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn--primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
