import type { ContatoStatus } from '../../../types/contatoStatus'
import type { ResultadoContato } from './resultadoContato'
import type { RegraTransicao } from './transicoesLead'

const STATUS_ELEGIVEIS: ContatoStatus[] = ['PACIENTE_INATIVO', 'PACIENTE_ATIVO']

const regrasIndicacao: Partial<Record<ResultadoContato, RegraTransicao>> = {
  NAO_RESPONDEU: {
    novoStatus: 'MESMO_STATUS',
    diasFollowUp: 15,
    tipoData: 'relativa',
    objetivoFollowUp: 'INDICACAO',
    mensagemResumo:
      'Sem resposta na indicação — nova tentativa em 15 dias.',
  },
  VAI_PENSAR: {
    novoStatus: 'MESMO_STATUS',
    diasFollowUp: 15,
    tipoData: 'relativa',
    objetivoFollowUp: 'INDICACAO',
    mensagemResumo:
      'Vai pensar sobre a indicação — follow-up em 15 dias.',
  },
  SEM_INTERESSE: {
    novoStatus: 'MESMO_STATUS',
    tipoData: 'nenhuma',
    objetivoFollowUp: null,
    mensagemResumo:
      'Sem interesse na indicação — campanha encerrada.',
  },
  CHAMAR_DEPOIS: {
    novoStatus: 'MESMO_STATUS',
    tipoData: 'manual',
    objetivoFollowUp: 'INDICACAO',
    mensagemResumo: 'Indicação adiada — escolha a nova data.',
  },
}

export function buscarRegraTransicaoIndicacao(
  statusAtual: ContatoStatus,
  resultado: ResultadoContato,
): RegraTransicao | null {
  if (!STATUS_ELEGIVEIS.includes(statusAtual)) {
    return null
  }

  return regrasIndicacao[resultado] ?? null
}
