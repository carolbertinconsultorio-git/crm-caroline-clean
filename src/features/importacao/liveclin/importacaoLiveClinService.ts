import * as XLSX from 'xlsx'
import { telefoneNormalizadoLiveClin } from './normalizacaoLiveClin'
import { normalizarDataArquivoLiveClin } from './parseDataLiveClin'
import type {
  PacienteLiveClin,
  ResumoImportacaoLiveClin,
  ResultadoPreviewImportacaoLiveClin,
  StatusLiveClin,
} from './types'

const SUFIXOS_COLUNAS = {
  id: 'patientReport.headers.id',
  nome: 'patientReport.headers.full_name',
  email: 'patientReport.headers.email',
  telefone: 'patientReport.headers.phone_number',
  status: 'patientReport.headers.customer_status',
  plano: 'patientReport.headers.last_service_provided',
  dataFimPlano: 'patientReport.headers.service_end_date',
  diasRestantes: 'patientReport.headers.service_days_remaining',
} as const

type ChavesLinha = Record<keyof typeof SUFIXOS_COLUNAS, string>

const QUANTIDADE_PREVIA = 10

function resolverChave(linha: Record<string, unknown>, sufixo: string): string {
  if (sufixo in linha) return sufixo

  const chaveEncontrada = Object.keys(linha).find(
    (chave) => chave === sufixo || chave.endsWith(`.${sufixo.split('.').pop()}`),
  )

  return chaveEncontrada ?? sufixo
}

function resolverChavesLinha(linha: Record<string, unknown>): ChavesLinha {
  return {
    id: resolverChave(linha, SUFIXOS_COLUNAS.id),
    nome: resolverChave(linha, SUFIXOS_COLUNAS.nome),
    email: resolverChave(linha, SUFIXOS_COLUNAS.email),
    telefone: resolverChave(linha, SUFIXOS_COLUNAS.telefone),
    status: resolverChave(linha, SUFIXOS_COLUNAS.status),
    plano: resolverChave(linha, SUFIXOS_COLUNAS.plano),
    dataFimPlano: resolverChave(linha, SUFIXOS_COLUNAS.dataFimPlano),
    diasRestantes: resolverChave(linha, SUFIXOS_COLUNAS.diasRestantes),
  }
}

function lerCampo(linha: Record<string, unknown>, chave: string): string {
  const valor = linha[chave]
  if (valor == null) return ''
  return String(valor).trim()
}

function lerCampoData(linha: Record<string, unknown>, chave: string): string {
  return normalizarDataArquivoLiveClin(linha[chave])
}

function normalizarStatus(valor: string): StatusLiveClin {
  const status = valor.trim().toLowerCase()

  if (status === 'active') return 'ACTIVE'
  if (status === 'inactive') return 'INACTIVE'
  if (status === 'finished') return 'FINISHED'

  return 'DESCONHECIDO'
}

function lerCampoInteiro(linha: Record<string, unknown>, chave: string): number | null {
  const valor = linha[chave]
  if (valor == null || valor === '') return null

  const numero = typeof valor === 'number' ? valor : Number(String(valor).trim())
  return Number.isFinite(numero) ? numero : null
}

function linhaTemDados(linha: Record<string, unknown>, chaves: ChavesLinha): boolean {
  return (
    lerCampo(linha, chaves.nome) !== '' ||
    lerCampo(linha, chaves.id) !== '' ||
    lerCampo(linha, chaves.telefone) !== ''
  )
}

function mapearLinha(
  linha: Record<string, unknown>,
  chaves: ChavesLinha,
): PacienteLiveClin {
  const telefone = lerCampo(linha, chaves.telefone)

  return {
    idLiveClin: lerCampo(linha, chaves.id),
    nome: lerCampo(linha, chaves.nome),
    telefone,
    telefoneNormalizado: telefoneNormalizadoLiveClin(telefone),
    email: lerCampo(linha, chaves.email),
    statusLiveClin: normalizarStatus(lerCampo(linha, chaves.status)),
    plano: lerCampo(linha, chaves.plano),
    dataFimPlano: lerCampoData(linha, chaves.dataFimPlano),
    diasRestantes: lerCampoInteiro(linha, chaves.diasRestantes),
  }
}

function montarResumo(
  linhas: Record<string, unknown>[],
  chaves: ChavesLinha,
): ResumoImportacaoLiveClin {
  let comTelefone = 0
  let comEmail = 0
  let active = 0
  let inactive = 0
  let finished = 0
  let comDataFinalServico = 0
  let comDiasRestantes = 0

  for (const linha of linhas) {
    const telefone = lerCampo(linha, chaves.telefone)
    const email = lerCampo(linha, chaves.email)
    const status = normalizarStatus(lerCampo(linha, chaves.status))
    const dataFimPlano = lerCampoData(linha, chaves.dataFimPlano)
    const diasRestantes = lerCampoInteiro(linha, chaves.diasRestantes)

    if (telefone !== '') comTelefone += 1
    if (email !== '') comEmail += 1
    if (status === 'ACTIVE') active += 1
    if (status === 'INACTIVE') inactive += 1
    if (status === 'FINISHED') finished += 1
    if (dataFimPlano !== '') comDataFinalServico += 1
    if (diasRestantes !== null) comDiasRestantes += 1
  }

  const totalRegistros = linhas.length

  return {
    totalRegistros,
    comTelefone,
    semTelefone: totalRegistros - comTelefone,
    comEmail,
    active,
    inactive,
    finished,
    comDataFinalServico,
    comDiasRestantes,
  }
}

function lerLinhasDoArquivo(buffer: ArrayBuffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const nomeAba = workbook.SheetNames[0]

  if (!nomeAba) {
    return []
  }

  const planilha = workbook.Sheets[nomeAba]
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(planilha, { defval: '' })
}

export function formatosArquivoImportacaoAceitos(): string {
  return '.csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'
}

export async function analisarArquivoLiveClin(
  arquivo: File,
): Promise<ResultadoPreviewImportacaoLiveClin> {
  const buffer = await arquivo.arrayBuffer()
  const linhasBrutas = lerLinhasDoArquivo(buffer)

  if (linhasBrutas.length === 0) {
    return {
      nomeArquivo: arquivo.name,
      resumo: {
        totalRegistros: 0,
        comTelefone: 0,
        semTelefone: 0,
        comEmail: 0,
        active: 0,
        inactive: 0,
        finished: 0,
        comDataFinalServico: 0,
        comDiasRestantes: 0,
      },
      previa: [],
      pacientes: [],
    }
  }

  const chaves = resolverChavesLinha(linhasBrutas[0])
  const linhasValidas = linhasBrutas.filter((linha) => linhaTemDados(linha, chaves))
  const pacientes = linhasValidas.map((linha) => mapearLinha(linha, chaves))

  return {
    nomeArquivo: arquivo.name,
    resumo: montarResumo(linhasValidas, chaves),
    pacientes,
    previa: pacientes.slice(0, QUANTIDADE_PREVIA),
  }
}
