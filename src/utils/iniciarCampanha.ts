import type { Contato } from '../types/contato'
import { dataRelativa } from './contatoHelpers'

export function aplicarInicioCampanhaReativacao(contato: Contato): Contato {
  return {
    ...contato,
    objetivoFollowUp: 'REATIVACAO',
    dataProximoFollowUp: dataRelativa(0),
  }
}

export function aplicarInicioCampanhaIndicacao(contato: Contato): Contato {
  return {
    ...contato,
    objetivoFollowUp: 'INDICACAO',
    dataProximoFollowUp: dataRelativa(0),
  }
}

export function aplicarEncerrarCampanha(contato: Contato): Contato {
  const contatoAtualizado = { ...contato }
  delete contatoAtualizado.objetivoFollowUp
  return contatoAtualizado
}
