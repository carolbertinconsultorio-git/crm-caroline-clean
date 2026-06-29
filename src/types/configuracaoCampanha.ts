export type TipoNovaCampanha = 'REATIVACAO' | 'INDICACAO' | 'PERSONALIZADA'

export type ConfiguracaoNovaCampanha = {
  tipo: TipoNovaCampanha
  campanhaNome: string
  campanhaMensagem: string
}
