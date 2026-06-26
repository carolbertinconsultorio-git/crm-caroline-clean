import type { Contato } from '../types/contato'
import {
  classificarContatosParaCampanhaReativacaoLote,
  prepararContatosCampanhaReativacaoLote,
  resultadoCampanhaReativacaoLote,
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

  const resultado = resultadoCampanhaReativacaoLote(classificacao)
  assert(resultado.iniciados === 1, 'resultado conta iniciados')
  assert(resultado.ignoradosCampanhaAtiva === 1, 'resultado conta campanha ativa')
  assert(resultado.ignoradosStatusIncompativel === 2, 'resultado conta status incompatível')
}
