import { useEffect, useRef, useState } from 'react'
import AdiarFollowUpModal from './components/AdiarFollowUpModal'
import ConcluirFollowUpModal from './components/ConcluirFollowUpModal'
import ContatoDrawer from './components/ContatoDrawer'
import ImportacaoLiveClinModal from './components/ImportacaoLiveClinModal'
import IniciarCampanhaModal from './components/IniciarCampanhaModal'
import NovoContatoModal from './components/NovoContatoModal'
import RemoverContatoModal from './components/RemoverContatoModal'
import { carregarContatos, type OrigemContatos } from './features/contatos/carregarContatos'
import { useAuth } from './hooks/useAuth'
import { atualizarContato, criarContato, removerContato } from './services/contatoService'
import AppLayout from './layouts/AppLayout'
import type { TelaAtiva } from './components/Sidebar'
import AcessoNegadoPage from './pages/AcessoNegadoPage'
import AuthCarregandoPage from './pages/AuthCarregandoPage'
import ContatosPage from './pages/ContatosPage'
import LoginPage from './pages/LoginPage'
import OportunidadesPage from './pages/OportunidadesPage'
import CampanhasPage from './pages/CampanhasPage'
import PainelDia from './pages/PainelDia'
import type { Contato } from './types/contato'
import { aplicarEncerrarCampanha, aplicarInicioCampanhaIndicacao, aplicarInicioCampanhaReativacao } from './utils/iniciarCampanha'
import {
  aplicarAtualizacaoCampanha,
  classificarContatosParaCampanhaReativacaoLote,
  NOME_CAMPANHA_REATIVACAO,
  prepararContatosCampanhaReativacaoLote,
  registrarCampanhaIniciada,
  resultadoCampanhaReativacaoLote,
  type DadosAtualizacaoCampanha,
  type ResultadoCampanhaReativacaoLote,
} from './utils/iniciarCampanhaLote'
import type { ConfiguracaoNovaCampanha } from './types/configuracaoCampanha'
import type { EstadoFiltrosContatos } from './utils/filtrosContatos'
import { criarCampanhaEntidadeEmFirestore } from './utils/criarCampanhaEntidade'

function gerarIdMockLocal(contatos: Contato[]): string {
  const idsNumericos = contatos
    .map((contato) => Number(contato.id))
    .filter((id) => !Number.isNaN(id))

  const proximoId =
    idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : contatos.length + 1

  return String(proximoId)
}

function contatoParaDadosFirestore(contato: Contato): Omit<Contato, 'id'> {
  const dados: Omit<Contato, 'id'> = {
    nome: contato.nome,
    telefone: contato.telefone,
    origem: contato.origem,
    status: contato.status,
    dataPrimeiroContato: contato.dataPrimeiroContato,
    dataUltimoContato: contato.dataUltimoContato,
    dataProximoFollowUp: contato.dataProximoFollowUp,
  }

  if (contato.plano !== undefined) {
    dados.plano = contato.plano
  }

  if (contato.email !== undefined) {
    dados.email = contato.email
  }

  if (contato.statusLiveClin !== undefined) {
    dados.statusLiveClin = contato.statusLiveClin
  }

  if (contato.dataFimPlano !== undefined) {
    dados.dataFimPlano = contato.dataFimPlano
  }

  if (contato.diasRestantes !== undefined) {
    dados.diasRestantes = contato.diasRestantes
  }

  if (contato.observacoes !== undefined) {
    dados.observacoes = contato.observacoes
  }

  if (contato.objetivoFollowUp !== undefined) {
    dados.objetivoFollowUp = contato.objetivoFollowUp
  }

  if (contato.ultimaReativacaoEm !== undefined) {
    dados.ultimaReativacaoEm = contato.ultimaReativacaoEm
  }

  if (contato.ultimoResultadoReativacao !== undefined) {
    dados.ultimoResultadoReativacao = contato.ultimoResultadoReativacao
  }

  if (contato.campanhaNome !== undefined) {
    dados.campanhaNome = contato.campanhaNome
  }

  if (contato.campanhaIniciadaEm !== undefined) {
    dados.campanhaIniciadaEm = contato.campanhaIniciadaEm
  }

  if (contato.campanhaMensagem !== undefined) {
    dados.campanhaMensagem = contato.campanhaMensagem
  }

  if (contato.campanhaId !== undefined) {
    dados.campanhaId = contato.campanhaId
  }

  if (contato.aguardandoRespostaDesde !== undefined) {
    dados.aguardandoRespostaDesde = contato.aguardandoRespostaDesde
  }

  return dados
}

function App() {
  const { status, usuario, erroLogin, entrando, entrarComGoogle, sair } = useAuth()
  const [contatos, setContatos] = useState<Contato[]>([])
  const [origemContatos, setOrigemContatos] = useState<OrigemContatos>('firestore')
  const [carregandoContatos, setCarregandoContatos] = useState(true)
  const [erroCarregamentoContatos, setErroCarregamentoContatos] = useState<string | null>(
    null,
  )
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>('hoje')
  const [presetFiltrosContatos, setPresetFiltrosContatos] = useState<EstadoFiltrosContatos | null>(
    null,
  )
  const [contatoSelecionadoId, setContatoSelecionadoId] = useState<string | null>(null)
  const [followUpContatoId, setFollowUpContatoId] = useState<string | null>(null)
  const [adiarContatoId, setAdiarContatoId] = useState<string | null>(null)
  const [modalNovoContatoAberto, setModalNovoContatoAberto] = useState(false)
  const [importacaoLiveClinAberta, setImportacaoLiveClinAberta] = useState(false)
  const [removerContatoId, setRemoverContatoId] = useState<string | null>(null)
  const [iniciarCampanhaContatoId, setIniciarCampanhaContatoId] = useState<string | null>(null)
  const criandoContatoRef = useRef(false)

  const contatoSelecionado =
    contatoSelecionadoId !== null
      ? contatos.find((c) => c.id === contatoSelecionadoId) ?? null
      : null

  const contatoFollowUp =
    followUpContatoId !== null
      ? contatos.find((c) => c.id === followUpContatoId) ?? null
      : null

  const contatoAdiar =
    adiarContatoId !== null
      ? contatos.find((c) => c.id === adiarContatoId) ?? null
      : null

  const contatoRemover =
    removerContatoId !== null
      ? contatos.find((c) => c.id === removerContatoId) ?? null
      : null

  const contatoIniciarCampanha =
    iniciarCampanhaContatoId !== null
      ? contatos.find((c) => c.id === iniciarCampanhaContatoId) ?? null
      : null

  useEffect(() => {
    if (status !== 'autorizado') return

    let ativo = true
    setCarregandoContatos(true)
    setErroCarregamentoContatos(null)

    carregarContatos().then(({ contatos: contatosCarregados, origem, erroCarregamento }) => {
      if (!ativo) return
      setContatos(contatosCarregados)
      setOrigemContatos(origem)
      setErroCarregamentoContatos(erroCarregamento ?? null)
      setCarregandoContatos(false)
    })

    return () => {
      ativo = false
    }
  }, [status])

  function abrirContato(id: string) {
    setContatoSelecionadoId(id)
  }

  function abrirContatosComFiltros(filtros: EstadoFiltrosContatos) {
    setPresetFiltrosContatos(filtros)
    setTelaAtiva('contatos')
  }

  function limparPresetFiltrosContatos() {
    setPresetFiltrosContatos(null)
  }

  function fecharContato() {
    setContatoSelecionadoId(null)
  }

  function abrirConcluirFollowUp(id: string) {
    setFollowUpContatoId(id)
  }

  function fecharConcluirFollowUp() {
    setFollowUpContatoId(null)
  }

  function aplicarContatoAtualizado(contatoAtualizado: Contato) {
    const contatoAnterior = contatos.find((c) => c.id === contatoAtualizado.id)

    setContatos((atual) =>
      atual.map((c) => (c.id === contatoAtualizado.id ? contatoAtualizado : c)),
    )

    if (origemContatos !== 'firestore') return

    const dados = contatoParaDadosFirestore(contatoAtualizado)
    const payload =
      contatoAnterior?.observacoes && !contatoAtualizado.observacoes
        ? { ...dados, observacoes: null }
        : dados

    atualizarContato(contatoAtualizado.id, payload).catch((erro) => {
      console.error('Não foi possível salvar contato no Firestore.', erro)
    })
  }

  function confirmarFollowUp(contatoAtualizado: Contato) {
    aplicarContatoAtualizado(contatoAtualizado)
    fecharConcluirFollowUp()
  }

  function abrirAdiar(id: string) {
    setAdiarContatoId(id)
  }

  function fecharAdiar() {
    setAdiarContatoId(null)
  }

  function confirmarAdiar(contatoAtualizado: Contato) {
    aplicarContatoAtualizado(contatoAtualizado)
    fecharAdiar()
  }

  function marcarMensagemEnviada(id: string) {
    const aguardandoRespostaDesde = new Date().toISOString()

    setContatos((atual) =>
      atual.map((contato) =>
        contato.id === id ? { ...contato, aguardandoRespostaDesde } : contato,
      ),
    )

    if (origemContatos !== 'firestore') return

    atualizarContato(id, { aguardandoRespostaDesde }).catch((erro) => {
      console.error('Não foi possível marcar mensagem enviada no Firestore.', erro)
    })
  }

  function desfazerMensagemEnviada(id: string) {
    setContatos((atual) =>
      atual.map((contato) => {
        if (contato.id !== id) return contato
        const { aguardandoRespostaDesde: _, ...resto } = contato
        return resto
      }),
    )

    if (origemContatos !== 'firestore') return

    atualizarContato(id, { aguardandoRespostaDesde: null }).catch((erro) => {
      console.error('Não foi possível desfazer mensagem enviada no Firestore.', erro)
    })
  }

  function salvarContato(contatoAtualizado: Contato) {
    aplicarContatoAtualizado(contatoAtualizado)
  }

  async function removerContatoDoCrm(id: string): Promise<void> {
    if (!id) {
      throw new Error('Contato sem identificador.')
    }

    if (origemContatos === 'firestore') {
      await removerContato(id)
    }

    setContatos((atual) => atual.filter((contato) => contato.id !== id))
    setRemoverContatoId(null)
    fecharContato()
  }

  function solicitarRemoverContato(id: string) {
    setRemoverContatoId(id)
  }

  function fecharModalRemoverContato() {
    setRemoverContatoId(null)
  }

  function abrirIniciarCampanha(id: string) {
    setIniciarCampanhaContatoId(id)
  }

  function fecharIniciarCampanha() {
    setIniciarCampanhaContatoId(null)
  }

  function confirmarIniciarCampanha(config: ConfiguracaoNovaCampanha) {
    if (!contatoIniciarCampanha) return

    const mensagem = config.campanhaMensagem.trim() || undefined
    const nome =
      config.campanhaNome.trim() ||
      (config.tipo === 'REATIVACAO' ? NOME_CAMPANHA_REATIVACAO : 'Campanha personalizada')

    if (config.tipo === 'REATIVACAO') {
      aplicarContatoAtualizado(
        registrarCampanhaIniciada(
          aplicarInicioCampanhaReativacao(contatoIniciarCampanha),
          nome,
          mensagem,
        ),
      )
    } else if (config.tipo === 'PERSONALIZADA') {
      aplicarContatoAtualizado(
        registrarCampanhaIniciada(contatoIniciarCampanha, nome, mensagem),
      )
    } else if (config.tipo === 'INDICACAO') {
      aplicarContatoAtualizado(aplicarInicioCampanhaIndicacao(contatoIniciarCampanha))
    }

    fecharIniciarCampanha()
  }

  async function confirmarIniciarCampanhaReativacaoLote(
    ids: string[],
    config?: ConfiguracaoNovaCampanha,
  ): Promise<ResultadoCampanhaReativacaoLote> {
    const selecionados = contatos.filter((contato) => ids.includes(contato.id))
    const classificacao = classificarContatosParaCampanhaReativacaoLote(selecionados)
    let contatosParaSalvar = prepararContatosCampanhaReativacaoLote(classificacao.validos, {
      campanhaNome: config?.campanhaNome,
      campanhaMensagem: config?.campanhaMensagem,
    })

    if (contatosParaSalvar.length > 0) {
      const configCampanha: ConfiguracaoNovaCampanha = config ?? {
        tipo: 'REATIVACAO',
        campanhaNome: NOME_CAMPANHA_REATIVACAO,
        campanhaMensagem: '',
      }
      const campanha = await criarCampanhaEntidadeEmFirestore(configCampanha, origemContatos)
      if (campanha) {
        contatosParaSalvar = contatosParaSalvar.map((contato) => ({
          ...contato,
          campanhaId: campanha.id,
        }))
      }
    }

    const idsAtualizados = new Set(contatosParaSalvar.map((contato) => contato.id))

    setContatos((atual) =>
      atual.map((contato) => {
        if (!idsAtualizados.has(contato.id)) return contato
        return contatosParaSalvar.find((atualizado) => atualizado.id === contato.id) ?? contato
      }),
    )

    if (origemContatos === 'firestore') {
      await Promise.all(
        contatosParaSalvar.map((contato) =>
          atualizarContato(contato.id, contatoParaDadosFirestore(contato)).catch((erro) => {
            console.error(
              'Não foi possível iniciar campanha de reativação no Firestore.',
              contato.id,
              erro,
            )
          }),
        ),
      )
    }

    return resultadoCampanhaReativacaoLote(classificacao)
  }

  async function confirmarCampanhaPersonalizadaLote(
    ids: string[],
    config: ConfiguracaoNovaCampanha,
  ): Promise<void> {
    const selecionados = contatos.filter((contato) => ids.includes(contato.id))
    const nome = config.campanhaNome.trim() || 'Campanha personalizada'
    const mensagem = config.campanhaMensagem.trim() || undefined
    let contatosParaSalvar = selecionados.map((contato) =>
      registrarCampanhaIniciada(contato, nome, mensagem),
    )

    if (contatosParaSalvar.length > 0) {
      const campanha = await criarCampanhaEntidadeEmFirestore(config, origemContatos)
      if (campanha) {
        contatosParaSalvar = contatosParaSalvar.map((contato) => ({
          ...contato,
          campanhaId: campanha.id,
        }))
      }
    }

    const idsAtualizados = new Set(contatosParaSalvar.map((contato) => contato.id))

    setContatos((atual) =>
      atual.map((contato) => {
        if (!idsAtualizados.has(contato.id)) return contato
        return contatosParaSalvar.find((atualizado) => atualizado.id === contato.id) ?? contato
      }),
    )

    if (origemContatos === 'firestore') {
      await Promise.all(
        contatosParaSalvar.map((contato) =>
          atualizarContato(contato.id, contatoParaDadosFirestore(contato)).catch((erro) => {
            console.error(
              'Não foi possível registrar campanha personalizada no Firestore.',
              contato.id,
              erro,
            )
          }),
        ),
      )
    }
  }

  async function confirmarAtualizarCampanhaLote(
    ids: string[],
    dados: DadosAtualizacaoCampanha,
  ): Promise<void> {
    const selecionados = contatos.filter((contato) => ids.includes(contato.id))
    const contatosAtualizados = selecionados.map((contato) =>
      aplicarAtualizacaoCampanha(contato, dados),
    )
    const idsAtualizados = new Set(contatosAtualizados.map((contato) => contato.id))

    setContatos((atual) =>
      atual.map((contato) => {
        if (!idsAtualizados.has(contato.id)) return contato
        return contatosAtualizados.find((atualizado) => atualizado.id === contato.id) ?? contato
      }),
    )

    if (origemContatos !== 'firestore') return

    await Promise.all(
      contatosAtualizados.map((contato) =>
        atualizarContato(contato.id, {
          campanhaNome: contato.campanhaNome,
          campanhaMensagem: contato.campanhaMensagem ?? null,
        }).catch((erro) => {
          console.error(
            'Não foi possível atualizar campanha no Firestore.',
            contato.id,
            erro,
          )
        }),
      ),
    )
  }

  function encerrarCampanha(contato: Contato) {
    const contatoAtualizado = aplicarEncerrarCampanha(contato)

    setContatos((atual) =>
      atual.map((c) => (c.id === contatoAtualizado.id ? contatoAtualizado : c)),
    )

    if (origemContatos !== 'firestore') return

    atualizarContato(contato.id, { objetivoFollowUp: null }).catch((erro) => {
      console.error('Não foi possível encerrar a campanha no Firestore.', erro)
    })
  }

  function abrirModalNovoContato() {
    setModalNovoContatoAberto(true)
  }

  function fecharModalNovoContato() {
    criandoContatoRef.current = false
    setModalNovoContatoAberto(false)
  }

  function confirmarNovoContato(dados: Omit<Contato, 'id'>): Promise<void> {
    if (criandoContatoRef.current) {
      return Promise.resolve()
    }

    criandoContatoRef.current = true

    if (origemContatos === 'firestore') {
      return criarContato(dados)
        .then((contato) => {
          setContatos((atual) => [...atual, contato])
          fecharModalNovoContato()
        })
        .catch((erro) => {
          criandoContatoRef.current = false
          console.error('Não foi possível criar contato no Firestore.', erro)
          throw erro
        })
    }

    setContatos((atual) => [
      ...atual,
      { id: gerarIdMockLocal(atual), ...dados },
    ])
    fecharModalNovoContato()
    return Promise.resolve()
  }

  function fecharImportacaoLiveClin() {
    setImportacaoLiveClinAberta(false)
  }

  function abrirImportacaoLiveClin() {
    setImportacaoLiveClinAberta(true)
  }

  async function recarregarContatosCrm() {
    const { contatos: contatosCarregados, origem, erroCarregamento } = await carregarContatos()
    setContatos(contatosCarregados)
    setOrigemContatos(origem)
    setErroCarregamentoContatos(erroCarregamento ?? null)
  }

  if (status === 'carregando') {
    return <AuthCarregandoPage />
  }

  if (status === 'nao_logado') {
    return (
      <LoginPage
        onEntrar={entrarComGoogle}
        entrando={entrando}
        erro={erroLogin}
      />
    )
  }

  if (status === 'nao_autorizado') {
    return <AcessoNegadoPage email={usuario?.email ?? null} onSair={sair} />
  }

  if (carregandoContatos) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="status"
        aria-live="polite"
      >
        Carregando contatos...
      </div>
    )
  }

  if (erroCarregamentoContatos) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          textAlign: 'center',
        }}
        role="alert"
      >
        {erroCarregamentoContatos}
      </div>
    )
  }

  return (
    <>
      <AppLayout telaAtiva={telaAtiva} onNavegar={setTelaAtiva} onSair={sair}>
        {telaAtiva === 'hoje' && (
          <PainelDia
            contatos={contatos}
            onAbrirContato={abrirContato}
            onConcluirFollowUp={abrirConcluirFollowUp}
            onAdiar={abrirAdiar}
            onMensagemEnviada={marcarMensagemEnviada}
            onDesfazerEnvio={desfazerMensagemEnviada}
          />
        )}
        {telaAtiva === 'contatos' && (
          <ContatosPage
            contatos={contatos}
            onAbrirContato={abrirContato}
            onConcluirFollowUp={abrirConcluirFollowUp}
            onAdiar={abrirAdiar}
            onNovoContato={abrirModalNovoContato}
            onAbrirImportacaoLiveClin={abrirImportacaoLiveClin}
            onIniciarCampanhaReativacaoLote={confirmarIniciarCampanhaReativacaoLote}
            onRegistrarCampanhaPersonalizadaLote={confirmarCampanhaPersonalizadaLote}
            onAtualizarCampanhaLote={confirmarAtualizarCampanhaLote}
            presetFiltros={presetFiltrosContatos}
            onPresetFiltrosAplicado={limparPresetFiltrosContatos}
          />
        )}
        {telaAtiva === 'campanhas' && (
          <CampanhasPage origemContatos={origemContatos} />
        )}
        {telaAtiva === 'oportunidades' && (
          <OportunidadesPage
            contatos={contatos}
            onAbrirContatosComFiltros={abrirContatosComFiltros}
          />
        )}
      </AppLayout>

      {contatoSelecionado && (
        <ContatoDrawer
          contato={contatoSelecionado}
          onFechar={fecharContato}
          onConcluirFollowUp={() => abrirConcluirFollowUp(contatoSelecionado.id)}
          onAdiar={() => abrirAdiar(contatoSelecionado.id)}
          onIniciarCampanha={() => abrirIniciarCampanha(contatoSelecionado.id)}
          onEncerrarCampanha={() => encerrarCampanha(contatoSelecionado)}
          onSalvar={salvarContato}
          onSolicitarRemover={() => solicitarRemoverContato(contatoSelecionado.id)}
        />
      )}

      {contatoIniciarCampanha && (
        <IniciarCampanhaModal
          contato={contatoIniciarCampanha}
          onFechar={fecharIniciarCampanha}
          onConfirmar={confirmarIniciarCampanha}
        />
      )}

      {contatoRemover && (
        <RemoverContatoModal
          contato={contatoRemover}
          onFechar={fecharModalRemoverContato}
          onConfirmar={() => removerContatoDoCrm(contatoRemover.id)}
        />
      )}

      {contatoAdiar && (
        <AdiarFollowUpModal
          contato={contatoAdiar}
          onFechar={fecharAdiar}
          onConfirmar={confirmarAdiar}
        />
      )}

      {contatoFollowUp && (
        <ConcluirFollowUpModal
          contato={contatoFollowUp}
          onFechar={fecharConcluirFollowUp}
          onConfirmar={confirmarFollowUp}
        />
      )}

      {importacaoLiveClinAberta && (
        <ImportacaoLiveClinModal
          onFechar={fecharImportacaoLiveClin}
          onContatosAtualizados={recarregarContatosCrm}
        />
      )}

      {modalNovoContatoAberto && (
        <NovoContatoModal
          onFechar={fecharModalNovoContato}
          onCriar={confirmarNovoContato}
        />
      )}
    </>
  )
}

export default App
