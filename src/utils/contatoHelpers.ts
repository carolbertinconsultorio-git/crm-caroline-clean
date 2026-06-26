import type { ContatoStatus } from '../types/contatoStatus'
import { inicioDoDiaLocal, somarDiasLocal } from './somarDiasLocal'

export const STATUS_LABELS: Record<ContatoStatus, string> = {
  NOVO: 'Novo',
  FOLLOW_UP_2_DIAS: 'Follow-up 2 dias',
  REENGAJAMENTO_7_DIAS: 'Reengajamento 7 dias',
  DESAPEGO_10_DIAS: 'Desapego 10 dias',
  LEAD_QUENTE: 'Lead quente',
  PACIENTE_ATIVO: 'Paciente ativo',
  PACIENTE_INATIVO: 'Paciente inativo',
  PERDIDO: 'Perdido',
}

export const TODOS_OS_STATUS: ContatoStatus[] = [
  'NOVO',
  'FOLLOW_UP_2_DIAS',
  'REENGAJAMENTO_7_DIAS',
  'DESAPEGO_10_DIAS',
  'LEAD_QUENTE',
  'PACIENTE_ATIVO',
  'PACIENTE_INATIVO',
  'PERDIDO',
]

export function parseData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function inicioDoDia(data: Date): Date {
  return inicioDoDiaLocal(data)
}

export function formatarData(iso: string): string {
  if (!iso) return 'Sem follow-up'
  return parseData(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function dataRelativa(diasAPartirDeHoje: number): string {
  return somarDiasLocal(diasAPartirDeHoje)
}

export { somarDiasLocal } from './somarDiasLocal'
