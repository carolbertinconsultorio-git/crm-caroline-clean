import { useEffect, useMemo, useState } from 'react'
import ContatoCard from '../components/ContatoCard'
import InteligenciaComercialFiltros from '../components/InteligenciaComercialFiltros'
import IniciarCampanhaReativacaoLoteModal from '../components/IniciarCampanhaReativacaoLoteModal'
import type { Contato } from '../types/contato'
import type { ResultadoCampanhaReativacaoLote } from '../utils/iniciarCampanhaLote'
import { STATUS_LABELS, TODOS_OS_STATUS } from '../utils/contatoHelpers'
import {
  filtrosInteligenciaComercialAtivos,
} from '../utils/filtroInteligenciaComercial'
import { filtrosExtrasContatosAtivos } from '../utils/filtrosExtrasContatos'
import {
  ESTADO_FILTROS_CONTATOS_INICIAL,
  filtrarContatos,
  type EstadoFiltrosContatos,
  type FiltroStatusContatos,
} from '../utils/filtrosContatos'
import './ContatosPage.css'

type ContatosPageProps = {
  contatos: Contato[]
  onAbrirContato: (id: string) => void
  onConcluirFollowUp: (id: string) => void
  onAdiar: (id: string) => void
  onNovoContato: () => void
  onAbrirImportacaoLiveClin: () => void
  onIniciarCampanhaReativacaoLote: (ids: string[]) => Promise<ResultadoCampanhaReativacaoLote>
  presetFiltros?: EstadoFiltrosContatos | null
  onPresetFiltrosAplicado?: () => void
}

export default function ContatosPage({
  contatos,
  onAbrirContato,
  onConcluirFollowUp,
  onAdiar,
  onNovoContato,
  onAbrirImportacaoLiveClin,
  onIniciarCampanhaReativacaoLote,
  presetFiltros = null,
  onPresetFiltrosAplicado,
}: ContatosPageProps) {
  const [busca, setBusca] = useState(ESTADO_FILTROS_CONTATOS_INICIAL.busca)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatusContatos>(
    ESTADO_FILTROS_CONTATOS_INICIAL.filtroStatus,
  )
  const [filtrosInteligencia, setFiltrosInteligencia] = useState(
    ESTADO_FILTROS_CONTATOS_INICIAL.filtrosInteligencia,
  )
  const [filtrosExtras, setFiltrosExtras] = useState(ESTADO_FILTROS_CONTATOS_INICIAL.filtrosExtras)
  const [idsSelecionados, setIdsSelecionados] = useState<Set<string>>(() => new Set())
  const [modalCampanhaReativacaoLoteAberto, setModalCampanhaReativacaoLoteAberto] =
    useState(false)
  const [contatosCampanhaLote, setContatosCampanhaLote] = useState<Contato[]>([])
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false)

  const filtrosAvancadosAtivos =
    filtrosInteligenciaComercialAtivos(filtrosInteligencia) ||
    filtrosExtrasContatosAtivos(filtrosExtras)

  useEffect(() => {
    if (!presetFiltros) return

    setBusca(presetFiltros.busca)
    setFiltroStatus(presetFiltros.filtroStatus)
    setFiltrosInteligencia(presetFiltros.filtrosInteligencia)
    setFiltrosExtras(presetFiltros.filtrosExtras)

    if (
      filtrosInteligenciaComercialAtivos(presetFiltros.filtrosInteligencia) ||
      filtrosExtrasContatosAtivos(presetFiltros.filtrosExtras)
    ) {
      setFiltrosAvancadosAbertos(true)
    }

    onPresetFiltrosAplicado?.()
  }, [presetFiltros, onPresetFiltrosAplicado])

  const contatosFiltrados = useMemo(
    () =>
      filtrarContatos(contatos, {
        busca,
        filtroStatus,
        filtrosInteligencia,
        filtrosExtras,
      }),
    [contatos, busca, filtroStatus, filtrosInteligencia, filtrosExtras],
  )

  const idsFiltrados = useMemo(
    () => new Set(contatosFiltrados.map((contato) => contato.id)),
    [contatosFiltrados],
  )

  useEffect(() => {
    setIdsSelecionados((anterior) => {
      const ajustado = new Set([...anterior].filter((id) => idsFiltrados.has(id)))
      return ajustado.size === anterior.size ? anterior : ajustado
    })
  }, [idsFiltrados])

  function alternarSelecao(id: string) {
    setIdsSelecionados((anterior) => {
      const proximo = new Set(anterior)
      if (proximo.has(id)) {
        proximo.delete(id)
      } else {
        proximo.add(id)
      }
      return proximo
    })
  }

  function selecionarTodosDaBusca() {
    setIdsSelecionados(new Set(contatosFiltrados.map((contato) => contato.id)))
  }

  function limparSelecao() {
    setIdsSelecionados(new Set())
  }

  const contatosSelecionados = useMemo(
    () => contatos.filter((contato) => idsSelecionados.has(contato.id)),
    [contatos, idsSelecionados],
  )

  const quantidadeSelecionados = idsSelecionados.size

  async function confirmarCampanhaReativacaoLote() {
    const resultado = await onIniciarCampanhaReativacaoLote(
      contatosCampanhaLote.map((contato) => contato.id),
    )
    limparSelecao()
    return resultado
  }

  function abrirModalCampanhaReativacaoLote() {
    setContatosCampanhaLote(contatosSelecionados)
    setModalCampanhaReativacaoLoteAberto(true)
  }

  return (
    <div className="contatos-page">
      <header className="contatos-page__cabecalho">
        <div>
          <h1 className="contatos-page__titulo">Contatos</h1>
          <p className="contatos-page__subtitulo">
            {contatosFiltrados.length} de {contatos.length} contatos
          </p>
        </div>
        <div className="contatos-page__acoes">
          <button
            type="button"
            className="btn btn--secundario"
            onClick={onAbrirImportacaoLiveClin}
          >
            Importar LiveClin
          </button>
          <button type="button" className="btn btn--primario" onClick={onNovoContato}>
            Novo Contato
          </button>
        </div>
      </header>

      <section className="contatos-page__filtros-gerais" aria-labelledby="filtros-gerais-titulo">
        <h2 id="filtros-gerais-titulo" className="contatos-page__filtros-titulo">
          🔎 Filtros gerais
        </h2>
        <div className="contatos-page__filtros">
          <label className="campo campo--busca">
            <span className="campo__rotulo">Pesquisar</span>
            <input
              type="search"
              className="campo__input"
              placeholder="Nome, telefone ou origem..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>

          <label className="campo campo--filtro">
            <span className="campo__rotulo">Status</span>
            <select
              className="campo__input"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as FiltroStatusContatos)}
            >
              <option value="TODOS">Todos os status</option>
              {TODOS_OS_STATUS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <hr className="contatos-page__filtros-separador" aria-hidden="true" />

      <InteligenciaComercialFiltros
        filtros={filtrosInteligencia}
        onAlterarFiltros={setFiltrosInteligencia}
        aberto={filtrosAvancadosAbertos}
        onAlternarAberto={() => setFiltrosAvancadosAbertos((aberto) => !aberto)}
        filtrosAtivos={filtrosAvancadosAtivos}
      />

      <hr className="contatos-page__filtros-separador" aria-hidden="true" />

      {contatosFiltrados.length > 0 && (
        <div className="contatos-page__selecao" aria-live="polite">
          <p className="contatos-page__selecao-contador">
            {quantidadeSelecionados}{' '}
            {quantidadeSelecionados === 1 ? 'contato selecionado' : 'contatos selecionados'}
          </p>
          <div className="contatos-page__selecao-acoes">
            <button
              type="button"
              className="btn btn--primario"
              disabled={quantidadeSelecionados === 0}
              onClick={abrirModalCampanhaReativacaoLote}
            >
              ❤️ Iniciar campanha de reativação
            </button>
            <button
              type="button"
              className="btn btn--secundario"
              onClick={selecionarTodosDaBusca}
            >
              Selecionar todos desta busca
            </button>
            <button
              type="button"
              className="btn btn--secundario"
              onClick={limparSelecao}
              disabled={quantidadeSelecionados === 0}
            >
              Limpar seleção
            </button>
          </div>
        </div>
      )}

      {contatosFiltrados.length === 0 ? (
        <p className="contatos-page__vazio">
          {filtrosInteligencia.nuncaReativar
            ? 'Nenhum paciente inativo sem tentativa de reativação foi encontrado.'
            : filtrosInteligenciaComercialAtivos(filtrosInteligencia)
              ? 'Nenhum contato encontrado com os filtros de Inteligência Comercial.'
              : 'Nenhum contato encontrado com esses filtros.'}
        </p>
      ) : (
        <div className="contatos-page__lista">
          {contatosFiltrados.map((contato) => (
            <ContatoCard
              key={contato.id}
              contato={contato}
              urgencia="semana"
              onAbrirContato={onAbrirContato}
              onConcluirFollowUp={onConcluirFollowUp}
              onAdiar={onAdiar}
              compacto
              selecionavel
              selecionado={idsSelecionados.has(contato.id)}
              onAlternarSelecao={alternarSelecao}
            />
          ))}
        </div>
      )}

      {modalCampanhaReativacaoLoteAberto && (
        <IniciarCampanhaReativacaoLoteModal
          contatos={contatosCampanhaLote}
          onFechar={() => setModalCampanhaReativacaoLoteAberto(false)}
          onConfirmar={confirmarCampanhaReativacaoLote}
        />
      )}
    </div>
  )
}
