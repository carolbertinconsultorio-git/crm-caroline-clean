import type { ResultadoContato } from '../features/contatos/fluxo/resultadoContato'
import type { Contato } from '../types/contato'
import { somarDiasLocal } from './somarDiasLocal'

export type ResultadoFiltroInteligencia = Extract<
  ResultadoContato,
  'NAO_RESPONDEU' | 'VAI_PENSAR' | 'SEM_INTERESSE'
>

export const RESULTADOS_FILTRO_INTELIGENCIA: ResultadoFiltroInteligencia[] = [
  'NAO_RESPONDEU',
  'VAI_PENSAR',
  'SEM_INTERESSE',
]

export type FiltrosInteligenciaComercial = {
  nuncaReativar: boolean
  campanhaAtiva: boolean
  ultimaTentativaMais90Dias: boolean
  resultados: ResultadoFiltroInteligencia[]
}

export const FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS: FiltrosInteligenciaComercial = {
  nuncaReativar: false,
  campanhaAtiva: false,
  ultimaTentativaMais90Dias: false,
  resultados: [],
}

export function contatoNuncaTentamosReativar(contato: Contato): boolean {
  const semUltimaTentativa =
    contato.ultimaReativacaoEm === undefined || contato.ultimaReativacaoEm === ''

  return (
    contato.status === 'PACIENTE_INATIVO' &&
    semUltimaTentativa &&
    contato.objetivoFollowUp === undefined
  )
}

export function contatoComCampanhaAtiva(contato: Contato): boolean {
  return contato.objetivoFollowUp !== undefined
}

export function contatoUltimaTentativaMais90Dias(
  contato: Contato,
  dataReferencia: Date = new Date(),
): boolean {
  if (!contato.ultimaReativacaoEm) return false

  const limiteIso = somarDiasLocal(-90, dataReferencia)
  return contato.ultimaReativacaoEm <= limiteIso
}

export function contatoComUltimoResultado(
  contato: Contato,
  resultados: ResultadoFiltroInteligencia[],
): boolean {
  if (resultados.length === 0) return true

  return (
    contato.ultimoResultadoReativacao !== undefined &&
    resultados.includes(contato.ultimoResultadoReativacao as ResultadoFiltroInteligencia)
  )
}

export function filtrosInteligenciaComercialAtivos(
  filtros: FiltrosInteligenciaComercial,
): boolean {
  return (
    filtros.nuncaReativar ||
    filtros.campanhaAtiva ||
    filtros.ultimaTentativaMais90Dias ||
    filtros.resultados.length > 0
  )
}

export function contatoCorrespondeFiltrosInteligenciaComercial(
  contato: Contato,
  filtros: FiltrosInteligenciaComercial,
  dataReferencia: Date = new Date(),
): boolean {
  if (!filtrosInteligenciaComercialAtivos(filtros)) return true

  if (filtros.nuncaReativar && !contatoNuncaTentamosReativar(contato)) {
    return false
  }

  if (filtros.campanhaAtiva && !contatoComCampanhaAtiva(contato)) {
    return false
  }

  if (filtros.ultimaTentativaMais90Dias && !contatoUltimaTentativaMais90Dias(contato, dataReferencia)) {
    return false
  }

  if (!contatoComUltimoResultado(contato, filtros.resultados)) {
    return false
  }

  return true
}

export function alternarResultadoFiltroInteligencia(
  resultados: ResultadoFiltroInteligencia[],
  resultado: ResultadoFiltroInteligencia,
  ativo: boolean,
): ResultadoFiltroInteligencia[] {
  if (ativo) {
    return resultados.includes(resultado) ? resultados : [...resultados, resultado]
  }

  return resultados.filter((item) => item !== resultado)
}
