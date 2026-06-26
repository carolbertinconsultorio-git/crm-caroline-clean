import type { StatusLiveClin } from '../../../types/contato'

export type { StatusLiveClin }

export type PacienteLiveClin = {
  idLiveClin: string
  nome: string
  telefone: string
  telefoneNormalizado: string | null
  email: string
  statusLiveClin: StatusLiveClin
  plano: string
  dataFimPlano: string
  diasRestantes: number | null
}

/** @deprecated Use PacienteLiveClin — mantido como alias para compatibilidade da prévia */
export type PacienteLiveClinLinha = PacienteLiveClin

export type ResumoImportacaoLiveClin = {
  totalRegistros: number
  comTelefone: number
  semTelefone: number
  comEmail: number
  active: number
  inactive: number
  finished: number
  comDataFinalServico: number
  comDiasRestantes: number
}

export type ResultadoPreviewImportacaoLiveClin = {
  resumo: ResumoImportacaoLiveClin
  pacientes: PacienteLiveClin[]
  previa: PacienteLiveClin[]
  nomeArquivo: string
}

export type AcaoSincronizacaoLiveClin = 'novo' | 'atualizar' | 'revisao'

export type LinhaSimulacaoSincronizacaoLiveClin = {
  acao: AcaoSincronizacaoLiveClin
  paciente: PacienteLiveClin
  contatoExistenteId?: string
  contatoExistenteNome?: string
  motivoRevisao?: string
  camposLiveClinAtualizados: string[]
}

export type ResultadoSimulacaoSincronizacaoLiveClin = {
  totalRegistros: number
  criar: number
  atualizar: number
  revisao: number
  linhas: LinhaSimulacaoSincronizacaoLiveClin[]
  linhasCriar: LinhaSimulacaoSincronizacaoLiveClin[]
  amostraCriar: LinhaSimulacaoSincronizacaoLiveClin[]
  amostraAtualizar: LinhaSimulacaoSincronizacaoLiveClin[]
  amostraRevisao: LinhaSimulacaoSincronizacaoLiveClin[]
}
