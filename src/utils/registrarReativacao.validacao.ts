import type { Contato } from '../types/contato'
import { aplicarRegistroReativacaoConcluida, registrarReativacaoConcluida } from './registrarReativacao'

function criarContato(parcial: Partial<Contato> & Pick<Contato, 'id'>): Contato {
  return {
    id: parcial.id,
    nome: parcial.nome ?? 'Contato',
    telefone: parcial.telefone ?? '',
    origem: parcial.origem ?? 'Manual',
    status: parcial.status ?? 'PACIENTE_INATIVO',
    dataPrimeiroContato: parcial.dataPrimeiroContato ?? '',
    dataUltimoContato: parcial.dataUltimoContato ?? '',
    dataProximoFollowUp: parcial.dataProximoFollowUp ?? '',
    objetivoFollowUp: parcial.objetivoFollowUp,
    ultimaReativacaoEm: parcial.ultimaReativacaoEm,
    ultimoResultadoReativacao: parcial.ultimoResultadoReativacao,
  }
}

function assert(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(`[registrarReativacao.validacao] ${mensagem}`)
  }
}

export function executarValidacoesRegistrarReativacao(): void {
  const contatoReativacao = criarContato({
    id: '1',
    status: 'PACIENTE_INATIVO',
    objetivoFollowUp: 'REATIVACAO',
  })

  const contatoIndicacao = criarContato({
    id: '2',
    status: 'PACIENTE_ATIVO',
    objetivoFollowUp: 'INDICACAO',
  })

  const registro = registrarReativacaoConcluida(contatoReativacao, 'NAO_RESPONDEU')
  assert(registro !== null, 'registra reativação concluída')
  assert(registro?.ultimoResultadoReativacao === 'NAO_RESPONDEU', 'guarda resultado')
  assert(registro?.ultimaReativacaoEm !== '', 'guarda data de hoje')

  const semRegistro = registrarReativacaoConcluida(contatoIndicacao, 'NAO_RESPONDEU')
  assert(semRegistro === null, 'não registra para indicação')

  const atualizado = aplicarRegistroReativacaoConcluida(contatoReativacao, 'VAI_PENSAR')
  assert(atualizado.ultimoResultadoReativacao === 'VAI_PENSAR', 'aplica no contato')
  assert(atualizado.ultimaReativacaoEm !== '', 'aplica data no contato')
}
