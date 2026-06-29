import { useState } from 'react'
import type { Contato } from '../types/contato'
import {
  aplicarTransicao,
  type ResultadoAplicacaoTransicao,
} from '../features/contatos/fluxo/aplicarTransicao'
import type { ResultadoContato } from '../features/contatos/fluxo/resultadoContato'
import { resultadosPermitidos } from '../features/contatos/fluxo/transicoes'
import { dataRelativa, formatarData } from '../utils/contatoHelpers'
import { registrarReativacaoConcluida } from '../utils/registrarReativacao'
import { resolverObjetivoFollowUp } from '../utils/resolverObjetivoFollowUp'
import { STATUS_FRASES } from '../utils/statusHumano'
import './ConcluirFollowUpModal.css'

type Etapa = 'resultado' | 'data' | 'confirmacao'

type ConcluirFollowUpModalProps = {
  contato: Contato
  onFechar: () => void
  onConfirmar: (contatoAtualizado: Contato) => void
}

const OPCOES_RESULTADO: {
  valor: ResultadoContato
  rotulo: string
  descricao: string
}[] = [
  {
    valor: 'NAO_RESPONDEU',
    rotulo: 'Não respondeu',
    descricao: 'Tentou contato, mas não houve retorno.',
  },
  {
    valor: 'VAI_PENSAR',
    rotulo: 'Vai pensar',
    descricao: 'A pessoa pediu tempo para decidir.',
  },
  {
    valor: 'AGENDOU',
    rotulo: 'Agendou consulta',
    descricao: 'Marcou consulta ou retorno.',
  },
  {
    valor: 'SEM_INTERESSE',
    rotulo: 'Sem interesse',
    descricao: 'Não quer continuar o contato.',
  },
  {
    valor: 'CHAMAR_DEPOIS',
    rotulo: 'Chamar depois',
    descricao: 'Pediu para falar em outra data.',
  },
]

function montarContatoAtualizado(
  contato: Contato,
  sugestao: ResultadoAplicacaoTransicao,
  resultado: ResultadoContato,
): Contato {
  const atualizado: Contato = {
    ...contato,
    status: sugestao.novoStatus,
    dataUltimoContato: dataRelativa(0),
    dataProximoFollowUp: sugestao.dataProximoFollowUp ?? '',
  }

  if (sugestao.novoObjetivoFollowUp === null) {
    delete atualizado.objetivoFollowUp
  } else if (sugestao.novoObjetivoFollowUp !== undefined) {
    atualizado.objetivoFollowUp = sugestao.novoObjetivoFollowUp
  }

  const registroReativacao = registrarReativacaoConcluida(contato, resultado)
  if (registroReativacao) {
    atualizado.ultimaReativacaoEm = registroReativacao.ultimaReativacaoEm
    atualizado.ultimoResultadoReativacao = registroReativacao.ultimoResultadoReativacao
  }

  return atualizado
}

export default function ConcluirFollowUpModal({
  contato,
  onFechar,
  onConfirmar,
}: ConcluirFollowUpModalProps) {
  const [etapa, setEtapa] = useState<Etapa>('resultado')
  const [resultadoSelecionado, setResultadoSelecionado] =
    useState<ResultadoContato | null>(null)
  const [dataManual, setDataManual] = useState(dataRelativa(1))
  const [sugestao, setSugestao] = useState<ResultadoAplicacaoTransicao | null>(
    null,
  )

  const resultadosDisponiveis = resultadosPermitidos(
    resolverObjetivoFollowUp(contato),
    contato.status,
  )
  const opcoesVisiveis = OPCOES_RESULTADO.filter((opcao) =>
    resultadosDisponiveis.includes(opcao.valor),
  )

  function selecionarResultado(resultado: ResultadoContato) {
    setResultadoSelecionado(resultado)
    const preview = aplicarTransicao(contato, resultado)

    if (preview.exigeDataManual) {
      setSugestao(preview)
      setEtapa('data')
      return
    }

    setSugestao(preview)
    setEtapa('confirmacao')
  }

  function avancarComData() {
    if (!resultadoSelecionado) return

    const preview = aplicarTransicao(contato, resultadoSelecionado, dataManual)
    setSugestao(preview)
    setEtapa('confirmacao')
  }

  function voltar() {
    if (etapa === 'confirmacao' && resultadoSelecionado) {
      const preview = aplicarTransicao(contato, resultadoSelecionado)
      if (preview.exigeDataManual) {
        setEtapa('data')
        return
      }
    }

    setEtapa('resultado')
    setResultadoSelecionado(null)
    setSugestao(null)
  }

  function confirmar() {
    if (!sugestao || !resultadoSelecionado) return
    onConfirmar(montarContatoAtualizado(contato, sugestao, resultadoSelecionado))
  }

  const tituloEtapa =
    etapa === 'resultado'
      ? 'O que aconteceu?'
      : etapa === 'data'
        ? 'Quando chamar de novo?'
        : 'Próxima ação sugerida'

  return (
    <div className="modal-overlay" onClick={onFechar} role="presentation">
      <div
        className="modal modal--followup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="followup-titulo"
      >
        <header className="modal__cabecalho">
          <div>
            <p className="followup-modal__contato">{contato.nome}</p>
            <h2 id="followup-titulo" className="modal__titulo">
              {tituloEtapa}
            </h2>
          </div>
          <button
            type="button"
            className="modal__fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className="modal__corpo followup-modal__corpo">
          {etapa === 'resultado' && (
            <div className="followup-modal__opcoes">
              {opcoesVisiveis.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  className="opcao-resultado"
                  onClick={() => selecionarResultado(opcao.valor)}
                >
                  <span className="opcao-resultado__rotulo">{opcao.rotulo}</span>
                  <span className="opcao-resultado__descricao">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          )}

          {etapa === 'data' && (
            <div className="followup-modal__data">
              <label className="campo">
                <span className="campo__rotulo">Nova data do follow-up</span>
                <input
                  type="date"
                  className="campo__input"
                  value={dataManual}
                  onChange={(e) => setDataManual(e.target.value)}
                />
              </label>
              <div className="followup-modal__acoes-inline">
                <button type="button" className="btn btn--secundario" onClick={voltar}>
                  Voltar
                </button>
                <button
                  type="button"
                  className="btn btn--primario"
                  onClick={avancarComData}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {etapa === 'confirmacao' && sugestao && (
            <div className="followup-modal__confirmacao">
              <p className="followup-modal__resumo">{sugestao.mensagemResumo}</p>

              <dl className="followup-modal__detalhes">
                <div>
                  <dt>Novo estágio</dt>
                  <dd>{STATUS_FRASES[sugestao.novoStatus]}</dd>
                </div>
                <div>
                  <dt>Próximo follow-up</dt>
                  <dd>
                    {sugestao.dataProximoFollowUp
                      ? formatarData(sugestao.dataProximoFollowUp)
                      : 'Sem follow-up agendado'}
                  </dd>
                </div>
              </dl>

              <p className="followup-modal__aviso">
                Ao confirmar, o contato será atualizado nesta sessão.
              </p>
            </div>
          )}
        </div>

        {etapa === 'confirmacao' && (
          <footer className="modal__rodape">
            <button type="button" className="btn btn--secundario" onClick={voltar}>
              Voltar
            </button>
            <button type="button" className="btn btn--secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="button" className="btn btn--primario" onClick={confirmar}>
              Confirmar
            </button>
          </footer>
        )}

        {etapa === 'resultado' && (
          <footer className="modal__rodape">
            <button type="button" className="btn btn--secundario" onClick={onFechar}>
              Cancelar
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
