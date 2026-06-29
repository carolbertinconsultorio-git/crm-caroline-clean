export function extrairPrimeiroNome(nomeCompleto: string): string {
  const primeiro = nomeCompleto.trim().split(/\s+/)[0]
  return primeiro || nomeCompleto.trim()
}

export function personalizarMensagemCampanha(
  mensagem: string,
  nomeCompleto: string,
): string {
  const primeiroNome = extrairPrimeiroNome(nomeCompleto)
  return mensagem.replace(/\[nome\]/gi, primeiroNome)
}
