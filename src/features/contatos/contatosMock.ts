import type { Contato } from '../../types/contato'

function dataRelativa(diasAPartirDeHoje: number): string {
  const data = new Date()
  data.setDate(data.getDate() + diasAPartirDeHoje)
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export const contatosMock: Contato[] = [
  {
    id: '1',
    nome: 'Ana Silva',
    telefone: '(11) 98765-4321',
    origem: 'Instagram',
    status: 'FOLLOW_UP_2_DIAS',
    dataPrimeiroContato: dataRelativa(-7),
    dataUltimoContato: dataRelativa(-5),
    dataProximoFollowUp: dataRelativa(-2),
    observacoes: 'Não respondeu ao último contato.',
  },
  {
    id: '2',
    nome: 'Bruno Costa',
    telefone: '(11) 97654-3210',
    origem: 'Indicação',
    status: 'REENGAJAMENTO_7_DIAS',
    dataPrimeiroContato: dataRelativa(-15),
    dataUltimoContato: dataRelativa(-7),
    dataProximoFollowUp: dataRelativa(0),
    plano: 'Acompanhamento mensal',
  },
  {
    id: '3',
    nome: 'Carla Mendes',
    telefone: '(11) 96543-2109',
    origem: 'WhatsApp',
    status: 'NOVO',
    dataPrimeiroContato: dataRelativa(-1),
    dataUltimoContato: dataRelativa(-1),
    dataProximoFollowUp: dataRelativa(1),
    observacoes: 'Interessada em consulta inicial.',
  },
  {
    id: '4',
    nome: 'Daniela Rocha',
    telefone: '(11) 95432-1098',
    origem: 'Google',
    status: 'LEAD_QUENTE',
    dataPrimeiroContato: dataRelativa(-10),
    dataUltimoContato: dataRelativa(-1),
    dataProximoFollowUp: dataRelativa(0),
    plano: 'Plano trimestral',
    observacoes: 'Pediu valores e disponibilidade de horários.',
  },
  {
    id: '5',
    nome: 'Eduardo Lima',
    telefone: '(11) 94321-0987',
    origem: 'Indicação',
    status: 'PACIENTE_ATIVO',
    dataPrimeiroContato: dataRelativa(-90),
    dataUltimoContato: dataRelativa(-5),
    dataProximoFollowUp: dataRelativa(3),
    plano: 'Acompanhamento mensal',
    observacoes: 'Retorno de avaliação de composição corporal.',
  },
  {
    id: '6',
    nome: 'Fernanda Alves',
    telefone: '(11) 93210-9876',
    origem: 'Instagram',
    status: 'PERDIDO',
    dataPrimeiroContato: dataRelativa(-60),
    dataUltimoContato: dataRelativa(-45),
    dataProximoFollowUp: dataRelativa(-40),
    observacoes: 'Disse que não tem interesse no momento.',
  },
  {
    id: '7',
    nome: 'Gabriel Santos',
    telefone: '(11) 92109-8765',
    origem: 'Facebook',
    status: 'DESAPEGO_10_DIAS',
    dataPrimeiroContato: dataRelativa(-24),
    dataUltimoContato: dataRelativa(-13),
    dataProximoFollowUp: dataRelativa(-1),
    observacoes: 'Follow-up atrasado há um dia.',
  },
  {
    id: '8',
    nome: 'Helena Moura',
    telefone: '(11) 91098-7654',
    origem: 'Consultório',
    status: 'PACIENTE_INATIVO',
    dataPrimeiroContato: dataRelativa(-200),
    dataUltimoContato: dataRelativa(-70),
    dataProximoFollowUp: dataRelativa(1),
    plano: 'Acompanhamento mensal',
    observacoes: 'Possível reativação — follow-up amanhã.',
  },
]
