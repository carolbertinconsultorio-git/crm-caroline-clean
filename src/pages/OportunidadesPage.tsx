import { useMemo } from 'react'
import type { Contato } from '../types/contato'
import {
  contarContatosComFiltros,
  PRESET_FILTROS_REATIVACAO,
  type EstadoFiltrosContatos,
} from '../utils/filtrosContatos'
import './OportunidadesPage.css'

type OportunidadeCard = {
  id: string
  icone: string
  titulo: string
  descricao: string
  preset?: EstadoFiltrosContatos
  emBreve?: boolean
}

const CARDS_OPORTUNIDADE: OportunidadeCard[] = [
  {
    id: 'reativacao',
    icone: '❤️',
    titulo: 'Reativação',
    descricao: 'Pacientes inativos elegíveis para campanha de reativação.',
    preset: PRESET_FILTROS_REATIVACAO,
  },
  {
    id: 'indicacao',
    icone: '🤝',
    titulo: 'Indicação',
    descricao: 'Pacientes ativos sem campanha em andamento.',
    emBreve: true,
  },
  {
    id: 'plano-encerrado',
    icone: '📅',
    titulo: 'Plano encerrado',
    descricao: 'Pacientes inativos com data de fim de plano registrada.',
    emBreve: true,
  },
  {
    id: 'follow-ups-atrasados',
    icone: '🔴',
    titulo: 'Follow-ups atrasados',
    descricao: 'Contatos com follow-up pendente antes de hoje.',
    emBreve: true,
  },
]

type OportunidadesPageProps = {
  contatos: Contato[]
  onAbrirContatosComFiltros: (filtros: EstadoFiltrosContatos) => void
}

function formatarContadorOportunidades(quantidade: number): string {
  const rotulo = quantidade === 1 ? 'oportunidade' : 'oportunidades'
  return `${quantidade} ${rotulo}`
}

export default function OportunidadesPage({
  contatos,
  onAbrirContatosComFiltros,
}: OportunidadesPageProps) {
  const contadorReativacao = useMemo(
    () => contarContatosComFiltros(contatos, PRESET_FILTROS_REATIVACAO),
    [contatos],
  )

  return (
    <div className="oportunidades-page">
      <header className="oportunidades-page__cabecalho">
        <h1 className="oportunidades-page__titulo">🎯 Oportunidades</h1>
        <p className="oportunidades-page__subtitulo">
          Atalhos para encontrar contatos com filtros já configurados na lista de Contatos.
        </p>
      </header>

      <div className="oportunidades-page__lista">
        {CARDS_OPORTUNIDADE.map((card) =>
          card.emBreve ? (
            <article
              key={card.id}
              className="oportunidade-card oportunidade-card--em-breve"
              aria-disabled="true"
            >
              <span className="oportunidade-card__icone" aria-hidden="true">
                {card.icone}
              </span>
              <div className="oportunidade-card__conteudo">
                <h2 className="oportunidade-card__titulo">{card.titulo}</h2>
                <p className="oportunidade-card__descricao">{card.descricao}</p>
                <span className="oportunidade-card__badge">Em breve</span>
              </div>
            </article>
          ) : (
            <button
              key={card.id}
              type="button"
              className="oportunidade-card"
              onClick={() => card.preset && onAbrirContatosComFiltros(card.preset)}
            >
              <span className="oportunidade-card__icone" aria-hidden="true">
                {card.icone}
              </span>
              <div className="oportunidade-card__conteudo">
                <h2 className="oportunidade-card__titulo">{card.titulo}</h2>
                <p className="oportunidade-card__contador" aria-live="polite">
                  {formatarContadorOportunidades(contadorReativacao)}
                </p>
                <p className="oportunidade-card__descricao">{card.descricao}</p>
              </div>
            </button>
          ),
        )}
      </div>
    </div>
  )
}
