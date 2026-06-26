export type ResultadoContato =
  | 'NAO_RESPONDEU'
  | 'VAI_PENSAR'
  | 'AGENDOU'
  | 'SEM_INTERESSE'
  | 'CHAMAR_DEPOIS'

export const RESULTADOS_CONTATO: ResultadoContato[] = [
  'NAO_RESPONDEU',
  'VAI_PENSAR',
  'AGENDOU',
  'SEM_INTERESSE',
  'CHAMAR_DEPOIS',
]

export const RESULTADO_LABELS: Record<ResultadoContato, string> = {
  NAO_RESPONDEU: 'Não respondeu',
  VAI_PENSAR: 'Vai pensar',
  AGENDOU: 'Agendou',
  SEM_INTERESSE: 'Sem interesse',
  CHAMAR_DEPOIS: 'Chamar depois',
}
