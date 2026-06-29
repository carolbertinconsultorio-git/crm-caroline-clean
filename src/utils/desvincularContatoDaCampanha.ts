import type { Contato } from '../types/contato'
import { aplicarEncerrarCampanha } from './iniciarCampanha'

export function desvincularContatoDaCampanha(contato: Contato): Contato {
  const contatoAtualizado = aplicarEncerrarCampanha(contato)
  delete contatoAtualizado.campanhaId
  delete contatoAtualizado.aguardandoRespostaDesde
  return contatoAtualizado
}
