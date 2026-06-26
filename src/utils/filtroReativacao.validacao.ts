import { contatoNuncaTentamosReativar } from './filtroInteligenciaComercial'

function assert(condicao: boolean, mensagem: string): void {
  if (!condicao) {
    throw new Error(`[filtroReativacao.validacao] ${mensagem}`)
  }
}

export function executarValidacoesFiltroReativacao(): void {
  const elegivel = {
    id: '1',
    nome: 'Contato',
    telefone: '',
    origem: 'Manual',
    status: 'PACIENTE_INATIVO' as const,
    dataPrimeiroContato: '',
    dataUltimoContato: '',
    dataProximoFollowUp: '',
  }

  assert(contatoNuncaTentamosReativar(elegivel), 'inativo sem tentativa entra no filtro')
}
