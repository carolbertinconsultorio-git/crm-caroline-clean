import { listarContatos } from '../../services/contatoService'
import type { Contato } from '../../types/contato'
import { contatosMock } from './contatosMock'

export type OrigemContatos = 'firestore' | 'mock'

export const MENSAGEM_ERRO_CARREGAMENTO_CONTATOS =
  'Não foi possível carregar os contatos. Verifique login, permissões ou conexão.'

export type ResultadoCarregamentoContatos = {
  contatos: Contato[]
  origem: OrigemContatos
  erroCarregamento?: string
}

const emProducao = import.meta.env.PROD

function carregarMocks(): ResultadoCarregamentoContatos {
  return {
    contatos: [...contatosMock],
    origem: 'mock',
  }
}

function resultadoErroProducao(): ResultadoCarregamentoContatos {
  return {
    contatos: [],
    origem: 'firestore',
    erroCarregamento: MENSAGEM_ERRO_CARREGAMENTO_CONTATOS,
  }
}

export async function carregarContatos(): Promise<ResultadoCarregamentoContatos> {
  try {
    const contatosFirestore = await listarContatos()

    if (contatosFirestore.length > 0) {
      return {
        contatos: contatosFirestore,
        origem: 'firestore',
      }
    }

    if (emProducao) {
      return resultadoErroProducao()
    }

    return carregarMocks()
  } catch (erro) {
    console.warn(
      'Não foi possível carregar contatos do Firestore. Usando mocks como fallback.',
      erro,
    )

    if (emProducao) {
      return resultadoErroProducao()
    }

    return carregarMocks()
  }
}
