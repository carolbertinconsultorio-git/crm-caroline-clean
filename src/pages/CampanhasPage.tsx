import { useEffect, useMemo, useState } from 'react'
import CampanhaDetalheDrawer from '../components/CampanhaDetalheDrawer'
import EncerrarCampanhaModal from '../components/EncerrarCampanhaModal'
import { listarCampanhas } from '../services/campanhaService'
import type { OrigemContatos } from '../features/contatos/carregarContatos'
import type { Campanha, StatusCampanha, TipoCampanha } from '../types/campanha'
import type { Contato } from '../types/contato'
import { formatarData } from '../utils/contatoHelpers'
import './CampanhasPage.css'

type CampanhasPageProps = {
  contatos: Contato[]
  origemContatos: OrigemContatos
  onEncerrarCampanhaEntidade: (campanha: Campanha) => Promise<Campanha>
}

const TIPO_LABELS: Record<TipoCampanha, string> = {
  REATIVACAO: 'Reativação',
  INDICACAO: 'Indicação',
  PERSONALIZADA: 'Personalizada',
}

const STATUS_LABELS: Record<StatusCampanha, string> = {
  RASCUNHO: 'Rascunho',
  ATIVA: 'Ativa',
  ENCERRADA: 'Encerrada',
}

function ordenarCampanhas(campanhas: Campanha[]): Campanha[] {
  return [...campanhas].sort((a, b) =>
    (b.criadaEm ?? b.dataInicio ?? '').localeCompare(a.criadaEm ?? a.dataInicio ?? ''),
  )
}

function SecaoCampanhas({
  titulo,
  campanhas,
  onSelecionarCampanha,
}: {
  titulo: string
  campanhas: Campanha[]
  onSelecionarCampanha: (campanha: Campanha) => void
}) {
  if (campanhas.length === 0) return null

  return (
    <section className="campanhas-secao">
      <h2 className="campanhas-secao__titulo">
        {titulo}
        <span className="campanhas-secao__contagem">({campanhas.length})</span>
      </h2>
      <div className="campanhas-secao__lista">
        {campanhas.map((campanha) => (
          <button
            key={campanha.id}
            type="button"
            className={`campanha-card campanha-card--${campanha.status.toLowerCase()}`}
            onClick={() => onSelecionarCampanha(campanha)}
          >
            <header className="campanha-card__cabecalho">
              <h3 className="campanha-card__nome">{campanha.nome}</h3>
              <span className="campanha-card__status">{STATUS_LABELS[campanha.status]}</span>
            </header>
            <dl className="campanha-card__detalhes">
              <div>
                <dt>Tipo</dt>
                <dd>{TIPO_LABELS[campanha.tipo]}</dd>
              </div>
              <div>
                <dt>Início</dt>
                <dd>{campanha.dataInicio ? formatarData(campanha.dataInicio) : '—'}</dd>
              </div>
              {campanha.dataFim && (
                <div>
                  <dt>Fim</dt>
                  <dd>{formatarData(campanha.dataFim)}</dd>
                </div>
              )}
            </dl>
          </button>
        ))}
      </div>
    </section>
  )
}

export default function CampanhasPage({
  contatos,
  origemContatos,
  onEncerrarCampanhaEntidade,
}: CampanhasPageProps) {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<Campanha | null>(null)
  const [modalEncerrarAberto, setModalEncerrarAberto] = useState(false)

  useEffect(() => {
    if (origemContatos !== 'firestore') {
      setCampanhas([])
      setCarregando(false)
      return
    }

    let ativo = true
    setCarregando(true)

    listarCampanhas()
      .then((lista) => {
        if (!ativo) return
        setCampanhas(lista)
      })
      .catch((erro) => {
        console.error('Não foi possível carregar campanhas.', erro)
        if (!ativo) return
        setCampanhas([])
      })
      .finally(() => {
        if (!ativo) return
        setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [origemContatos])

  const { ativas, rascunhos, encerradas } = useMemo(() => {
    const ordenadas = ordenarCampanhas(campanhas)
    return {
      ativas: ordenadas.filter((campanha) => campanha.status === 'ATIVA'),
      rascunhos: ordenadas.filter((campanha) => campanha.status === 'RASCUNHO'),
      encerradas: ordenadas.filter((campanha) => campanha.status === 'ENCERRADA'),
    }
  }, [campanhas])

  const nenhumaCampanha = !carregando && campanhas.length === 0

  const quantidadeParticipantesSelecionada = useMemo(() => {
    if (!campanhaSelecionada) return 0
    return contatos.filter((contato) => contato.campanhaId === campanhaSelecionada.id).length
  }, [contatos, campanhaSelecionada])

  async function confirmarEncerrarCampanha() {
    if (!campanhaSelecionada) return

    const campanhaAtualizada = await onEncerrarCampanhaEntidade(campanhaSelecionada)
    setCampanhas((atual) =>
      atual.map((campanha) => (campanha.id === campanhaAtualizada.id ? campanhaAtualizada : campanha)),
    )
    setCampanhaSelecionada(campanhaAtualizada)
    setModalEncerrarAberto(false)
  }

  return (
    <div className="campanhas-page">
      <header className="campanhas-page__cabecalho">
        <h1 className="campanhas-page__titulo">📣 Campanhas</h1>
        <p className="campanhas-page__subtitulo">
          Visualize as campanhas criadas no CRM.
        </p>
      </header>

      {carregando && (
        <p className="campanhas-page__carregando" role="status" aria-live="polite">
          Carregando campanhas...
        </p>
      )}

      {nenhumaCampanha && (
        <p className="campanhas-page__vazio">Nenhuma campanha criada ainda.</p>
      )}

      {!carregando && campanhas.length > 0 && (
        <div className="campanhas-page__secoes">
          <SecaoCampanhas
            titulo="Ativas"
            campanhas={ativas}
            onSelecionarCampanha={setCampanhaSelecionada}
          />
          <SecaoCampanhas
            titulo="Rascunhos"
            campanhas={rascunhos}
            onSelecionarCampanha={setCampanhaSelecionada}
          />
          <SecaoCampanhas
            titulo="Encerradas"
            campanhas={encerradas}
            onSelecionarCampanha={setCampanhaSelecionada}
          />
        </div>
      )}

      {campanhaSelecionada && (
        <CampanhaDetalheDrawer
          campanha={campanhaSelecionada}
          contatos={contatos}
          onFechar={() => setCampanhaSelecionada(null)}
          onEncerrar={
            campanhaSelecionada.status === 'ATIVA'
              ? () => setModalEncerrarAberto(true)
              : undefined
          }
        />
      )}

      {modalEncerrarAberto && campanhaSelecionada && (
        <EncerrarCampanhaModal
          quantidadeParticipantes={quantidadeParticipantesSelecionada}
          onFechar={() => setModalEncerrarAberto(false)}
          onConfirmar={confirmarEncerrarCampanha}
        />
      )}
    </div>
  )
}
