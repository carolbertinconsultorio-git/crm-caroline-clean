import type { Contato } from '../../../types/contato'
import { somarDiasLocal } from '../../../utils/somarDiasLocal'
import { aplicarTransicao } from './aplicarTransicao'
import { buscarRegraTransicao, resultadosPermitidosParaStatus } from './transicoes'

function criarContato(status: Contato['status']): Contato {
  return {
    id: 'teste',
    nome: 'Contato Teste',
    telefone: '(11) 90000-0000',
    origem: 'Teste',
    status,
    dataPrimeiroContato: '2026-01-01',
    dataUltimoContato: '2026-01-01',
    dataProximoFollowUp: '2026-01-01',
  }
}

function criarContatoReativacao(): Contato {
  return {
    ...criarContato('PACIENTE_INATIVO'),
    objetivoFollowUp: 'REATIVACAO',
  }
}

function criarContatoIndicacao(status: Contato['status'] = 'PACIENTE_INATIVO'): Contato {
  return {
    ...criarContato(status),
    objetivoFollowUp: 'INDICACAO',
  }
}

function assert(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(`Falha na validação: ${mensagem}`)
  }
}

export function executarValidacoesMotorFluxo(): void {
  for (const dias of [2, 7, 10, 15, 60] as const) {
    assert(
      somarDiasLocal(dias) === somarDiasLocal(dias, new Date()),
      `somarDiasLocal +${dias} dias a partir de hoje`,
    )
  }

  const followUp2Dias = aplicarTransicao(
    criarContato('NOVO'),
    'NAO_RESPONDEU',
  )
  assert(followUp2Dias.novoStatus === 'FOLLOW_UP_2_DIAS', 'NOVO + NAO_RESPONDEU')
  assert(
    followUp2Dias.dataProximoFollowUp === somarDiasLocal(2),
    'NOVO + NAO_RESPONDEU agenda +2 dias',
  )

  const reengajamento = aplicarTransicao(
    criarContato('FOLLOW_UP_2_DIAS'),
    'NAO_RESPONDEU',
  )
  assert(
    reengajamento.novoStatus === 'REENGAJAMENTO_7_DIAS',
    'FOLLOW_UP_2_DIAS + NAO_RESPONDEU',
  )
  assert(
    reengajamento.dataProximoFollowUp === somarDiasLocal(7),
    'FOLLOW_UP_2_DIAS + NAO_RESPONDEU +7 dias',
  )

  const vaiPensar = aplicarTransicao(criarContato('NOVO'), 'VAI_PENSAR')
  assert(vaiPensar.novoStatus === 'REENGAJAMENTO_7_DIAS', 'NOVO + VAI_PENSAR')

  const vaiPensarPaciente = aplicarTransicao(
    criarContato('PACIENTE_ATIVO'),
    'VAI_PENSAR',
  )
  assert(
    vaiPensarPaciente.novoStatus === 'PACIENTE_ATIVO',
    'PACIENTE_ATIVO + VAI_PENSAR',
  )

  const agendou = aplicarTransicao(criarContato('LEAD_QUENTE'), 'AGENDOU')
  assert(agendou.novoStatus === 'PACIENTE_ATIVO', 'AGENDOU → PACIENTE_ATIVO')
  assert(agendou.exigeDataManual === false, 'AGENDOU não exige data manual')
  assert(agendou.dataProximoFollowUp === null, 'AGENDOU sem follow-up')

  const chamarDepoisSemData = aplicarTransicao(
    criarContato('FOLLOW_UP_2_DIAS'),
    'CHAMAR_DEPOIS',
  )
  assert(chamarDepoisSemData.exigeDataManual === true, 'CHAMAR_DEPOIS exige data manual')

  const semInteresseLead = aplicarTransicao(
    criarContato('REENGAJAMENTO_7_DIAS'),
    'SEM_INTERESSE',
  )
  assert(semInteresseLead.novoStatus === 'PERDIDO', 'SEM_INTERESSE lead → PERDIDO')
  assert(semInteresseLead.dataProximoFollowUp === null, 'PERDIDO sem follow-up')

  const semInteressePaciente = aplicarTransicao(
    criarContato('PACIENTE_ATIVO'),
    'SEM_INTERESSE',
  )
  assert(
    semInteressePaciente.novoStatus === 'PACIENTE_INATIVO',
    'SEM_INTERESSE paciente → INATIVO',
  )

  const chamarDepois = aplicarTransicao(
    criarContato('FOLLOW_UP_2_DIAS'),
    'CHAMAR_DEPOIS',
    '2026-08-01',
  )
  assert(chamarDepois.novoStatus === 'FOLLOW_UP_2_DIAS', 'CHAMAR_DEPOIS mantém status')

  const desapegoPerdido = aplicarTransicao(
    criarContato('DESAPEGO_10_DIAS'),
    'NAO_RESPONDEU',
  )
  assert(desapegoPerdido.novoStatus === 'PERDIDO', 'DESAPEGO → PERDIDO')

  const desapego10Dias = aplicarTransicao(
    criarContato('REENGAJAMENTO_7_DIAS'),
    'NAO_RESPONDEU',
  )
  assert(
    desapego10Dias.novoStatus === 'DESAPEGO_10_DIAS',
    'REENGAJAMENTO_7_DIAS + NAO_RESPONDEU',
  )
  assert(
    desapego10Dias.dataProximoFollowUp === somarDiasLocal(10),
    'REENGAJAMENTO_7_DIAS + NAO_RESPONDEU +10 dias',
  )

  const inativoLead60 = aplicarTransicao(criarContato('PACIENTE_INATIVO'), 'NAO_RESPONDEU')
  assert(
    inativoLead60.dataProximoFollowUp === somarDiasLocal(60),
    'PACIENTE_INATIVO LEAD + NAO_RESPONDEU +60 dias',
  )

  assert(
    resultadosPermitidosParaStatus('PERDIDO').length === 0,
    'PERDIDO sem resultados',
  )

  const leadExplicito = aplicarTransicao(
    { ...criarContato('NOVO'), objetivoFollowUp: 'LEAD' },
    'NAO_RESPONDEU',
  )
  assert(
    leadExplicito.novoStatus === 'FOLLOW_UP_2_DIAS',
    'objetivo LEAD explícito mantém regras atuais',
  )

  assert(
    buscarRegraTransicao('REATIVACAO', 'PACIENTE_INATIVO', 'NAO_RESPONDEU') !== null,
    'REATIVACAO com regra para PACIENTE_INATIVO',
  )

  const reativacaoNaoRespondeu = aplicarTransicao(
    criarContatoReativacao(),
    'NAO_RESPONDEU',
  )
  assert(
    reativacaoNaoRespondeu.novoStatus === 'PACIENTE_INATIVO',
    'REATIVACAO + NAO_RESPONDEU mantém inativo',
  )
  assert(
    reativacaoNaoRespondeu.dataProximoFollowUp === somarDiasLocal(7),
    'REATIVACAO + NAO_RESPONDEU +7 dias',
  )
  assert(
    reativacaoNaoRespondeu.novoObjetivoFollowUp === 'REATIVACAO',
    'REATIVACAO + NAO_RESPONDEU mantém objetivo',
  )

  const reativacaoVaiPensar = aplicarTransicao(
    criarContatoReativacao(),
    'VAI_PENSAR',
  )
  assert(
    reativacaoVaiPensar.novoStatus === 'PACIENTE_INATIVO',
    'REATIVACAO + VAI_PENSAR mantém inativo',
  )
  assert(
    reativacaoVaiPensar.dataProximoFollowUp === somarDiasLocal(7),
    'REATIVACAO + VAI_PENSAR +7 dias',
  )
  assert(
    reativacaoVaiPensar.novoObjetivoFollowUp === 'REATIVACAO',
    'REATIVACAO + VAI_PENSAR mantém objetivo',
  )

  const reativacaoAgendou = aplicarTransicao(criarContatoReativacao(), 'AGENDOU')
  assert(
    reativacaoAgendou.novoStatus === 'PACIENTE_ATIVO',
    'REATIVACAO + AGENDOU → PACIENTE_ATIVO',
  )
  assert(
    reativacaoAgendou.dataProximoFollowUp === null,
    'REATIVACAO + AGENDOU sem follow-up',
  )
  assert(
    reativacaoAgendou.novoObjetivoFollowUp === null,
    'REATIVACAO + AGENDOU limpa objetivo',
  )

  const reativacaoSemInteresse = aplicarTransicao(
    criarContatoReativacao(),
    'SEM_INTERESSE',
  )
  assert(
    reativacaoSemInteresse.novoStatus === 'PACIENTE_INATIVO',
    'REATIVACAO + SEM_INTERESSE mantém inativo',
  )
  assert(
    reativacaoSemInteresse.dataProximoFollowUp === null,
    'REATIVACAO + SEM_INTERESSE sem follow-up',
  )
  assert(
    reativacaoSemInteresse.novoObjetivoFollowUp === null,
    'REATIVACAO + SEM_INTERESSE limpa objetivo',
  )

  const reativacaoChamarDepois = aplicarTransicao(
    criarContatoReativacao(),
    'CHAMAR_DEPOIS',
  )
  assert(
    reativacaoChamarDepois.exigeDataManual === true,
    'REATIVACAO + CHAMAR_DEPOIS exige data manual',
  )
  assert(
    reativacaoChamarDepois.novoObjetivoFollowUp === 'REATIVACAO',
    'REATIVACAO + CHAMAR_DEPOIS mantém objetivo',
  )

  assert(
    buscarRegraTransicao('INDICACAO', 'PACIENTE_INATIVO', 'AGENDOU') === null,
    'INDICACAO sem AGENDOU',
  )

  const indicacaoNaoRespondeu = aplicarTransicao(
    criarContatoIndicacao('PACIENTE_INATIVO'),
    'NAO_RESPONDEU',
  )
  assert(
    indicacaoNaoRespondeu.novoStatus === 'PACIENTE_INATIVO',
    'INDICACAO + NAO_RESPONDEU mantém inativo',
  )
  assert(
    indicacaoNaoRespondeu.dataProximoFollowUp === somarDiasLocal(15),
    'INDICACAO + NAO_RESPONDEU +15 dias',
  )
  assert(
    indicacaoNaoRespondeu.novoObjetivoFollowUp === 'INDICACAO',
    'INDICACAO + NAO_RESPONDEU mantém objetivo',
  )

  const indicacaoAtivo = aplicarTransicao(
    criarContatoIndicacao('PACIENTE_ATIVO'),
    'VAI_PENSAR',
  )
  assert(
    indicacaoAtivo.novoStatus === 'PACIENTE_ATIVO',
    'INDICACAO + VAI_PENSAR mantém ativo',
  )
  assert(
    indicacaoAtivo.dataProximoFollowUp === somarDiasLocal(15),
    'INDICACAO + VAI_PENSAR +15 dias',
  )

  const indicacaoSemInteresse = aplicarTransicao(
    criarContatoIndicacao('PACIENTE_INATIVO'),
    'SEM_INTERESSE',
  )
  assert(
    indicacaoSemInteresse.novoStatus === 'PACIENTE_INATIVO',
    'INDICACAO + SEM_INTERESSE mantém status',
  )
  assert(
    indicacaoSemInteresse.dataProximoFollowUp === null,
    'INDICACAO + SEM_INTERESSE sem follow-up',
  )
  assert(
    indicacaoSemInteresse.novoObjetivoFollowUp === null,
    'INDICACAO + SEM_INTERESSE limpa objetivo',
  )

  const indicacaoChamarDepois = aplicarTransicao(
    criarContatoIndicacao('PACIENTE_ATIVO'),
    'CHAMAR_DEPOIS',
  )
  assert(
    indicacaoChamarDepois.exigeDataManual === true,
    'INDICACAO + CHAMAR_DEPOIS exige data manual',
  )
  assert(
    indicacaoChamarDepois.novoObjetivoFollowUp === 'INDICACAO',
    'INDICACAO + CHAMAR_DEPOIS mantém objetivo',
  )
}
