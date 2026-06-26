import type { Contato } from '../types/contato'
import { aplicarInicioCampanhaReativacao } from './iniciarCampanha'

export type ClassificacaoCampanhaReativacaoLote = {
  validos: Contato[]
  ignoradosCampanhaAtiva: Contato[]
  ignoradosStatusIncompativel: Contato[]
}

export type ResultadoCampanhaReativacaoLote = {
  iniciados: number
  ignoradosCampanhaAtiva: number
  ignoradosStatusIncompativel: number
}

export function classificarContatosParaCampanhaReativacaoLote(
  contatos: Contato[],
): ClassificacaoCampanhaReativacaoLote {
  const validos: Contato[] = []
  const ignoradosCampanhaAtiva: Contato[] = []
  const ignoradosStatusIncompativel: Contato[] = []

  for (const contato of contatos) {
    if (contato.objetivoFollowUp !== undefined) {
      ignoradosCampanhaAtiva.push(contato)
      continue
    }

    if (contato.status !== 'PACIENTE_INATIVO') {
      ignoradosStatusIncompativel.push(contato)
      continue
    }

    validos.push(contato)
  }

  return { validos, ignoradosCampanhaAtiva, ignoradosStatusIncompativel }
}

export function prepararContatosCampanhaReativacaoLote(contatos: Contato[]): Contato[] {
  return contatos.map((contato) => aplicarInicioCampanhaReativacao(contato))
}

export function resultadoCampanhaReativacaoLote(
  classificacao: ClassificacaoCampanhaReativacaoLote,
): ResultadoCampanhaReativacaoLote {
  return {
    iniciados: classificacao.validos.length,
    ignoradosCampanhaAtiva: classificacao.ignoradosCampanhaAtiva.length,
    ignoradosStatusIncompativel: classificacao.ignoradosStatusIncompativel.length,
  }
}
