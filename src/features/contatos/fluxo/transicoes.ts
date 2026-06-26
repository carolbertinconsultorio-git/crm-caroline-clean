import type { ContatoStatus } from '../../../types/contatoStatus'
import type { ObjetivoFollowUp } from '../../../types/objetivoFollowUp'
import type { ResultadoContato } from './resultadoContato'
import {
  buscarRegraTransicaoLead,
  type RegraTransicao,
} from './transicoesLead'
import { buscarRegraTransicaoReativacao } from './transicoesReativacao'
import { buscarRegraTransicaoIndicacao } from './transicoesIndicacao'

export type { RegraTransicao, TipoDataFollowUp } from './transicoesLead'

export const STATUS_ATIVOS: ContatoStatus[] = [
  'NOVO',
  'FOLLOW_UP_2_DIAS',
  'REENGAJAMENTO_7_DIAS',
  'DESAPEGO_10_DIAS',
  'LEAD_QUENTE',
  'PACIENTE_ATIVO',
  'PACIENTE_INATIVO',
]

type BuscadorRegraTransicao = (
  statusAtual: ContatoStatus,
  resultado: ResultadoContato,
) => RegraTransicao | null

const BUSCADORES_POR_OBJETIVO: Partial<
  Record<ObjetivoFollowUp, BuscadorRegraTransicao>
> = {
  LEAD: buscarRegraTransicaoLead,
  REATIVACAO: buscarRegraTransicaoReativacao,
  INDICACAO: buscarRegraTransicaoIndicacao,
}

export function buscarRegraTransicao(
  objetivo: ObjetivoFollowUp,
  statusAtual: ContatoStatus,
  resultado: ResultadoContato,
): RegraTransicao | null {
  const buscador = BUSCADORES_POR_OBJETIVO[objetivo]
  if (!buscador) {
    return null
  }

  return buscador(statusAtual, resultado)
}

export function resultadosPermitidos(
  objetivo: ObjetivoFollowUp,
  statusAtual: ContatoStatus,
): ResultadoContato[] {
  if (statusAtual === 'PERDIDO') {
    return []
  }

  const todos: ResultadoContato[] = [
    'NAO_RESPONDEU',
    'VAI_PENSAR',
    'AGENDOU',
    'SEM_INTERESSE',
    'CHAMAR_DEPOIS',
  ]

  return todos.filter(
    (resultado) => buscarRegraTransicao(objetivo, statusAtual, resultado) !== null,
  )
}

export function resultadosPermitidosParaStatus(
  statusAtual: ContatoStatus,
): ResultadoContato[] {
  return resultadosPermitidos('LEAD', statusAtual)
}
