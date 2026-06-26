import type { Contato } from '../types/contato'
import { contatoEstaFollowUpAtrasado } from './agruparContatos'
import type { FiltrosExtrasContatos } from './filtrosContatos'

export function contatoSemCampanhaAtiva(contato: Contato): boolean {
  return contato.objetivoFollowUp === undefined
}

export function contatoComDataFimPlano(contato: Contato): boolean {
  return contato.dataFimPlano !== undefined && contato.dataFimPlano !== ''
}

export function contatoFollowUpAtrasado(
  contato: Contato,
  dataReferencia: Date = new Date(),
): boolean {
  return contatoEstaFollowUpAtrasado(contato, dataReferencia)
}

export function filtrosExtrasContatosAtivos(filtros: FiltrosExtrasContatos): boolean {
  return filtros.semCampanhaAtiva || filtros.comDataFimPlano || filtros.followUpAtrasado
}

export function contatoCorrespondeFiltrosExtrasContatos(
  contato: Contato,
  filtros: FiltrosExtrasContatos,
  dataReferencia: Date = new Date(),
): boolean {
  if (!filtrosExtrasContatosAtivos(filtros)) return true

  if (filtros.semCampanhaAtiva && !contatoSemCampanhaAtiva(contato)) {
    return false
  }

  if (filtros.comDataFimPlano && !contatoComDataFimPlano(contato)) {
    return false
  }

  if (filtros.followUpAtrasado && !contatoFollowUpAtrasado(contato, dataReferencia)) {
    return false
  }

  return true
}
