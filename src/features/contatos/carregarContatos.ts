import { listarContatos } from '../../services/contatoService'
import type { Contato } from '../../types/contato'
import { contatosMock } from './contatosMock'

export type OrigemContatos = 'firestore' | 'mock'

export type ResultadoCarregamentoContatos = {
  contatos: Contato[]
  origem: OrigemContatos
}

function carregarMocks(): ResultadoCarregamentoContatos {
  return {
    contatos: [...contatosMock],
    origem: 'mock',
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

    return carregarMocks()
  } catch (erro) {
    console.warn(
      'Não foi possível carregar contatos do Firestore. Usando mocks como fallback.',
      erro,
    )
    return carregarMocks()
  }
}
