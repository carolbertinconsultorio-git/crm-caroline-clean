import type { ContatoStatus } from './contatoStatus'
import type { ObjetivoFollowUp } from './objetivoFollowUp'
import type { ResultadoContato } from '../features/contatos/fluxo/resultadoContato'

export type StatusLiveClin = 'ACTIVE' | 'INACTIVE' | 'FINISHED' | 'DESCONHECIDO'

export interface Contato {
  id: string
  nome: string
  telefone: string
  origem: string
  status: ContatoStatus
  dataPrimeiroContato: string
  dataUltimoContato: string
  dataProximoFollowUp: string
  email?: string
  statusLiveClin?: StatusLiveClin
  plano?: string
  dataFimPlano?: string
  diasRestantes?: number
  observacoes?: string
  objetivoFollowUp?: ObjetivoFollowUp
  ultimaReativacaoEm?: string
  ultimoResultadoReativacao?: ResultadoContato
  campanhaNome?: string
  campanhaIniciadaEm?: string
  campanhaMensagem?: string
  aguardandoRespostaDesde?: string
}
