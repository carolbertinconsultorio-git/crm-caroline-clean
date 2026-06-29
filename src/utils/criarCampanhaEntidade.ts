import { criarCampanha } from '../services/campanhaService'
import type { ConfiguracaoNovaCampanha } from '../types/configuracaoCampanha'
import type { OrigemContatos } from '../features/contatos/carregarContatos'
import { dataRelativa } from './contatoHelpers'
import { NOME_CAMPANHA_REATIVACAO } from './iniciarCampanhaLote'

export async function criarCampanhaEntidadeEmFirestore(
  config: ConfiguracaoNovaCampanha,
  origemContatos: OrigemContatos,
): Promise<void> {
  if (origemContatos !== 'firestore') return

  const agora = new Date().toISOString()
  const nome =
    config.campanhaNome.trim() ||
    (config.tipo === 'REATIVACAO' ? NOME_CAMPANHA_REATIVACAO : 'Campanha personalizada')
  const mensagem = config.campanhaMensagem.trim() || undefined

  try {
    await criarCampanha({
      nome,
      mensagem,
      tipo: config.tipo,
      status: 'ATIVA',
      dataInicio: dataRelativa(0),
      criadaEm: agora,
      atualizadaEm: agora,
    })
  } catch (erro) {
    console.error('Não foi possível criar campanha na coleção campanhas.', erro)
  }
}
