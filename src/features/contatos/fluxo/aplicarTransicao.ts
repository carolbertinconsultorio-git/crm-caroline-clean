import type { Contato } from '../../../types/contato'
import type { ContatoStatus } from '../../../types/contatoStatus'
import type { ObjetivoFollowUp } from '../../../types/objetivoFollowUp'
import { STATUS_LABELS, somarDiasLocal } from '../../../utils/contatoHelpers'
import { resolverObjetivoFollowUp } from '../../../utils/resolverObjetivoFollowUp'
import type { ResultadoContato } from './resultadoContato'
import { RESULTADO_LABELS } from './resultadoContato'
import { buscarRegraTransicao } from './transicoes'
import type { RegraTransicao } from './transicoesLead'

export type ResultadoAplicacaoTransicao = {
  novoStatus: ContatoStatus
  dataProximoFollowUp: string | null
  exigeDataManual: boolean
  mensagemResumo: string
  novoObjetivoFollowUp?: ObjetivoFollowUp | null
}

export class TransicaoIndisponivelError extends Error {
  constructor(statusAtual: ContatoStatus, resultado: ResultadoContato) {
    super(
      `Transição indisponível para status ${statusAtual} com resultado ${resultado}.`,
    )
    this.name = 'TransicaoIndisponivelError'
  }
}

function resolverNovoStatus(
  statusAtual: ContatoStatus,
  novoStatus: ContatoStatus | 'MESMO_STATUS',
): ContatoStatus {
  return novoStatus === 'MESMO_STATUS' ? statusAtual : novoStatus
}

function validarDataManual(data: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error('Data manual inválida. Use o formato YYYY-MM-DD.')
  }
}

function objetivoDaRegra(
  regra: RegraTransicao,
): Pick<ResultadoAplicacaoTransicao, 'novoObjetivoFollowUp'> {
  if (regra.objetivoFollowUp === undefined) {
    return {}
  }

  return { novoObjetivoFollowUp: regra.objetivoFollowUp }
}

export function aplicarTransicao(
  contato: Contato,
  resultado: ResultadoContato,
  dataManualOpcional?: string,
): ResultadoAplicacaoTransicao {
  const objetivo = resolverObjetivoFollowUp(contato)
  const regra = buscarRegraTransicao(objetivo, contato.status, resultado)

  if (!regra) {
    throw new TransicaoIndisponivelError(contato.status, resultado)
  }

  const novoStatus = resolverNovoStatus(contato.status, regra.novoStatus)
  const exigeDataManual = regra.tipoData === 'manual'

  if (exigeDataManual && !dataManualOpcional) {
    return {
      novoStatus,
      dataProximoFollowUp: null,
      exigeDataManual: true,
      mensagemResumo: regra.mensagemResumo,
      ...objetivoDaRegra(regra),
    }
  }

  if (exigeDataManual && dataManualOpcional) {
    validarDataManual(dataManualOpcional)
    return {
      novoStatus,
      dataProximoFollowUp: dataManualOpcional,
      exigeDataManual: false,
      mensagemResumo: `${regra.mensagemResumo} Próximo follow-up em ${dataManualOpcional}.`,
      ...objetivoDaRegra(regra),
    }
  }

  if (regra.tipoData === 'nenhuma') {
    return {
      novoStatus,
      dataProximoFollowUp: null,
      exigeDataManual: false,
      mensagemResumo: `${regra.mensagemResumo} Novo status: ${STATUS_LABELS[novoStatus]}.`,
      ...objetivoDaRegra(regra),
    }
  }

  const dataProximoFollowUp = somarDiasLocal(regra.diasFollowUp ?? 0)

  return {
    novoStatus,
    dataProximoFollowUp,
    exigeDataManual: false,
    mensagemResumo: `${RESULTADO_LABELS[resultado]} — ${regra.mensagemResumo} Novo status: ${STATUS_LABELS[novoStatus]}. Follow-up em ${dataProximoFollowUp}.`,
    ...objetivoDaRegra(regra),
  }
}
