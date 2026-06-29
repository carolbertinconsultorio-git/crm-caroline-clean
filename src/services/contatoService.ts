import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import type { Contato, StatusLiveClin } from '../types/contato'
import type { ContatoStatus } from '../types/contatoStatus'
import { RESULTADOS_CONTATO, type ResultadoContato } from '../features/contatos/fluxo/resultadoContato'
import type { ObjetivoFollowUp } from '../types/objetivoFollowUp'
import { TODOS_OS_OBJETIVOS_FOLLOW_UP } from '../types/objetivoFollowUp'
import { TODOS_OS_STATUS } from '../utils/contatoHelpers'
import { db } from './firebase'

const COLECAO_CONTATOS = 'contatos'

type ContatoSemId = Omit<Contato, 'id'>
type ContatoAtualizacao = Omit<
  Partial<ContatoSemId>,
  'objetivoFollowUp' | 'observacoes' | 'campanhaMensagem'
> & {
  objetivoFollowUp?: ObjetivoFollowUp | null
  observacoes?: string | null
  campanhaMensagem?: string | null
}

function resolverResultadoReativacao(valor: unknown): ResultadoContato | undefined {
  if (
    typeof valor === 'string' &&
    RESULTADOS_CONTATO.includes(valor as ResultadoContato)
  ) {
    return valor as ResultadoContato
  }

  return undefined
}

function resolverStatus(valor: unknown): ContatoStatus {
  if (
    typeof valor === 'string' &&
    TODOS_OS_STATUS.includes(valor as ContatoStatus)
  ) {
    return valor as ContatoStatus
  }

  return 'NOVO'
}

function resolverObjetivoFollowUpValor(valor: unknown): ObjetivoFollowUp | undefined {
  if (
    typeof valor === 'string' &&
    TODOS_OS_OBJETIVOS_FOLLOW_UP.includes(valor as ObjetivoFollowUp)
  ) {
    return valor as ObjetivoFollowUp
  }

  return undefined
}

function resolverStatusLiveClin(valor: unknown): StatusLiveClin | undefined {
  if (
    valor === 'ACTIVE' ||
    valor === 'INACTIVE' ||
    valor === 'FINISHED' ||
    valor === 'DESCONHECIDO'
  ) {
    return valor
  }

  return undefined
}

function resolverNumeroOpcional(valor: unknown): number | undefined {
  if (valor == null || valor === '') return undefined

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : undefined
}

function normalizarCampoData(valor: unknown): string {
  if (valor == null || valor === '') return ''

  if (typeof valor === 'string') {
    return valor.slice(0, 10)
  }

  if (
    typeof valor === 'object' &&
    'toDate' in valor &&
    typeof valor.toDate === 'function'
  ) {
    const data = valor.toDate()
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  return String(valor).slice(0, 10)
}

function documentoParaContato(id: string, dados: DocumentData): Contato {
  return {
    id,
    nome: String(dados.nome ?? ''),
    telefone: String(dados.telefone ?? ''),
    origem: String(dados.origem ?? ''),
    status: resolverStatus(dados.status),
    dataPrimeiroContato: normalizarCampoData(dados.dataPrimeiroContato),
    dataUltimoContato: normalizarCampoData(dados.dataUltimoContato),
    dataProximoFollowUp: normalizarCampoData(dados.dataProximoFollowUp),
    email: dados.email ? String(dados.email) : undefined,
    statusLiveClin: resolverStatusLiveClin(dados.statusLiveClin),
    plano: dados.plano ? String(dados.plano) : undefined,
    dataFimPlano: dados.dataFimPlano ? normalizarCampoData(dados.dataFimPlano) : undefined,
    diasRestantes: resolverNumeroOpcional(dados.diasRestantes),
    observacoes: dados.observacoes ? String(dados.observacoes) : undefined,
    objetivoFollowUp: resolverObjetivoFollowUpValor(dados.objetivoFollowUp),
    ultimaReativacaoEm: dados.ultimaReativacaoEm
      ? normalizarCampoData(dados.ultimaReativacaoEm)
      : undefined,
    ultimoResultadoReativacao: resolverResultadoReativacao(dados.ultimoResultadoReativacao),
    campanhaNome: dados.campanhaNome ? String(dados.campanhaNome) : undefined,
    campanhaIniciadaEm: dados.campanhaIniciadaEm
      ? normalizarCampoData(dados.campanhaIniciadaEm)
      : undefined,
    campanhaMensagem: dados.campanhaMensagem ? String(dados.campanhaMensagem) : undefined,
  }
}

function contatoParaDocumento(dados: ContatoSemId): DocumentData {
  const documento: DocumentData = {
    nome: dados.nome,
    telefone: dados.telefone,
    origem: dados.origem,
    status: dados.status,
    dataPrimeiroContato: dados.dataPrimeiroContato,
    dataUltimoContato: dados.dataUltimoContato,
    dataProximoFollowUp: dados.dataProximoFollowUp,
  }

  if (dados.plano !== undefined) {
    documento.plano = dados.plano
  }

  if (dados.email !== undefined) {
    documento.email = dados.email
  }

  if (dados.statusLiveClin !== undefined) {
    documento.statusLiveClin = dados.statusLiveClin
  }

  if (dados.dataFimPlano !== undefined) {
    documento.dataFimPlano = dados.dataFimPlano
  }

  if (dados.diasRestantes !== undefined) {
    documento.diasRestantes = dados.diasRestantes
  }

  if (dados.observacoes !== undefined) {
    documento.observacoes = dados.observacoes
  }

  if (dados.objetivoFollowUp !== undefined) {
    documento.objetivoFollowUp = dados.objetivoFollowUp
  }

  if (dados.ultimaReativacaoEm !== undefined) {
    documento.ultimaReativacaoEm = dados.ultimaReativacaoEm
  }

  if (dados.ultimoResultadoReativacao !== undefined) {
    documento.ultimoResultadoReativacao = dados.ultimoResultadoReativacao
  }

  if (dados.campanhaNome !== undefined) {
    documento.campanhaNome = dados.campanhaNome
  }

  if (dados.campanhaIniciadaEm !== undefined) {
    documento.campanhaIniciadaEm = dados.campanhaIniciadaEm
  }

  if (dados.campanhaMensagem !== undefined) {
    documento.campanhaMensagem = dados.campanhaMensagem
  }

  return documento
}

function prepararDadosAtualizacao(dados: ContatoAtualizacao): DocumentData {
  return Object.fromEntries(
    Object.entries(dados)
      .filter(([, valor]) => valor !== undefined)
      .map(([chave, valor]) => [chave, valor === null ? deleteField() : valor]),
  )
}

export async function listarContatos(): Promise<Contato[]> {
  const snapshot = await getDocs(collection(db, COLECAO_CONTATOS))

  return snapshot.docs.map((documento) =>
    documentoParaContato(documento.id, documento.data()),
  )
}

export async function criarContato(dados: ContatoSemId): Promise<Contato> {
  const referencia = await addDoc(
    collection(db, COLECAO_CONTATOS),
    contatoParaDocumento(dados),
  )

  return {
    id: referencia.id,
    ...dados,
  }
}

export async function atualizarContato(
  id: string,
  dados: ContatoAtualizacao,
): Promise<void> {
  await updateDoc(doc(db, COLECAO_CONTATOS, id), prepararDadosAtualizacao(dados))
}

export async function removerContato(id: string): Promise<void> {
  await deleteDoc(doc(db, COLECAO_CONTATOS, id))
}
