import type { Contato } from '../types/contato'
import {
  aplicarAtualizacaoCampanha,
  classificarContatosParaCampanhaReativacaoLote,
  contatoTemCampanhaAtiva,
  prepararContatosCampanhaReativacaoLote,
  resultadoCampanhaReativacaoLote,
  todosContatosComCampanhaAtiva,
  valoresIniciaisAtualizacaoCampanha,
} from './iniciarCampanhaLote'

function criarContato(parcial: Partial<Contato> & Pick<Contato, 'id' | 'status'>): Contato {
  return {
    id: parcial.id,
    nome: parcial.nome ?? 'Contato',
    telefone: parcial.telefone ?? '',
    origem: parcial.origem ?? 'Manual',
    status: parcial.status,
    dataPrimeiroContato: parcial.dataPrimeiroContato ?? '',
    dataUltimoContato: parcial.dataUltimoContato ?? '',
    dataProximoFollowUp: parcial.dataProximoFollowUp ?? '',
    objetivoFollowUp: parcial.objetivoFollowUp,
  }
}

function assert(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(`[iniciarCampanhaLote.validacao] ${mensagem}`)
  }
}

export function executarValidacoesIniciarCampanhaLote(): void {
  const inativoSemCampanha = criarContato({
    id: '1',
    status: 'PACIENTE_INATIVO',
  })
  const inativoComCampanha = criarContato({
    id: '2',
    status: 'PACIENTE_INATIVO',
    objetivoFollowUp: 'REATIVACAO',
  })
  const ativoSemCampanha = criarContato({
    id: '3',
    status: 'PACIENTE_ATIVO',
  })
  const perdido = criarContato({
    id: '4',
    status: 'PERDIDO',
  })

  const classificacao = classificarContatosParaCampanhaReativacaoLote([
    inativoSemCampanha,
    inativoComCampanha,
    ativoSemCampanha,
    perdido,
  ])

  assert(classificacao.validos.length === 1, 'apenas inativo sem campanha é válido')
  assert(classificacao.validos[0]?.id === '1', 'válido é o inativo sem campanha')
  assert(classificacao.ignoradosCampanhaAtiva.length === 1, 'ignora campanha ativa')
  assert(classificacao.ignoradosStatusIncompativel.length === 2, 'ignora ativo e perdido')

  const preparados = prepararContatosCampanhaReativacaoLote(classificacao.validos)
  assert(preparados[0]?.objetivoFollowUp === 'REATIVACAO', 'define objetivo REATIVACAO')
  assert(preparados[0]?.dataProximoFollowUp !== '', 'define follow-up para hoje')
  assert(
    preparados[0]?.campanhaNome === 'Reativação de ex-pacientes',
    'registra nome da campanha',
  )
  assert(preparados[0]?.campanhaIniciadaEm !== '', 'registra data de início da campanha')

  const resultado = resultadoCampanhaReativacaoLote(classificacao)
  assert(resultado.iniciados === 1, 'resultado conta iniciados')
  assert(resultado.ignoradosCampanhaAtiva === 1, 'resultado conta campanha ativa')
  assert(resultado.ignoradosStatusIncompativel === 2, 'resultado conta status incompatível')

  const comCampanhaAtiva = criarContato({
    id: '5',
    status: 'PACIENTE_INATIVO',
    objetivoFollowUp: 'REATIVACAO',
    campanhaNome: 'Campanha antiga',
    campanhaIniciadaEm: '2026-01-01',
    dataProximoFollowUp: '2026-02-01',
    campanhaMensagem: 'Olá [nome]',
  })

  assert(contatoTemCampanhaAtiva(comCampanhaAtiva), 'identifica contato com campanha ativa')
  assert(
    todosContatosComCampanhaAtiva([comCampanhaAtiva]),
    'todos com campanha quando há apenas um ativo',
  )
  assert(
    !todosContatosComCampanhaAtiva([inativoSemCampanha, comCampanhaAtiva]),
    'não considera todos com campanha em seleção mista',
  )

  const valoresIniciais = valoresIniciaisAtualizacaoCampanha([comCampanhaAtiva])
  assert(valoresIniciais.campanhaNome === 'Campanha antiga', 'preenche nome inicial')
  assert(valoresIniciais.campanhaMensagem === 'Olá [nome]', 'preenche mensagem inicial')

  const atualizado = aplicarAtualizacaoCampanha(comCampanhaAtiva, {
    campanhaNome: 'Campanha nova',
    campanhaMensagem: 'Oi [nome], sentimos sua falta!',
  })

  assert(atualizado.campanhaNome === 'Campanha nova', 'atualiza nome da campanha')
  assert(
    atualizado.campanhaMensagem === 'Oi [nome], sentimos sua falta!',
    'atualiza mensagem da campanha',
  )
  assert(
    atualizado.campanhaIniciadaEm === comCampanhaAtiva.campanhaIniciadaEm,
    'mantém data de início',
  )
  assert(
    atualizado.dataProximoFollowUp === comCampanhaAtiva.dataProximoFollowUp,
    'mantém próximo follow-up',
  )
  assert(
    atualizado.objetivoFollowUp === comCampanhaAtiva.objetivoFollowUp,
    'mantém objetivo do follow-up',
  )
  assert(atualizado.status === comCampanhaAtiva.status, 'mantém status')
}
