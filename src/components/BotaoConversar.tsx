import { gerarLinkWhatsApp } from '../utils/whatsapp'
import './BotaoConversar.css'

const MENSAGEM_TELEFONE_INVALIDO = 'Cadastre um telefone para iniciar uma conversa.'

type BotaoConversarProps = {
  telefone: string
}

export default function BotaoConversar({ telefone }: BotaoConversarProps) {
  const link = gerarLinkWhatsApp(telefone)
  const desabilitado = link === null

  if (desabilitado) {
    return (
      <span className="btn-conversar__wrapper" title={MENSAGEM_TELEFONE_INVALIDO}>
        <button type="button" className="btn btn--whatsapp" disabled aria-disabled="true">
          <span aria-hidden="true">💬</span> Conversar
        </button>
        <span className="btn-conversar__aviso" role="note">
          {MENSAGEM_TELEFONE_INVALIDO}
        </span>
      </span>
    )
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn--whatsapp"
    >
      <span aria-hidden="true">💬</span> Conversar
    </a>
  )
}
