import { atualizarContato, criarContato, listarContatos } from '../../../services/contatoService'
import type { Contato } from '../../../types/contato'
import {
  mapearCamposLiveClinParaAtualizacao,
  mapearPacienteLiveClinParaContato,
  mesclarContatoComCamposLiveClin,
} from './mapeamentoLiveClin'
import { simularSincronizacaoLiveClin } from './simulacaoSincronizacaoLiveClinService'
import type { LinhaSimulacaoSincronizacaoLiveClin, PacienteLiveClin } from './types'

export const QUANTIDADE_IMPORTACAO_TESTE_LIVECLIN = 5

export type ResultadoSincronizacaoLiveClin = {
  criados: number
  atualizados: number
  ignorados: number
  erros: number
  contatos: Contato[]
  mensagensErro: string[]
}

/** @deprecated Use ResultadoSincronizacaoLiveClin */
export type ResultadoImportacaoTesteLiveClin = ResultadoSincronizacaoLiveClin

function identificarPaciente(paciente: PacienteLiveClin): string {
  return paciente.nome || paciente.idLiveClin || 'sem nome'
}

async function executarSincronizacaoLinhas(
  linhas: LinhaSimulacaoSincronizacaoLiveClin[],
  contatosExistentes: Contato[],
): Promise<ResultadoSincronizacaoLiveClin> {
  const contatos: Contato[] = []
  const mensagensErro: string[] = []
  let criados = 0
  let atualizados = 0
  let ignorados = 0
  let erros = 0

  for (const linha of linhas) {
    const identificador = identificarPaciente(linha.paciente)

    if (linha.acao === 'revisao') {
      ignorados += 1
      mensagensErro.push(`${identificador}: ${linha.motivoRevisao ?? 'Revisão manual necessária.'}`)
      continue
    }

    if (linha.acao === 'novo') {
      try {
        const contato = await criarContato(mapearPacienteLiveClinParaContato(linha.paciente))
        contatos.push(contato)
        criados += 1
      } catch (erro) {
        erros += 1
        const mensagem =
          erro instanceof Error ? erro.message : 'Erro desconhecido ao criar contato.'
        mensagensErro.push(`${identificador}: ${mensagem}`)
        console.error('[LiveClin sincronização] Falha ao criar contato:', identificador, erro)
      }
      continue
    }

    if (linha.acao === 'atualizar') {
      const contatoExistente = contatosExistentes.find(
        (contato) => contato.id === linha.contatoExistenteId,
      )

      if (!contatoExistente) {
        erros += 1
        mensagensErro.push(`${identificador}: contato existente não encontrado no CRM.`)
        continue
      }

      const camposLiveClin = mapearCamposLiveClinParaAtualizacao(linha.paciente)

      try {
        await atualizarContato(contatoExistente.id, camposLiveClin)
        contatos.push(mesclarContatoComCamposLiveClin(contatoExistente, linha.paciente))
        atualizados += 1
      } catch (erro) {
        erros += 1
        const mensagem =
          erro instanceof Error ? erro.message : 'Erro desconhecido ao atualizar contato.'
        mensagensErro.push(`${identificador}: ${mensagem}`)
        console.error('[LiveClin sincronização] Falha ao atualizar contato:', identificador, erro)
      }
    }
  }

  return {
    criados,
    atualizados,
    ignorados,
    erros,
    contatos,
    mensagensErro,
  }
}

async function prepararLinhasSincronizacao(pacientes: PacienteLiveClin[]) {
  const contatosExistentes = await listarContatos()
  const simulacao = simularSincronizacaoLiveClin(pacientes, contatosExistentes)
  return { simulacao, contatosExistentes }
}

export async function sincronizarTodosPacientesLiveClin(
  pacientes: PacienteLiveClin[],
): Promise<ResultadoSincronizacaoLiveClin> {
  const { simulacao, contatosExistentes } = await prepararLinhasSincronizacao(pacientes)
  return executarSincronizacaoLinhas(simulacao.linhas, contatosExistentes)
}

export async function sincronizarPrimeirosPacientesTesteLiveClin(
  pacientes: PacienteLiveClin[],
): Promise<ResultadoSincronizacaoLiveClin> {
  const { simulacao, contatosExistentes } = await prepararLinhasSincronizacao(pacientes)
  return executarSincronizacaoLinhas(
    simulacao.linhas.slice(0, QUANTIDADE_IMPORTACAO_TESTE_LIVECLIN),
    contatosExistentes,
  )
}

/** @deprecated Use sincronizarPrimeirosPacientesTesteLiveClin */
export const importarPrimeirosPacientesTesteLiveClin =
  sincronizarPrimeirosPacientesTesteLiveClin
