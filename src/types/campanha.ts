export type TipoCampanha = 'REATIVACAO' | 'INDICACAO' | 'PERSONALIZADA'

export type StatusCampanha = 'RASCUNHO' | 'ATIVA' | 'ENCERRADA'

export const TODOS_OS_TIPOS_CAMPANHA: TipoCampanha[] = [
  'REATIVACAO',
  'INDICACAO',
  'PERSONALIZADA',
]

export const TODOS_OS_STATUS_CAMPANHA: StatusCampanha[] = [
  'RASCUNHO',
  'ATIVA',
  'ENCERRADA',
]

export interface Campanha {
  id: string
  nome: string
  mensagem?: string
  tipo: TipoCampanha
  status: StatusCampanha
  dataInicio?: string
  dataFim?: string
  criadaEm?: string
  atualizadaEm?: string
}
