import type { Campanha, StatusCampanha, TipoCampanha } from '../types/campanha'
import type { Contato } from '../types/contato'

export type DadosCampanhaContato = {
  nome?: string
  mensagem?: string
  dataInicio?: string
  tipo?: TipoCampanha
  status?: StatusCampanha
  campanhaNaoEncontrada: boolean
  temDadosCampanha: boolean
}

function dadosLegadosContato(contato: Contato): Omit<DadosCampanhaContato, 'campanhaNaoEncontrada'> {
  return {
    nome: contato.campanhaNome,
    mensagem: contato.campanhaMensagem,
    dataInicio: contato.campanhaIniciadaEm,
    temDadosCampanha: Boolean(
      contato.campanhaNome || contato.campanhaMensagem || contato.campanhaIniciadaEm,
    ),
  }
}

export function resolverDadosCampanhaContato(
  contato: Contato,
  campanhas: Campanha[],
  campanhasCarregadas: boolean,
): DadosCampanhaContato {
  if (!contato.campanhaId) {
    return {
      ...dadosLegadosContato(contato),
      campanhaNaoEncontrada: false,
    }
  }

  const campanha = campanhas.find((item) => item.id === contato.campanhaId)

  if (campanha) {
    return {
      nome: campanha.nome,
      mensagem: campanha.mensagem,
      dataInicio: campanha.dataInicio,
      tipo: campanha.tipo,
      status: campanha.status,
      campanhaNaoEncontrada: false,
      temDadosCampanha: true,
    }
  }

  if (!campanhasCarregadas) {
    return {
      ...dadosLegadosContato(contato),
      campanhaNaoEncontrada: false,
    }
  }

  return {
    ...dadosLegadosContato(contato),
    campanhaNaoEncontrada: true,
  }
}
