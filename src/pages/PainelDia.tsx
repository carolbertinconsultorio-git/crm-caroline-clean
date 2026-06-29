import { useState } from 'react'
import ContatoCard from '../components/ContatoCard'
import type { Contato } from '../types/contato'
import type { Urgencia } from '../utils/agruparContatos'
import { agruparContatos } from '../utils/agruparContatos'
import { inicioDoDia } from '../utils/contatoHelpers'
import './PainelDia.css'

type SecaoId = 'atrasados' | 'hoje' | 'semana' | 'aguardando'

type PainelDiaProps = {
  contatos: Contato[]
  onAbrirContato: (id: string) => void
  onConcluirFollowUp: (id: string) => void
  onAdiar: (id: string) => void
  onMensagemEnviada: (id: string) => void
  onDesfazerEnvio: (id: string) => void
}

function estadoInicialSecoes(contatos: Contato[], hoje: Date): Record<SecaoId, boolean> {
  const { estaSemana, aguardandoResposta } = agruparContatos(contatos, hoje)

  return {
    atrasados: true,
    hoje: true,
    semana: estaSemana.length > 0,
    aguardando: aguardandoResposta.length > 0,
  }
}

function SecaoContatos({
  titulo,
  descricao,
  contatos,
  urgencia,
  vazio,
  aberta,
  onAlternar,
  onAbrirContato,
  onConcluirFollowUp,
  onAdiar,
  onMensagemEnviada,
  onDesfazerEnvio,
}: {
  titulo: string
  descricao: string
  contatos: Contato[]
  urgencia: Urgencia
  vazio: string
  aberta: boolean
  onAlternar: () => void
  onAbrirContato: (id: string) => void
  onConcluirFollowUp: (id: string) => void
  onAdiar: (id: string) => void
  onMensagemEnviada?: (id: string) => void
  onDesfazerEnvio?: (id: string) => void
}) {
  return (
    <section className={`secao secao--${urgencia}${aberta ? '' : ' secao--recolhida'}`}>
      <header className="secao__cabecalho">
        <h2 className="secao__titulo">
          <button
            type="button"
            className="secao__toggle"
            onClick={onAlternar}
            aria-expanded={aberta}
          >
            <span className="secao__toggle-texto">
              {titulo}
              <span className="secao__contagem">({contatos.length})</span>
            </span>
            <span className="secao__icone" aria-hidden="true">
              {aberta ? '˄' : '˅'}
            </span>
          </button>
        </h2>
        {aberta && <p className="secao__descricao">{descricao}</p>}
      </header>
      {aberta &&
        (contatos.length === 0 ? (
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
                onMensagemEnviada={onMensagemEnviada}
                onDesfazerEnvio={onDesfazerEnvio}
              />
            ))}
          </div>
        ))}
    </section>
  )
}

export default function PainelDia({
  contatos,
  onAbrirContato,
  onConcluirFollowUp,
  onAdiar,
  onMensagemEnviada,
  onDesfazerEnvio,
}: PainelDiaProps) {
  const hoje = inicioDoDia(new Date())
  const { atrasados, paraHoje, estaSemana, aguardandoResposta } = agruparContatos(contatos, hoje)

  const [secoesAbertas, setSecoesAbertas] = useState(() => estadoInicialSecoes(contatos, hoje))

  function alternarSecao(id: SecaoId) {
    setSecoesAbertas((atual) => ({ ...atual, [id]: !atual[id] }))
  }

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
          aberta={secoesAbertas.atrasados}
          onAlternar={() => alternarSecao('atrasados')}
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
          onMensagemEnviada={onMensagemEnviada}
        />
        <SecaoContatos
          titulo="Para hoje"
          descricao="Prioridade do dia"
          contatos={paraHoje}
          urgencia="hoje"
          vazio="Nenhum follow-up para hoje."
          aberta={secoesAbertas.hoje}
          onAlternar={() => alternarSecao('hoje')}
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
          onMensagemEnviada={onMensagemEnviada}
        />
        <SecaoContatos
          titulo="Aguardando resposta"
          descricao="Mensagem enviada — aguardando retorno"
          contatos={aguardandoResposta}
          urgencia="aguardando"
          vazio="Nenhum contato aguardando resposta."
          aberta={secoesAbertas.aguardando}
          onAlternar={() => alternarSecao('aguardando')}
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
          onDesfazerEnvio={onDesfazerEnvio}
        />
        <SecaoContatos
          titulo="Próximos dias"
          descricao="Follow-ups nos próximos 7 dias"
          contatos={estaSemana}
          urgencia="semana"
          vazio="Nenhum follow-up nesta semana."
          aberta={secoesAbertas.semana}
          onAlternar={() => alternarSecao('semana')}
          onAbrirContato={onAbrirContato}
          onConcluirFollowUp={onConcluirFollowUp}
          onAdiar={onAdiar}
          onMensagemEnviada={onMensagemEnviada}
        />
      </div>
    </div>
  )
}
