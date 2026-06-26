export type ObjetivoFollowUp = 'LEAD' | 'REATIVACAO' | 'INDICACAO'

export const TODOS_OS_OBJETIVOS_FOLLOW_UP: ObjetivoFollowUp[] = [
  'LEAD',
  'REATIVACAO',
  'INDICACAO',
]

export const OBJETIVO_FOLLOW_UP_LABELS: Record<ObjetivoFollowUp, string> = {
  LEAD: 'Lead',
  REATIVACAO: 'Reativação',
  INDICACAO: 'Indicação',
}
