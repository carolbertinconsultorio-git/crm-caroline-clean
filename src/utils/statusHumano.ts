import type { ContatoStatus } from '../types/contatoStatus'

export const STATUS_FRASES: Record<ContatoStatus, string> = {
  NOVO: 'Novo contato',
  FOLLOW_UP_2_DIAS: 'Follow-up em 2 dias',
  REENGAJAMENTO_7_DIAS: 'Reengajamento em 7 dias',
  DESAPEGO_10_DIAS: 'Desapego em 10 dias',
  LEAD_QUENTE: 'Lead com alto potencial',
  PACIENTE_ATIVO: 'Paciente em acompanhamento',
  PACIENTE_INATIVO: 'Paciente inativo',
  PERDIDO: 'Contato arquivado',
}
