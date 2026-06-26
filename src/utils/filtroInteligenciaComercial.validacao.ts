import type { Contato } from '../types/contato'
import {
  contatoComCampanhaAtiva,
  contatoComUltimoResultado,
  contatoCorrespondeFiltrosInteligenciaComercial,
  contatoNuncaTentamosReativar,
  contatoUltimaTentativaMais90Dias,
  type FiltrosInteligenciaComercial,
} from './filtroInteligenciaComercial'

function criarContato(parcial: Partial<Contato> & Pick<Contato, 'id' | 'status'>): Contato {
  return {
    id: parcial.id,
    nome: parcial.nome ?? 'Contato',
    telefone: parcial.telefone ?? '',
    origem: parcial.origem ?? 'Manual',
    status: parcial.status,
    dataPrimeiroContato: parcial.dataPrimeiroContato ?? '',
    dataUltimoContato: parcial.dataUltimoContato ?? '',
    dataProximoFollowUp: parcial.dataProximoFollowUp ?? '',
    objetivoFollowUp: parcial.objetivoFollowUp,
    ultimaReativacaoEm: parcial.ultimaReativacaoEm,
    ultimoResultadoReativacao: parcial.ultimoResultadoReativacao,
  }
}

function assert(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(`[filtroInteligenciaComercial.validacao] ${mensagem}`)
  }
}

const dataReferencia = new Date(2026, 5, 25)

export function executarValidacoesFiltroInteligenciaComercial(): void {
  const elegivelNunca = criarContato({ id: '1', status: 'PACIENTE_INATIVO' })
  const comTentativa = criarContato({
    id: '2',
    status: 'PACIENTE_INATIVO',
    ultimaReativacaoEm: '2026-06-25',
  })
  const comCampanha = criarContato({
    id: '3',
    status: 'PACIENTE_INATIVO',
    objetivoFollowUp: 'REATIVACAO',
  })
  const ativo = criarContato({ id: '4', status: 'PACIENTE_ATIVO' })

  assert(contatoNuncaTentamosReativar(elegivelNunca), 'inativo sem tentativa entra no filtro')
  assert(!contatoNuncaTentamosReativar(comTentativa), 'com ultimaReativacaoEm fica de fora')
  assert(!contatoNuncaTentamosReativar(comCampanha), 'com campanha ativa fica de fora')
  assert(!contatoNuncaTentamosReativar(ativo), 'ativo fica de fora')

  const campanhaReativacao = criarContato({
    id: '5',
    status: 'PACIENTE_INATIVO',
    objetivoFollowUp: 'REATIVACAO',
    ultimoResultadoReativacao: 'NAO_RESPONDEU',
  })

  assert(contatoComCampanhaAtiva(campanhaReativacao), 'identifica campanha ativa')
  assert(
    !contatoComCampanhaAtiva(criarContato({ id: '6', status: 'PACIENTE_INATIVO' })),
    'sem objetivo não é campanha ativa',
  )

  const tentativaAntiga = criarContato({
    id: '7',
    status: 'PACIENTE_INATIVO',
    ultimaReativacaoEm: '2026-01-01',
  })
  const tentativaRecente = criarContato({
    id: '8',
    status: 'PACIENTE_INATIVO',
    ultimaReativacaoEm: '2026-06-01',
  })

  assert(
    contatoUltimaTentativaMais90Dias(tentativaAntiga, dataReferencia),
    'tentativa antiga entra no filtro > 90 dias',
  )
  assert(
    !contatoUltimaTentativaMais90Dias(tentativaRecente, dataReferencia),
    'tentativa recente fica de fora',
  )

  assert(
    contatoComUltimoResultado(
      criarContato({
        id: '9',
        status: 'PACIENTE_INATIVO',
        ultimoResultadoReativacao: 'VAI_PENSAR',
      }),
      ['VAI_PENSAR', 'SEM_INTERESSE'],
    ),
    'resultado combina com OR no grupo',
  )

  const filtrosCombinados: FiltrosInteligenciaComercial = {
    nuncaReativar: false,
    campanhaAtiva: true,
    ultimaTentativaMais90Dias: false,
    resultados: ['NAO_RESPONDEU'],
  }

  assert(
    contatoCorrespondeFiltrosInteligenciaComercial(campanhaReativacao, filtrosCombinados),
    'combina campanha ativa com resultado',
  )
  assert(
    !contatoCorrespondeFiltrosInteligenciaComercial(
      criarContato({
        id: '10',
        status: 'PACIENTE_INATIVO',
        objetivoFollowUp: 'REATIVACAO',
        ultimoResultadoReativacao: 'VAI_PENSAR',
      }),
      filtrosCombinados,
    ),
    'combinação exige todos os critérios ativos',
  )

  const filtrosSemCampanhaMais90: FiltrosInteligenciaComercial = {
    nuncaReativar: false,
    campanhaAtiva: false,
    ultimaTentativaMais90Dias: true,
    resultados: [],
  }

  assert(
    contatoCorrespondeFiltrosInteligenciaComercial(tentativaAntiga, filtrosSemCampanhaMais90),
    'filtro isolado de > 90 dias',
  )
  assert(
    !contatoCorrespondeFiltrosInteligenciaComercial(comCampanha, filtrosSemCampanhaMais90),
    '> 90 dias sem campanha ativa não inclui quem não tem tentativa',
  )
}
