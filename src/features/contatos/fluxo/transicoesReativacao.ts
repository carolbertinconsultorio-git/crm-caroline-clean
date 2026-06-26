import type { ContatoStatus } from '../../../types/contatoStatus'
import type { ResultadoContato } from './resultadoContato'
import type { RegraTransicao } from './transicoesLead'

const regrasPacienteInativo: Partial<Record<ResultadoContato, RegraTransicao>> = {
  NAO_RESPONDEU: {
    novoStatus: 'PACIENTE_INATIVO',
    diasFollowUp: 7,
    tipoData: 'relativa',
    objetivoFollowUp: 'REATIVACAO',
    mensagemResumo:
      'Paciente inativo sem resposta na reativação — nova tentativa em 7 dias.',
  },
  VAI_PENSAR: {
    novoStatus: 'PACIENTE_INATIVO',
    diasFollowUp: 7,
    tipoData: 'relativa',
    objetivoFollowUp: 'REATIVACAO',
    mensagemResumo:
      'Paciente inativo vai pensar — follow-up de reativação em 7 dias.',
  },
  AGENDOU: {
    novoStatus: 'PACIENTE_ATIVO',
    tipoData: 'nenhuma',
    objetivoFollowUp: null,
    mensagemResumo:
      'Consulta agendada na reativação — paciente volta a ativo e objetivo encerrado.',
  },
  SEM_INTERESSE: {
    novoStatus: 'PACIENTE_INATIVO',
    tipoData: 'nenhuma',
    objetivoFollowUp: null,
    mensagemResumo:
      'Sem interesse na reativação — paciente permanece inativo e objetivo encerrado.',
  },
  CHAMAR_DEPOIS: {
    novoStatus: 'MESMO_STATUS',
    tipoData: 'manual',
    objetivoFollowUp: 'REATIVACAO',
    mensagemResumo: 'Reativação adiada — escolha a nova data.',
  },
}

export function buscarRegraTransicaoReativacao(
  statusAtual: ContatoStatus,
  resultado: ResultadoContato,
): RegraTransicao | null {
  if (statusAtual !== 'PACIENTE_INATIVO') {
    return null
  }

  return regrasPacienteInativo[resultado] ?? null
}
