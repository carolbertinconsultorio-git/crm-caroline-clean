import type { ContatoStatus } from '../../../types/contatoStatus'
import type { ObjetivoFollowUp } from '../../../types/objetivoFollowUp'
import type { ResultadoContato } from './resultadoContato'

export type TipoDataFollowUp = 'manual' | 'relativa' | 'nenhuma'

export type RegraTransicao = {
  novoStatus: ContatoStatus | 'MESMO_STATUS'
  diasFollowUp?: number
  tipoData: TipoDataFollowUp
  mensagemResumo: string
  /** undefined = não altera; null = remove do contato */
  objetivoFollowUp?: ObjetivoFollowUp | null
}

const transicoesEspecificas: Partial<
  Record<ContatoStatus, Partial<Record<ResultadoContato, RegraTransicao>>>
> = {
  NOVO: {
    NAO_RESPONDEU: {
      novoStatus: 'FOLLOW_UP_2_DIAS',
      diasFollowUp: 2,
      tipoData: 'relativa',
      mensagemResumo: 'Sem resposta — follow-up em 2 dias.',
    },
  },
  FOLLOW_UP_2_DIAS: {
    NAO_RESPONDEU: {
      novoStatus: 'REENGAJAMENTO_7_DIAS',
      diasFollowUp: 7,
      tipoData: 'relativa',
      mensagemResumo: 'Sem resposta — reengajamento em 7 dias.',
    },
  },
  REENGAJAMENTO_7_DIAS: {
    NAO_RESPONDEU: {
      novoStatus: 'DESAPEGO_10_DIAS',
      diasFollowUp: 10,
      tipoData: 'relativa',
      mensagemResumo: 'Sem resposta — desapego em 10 dias.',
    },
  },
  DESAPEGO_10_DIAS: {
    NAO_RESPONDEU: {
      novoStatus: 'PERDIDO',
      tipoData: 'nenhuma',
      mensagemResumo: 'Sem resposta após desapego — contato arquivado como perdido.',
    },
  },
  LEAD_QUENTE: {
    NAO_RESPONDEU: {
      novoStatus: 'REENGAJAMENTO_7_DIAS',
      diasFollowUp: 7,
      tipoData: 'relativa',
      mensagemResumo: 'Lead quente sem resposta — reengajamento em 7 dias.',
    },
  },
  PACIENTE_ATIVO: {
    NAO_RESPONDEU: {
      novoStatus: 'PACIENTE_ATIVO',
      diasFollowUp: 7,
      tipoData: 'relativa',
      mensagemResumo: 'Paciente ativo sem resposta — novo follow-up em 7 dias.',
    },
    VAI_PENSAR: {
      novoStatus: 'PACIENTE_ATIVO',
      diasFollowUp: 7,
      tipoData: 'relativa',
      mensagemResumo: 'Paciente vai pensar — follow-up em 7 dias.',
    },
    SEM_INTERESSE: {
      novoStatus: 'PACIENTE_INATIVO',
      tipoData: 'nenhuma',
      mensagemResumo: 'Paciente sem interesse — movido para inativo.',
    },
  },
  PACIENTE_INATIVO: {
    NAO_RESPONDEU: {
      novoStatus: 'PACIENTE_INATIVO',
      diasFollowUp: 60,
      tipoData: 'relativa',
      mensagemResumo: 'Paciente inativo sem resposta — nova tentativa em 60 dias.',
    },
  },
}

function regraAgendou(): RegraTransicao {
  return {
    novoStatus: 'PACIENTE_ATIVO',
    tipoData: 'nenhuma',
    mensagemResumo:
      'Consulta agendada — contato passa a paciente ativo e sai do fluxo de follow-up de lead.',
  }
}

function regraChamarDepois(): RegraTransicao {
  return {
    novoStatus: 'MESMO_STATUS',
    tipoData: 'manual',
    mensagemResumo: 'Follow-up adiado — escolha a nova data.',
  }
}

function regraVaiPensar(statusAtual: ContatoStatus): RegraTransicao {
  if (statusAtual === 'PACIENTE_ATIVO') {
    return {
      novoStatus: 'PACIENTE_ATIVO',
      diasFollowUp: 7,
      tipoData: 'relativa',
      mensagemResumo: 'Paciente vai pensar — follow-up em 7 dias.',
    }
  }

  return {
    novoStatus: 'REENGAJAMENTO_7_DIAS',
    diasFollowUp: 7,
    tipoData: 'relativa',
    mensagemResumo: 'Contato vai pensar — reengajamento em 7 dias.',
  }
}

function regraSemInteresse(statusAtual: ContatoStatus): RegraTransicao {
  if (statusAtual === 'PACIENTE_ATIVO') {
    return {
      novoStatus: 'PACIENTE_INATIVO',
      tipoData: 'nenhuma',
      mensagemResumo: 'Paciente sem interesse — movido para inativo.',
    }
  }

  return {
    novoStatus: 'PERDIDO',
    tipoData: 'nenhuma',
    mensagemResumo: 'Contato sem interesse — arquivado como perdido.',
  }
}

export function buscarRegraTransicaoLead(
  statusAtual: ContatoStatus,
  resultado: ResultadoContato,
): RegraTransicao | null {
  if (statusAtual === 'PERDIDO') {
    return null
  }

  const especifica = transicoesEspecificas[statusAtual]?.[resultado]
  if (especifica) {
    return especifica
  }

  switch (resultado) {
    case 'AGENDOU':
      return regraAgendou()
    case 'CHAMAR_DEPOIS':
      return regraChamarDepois()
    case 'VAI_PENSAR':
      return regraVaiPensar(statusAtual)
    case 'SEM_INTERESSE':
      return regraSemInteresse(statusAtual)
    default:
      return null
  }
}
