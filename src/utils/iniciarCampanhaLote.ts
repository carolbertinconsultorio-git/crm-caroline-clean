import type { Contato } from '../types/contato'
import { dataRelativa } from './contatoHelpers'
import { aplicarInicioCampanhaReativacao } from './iniciarCampanha'

export const NOME_CAMPANHA_REATIVACAO = 'Reativação de ex-pacientes'

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

export function registrarCampanhaIniciada(
  contato: Contato,
  campanhaNome: string,
  campanhaMensagem?: string,
): Contato {
  const mensagem = campanhaMensagem?.trim()
  const contatoAtualizado: Contato = {
    ...contato,
    campanhaNome,
    campanhaIniciadaEm: dataRelativa(0),
  }

  if (mensagem) {
    contatoAtualizado.campanhaMensagem = mensagem
  }

  return contatoAtualizado
}

export type ConfiguracaoCampanhaLote = {
  campanhaNome?: string
  campanhaMensagem?: string
}

export function prepararContatosCampanhaReativacaoLote(
  contatos: Contato[],
  config?: ConfiguracaoCampanhaLote,
): Contato[] {
  const nome = config?.campanhaNome?.trim() || NOME_CAMPANHA_REATIVACAO
  const mensagem = config?.campanhaMensagem?.trim() || undefined

  return contatos.map((contato) =>
    registrarCampanhaIniciada(aplicarInicioCampanhaReativacao(contato), nome, mensagem),
  )
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

export function contatoTemCampanhaAtiva(contato: Contato): boolean {
  return contato.objetivoFollowUp !== undefined
}

export function todosContatosComCampanhaAtiva(contatos: Contato[]): boolean {
  return contatos.length > 0 && contatos.every(contatoTemCampanhaAtiva)
}

export type DadosAtualizacaoCampanha = {
  campanhaNome: string
  campanhaMensagem: string
}

export function valoresIniciaisAtualizacaoCampanha(contatos: Contato[]): DadosAtualizacaoCampanha {
  if (contatos.length === 0) {
    return { campanhaNome: '', campanhaMensagem: '' }
  }

  const primeiro = contatos[0]!
  const nomesIguais = contatos.every(
    (contato) => (contato.campanhaNome ?? '') === (primeiro.campanhaNome ?? ''),
  )
  const mensagensIguais = contatos.every(
    (contato) => (contato.campanhaMensagem ?? '') === (primeiro.campanhaMensagem ?? ''),
  )

  return {
    campanhaNome: nomesIguais ? (primeiro.campanhaNome ?? '') : '',
    campanhaMensagem: mensagensIguais ? (primeiro.campanhaMensagem ?? '') : '',
  }
}

export function aplicarAtualizacaoCampanha(
  contato: Contato,
  dados: DadosAtualizacaoCampanha,
): Contato {
  const nome = dados.campanhaNome.trim()
  const mensagem = dados.campanhaMensagem.trim()
  const atualizado: Contato = { ...contato }

  if (nome) {
    atualizado.campanhaNome = nome
  }

  if (mensagem) {
    atualizado.campanhaMensagem = mensagem
  } else {
    delete atualizado.campanhaMensagem
  }

  return atualizado
}
