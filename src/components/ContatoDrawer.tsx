import { useEffect, useMemo, useRef, useState } from 'react'
import type { Campanha, StatusCampanha, TipoCampanha } from '../types/campanha'
import type { Contato } from '../types/contato'
import type { ContatoStatus } from '../types/contatoStatus'
import { OBJETIVO_FOLLOW_UP_LABELS } from '../types/objetivoFollowUp'
import { TODOS_OS_STATUS, dataRelativa, formatarData } from '../utils/contatoHelpers'
import { personalizarMensagemCampanha } from '../utils/campanhaMensagem'
import { resolverDadosCampanhaContato } from '../utils/resolverDadosCampanhaContato'
import { STATUS_FRASES } from '../utils/statusHumano'
import BotaoConversar from './BotaoConversar'
import './ContatoDrawer.css'

type ContatoDrawerProps = {
  contato: Contato
  campanhas: Campanha[]
  campanhasCarregadas: boolean
  onFechar: () => void
  onConcluirFollowUp: () => void
  onAdiar: () => void
  onIniciarCampanha: () => void
  onEncerrarCampanha: () => void
  onSalvar: (contatoAtualizado: Contato) => void
  onSolicitarRemover: () => void
}

type FormularioEdicao = {
  nome: string
  telefone: string
  origem: string
  status: ContatoStatus
  plano: string
  dataProximoFollowUp: string
  observacoes: string
}

function contatoParaFormulario(contato: Contato): FormularioEdicao {
  return {
    nome: contato.nome,
    telefone: contato.telefone,
    origem: contato.origem,
    status: contato.status,
    plano: contato.plano ?? '',
    dataProximoFollowUp: contato.dataProximoFollowUp,
    observacoes: contato.observacoes ?? '',
  }
}

function recalcularDataProximoFollowUpPorStatus(status: ContatoStatus): string {
  switch (status) {
    case 'FOLLOW_UP_2_DIAS':
      return dataRelativa(2)
    case 'REENGAJAMENTO_7_DIAS':
      return dataRelativa(7)
    case 'DESAPEGO_10_DIAS':
      return dataRelativa(10)
    case 'PACIENTE_INATIVO':
      return dataRelativa(60)
    default:
      return ''
  }
}

function formularioParaContato(contato: Contato, formulario: FormularioEdicao): Contato {
  return {
    ...contato,
    nome: formulario.nome.trim(),
    telefone: formulario.telefone.trim(),
    origem: formulario.origem.trim(),
    status: formulario.status,
    dataProximoFollowUp: formulario.dataProximoFollowUp,
    plano: formulario.plano.trim() || undefined,
    observacoes: formulario.observacoes.trim() || undefined,
  }
}

const TIPO_CAMPANHA_LABELS: Record<TipoCampanha, string> = {
  REATIVACAO: 'Reativação',
  INDICACAO: 'Indicação',
  PERSONALIZADA: 'Personalizada',
}

const STATUS_CAMPANHA_LABELS: Record<StatusCampanha, string> = {
  RASCUNHO: 'Rascunho',
  ATIVA: 'Ativa',
  ENCERRADA: 'Encerrada',
}

export default function ContatoDrawer({
  contato,
  campanhas,
  campanhasCarregadas,
  onFechar,
  onConcluirFollowUp,
  onAdiar,
  onIniciarCampanha,
  onEncerrarCampanha,
  onSalvar,
  onSolicitarRemover,
}: ContatoDrawerProps) {
  const [modoEdicao, setModoEdicao] = useState(false)
  const [modoEdicaoObservacoes, setModoEdicaoObservacoes] = useState(false)
  const [observacoesRascunho, setObservacoesRascunho] = useState(contato.observacoes ?? '')
  const [formulario, setFormulario] = useState<FormularioEdicao>(() =>
    contatoParaFormulario(contato),
  )
  const dataProximoFollowUpRef = useRef<HTMLInputElement>(null)
  const statusOriginalRef = useRef<ContatoStatus>(contato.status)
  const [mostrarAvisoStatus, setMostrarAvisoStatus] = useState(false)
  const [mensagemCampanhaVisivel, setMensagemCampanhaVisivel] = useState(false)
  const [mensagemCopiada, setMensagemCopiada] = useState(false)

  const podeIniciarCampanha =
    (contato.status === 'PACIENTE_INATIVO' || contato.status === 'PACIENTE_ATIVO') &&
    contato.objetivoFollowUp === undefined

  const temCampanhaAtiva = contato.objetivoFollowUp !== undefined

  const dadosCampanha = useMemo(
    () => resolverDadosCampanhaContato(contato, campanhas, campanhasCarregadas),
    [contato, campanhas, campanhasCarregadas],
  )

  const temCampanhaRegistrada = dadosCampanha.temDadosCampanha
  const mensagemCampanhaPersonalizada = dadosCampanha.mensagem
    ? personalizarMensagemCampanha(dadosCampanha.mensagem, contato.nome)
    : ''

  useEffect(() => {
    setMensagemCampanhaVisivel(false)
    setMensagemCopiada(false)
  }, [contato.id, dadosCampanha.mensagem])

  useEffect(() => {
    if (!modoEdicao) {
      setFormulario(contatoParaFormulario(contato))
    }
  }, [contato, modoEdicao])

  useEffect(() => {
    if (!modoEdicaoObservacoes) {
      setObservacoesRascunho(contato.observacoes ?? '')
    }
  }, [contato, modoEdicaoObservacoes])

  function alternarMensagemCampanha() {
    setMensagemCampanhaVisivel((anterior) => !anterior)
  }

  async function copiarMensagemCampanha() {
    if (!mensagemCampanhaPersonalizada) return

    try {
      await navigator.clipboard.writeText(mensagemCampanhaPersonalizada)
      setMensagemCopiada(true)
      window.setTimeout(() => setMensagemCopiada(false), 2000)
    } catch {
      setMensagemCopiada(false)
    }
  }

  function iniciarEdicao() {
    statusOriginalRef.current = contato.status
    setMostrarAvisoStatus(false)
    setModoEdicaoObservacoes(false)
    setFormulario(contatoParaFormulario(contato))
    setModoEdicao(true)
  }

  function cancelarEdicao() {
    statusOriginalRef.current = contato.status
    setMostrarAvisoStatus(false)
    setFormulario(contatoParaFormulario(contato))
    setModoEdicao(false)
  }

  function iniciarEdicaoObservacoes() {
    setModoEdicao(false)
    setObservacoesRascunho(contato.observacoes ?? '')
    setModoEdicaoObservacoes(true)
  }

  function cancelarEdicaoObservacoes() {
    setObservacoesRascunho(contato.observacoes ?? '')
    setModoEdicaoObservacoes(false)
  }

  function salvarObservacoes() {
    onSalvar({
      ...contato,
      observacoes: observacoesRascunho.trim() || undefined,
    })
    setModoEdicaoObservacoes(false)
  }

  function alterarStatus(novoStatus: ContatoStatus) {
    setFormulario((atual) => ({ ...atual, status: novoStatus }))
    setMostrarAvisoStatus(novoStatus !== statusOriginalRef.current)
  }

  function confirmarRecalcularDataFollowUp() {
    const novaData = recalcularDataProximoFollowUpPorStatus(formulario.status)
    setFormulario((atual) => ({ ...atual, dataProximoFollowUp: novaData }))
    if (dataProximoFollowUpRef.current) {
      dataProximoFollowUpRef.current.value = novaData
    }
    setMostrarAvisoStatus(false)
  }

  function manterDataFollowUpAtual() {
    setMostrarAvisoStatus(false)
  }

  function atualizarCampo<K extends keyof FormularioEdicao>(
    campo: K,
    valor: FormularioEdicao[K],
  ) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  function salvarEdicao() {
    const dataProximoFollowUp =
      dataProximoFollowUpRef.current?.value ?? formulario.dataProximoFollowUp

    const formularioAtualizado: FormularioEdicao = {
      ...formulario,
      dataProximoFollowUp,
    }

    onSalvar(formularioParaContato(contato, formularioAtualizado))
    setModoEdicao(false)
  }

  return (
    <div className="drawer-overlay" onClick={onFechar} role="presentation">
      <aside
        className="drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Detalhes de ${contato.nome}`}
      >
        <header className="drawer__cabecalho">
          <div>
            <h2 className="drawer__nome">
              {modoEdicao ? 'Editar contato' : contato.nome}
            </h2>
            {!modoEdicao && (
              <div className="drawer__etiquetas">
                <span className="drawer__status">{STATUS_FRASES[contato.status]}</span>
                {contato.objetivoFollowUp && (
                  <span className="drawer__objetivo">
                    {OBJETIVO_FOLLOW_UP_LABELS[contato.objetivoFollowUp]}
                  </span>
                )}
              </div>
            )}
            {modoEdicao && (
              <p className="drawer__subtitulo">{contato.nome}</p>
            )}
          </div>
          <button type="button" className="drawer__fechar" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="drawer__corpo">
          {modoEdicao ? (
            <form
              className="drawer__formulario"
              onSubmit={(e) => {
                e.preventDefault()
                salvarEdicao()
              }}
            >
              <label className="campo">
                <span className="campo__rotulo">Nome</span>
                <input
                  type="text"
                  className="campo__input"
                  value={formulario.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  required
                />
              </label>

              <label className="campo">
                <span className="campo__rotulo">Telefone</span>
                <input
                  type="tel"
                  className="campo__input"
                  value={formulario.telefone}
                  onChange={(e) => atualizarCampo('telefone', e.target.value)}
                  required
                />
              </label>

              <label className="campo">
                <span className="campo__rotulo">Origem</span>
                <input
                  type="text"
                  className="campo__input"
                  value={formulario.origem}
                  onChange={(e) => atualizarCampo('origem', e.target.value)}
                  required
                />
              </label>

              <label className="campo">
                <span className="campo__rotulo">Status</span>
                <select
                  className="campo__input"
                  value={formulario.status}
                  onChange={(e) => alterarStatus(e.target.value as ContatoStatus)}
                >
                  {TODOS_OS_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_FRASES[status]}
                    </option>
                  ))}
                </select>
              </label>

              {mostrarAvisoStatus && (
                <div className="drawer__aviso-status" role="note">
                  <p className="drawer__aviso-status-texto">
                    Você alterou a etapa do contato. Deseja atualizar automaticamente a data do
                    próximo follow-up conforme essa etapa?
                  </p>
                  <div className="drawer__aviso-status-acoes">
                    <button
                      type="button"
                      className="btn btn--primario"
                      onClick={confirmarRecalcularDataFollowUp}
                    >
                      Sim, recalcular
                    </button>
                    <button
                      type="button"
                      className="btn btn--secundario"
                      onClick={manterDataFollowUpAtual}
                    >
                      Não, manter data atual
                    </button>
                  </div>
                </div>
              )}

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

              <label className="campo">
                <span className="campo__rotulo">Próximo follow-up</span>
                <input
                  ref={dataProximoFollowUpRef}
                  type="date"
                  className="campo__input"
                  value={formulario.dataProximoFollowUp}
                  onChange={(e) => atualizarCampo('dataProximoFollowUp', e.target.value)}
                />
              </label>

              <label className="campo">
                <span className="campo__rotulo">Observações</span>
                <textarea
                  className="campo__input campo__textarea"
                  value={formulario.observacoes}
                  onChange={(e) => atualizarCampo('observacoes', e.target.value)}
                  rows={4}
                  placeholder="Opcional"
                />
              </label>
            </form>
          ) : (
            <>
              {(temCampanhaAtiva || temCampanhaRegistrada) && (
                <section className="drawer__campanha-ativa" aria-label="Campanha ativa">
                  <p className="drawer__campanha-ativa-titulo">
                    {temCampanhaAtiva ? '❤️ Campanha ativa' : '📣 Campanha registrada'}
                  </p>
                  {temCampanhaAtiva && contato.objetivoFollowUp && (
                    <p className="drawer__campanha-ativa-objetivo">
                      {OBJETIVO_FOLLOW_UP_LABELS[contato.objetivoFollowUp]}
                    </p>
                  )}
                  {dadosCampanha.campanhaNaoEncontrada && (
                    <p className="drawer__campanha-ativa-aviso">Campanha não encontrada</p>
                  )}
                  {dadosCampanha.nome && (
                    <p className="drawer__campanha-ativa-meta">
                      <span className="drawer__campanha-ativa-meta-rotulo">Campanha:</span>
                      <span className="drawer__campanha-ativa-meta-valor">
                        {dadosCampanha.nome}
                      </span>
                    </p>
                  )}
                  {dadosCampanha.tipo && (
                    <p className="drawer__campanha-ativa-meta">
                      <span className="drawer__campanha-ativa-meta-rotulo">Tipo:</span>
                      <span className="drawer__campanha-ativa-meta-valor">
                        {TIPO_CAMPANHA_LABELS[dadosCampanha.tipo]}
                      </span>
                    </p>
                  )}
                  {dadosCampanha.status && (
                    <p className="drawer__campanha-ativa-meta">
                      <span className="drawer__campanha-ativa-meta-rotulo">Status:</span>
                      <span className="drawer__campanha-ativa-meta-valor">
                        {STATUS_CAMPANHA_LABELS[dadosCampanha.status]}
                      </span>
                    </p>
                  )}
                  {dadosCampanha.dataInicio && (
                    <p className="drawer__campanha-ativa-meta">
                      <span className="drawer__campanha-ativa-meta-rotulo">Iniciada em:</span>
                      <span className="drawer__campanha-ativa-meta-valor">
                        {formatarData(dadosCampanha.dataInicio)}
                      </span>
                    </p>
                  )}
                  {dadosCampanha.mensagem && (
                    <div className="drawer__campanha-mensagem">
                      <div className="drawer__campanha-mensagem-acoes">
                        <button
                          type="button"
                          className="btn btn--secundario"
                          onClick={alternarMensagemCampanha}
                        >
                          {mensagemCampanhaVisivel ? 'Ocultar mensagem' : 'Ver mensagem'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--secundario"
                          onClick={() => void copiarMensagemCampanha()}
                        >
                          {mensagemCopiada ? 'Copiado!' : 'Copiar mensagem'}
                        </button>
                      </div>
                      {mensagemCampanhaVisivel && (
                        <p className="drawer__campanha-mensagem-texto">
                          {mensagemCampanhaPersonalizada}
                        </p>
                      )}
                    </div>
                  )}
                  {temCampanhaAtiva && (
                    <>
                      <p className="drawer__campanha-ativa-proximo">
                        <span className="drawer__campanha-ativa-proximo-rotulo">Próximo contato:</span>
                        <span className="drawer__campanha-ativa-proximo-data">
                          {formatarData(contato.dataProximoFollowUp)}
                        </span>
                      </p>
                      <div className="drawer__campanha-ativa-acoes">
                        <BotaoConversar telefone={contato.telefone} />
                        <button type="button" className="btn btn--secundario" onClick={onAdiar}>
                          Adiar
                        </button>
                        <button
                          type="button"
                          className="btn btn--primario"
                          onClick={onConcluirFollowUp}
                        >
                          Concluir follow-up
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn--secundario drawer__campanha-ativa-encerrar"
                        onClick={onEncerrarCampanha}
                      >
                        Encerrar campanha
                      </button>
                    </>
                  )}
                </section>
              )}

              <section className="drawer__secao">
                <h3 className="drawer__secao-titulo">Informações</h3>
                <dl className="drawer__lista drawer__lista--grid">
                  <div>
                    <dt>Telefone</dt>
                    <dd className="drawer__valor-destaque">{contato.telefone}</dd>
                  </div>
                  <div>
                    <dt>Origem</dt>
                    <dd>{contato.origem}</dd>
                  </div>
                  {contato.plano && (
                    <div>
                      <dt>Plano</dt>
                      <dd>{contato.plano}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className="drawer__status drawer__status--inline">
                        {STATUS_FRASES[contato.status]}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Primeiro contato</dt>
                    <dd>{formatarData(contato.dataPrimeiroContato)}</dd>
                  </div>
                  <div>
                    <dt>Último contato</dt>
                    <dd>{formatarData(contato.dataUltimoContato)}</dd>
                  </div>
                  <div>
                    <dt>Próximo follow-up</dt>
                    <dd>{formatarData(contato.dataProximoFollowUp)}</dd>
                  </div>
                  {contato.diasRestantes !== undefined && (
                    <div>
                      <dt>Dias restantes</dt>
                      <dd>{contato.diasRestantes}</dd>
                    </div>
                  )}
                  {contato.dataFimPlano && (
                    <div className="drawer__item--largura-total">
                      <dt>Fim do plano</dt>
                      <dd>{formatarData(contato.dataFimPlano)}</dd>
                    </div>
                  )}
                </dl>
              </section>

              <section className="drawer__secao">
                <div className="drawer__secao-cabecalho">
                  <h3 className="drawer__secao-titulo drawer__secao-titulo--inline">
                    Observações
                  </h3>
                  {!modoEdicaoObservacoes && (
                    <button
                      type="button"
                      className="drawer__secao-acao"
                      onClick={iniciarEdicaoObservacoes}
                    >
                      {contato.observacoes ? 'Editar' : 'Adicionar'}
                    </button>
                  )}
                </div>

                {modoEdicaoObservacoes ? (
                  <div className="drawer__observacoes-edicao">
                    <textarea
                      className="campo__input campo__textarea"
                      value={observacoesRascunho}
                      onChange={(e) => setObservacoesRascunho(e.target.value)}
                      rows={4}
                      placeholder="Observações internas sobre o contato"
                      aria-label="Observações do contato"
                    />
                    <div className="drawer__observacoes-acoes">
                      <button
                        type="button"
                        className="btn btn--secundario"
                        onClick={cancelarEdicaoObservacoes}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn--primario"
                        onClick={salvarObservacoes}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : contato.observacoes ? (
                  <p className="drawer__observacoes">{contato.observacoes}</p>
                ) : (
                  <p className="drawer__observacoes drawer__observacoes--vazio">
                    Nenhuma observação registrada.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        <footer className="drawer__rodape">
          {modoEdicao ? (
            <>
              <button type="button" className="btn btn--secundario" onClick={cancelarEdicao}>
                Cancelar
              </button>
              <button type="button" className="btn btn--primario" onClick={salvarEdicao}>
                Salvar
              </button>
              <button
                type="button"
                className="btn btn--secundario drawer__btn-remover"
                onClick={onSolicitarRemover}
              >
                Remover contato
              </button>
            </>
          ) : (
            <>
              {!temCampanhaAtiva && <BotaoConversar telefone={contato.telefone} />}
              {podeIniciarCampanha && (
                <button
                  type="button"
                  className="btn btn--primario"
                  onClick={onIniciarCampanha}
                >
                  Iniciar campanha
                </button>
              )}
              {!temCampanhaAtiva && (
                <>
                  <button type="button" className="btn btn--primario" onClick={onConcluirFollowUp}>
                    Concluir follow-up
                  </button>
                  <button type="button" className="btn btn--secundario" onClick={onAdiar}>
                    Adiar follow-up
                  </button>
                </>
              )}
              <button type="button" className="btn btn--secundario" onClick={iniciarEdicao}>
                Editar contato
              </button>
              <button
                type="button"
                className="btn btn--secundario drawer__btn-remover"
                onClick={onSolicitarRemover}
              >
                Remover contato
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  )
}
