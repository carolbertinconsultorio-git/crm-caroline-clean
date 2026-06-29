import { useRef, useState } from 'react'
import {
  analisarArquivoLiveClin,
  formatosArquivoImportacaoAceitos,
  sincronizarPrimeirosPacientesTesteLiveClin,
  sincronizarTodosPacientesLiveClin,
  mapearStatusLiveClinParaContato,
  QUANTIDADE_IMPORTACAO_TESTE_LIVECLIN,
  simularSincronizacaoLiveClinComFirestore,
  type LinhaSimulacaoSincronizacaoLiveClin,
  type PacienteLiveClin,
  type ResultadoSincronizacaoLiveClin,
  type ResultadoPreviewImportacaoLiveClin,
  type ResultadoSimulacaoSincronizacaoLiveClin,
} from '../features/importacao/liveclin'
import { formatarData, STATUS_LABELS } from '../utils/contatoHelpers'
import './NovoContatoModal.css'
import './ImportacaoLiveClinModal.css'

type ImportacaoLiveClinModalProps = {
  onFechar: () => void
  onContatosAtualizados: () => Promise<void>
}

type Etapa = 'selecao' | 'preview' | 'simulacao'

function formatarFimPlano(valor: string): string {
  if (!valor) return '—'
  return formatarData(valor)
}

function formatarDiasRestantes(valor: number | null): string {
  if (valor === null) return '—'
  return String(valor)
}

function formatarStatusCrmImportacao(paciente: PacienteLiveClin): string {
  return STATUS_LABELS[mapearStatusLiveClinParaContato(paciente.statusLiveClin)]
}

function TabelaSimulacao({
  titulo,
  tituloClassName,
  linhas,
  mostrarContatoCrm = false,
}: {
  titulo: string
  tituloClassName?: string
  linhas: LinhaSimulacaoSincronizacaoLiveClin[]
  mostrarContatoCrm?: boolean
}) {
  if (linhas.length === 0) {
    return (
      <div>
        <p className={`importacao-modal__grupo-titulo ${tituloClassName ?? ''}`}>{titulo}</p>
        <p className="importacao-modal__vazio">Nenhum registro neste grupo.</p>
      </div>
    )
  }

  return (
    <div>
      <p className={`importacao-modal__grupo-titulo ${tituloClassName ?? ''}`}>{titulo}</p>
      <div className="importacao-modal__tabela-wrapper">
        <table className="importacao-modal__tabela">
          <thead>
            <tr>
              <th>Nome (LiveClin)</th>
              <th>Telefone</th>
              <th>Status LiveClin</th>
              <th>Status no CRM</th>
              <th>Fim do plano</th>
              <th>Dias restantes</th>
              {mostrarContatoCrm && <th>Contato no CRM</th>}
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, indice) => (
              <tr key={`${linha.paciente.idLiveClin}-${indice}`}>
                <td>{linha.paciente.nome || '—'}</td>
                <td>{linha.paciente.telefone || '—'}</td>
                <td>{linha.paciente.statusLiveClin}</td>
                <td>{formatarStatusCrmImportacao(linha.paciente)}</td>
                <td>{formatarFimPlano(linha.paciente.dataFimPlano)}</td>
                <td>{formatarDiasRestantes(linha.paciente.diasRestantes)}</td>
                {mostrarContatoCrm && (
                  <td>{linha.contatoExistenteNome ?? '—'}</td>
                )}
                <td>
                  {linha.motivoRevisao && (
                    <p className="importacao-modal__detalhe-linha">{linha.motivoRevisao}</p>
                  )}
                  {linha.camposLiveClinAtualizados.length > 0 && (
                    <p className="importacao-modal__detalhe-linha">
                      Campos LiveClin: {linha.camposLiveClinAtualizados.join(', ')}
                    </p>
                  )}
                  <p className="importacao-modal__detalhe-linha">
                    CRM preserva: status do funil, follow-up, observações e datas manuais.
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ImportacaoLiveClinModal({
  onFechar,
  onContatosAtualizados,
}: ImportacaoLiveClinModalProps) {
  const inputArquivoRef = useRef<HTMLInputElement>(null)
  const [etapa, setEtapa] = useState<Etapa>('selecao')
  const [carregando, setCarregando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoPreviewImportacaoLiveClin | null>(null)
  const [simulacao, setSimulacao] = useState<ResultadoSimulacaoSincronizacaoLiveClin | null>(
    null,
  )
  const [resultadoImportacao, setResultadoImportacao] =
    useState<ResultadoSincronizacaoLiveClin | null>(null)
  const [confirmandoSincronizacaoTotal, setConfirmandoSincronizacaoTotal] = useState(false)
  const [tipoUltimaSincronizacao, setTipoUltimaSincronizacao] = useState<
    'teste' | 'todos' | null
  >(null)

  function cancelar() {
    setEtapa('selecao')
    setCarregando(false)
    setErro(null)
    setResultado(null)
    setSimulacao(null)
    setResultadoImportacao(null)
    setConfirmandoSincronizacaoTotal(false)
    setTipoUltimaSincronizacao(null)
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = ''
    }
    onFechar()
  }

  async function selecionarArquivo(arquivo: File | undefined) {
    if (!arquivo) return

    setCarregando(true)
    setErro(null)
    setResultado(null)
    setSimulacao(null)
    setResultadoImportacao(null)
    setConfirmandoSincronizacaoTotal(false)
    setTipoUltimaSincronizacao(null)

    try {
      const analise = await analisarArquivoLiveClin(arquivo)
      setResultado(analise)
      setEtapa('preview')
    } catch (erroLeitura) {
      console.error('Não foi possível analisar o arquivo LiveClin.', erroLeitura)
      setErro('Não foi possível ler o arquivo. Verifique se é um CSV ou XLSX válido do LiveClin.')
      setEtapa('selecao')
    } finally {
      setCarregando(false)
    }
  }

  async function continuarParaSimulacao() {
    if (!resultado || resultado.pacientes.length === 0) return

    setCarregando(true)
    setErro(null)
    setResultadoImportacao(null)
    setConfirmandoSincronizacaoTotal(false)
    setTipoUltimaSincronizacao(null)

    try {
      const resultadoSimulacao = await simularSincronizacaoLiveClinComFirestore(
        resultado.pacientes,
      )
      setSimulacao(resultadoSimulacao)
      setEtapa('simulacao')
    } catch (erroSimulacao) {
      const mensagem =
        erroSimulacao instanceof Error ? erroSimulacao.message : String(erroSimulacao)
      console.error(
        '[LiveClin simulação] Erro ao carregar contatos para simulação:',
        mensagem,
        erroSimulacao,
      )
      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  function trocarArquivo() {
    setEtapa('selecao')
    setErro(null)
    setResultado(null)
    setSimulacao(null)
    setResultadoImportacao(null)
    setConfirmandoSincronizacaoTotal(false)
    setTipoUltimaSincronizacao(null)
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = ''
      inputArquivoRef.current.click()
    }
  }

  function voltarParaPreview() {
    setEtapa('preview')
    setSimulacao(null)
    setResultadoImportacao(null)
    setConfirmandoSincronizacaoTotal(false)
    setTipoUltimaSincronizacao(null)
    setErro(null)
  }

  async function sincronizarCincoPrimeirosTeste() {
    if (!resultado || resultado.pacientes.length === 0) return

    setImportando(true)
    setErro(null)
    setResultadoImportacao(null)
    setConfirmandoSincronizacaoTotal(false)
    setTipoUltimaSincronizacao('teste')

    try {
      const resultadoTeste = await sincronizarPrimeirosPacientesTesteLiveClin(
        resultado.pacientes,
      )
      setResultadoImportacao(resultadoTeste)
      await onContatosAtualizados()
    } catch (erroImportacao) {
      const mensagem =
        erroImportacao instanceof Error
          ? erroImportacao.message
          : 'Não foi possível sincronizar os pacientes de teste.'
      console.error('[LiveClin sincronização teste] Erro inesperado:', erroImportacao)
      setErro(mensagem)
    } finally {
      setImportando(false)
    }
  }

  function solicitarSincronizacaoTotal() {
    setConfirmandoSincronizacaoTotal(true)
    setErro(null)
  }

  function cancelarConfirmacaoSincronizacaoTotal() {
    setConfirmandoSincronizacaoTotal(false)
  }

  async function confirmarSincronizacaoTotal() {
    if (!resultado || resultado.pacientes.length === 0) return

    setConfirmandoSincronizacaoTotal(false)
    setImportando(true)
    setErro(null)
    setResultadoImportacao(null)
    setTipoUltimaSincronizacao('todos')

    try {
      const resultadoTotal = await sincronizarTodosPacientesLiveClin(resultado.pacientes)
      setResultadoImportacao(resultadoTotal)
      await onContatosAtualizados()
    } catch (erroImportacao) {
      const mensagem =
        erroImportacao instanceof Error
          ? erroImportacao.message
          : 'Não foi possível sincronizar todos os pacientes.'
      console.error('[LiveClin sincronização total] Erro inesperado:', erroImportacao)
      setErro(mensagem)
    } finally {
      setImportando(false)
    }
  }

  const { resumo, previa, nomeArquivo, pacientes } = resultado ?? {
    resumo: null,
    previa: [],
    pacientes: [],
    nomeArquivo: '',
  }

  const quantidadeDisponivelTeste = Math.min(
    QUANTIDADE_IMPORTACAO_TESTE_LIVECLIN,
    pacientes.length,
  )

  const totalSincronizaveis = simulacao ? simulacao.criar + simulacao.atualizar : 0

  const tituloEtapa =
    etapa === 'selecao'
      ? 'Importar pacientes do LiveClin'
      : etapa === 'preview'
        ? 'Prévia do arquivo'
        : 'Simulação de sincronização'

  return (
    <div className="modal-overlay" onClick={cancelar} role="presentation">
      <div
        className="modal modal--importacao"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="importacao-titulo"
      >
        <header className="modal__cabecalho">
          <h2 id="importacao-titulo" className="modal__titulo">
            {tituloEtapa}
          </h2>
          <button type="button" className="modal__fechar" onClick={cancelar} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className="modal__corpo importacao-modal__corpo">
          {etapa === 'selecao' && (
            <>
              <p className="importacao-modal__passo-titulo">Passo 1 — Selecionar arquivo</p>
              <p className="importacao-modal__descricao">
                Escolha um arquivo exportado do LiveClin em formato CSV ou XLSX. A análise é feita
                apenas em memória; nada será gravado no CRM.
              </p>
              <label className="importacao-modal__arquivo">
                <span className="campo__rotulo">Arquivo</span>
                <input
                  ref={inputArquivoRef}
                  type="file"
                  className="campo__input"
                  accept={formatosArquivoImportacaoAceitos()}
                  disabled={carregando}
                  onChange={(e) => void selecionarArquivo(e.target.files?.[0])}
                />
              </label>
              {carregando && (
                <p className="importacao-modal__carregando" role="status" aria-live="polite">
                  Lendo arquivo em memória...
                </p>
              )}
              {erro && (
                <p className="importacao-modal__erro" role="alert">
                  {erro}
                </p>
              )}
            </>
          )}

          {etapa === 'preview' && resumo && (
            <>
              <div>
                <p className="importacao-modal__passo-titulo">Resumo da análise</p>
                <p className="importacao-modal__nome-arquivo">Arquivo: {nomeArquivo}</p>
              </div>

              <dl className="importacao-modal__resumo">
                <div>
                  <dt>Total de registros</dt>
                  <dd>{resumo.totalRegistros}</dd>
                </div>
                <div>
                  <dt>Com telefone</dt>
                  <dd>{resumo.comTelefone}</dd>
                </div>
                <div>
                  <dt>Sem telefone</dt>
                  <dd>{resumo.semTelefone}</dd>
                </div>
                <div>
                  <dt>Com e-mail</dt>
                  <dd>{resumo.comEmail}</dd>
                </div>
                <div>
                  <dt>ACTIVE</dt>
                  <dd>{resumo.active}</dd>
                </div>
                <div>
                  <dt>INACTIVE</dt>
                  <dd>{resumo.inactive}</dd>
                </div>
                <div>
                  <dt>FINISHED</dt>
                  <dd>{resumo.finished}</dd>
                </div>
                <div>
                  <dt>Com data final do serviço</dt>
                  <dd>{resumo.comDataFinalServico}</dd>
                </div>
                <div>
                  <dt>Com dias restantes</dt>
                  <dd>{resumo.comDiasRestantes}</dd>
                </div>
              </dl>

              <div>
                <p className="importacao-modal__passo-titulo">
                  Prévia dos primeiros {previa.length} pacientes
                </p>
                {previa.length === 0 ? (
                  <p className="importacao-modal__vazio">Nenhum registro encontrado no arquivo.</p>
                ) : (
                  <div className="importacao-modal__tabela-wrapper">
                    <table className="importacao-modal__tabela">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Telefone</th>
                          <th>Status LiveClin</th>
                          <th>Status no CRM</th>
                          <th>Plano</th>
                          <th>Fim do plano</th>
                          <th>Dias restantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previa.map((paciente, indice) => (
                          <tr key={`${paciente.idLiveClin}-${indice}`}>
                            <td>{paciente.nome || '—'}</td>
                            <td>{paciente.telefone || '—'}</td>
                            <td>{paciente.statusLiveClin}</td>
                            <td>{formatarStatusCrmImportacao(paciente)}</td>
                            <td>{paciente.plano || '—'}</td>
                            <td>{formatarFimPlano(paciente.dataFimPlano)}</td>
                            <td>{formatarDiasRestantes(paciente.diasRestantes)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <button type="button" className="btn btn--secundario" onClick={trocarArquivo}>
                Escolher outro arquivo
              </button>

              {erro && (
                <p className="importacao-modal__erro" role="alert">
                  {erro}
                </p>
              )}
            </>
          )}

          {etapa === 'simulacao' && simulacao && (
            <>
              <p className="importacao-modal__aviso-simulacao" role="note">
                Esta é apenas uma simulação. Nenhum contato foi criado, atualizado ou excluído no
                Firestore. A correspondência usa e-mail normalizado e, na ausência dele, telefone
                normalizado. Nome não é usado como identificador automático.
              </p>

              <dl className="importacao-modal__resumo">
                <div>
                  <dt>Total no arquivo</dt>
                  <dd>{simulacao.totalRegistros}</dd>
                </div>
                <div>
                  <dt>Seriam criados</dt>
                  <dd>{simulacao.criar}</dd>
                </div>
                <div>
                  <dt>Seriam atualizados</dt>
                  <dd>{simulacao.atualizar}</dd>
                </div>
                <div>
                  <dt>Precisam de revisão</dt>
                  <dd>{simulacao.revisao}</dd>
                </div>
              </dl>

              <TabelaSimulacao
                titulo={`Amostra — criar (${simulacao.amostraCriar.length} de ${simulacao.criar})`}
                tituloClassName="importacao-modal__grupo-titulo--novo"
                linhas={simulacao.amostraCriar}
              />

              <TabelaSimulacao
                titulo={`Amostra — atualizar (${simulacao.amostraAtualizar.length} de ${simulacao.atualizar})`}
                tituloClassName="importacao-modal__grupo-titulo--atualizar"
                linhas={simulacao.amostraAtualizar}
                mostrarContatoCrm
              />

              <TabelaSimulacao
                titulo={`Amostra — revisão (${simulacao.amostraRevisao.length} de ${simulacao.revisao})`}
                tituloClassName="importacao-modal__grupo-titulo--revisao"
                linhas={simulacao.amostraRevisao}
                mostrarContatoCrm
              />

              <button type="button" className="btn btn--secundario" onClick={voltarParaPreview}>
                Voltar à prévia
              </button>

              {confirmandoSincronizacaoTotal && simulacao && (
                <div className="importacao-modal__confirmacao" role="alertdialog" aria-live="polite">
                  <p className="importacao-modal__confirmacao-texto">
                    Você está prestes a sincronizar {totalSincronizaveis} contato(s). Esta ação
                    criará {simulacao.criar} e atualizará {simulacao.atualizar}.{' '}
                    {simulacao.revisao > 0 &&
                      `${simulacao.revisao} registro(s) em revisão serão ignorados. `}
                    Deseja continuar?
                  </p>
                  <div className="importacao-modal__confirmacao-acoes">
                    <button
                      type="button"
                      className="btn btn--secundario"
                      onClick={cancelarConfirmacaoSincronizacaoTotal}
                      disabled={importando}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      className="btn btn--primario"
                      onClick={() => void confirmarSincronizacaoTotal()}
                      disabled={importando || totalSincronizaveis === 0}
                    >
                      Confirmar sincronização
                    </button>
                  </div>
                </div>
              )}

              {resultadoImportacao && (
                <div className="importacao-modal__resultado-importacao" role="status">
                  <p className="importacao-modal__resultado-importacao-titulo">
                    {tipoUltimaSincronizacao === 'todos'
                      ? 'Sincronização completa concluída'
                      : 'Sincronização de teste concluída'}
                  </p>
                  <ul className="importacao-modal__resultado-importacao-lista">
                    <li>{resultadoImportacao.criados} criado(s)</li>
                    <li>{resultadoImportacao.atualizados} atualizado(s)</li>
                    <li>{resultadoImportacao.erros} com erro</li>
                    <li>{resultadoImportacao.ignorados} em revisão ignorado(s)</li>
                  </ul>
                  {resultadoImportacao.mensagensErro.length > 0 && (
                    <ul className="importacao-modal__lista-erros">
                      {resultadoImportacao.mensagensErro.map((mensagem) => (
                        <li key={mensagem}>{mensagem}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {erro && (
                <p className="importacao-modal__erro" role="alert">
                  {erro}
                </p>
              )}
            </>
          )}

          {carregando && etapa !== 'selecao' && (
            <p className="importacao-modal__carregando" role="status" aria-live="polite">
              {etapa === 'preview'
                ? 'Comparando com contatos do Firestore...'
                : importando
                  ? tipoUltimaSincronizacao === 'todos'
                    ? 'Sincronizando todos os pacientes no Firestore...'
                    : 'Sincronizando 5 primeiros pacientes no Firestore...'
                  : 'Processando...'}
            </p>
          )}
        </div>

        <footer className="modal__rodape">
          <button type="button" className="btn btn--secundario" onClick={cancelar}>
            Cancelar
          </button>
          {etapa === 'preview' && (
            <button
              type="button"
              className="btn btn--primario"
              disabled={carregando || pacientes.length === 0}
              onClick={() => void continuarParaSimulacao()}
            >
              Continuar
            </button>
          )}
          {etapa === 'simulacao' && simulacao && (
            <>
              <button
                type="button"
                className="btn btn--secundario"
                disabled={
                  importando ||
                  carregando ||
                  quantidadeDisponivelTeste === 0 ||
                  confirmandoSincronizacaoTotal
                }
                onClick={() => void sincronizarCincoPrimeirosTeste()}
              >
                Sincronizar 5 primeiros
              </button>
              <button
                type="button"
                className="btn btn--primario"
                disabled={
                  importando ||
                  carregando ||
                  totalSincronizaveis === 0 ||
                  confirmandoSincronizacaoTotal
                }
                onClick={solicitarSincronizacaoTotal}
              >
                Sincronizar todos
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
