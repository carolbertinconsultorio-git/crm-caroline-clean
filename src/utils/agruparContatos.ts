import type { Contato } from '../types/contato'
import { inicioDoDia, parseData } from '../utils/contatoHelpers'

export type Urgencia = 'atrasado' | 'hoje' | 'semana'

export function contatoEstaFollowUpAtrasado(contato: Contato, hoje: Date): boolean {
  if (contato.status === 'PERDIDO' || contato.status === 'PACIENTE_ATIVO') return false
  if (!contato.dataProximoFollowUp) return false

  const followUp = inicioDoDia(parseData(contato.dataProximoFollowUp))

  return followUp < hoje
}

export function agruparContatos(contatos: Contato[], hoje: Date) {
  const atrasados: Contato[] = []
  const paraHoje: Contato[] = []
  const estaSemana: Contato[] = []

  const fimDaSemana = new Date(hoje)
  fimDaSemana.setDate(hoje.getDate() + 7)

  for (const contato of contatos) {
    if (contato.status === 'PERDIDO' || contato.status === 'PACIENTE_ATIVO') continue
    if (!contato.dataProximoFollowUp) continue

    const followUp = inicioDoDia(parseData(contato.dataProximoFollowUp))

    if (contatoEstaFollowUpAtrasado(contato, hoje)) {
      atrasados.push(contato)
    } else if (followUp.getTime() === hoje.getTime()) {
      paraHoje.push(contato)
    } else if (followUp > hoje && followUp <= fimDaSemana) {
      estaSemana.push(contato)
    }
  }

  return { atrasados, paraHoje, estaSemana }
}
