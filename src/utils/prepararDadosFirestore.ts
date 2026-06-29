import { deleteField, type DocumentData } from 'firebase/firestore'

export function prepararDadosFirestore(dados: Record<string, unknown>): DocumentData {
  return Object.fromEntries(
    Object.entries(dados)
      .filter(([, valor]) => valor !== undefined)
      .map(([chave, valor]) => [chave, valor === null ? deleteField() : valor]),
  )
}
