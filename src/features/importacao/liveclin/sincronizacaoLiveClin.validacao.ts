import type { Contato } from '../../../types/contato'
import {
  mapearCamposLiveClinParaAtualizacao,
  mesclarContatoComCamposLiveClin,
} from './mapeamentoLiveClin'
import { simularSincronizacaoLiveClin } from './simulacaoSincronizacaoLiveClinService'
import type { PacienteLiveClin } from './types'

function assert(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(`Falha na validação LiveClin: ${mensagem}`)
  }
}

function criarPaciente(overrides: Partial<PacienteLiveClin> = {}): PacienteLiveClin {
  return {
    idLiveClin: 'lc-1',
    nome: 'Maria LiveClin',
    telefone: '(11) 91234-5678',
    telefoneNormalizado: '11912345678',
    email: 'maria@exemplo.com',
    statusLiveClin: 'ACTIVE',
    plano: 'Plano mensal',
    dataFimPlano: '2026-12-31',
    diasRestantes: 30,
    ...overrides,
  }
}

function criarContatoCrm(overrides: Partial<Contato> = {}): Contato {
  return {
    id: 'crm-abc',
    nome: 'Maria Antiga',
    telefone: '(11) 91234-5678',
    origem: 'LiveClin',
    status: 'PACIENTE_ATIVO',
    dataPrimeiroContato: '2026-01-01',
    dataUltimoContato: '2026-02-01',
    dataProximoFollowUp: '2026-06-30',
    objetivoFollowUp: 'REATIVACAO',
    observacoes: 'Nota manual do CRM',
    email: 'maria@exemplo.com',
    statusLiveClin: 'INACTIVE',
    plano: 'Plano antigo',
    dataFimPlano: '2026-01-15',
    diasRestantes: 5,
    ...overrides,
  }
}

export function executarValidacoesSincronizacaoLiveClin(): void {
  const paciente = criarPaciente()
  const contato = criarContatoCrm()
  const campos = mapearCamposLiveClinParaAtualizacao(paciente)

  assert(campos.nome === 'Maria LiveClin', 'mapeia nome LiveClin')
  assert(campos.telefone === '(11) 91234-5678', 'mapeia telefone LiveClin')
  assert(campos.email === 'maria@exemplo.com', 'mapeia email LiveClin')
  assert(campos.plano === 'Plano mensal', 'mapeia plano LiveClin')
  assert(campos.statusLiveClin === 'ACTIVE', 'mapeia statusLiveClin')
  assert(campos.dataFimPlano === '2026-12-31', 'mapeia dataFimPlano')
  assert(campos.diasRestantes === 30, 'mapeia diasRestantes')
  assert(!('status' in campos), 'não inclui status do CRM na atualização')
  assert(!('dataProximoFollowUp' in campos), 'não inclui follow-up na atualização')
  assert(!('objetivoFollowUp' in campos), 'não inclui objetivo na atualização')
  assert(!('observacoes' in campos), 'não inclui observações na atualização')

  const mesclado = mesclarContatoComCamposLiveClin(contato, paciente)
  assert(mesclado.id === 'crm-abc', 'preserva id do Firestore')
  assert(mesclado.status === 'PACIENTE_ATIVO', 'preserva status do CRM')
  assert(mesclado.objetivoFollowUp === 'REATIVACAO', 'preserva objetivoFollowUp')
  assert(mesclado.dataProximoFollowUp === '2026-06-30', 'preserva dataProximoFollowUp')
  assert(mesclado.observacoes === 'Nota manual do CRM', 'preserva observações')
  assert(mesclado.plano === 'Plano mensal', 'atualiza plano LiveClin')
  assert(mesclado.statusLiveClin === 'ACTIVE', 'atualiza statusLiveClin')

  const contatosExistentes = [contato]
  const simulacao = simularSincronizacaoLiveClin([paciente], contatosExistentes)

  assert(simulacao.criar === 0, 'reimportação não cria duplicado')
  assert(simulacao.atualizar === 1, 'reimportação reconhece contato existente')
  assert(simulacao.linhas[0]?.acao === 'atualizar', 'primeira linha é atualização')
  assert(
    simulacao.linhas[0]?.contatoExistenteId === 'crm-abc',
    'mantém o mesmo id do Firestore',
  )

  const simulacaoPorTelefone = simularSincronizacaoLiveClin(
    [criarPaciente({ email: '', telefone: '(11) 91234-5678', telefoneNormalizado: '11912345678' })],
    [criarContatoCrm({ email: undefined })],
  )
  assert(simulacaoPorTelefone.atualizar === 1, 'identifica por telefone sem email')

  const simulacaoNovo = simularSincronizacaoLiveClin(
    [criarPaciente({ email: 'novo@exemplo.com', telefone: '(11) 90000-0001', telefoneNormalizado: '11900000001' })],
    contatosExistentes,
  )
  assert(simulacaoNovo.criar === 1, 'paciente sem match vira novo')
}
