import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import type { Campanha, StatusCampanha, TipoCampanha } from '../types/campanha'
import { TODOS_OS_STATUS_CAMPANHA, TODOS_OS_TIPOS_CAMPANHA } from '../types/campanha'
import { prepararDadosFirestore } from '../utils/prepararDadosFirestore'
import { db } from './firebase'

const COLECAO_CAMPANHAS = 'campanhas'

type CampanhaSemId = Omit<Campanha, 'id'>
type CampanhaAtualizacao = Omit<Partial<CampanhaSemId>, 'mensagem'> & {
  mensagem?: string | null
}

function resolverTipoCampanha(valor: unknown): TipoCampanha {
  if (
    typeof valor === 'string' &&
    TODOS_OS_TIPOS_CAMPANHA.includes(valor as TipoCampanha)
  ) {
    return valor as TipoCampanha
  }

  return 'PERSONALIZADA'
}

function resolverStatusCampanha(valor: unknown): StatusCampanha {
  if (
    typeof valor === 'string' &&
    TODOS_OS_STATUS_CAMPANHA.includes(valor as StatusCampanha)
  ) {
    return valor as StatusCampanha
  }

  return 'RASCUNHO'
}

function normalizarCampoData(valor: unknown): string | undefined {
  if (valor == null || valor === '') return undefined

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

function normalizarCampoDataHora(valor: unknown): string | undefined {
  if (valor == null || valor === '') return undefined

  if (typeof valor === 'string') {
    return valor
  }

  if (
    typeof valor === 'object' &&
    'toDate' in valor &&
    typeof valor.toDate === 'function'
  ) {
    return valor.toDate().toISOString()
  }

  return String(valor)
}

function documentoParaCampanha(id: string, dados: DocumentData): Campanha {
  return {
    id,
    nome: String(dados.nome ?? ''),
    mensagem: dados.mensagem ? String(dados.mensagem) : undefined,
    tipo: resolverTipoCampanha(dados.tipo),
    status: resolverStatusCampanha(dados.status),
    dataInicio: normalizarCampoData(dados.dataInicio),
    dataFim: normalizarCampoData(dados.dataFim),
    criadaEm: normalizarCampoDataHora(dados.criadaEm),
    atualizadaEm: normalizarCampoDataHora(dados.atualizadaEm),
  }
}

function campanhaParaDocumento(dados: CampanhaSemId): DocumentData {
  const documento: DocumentData = {
    nome: dados.nome,
    tipo: dados.tipo,
    status: dados.status,
  }

  if (dados.mensagem !== undefined) {
    documento.mensagem = dados.mensagem
  }

  if (dados.dataInicio !== undefined) {
    documento.dataInicio = dados.dataInicio
  }

  if (dados.dataFim !== undefined) {
    documento.dataFim = dados.dataFim
  }

  if (dados.criadaEm !== undefined) {
    documento.criadaEm = dados.criadaEm
  }

  if (dados.atualizadaEm !== undefined) {
    documento.atualizadaEm = dados.atualizadaEm
  }

  return documento
}

export async function listarCampanhas(): Promise<Campanha[]> {
  const snapshot = await getDocs(collection(db, COLECAO_CAMPANHAS))

  return snapshot.docs.map((documento) =>
    documentoParaCampanha(documento.id, documento.data()),
  )
}

export async function obterCampanha(id: string): Promise<Campanha | null> {
  const snapshot = await getDoc(doc(db, COLECAO_CAMPANHAS, id))

  if (!snapshot.exists()) {
    return null
  }

  return documentoParaCampanha(snapshot.id, snapshot.data())
}

export async function criarCampanha(dados: CampanhaSemId): Promise<Campanha> {
  const referencia = await addDoc(
    collection(db, COLECAO_CAMPANHAS),
    campanhaParaDocumento(dados),
  )

  return {
    id: referencia.id,
    ...dados,
  }
}

export async function atualizarCampanha(
  id: string,
  dados: CampanhaAtualizacao,
): Promise<void> {
  await updateDoc(doc(db, COLECAO_CAMPANHAS, id), prepararDadosFirestore(dados))
}

export async function encerrarCampanha(id: string): Promise<void> {
  const agora = new Date().toISOString()

  await atualizarCampanha(id, {
    status: 'ENCERRADA',
    dataFim: agora.slice(0, 10),
    atualizadaEm: agora,
  })
}
