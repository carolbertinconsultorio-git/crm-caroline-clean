import type { Contato, StatusLiveClin } from '../../../types/contato'
import type { ContatoStatus } from '../../../types/contatoStatus'
import { dataRelativa } from '../../../utils/contatoHelpers'
import type { PacienteLiveClin } from './types'

export function mapearStatusLiveClinParaContato(status: StatusLiveClin): ContatoStatus {
  if (status === 'ACTIVE') return 'PACIENTE_ATIVO'
  if (status === 'INACTIVE' || status === 'FINISHED') return 'PACIENTE_INATIVO'
  return 'NOVO'
}

export function mapearPacienteLiveClinParaContato(
  paciente: PacienteLiveClin,
): Omit<Contato, 'id'> {
  const hoje = dataRelativa(0)

  const plano = paciente.plano.trim() || undefined
  const email = paciente.email.trim() || undefined
  const dataFimPlano = paciente.dataFimPlano || undefined
  const diasRestantes =
    paciente.diasRestantes === null ? undefined : paciente.diasRestantes
  const statusLiveClin =
    paciente.statusLiveClin !== 'DESCONHECIDO' ? paciente.statusLiveClin : undefined

  return {
    nome: paciente.nome.trim(),
    telefone: paciente.telefone.trim(),
    origem: 'LiveClin',
    status: mapearStatusLiveClinParaContato(paciente.statusLiveClin),
    dataPrimeiroContato: hoje,
    dataUltimoContato: hoje,
    dataProximoFollowUp: '',
    email,
    statusLiveClin,
    plano,
    dataFimPlano,
    diasRestantes,
  }
}

export type CamposLiveClinAtualizaveis = Pick<
  Contato,
  'nome' | 'telefone' | 'email' | 'plano' | 'statusLiveClin' | 'dataFimPlano' | 'diasRestantes'
>

export function mapearCamposLiveClinParaAtualizacao(
  paciente: PacienteLiveClin,
): Partial<CamposLiveClinAtualizaveis> {
  const campos: Partial<CamposLiveClinAtualizaveis> = {
    nome: paciente.nome.trim(),
    telefone: paciente.telefone.trim(),
  }

  const email = paciente.email.trim()
  if (email) {
    campos.email = email
  }

  const plano = paciente.plano.trim()
  if (plano) {
    campos.plano = plano
  }

  if (paciente.statusLiveClin !== 'DESCONHECIDO') {
    campos.statusLiveClin = paciente.statusLiveClin
  }

  if (paciente.dataFimPlano) {
    campos.dataFimPlano = paciente.dataFimPlano
  }

  if (paciente.diasRestantes !== null) {
    campos.diasRestantes = paciente.diasRestantes
  }

  return campos
}

export function mesclarContatoComCamposLiveClin(
  contato: Contato,
  paciente: PacienteLiveClin,
): Contato {
  return {
    ...contato,
    ...mapearCamposLiveClinParaAtualizacao(paciente),
  }
}
