import type { Contato } from '../types/contato'
import type { ResultadoContato } from '../features/contatos/fluxo/resultadoContato'
import { dataRelativa } from './contatoHelpers'

export function registrarReativacaoConcluida(
  contato: Contato,
  resultado: ResultadoContato,
): Pick<Contato, 'ultimaReativacaoEm' | 'ultimoResultadoReativacao'> | null {
  if (contato.objetivoFollowUp !== 'REATIVACAO') {
    return null
  }

  return {
    ultimaReativacaoEm: dataRelativa(0),
    ultimoResultadoReativacao: resultado,
  }
}

export function aplicarRegistroReativacaoConcluida(
  contato: Contato,
  resultado: ResultadoContato,
): Contato {
  const registro = registrarReativacaoConcluida(contato, resultado)
  if (!registro) return contato

  return {
    ...contato,
    ...registro,
  }
}
