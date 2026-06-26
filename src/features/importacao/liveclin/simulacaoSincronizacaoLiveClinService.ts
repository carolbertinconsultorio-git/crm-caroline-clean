import type { Contato } from '../../../types/contato'
import {
  normalizarEmailLiveClin,
  telefoneNormalizadoLiveClin,
} from './normalizacaoLiveClin'
import type {
  AcaoSincronizacaoLiveClin,
  LinhaSimulacaoSincronizacaoLiveClin,
  PacienteLiveClin,
  ResultadoSimulacaoSincronizacaoLiveClin,
} from './types'

const QUANTIDADE_AMOSTRA = 10

const CAMPOS_LIVECLIN_ATUALIZAVEIS = [
  'nome',
  'telefone',
  'email',
  'plano',
  'status LiveClin',
  'data fim do serviço',
  'dias restantes',
] as const

type IndiceContatos = {
  porEmail: Map<string, Contato[]>
  porTelefone: Map<string, Contato[]>
}

function montarIndiceContatos(contatos: Contato[]): IndiceContatos {
  const porEmail = new Map<string, Contato[]>()
  const porTelefone = new Map<string, Contato[]>()

  for (const contato of contatos) {
    const email = normalizarEmailLiveClin(extrairEmailDoContato(contato))
    const telefone = telefoneNormalizadoLiveClin(contato.telefone)

    if (email) {
      const lista = porEmail.get(email) ?? []
      lista.push(contato)
      porEmail.set(email, lista)
    }

    if (telefone) {
      const lista = porTelefone.get(telefone) ?? []
      lista.push(contato)
      porTelefone.set(telefone, lista)
    }
  }

  return { porEmail, porTelefone }
}

function extrairEmailDoContato(contato: Contato): string {
  return contato.email ?? ''
}

function listarCamposLiveClinComDados(paciente: PacienteLiveClin): string[] {
  const campos: string[] = []

  if (paciente.nome) campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[0])
  if (paciente.telefone) campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[1])
  if (paciente.email) campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[2])
  if (paciente.plano) campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[3])
  if (paciente.statusLiveClin !== 'DESCONHECIDO') {
    campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[4])
  }
  if (paciente.dataFimPlano) campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[5])
  if (paciente.diasRestantes !== null) campos.push(CAMPOS_LIVECLIN_ATUALIZAVEIS[6])

  return campos
}

function listarCamposLiveClinAlterados(
  paciente: PacienteLiveClin,
  contato: Contato,
): string[] {
  const campos = listarCamposLiveClinComDados(paciente)

  return campos.filter((campo) => {
    if (campo === 'nome') return paciente.nome.trim() !== contato.nome.trim()
    if (campo === 'telefone') {
      const telefonePaciente =
        paciente.telefoneNormalizado ?? telefoneNormalizadoLiveClin(paciente.telefone)
      const telefoneContato = telefoneNormalizadoLiveClin(contato.telefone)
      return telefonePaciente !== telefoneContato
    }
    if (campo === 'email') {
      return paciente.email.trim() !== (contato.email ?? '').trim()
    }
    if (campo === 'plano') return paciente.plano.trim() !== (contato.plano ?? '').trim()
    if (campo === 'status LiveClin') {
      return paciente.statusLiveClin !== (contato.statusLiveClin ?? 'DESCONHECIDO')
    }
    if (campo === 'data fim do serviço') {
      return paciente.dataFimPlano !== (contato.dataFimPlano ?? '')
    }
    if (campo === 'dias restantes') {
      return paciente.diasRestantes !== (contato.diasRestantes ?? null)
    }
    return true
  })
}

function resolverCorrespondencia(
  paciente: PacienteLiveClin,
  indice: IndiceContatos,
): {
  acao: AcaoSincronizacaoLiveClin
  contato?: Contato
  motivoRevisao?: string
} {
  const email = normalizarEmailLiveClin(paciente.email)
  const telefone =
    paciente.telefoneNormalizado ?? telefoneNormalizadoLiveClin(paciente.telefone)

  if (!email && !telefone) {
    return {
      acao: 'revisao',
      motivoRevisao: 'Sem e-mail e sem telefone para identificação automática.',
    }
  }

  const porEmail = email ? (indice.porEmail.get(email) ?? []) : []
  const porTelefone = telefone ? (indice.porTelefone.get(telefone) ?? []) : []

  if (email && porEmail.length > 1) {
    return {
      acao: 'revisao',
      motivoRevisao: 'Mais de um contato no CRM com o mesmo e-mail.',
    }
  }

  if (telefone && porTelefone.length > 1) {
    return {
      acao: 'revisao',
      motivoRevisao: 'Mais de um contato no CRM com o mesmo telefone.',
    }
  }

  const contatoPorEmail = porEmail.length === 1 ? porEmail[0] : undefined
  const contatoPorTelefone = porTelefone.length === 1 ? porTelefone[0] : undefined

  if (
    contatoPorEmail &&
    contatoPorTelefone &&
    contatoPorEmail.id !== contatoPorTelefone.id
  ) {
    return {
      acao: 'revisao',
      motivoRevisao:
        'E-mail e telefone correspondem a contatos diferentes no CRM.',
    }
  }

  const contato = contatoPorEmail ?? contatoPorTelefone

  if (contato) {
    return { acao: 'atualizar', contato }
  }

  return { acao: 'novo' }
}

function montarLinhaSimulacao(
  paciente: PacienteLiveClin,
  acao: AcaoSincronizacaoLiveClin,
  contato?: Contato,
  motivoRevisao?: string,
): LinhaSimulacaoSincronizacaoLiveClin {
  return {
    acao,
    paciente,
    contatoExistenteId: contato?.id,
    contatoExistenteNome: contato?.nome,
    motivoRevisao,
    camposLiveClinAtualizados:
      acao === 'atualizar' && contato
        ? listarCamposLiveClinAlterados(paciente, contato)
        : acao === 'novo'
          ? listarCamposLiveClinComDados(paciente)
          : [],
  }
}

export function simularSincronizacaoLiveClin(
  pacientes: PacienteLiveClin[],
  contatos: Contato[],
): ResultadoSimulacaoSincronizacaoLiveClin {
  const indice = montarIndiceContatos(contatos)
  const contatosVinculados = new Set<string>()

  const linhas: LinhaSimulacaoSincronizacaoLiveClin[] = []

  for (const paciente of pacientes) {
    const correspondencia = resolverCorrespondencia(paciente, indice)

    if (
      correspondencia.acao === 'atualizar' &&
      correspondencia.contato &&
      contatosVinculados.has(correspondencia.contato.id)
    ) {
      linhas.push(
        montarLinhaSimulacao(
          paciente,
          'revisao',
          correspondencia.contato,
          'Outro registro LiveClin já foi vinculado a este contato.',
        ),
      )
      continue
    }

    if (correspondencia.acao === 'atualizar' && correspondencia.contato) {
      contatosVinculados.add(correspondencia.contato.id)
    }

    linhas.push(
      montarLinhaSimulacao(
        paciente,
        correspondencia.acao,
        correspondencia.contato,
        correspondencia.motivoRevisao,
      ),
    )
  }

  const criarLinhas = linhas.filter((linha) => linha.acao === 'novo')
  const atualizarLinhas = linhas.filter((linha) => linha.acao === 'atualizar')
  const revisaoLinhas = linhas.filter((linha) => linha.acao === 'revisao')

  return {
    totalRegistros: pacientes.length,
    criar: criarLinhas.length,
    atualizar: atualizarLinhas.length,
    revisao: revisaoLinhas.length,
    linhas,
    linhasCriar: criarLinhas,
    amostraCriar: criarLinhas.slice(0, QUANTIDADE_AMOSTRA),
    amostraAtualizar: atualizarLinhas.slice(0, QUANTIDADE_AMOSTRA),
    amostraRevisao: revisaoLinhas.slice(0, QUANTIDADE_AMOSTRA),
  }
}

export async function simularSincronizacaoLiveClinComFirestore(
  pacientes: PacienteLiveClin[],
): Promise<ResultadoSimulacaoSincronizacaoLiveClin> {
  try {
    const { listarContatos } = await import('../../../services/contatoService')
    const contatos = await listarContatos()
    return simularSincronizacaoLiveClin(pacientes, contatos)
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    console.error(
      '[LiveClin simulação] Falha ao listar contatos do Firestore:',
      mensagem,
      erro,
    )
    throw erro
  }
}
