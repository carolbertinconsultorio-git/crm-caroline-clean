import type { Contato } from '../types/contato'
import type { ObjetivoFollowUp } from '../types/objetivoFollowUp'

export function resolverObjetivoFollowUp(contato: Contato): ObjetivoFollowUp {
  return contato.objetivoFollowUp ?? 'LEAD'
}
