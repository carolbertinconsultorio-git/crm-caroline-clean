import type { Contato } from '../types/contato'
import type { ContatoStatus } from '../types/contatoStatus'
import { inicioDoDia } from './contatoHelpers'
import {
  contatoCorrespondeFiltrosInteligenciaComercial,
  FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS,
  type FiltrosInteligenciaComercial,
} from './filtroInteligenciaComercial'
import { contatoCorrespondeFiltrosExtrasContatos } from './filtrosExtrasContatos'

export type FiltroStatusContatos = ContatoStatus | 'TODOS'

export type FiltrosExtrasContatos = {
  semCampanhaAtiva: boolean
  comDataFimPlano: boolean
  followUpAtrasado: boolean
}

export const FILTROS_EXTRAS_CONTATOS_INICIAIS: FiltrosExtrasContatos = {
  semCampanhaAtiva: false,
  comDataFimPlano: false,
  followUpAtrasado: false,
}

export type EstadoFiltrosContatos = {
  busca: string
  filtroStatus: FiltroStatusContatos
  filtrosInteligencia: FiltrosInteligenciaComercial
  filtrosExtras: FiltrosExtrasContatos
}

export const ESTADO_FILTROS_CONTATOS_INICIAL: EstadoFiltrosContatos = {
  busca: '',
  filtroStatus: 'TODOS',
  filtrosInteligencia: FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS,
  filtrosExtras: FILTROS_EXTRAS_CONTATOS_INICIAIS,
}

export const PRESET_FILTROS_REATIVACAO: EstadoFiltrosContatos = {
  busca: '',
  filtroStatus: 'PACIENTE_INATIVO',
  filtrosInteligencia: {
    ...FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS,
    nuncaReativar: true,
  },
  filtrosExtras: FILTROS_EXTRAS_CONTATOS_INICIAIS,
}

export const PRESET_FILTROS_INDICACAO: EstadoFiltrosContatos = {
  busca: '',
  filtroStatus: 'PACIENTE_ATIVO',
  filtrosInteligencia: FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS,
  filtrosExtras: {
    ...FILTROS_EXTRAS_CONTATOS_INICIAIS,
    semCampanhaAtiva: true,
  },
}

export const PRESET_FILTROS_PLANO_ENCERRADO: EstadoFiltrosContatos = {
  busca: '',
  filtroStatus: 'PACIENTE_INATIVO',
  filtrosInteligencia: FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS,
  filtrosExtras: {
    ...FILTROS_EXTRAS_CONTATOS_INICIAIS,
    comDataFimPlano: true,
  },
}

export const PRESET_FILTROS_FOLLOW_UP_ATRASADO: EstadoFiltrosContatos = {
  busca: '',
  filtroStatus: 'TODOS',
  filtrosInteligencia: FILTROS_INTELIGENCIA_COMERCIAL_INICIAIS,
  filtrosExtras: {
    ...FILTROS_EXTRAS_CONTATOS_INICIAIS,
    followUpAtrasado: true,
  },
}

export function filtrarContatos(
  contatos: Contato[],
  filtros: EstadoFiltrosContatos,
  dataReferencia: Date = inicioDoDia(new Date()),
): Contato[] {
  const termo = filtros.busca.trim().toLowerCase()

  return contatos.filter((contato) => {
    const correspondeBusca =
      termo === '' ||
      contato.nome.toLowerCase().includes(termo) ||
      contato.telefone.includes(termo) ||
      contato.origem.toLowerCase().includes(termo)

    const correspondeStatus =
      filtros.filtroStatus === 'TODOS' || contato.status === filtros.filtroStatus

    const correspondeInteligenciaComercial = contatoCorrespondeFiltrosInteligenciaComercial(
      contato,
      filtros.filtrosInteligencia,
      dataReferencia,
    )

    const correspondeFiltrosExtras = contatoCorrespondeFiltrosExtrasContatos(
      contato,
      filtros.filtrosExtras,
      dataReferencia,
    )

    return (
      correspondeBusca &&
      correspondeStatus &&
      correspondeInteligenciaComercial &&
      correspondeFiltrosExtras
    )
  })
}

export function contarContatosComFiltros(
  contatos: Contato[],
  filtros: EstadoFiltrosContatos,
  dataReferencia: Date = inicioDoDia(new Date()),
): number {
  return filtrarContatos(contatos, filtros, dataReferencia).length
}

export type ContadoresOportunidades = {
  reativacao: number
  indicacao: number
  retornoPacientes: number
  followUpsAtrasados: number
}

export function calcularContadoresOportunidades(
  contatos: Contato[],
  dataReferencia: Date = inicioDoDia(new Date()),
): ContadoresOportunidades {
  return {
    reativacao: contarContatosComFiltros(contatos, PRESET_FILTROS_REATIVACAO, dataReferencia),
    indicacao: contarContatosComFiltros(contatos, PRESET_FILTROS_INDICACAO, dataReferencia),
    retornoPacientes: contarContatosComFiltros(
      contatos,
      PRESET_FILTROS_PLANO_ENCERRADO,
      dataReferencia,
    ),
    followUpsAtrasados: contarContatosComFiltros(
      contatos,
      PRESET_FILTROS_FOLLOW_UP_ATRASADO,
      dataReferencia,
    ),
  }
}
