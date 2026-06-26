import ContatoCard from '../components/ContatoCard'
import type { Contato } from '../types/contato'
import type { Urgencia } from '../utils/agruparContatos'
import { agruparContatos } from '../utils/agruparContatos'
import { inicioDoDia } from '../utils/contatoHelpers'
import './PainelDia.css'

type PainelDiaProps = {
  contatos: Contato[]
  onAbrirContato: (id: string) => void
  onConcluirFollowUp: (id: string) => void
  onAdiar: (id: string) => void
}

function SecaoContatos({
  titulo,
  descricao,
  contatos,
  urgencia,
  vazio,
  onAbrirContato,
  onConcluirFollowUp,
  onAdiar,
}: {
  titulo: string
  descricao: string
  contatos: Contato[]
  urgencia: Urgencia
  vazio: string
  onAbrirContato: (id: string) => void
  onConcluirFollowUp: (id: string) => void
  onAdiar: (id: string) => void
}) {
  return (
    <section className={`secao secao--${urgencia}`}>
      <header className="secao__cabecalho">
        <h2 className="secao__titulo">{titulo}</h2>
        <p className="secao__descricao">{descricao}</p>
      </header>
      {contatos.length === 0 ? (
        <p className="secao__vazio">{vazio}</p>
      ) : (
        <div className="secao__lista">
          {contatos.map((contato) => (
            <ContatoCard
              key={contato.id}
              contato={contato}
              urgencia={urgencia}
              onAbrirContato={onAbrirContato}
              onConcluirFollowUp={onConcluirFollowUp}
              onAdiar={onAdiar}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default function PainelDia({
  contatos,
  onAbrirContato,
  onConcluirFollowUp,
  onAdiar,
}: PainelDiaProps) {
  const hoje = inicioDoDia(new Date())
  const { atrasados, paraHoje, estaSemana } = agruparContatos(contatos, hoje)

  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="painel">
      <header className="painel__topo">
        <div>
          <h1 className="painel__saudacao">{saudacao}, Caroline</h1>
          <p className="painel__data">{dataFormatada}</p>
        </div>
        <p className="painel__subtitulo">Com quem falar hoje e nos próximos dias</p>
      </header>

      <div className="resumo">
        <div className="resumo__card resumo__card--atrasado">
          <span className="resumo__numero">{atrasados.length}</span>
          <span className="resumo__rotulo">Atrasados</span>
        </div>
        <div className="resumo__card resumo__card--hoje">
          <span className="resumo__numero">{paraHoje.length}</span>
          <span className="resumo__rotulo">Para hoje</span>
        </div>
        <div className="resumo__card resumo__card--semana">
          <span className="resumo__numero">{estaSemana.length}</span>
          <span className="resumo__rotulo">Esta semana</span>
        </div>
      </div>

      <div className="painel__secoes">
        <SecaoContatos
          titulo="Atrasados"
          descricao="Contatos com follow-up pendente"
          contatos={atrasados}
          urgencia="atrasado"
          vazio="Nenhum contato atrasado."
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
        />
        <SecaoContatos
          titulo="Para hoje"
          descricao="Prioridade do dia"
          contatos={paraHoje}
          urgencia="hoje"
          vazio="Nenhum follow-up para hoje."
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
        />
        <SecaoContatos
          titulo="Próximos dias"
          descricao="Follow-ups nos próximos 7 dias"
          contatos={estaSemana}
          urgencia="semana"
          vazio="Nenhum follow-up nesta semana."
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
        />
      </div>
    </div>
  )
}
