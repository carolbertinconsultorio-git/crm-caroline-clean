export function normalizarTelefoneWhatsApp(telefone: string): string | null {
  const numeros = telefone.replace(/\D/g, '')
  if (!numeros) return null

  const comPais = numeros.startsWith('55') ? numeros : `55${numeros}`

  // 55 + DDD (2) + número (8 ou 9 dígitos)
  if (comPais.length < 12) return null

  return comPais
}

export function gerarLinkWhatsApp(telefone: string): string | null {
  const normalizado = normalizarTelefoneWhatsApp(telefone)
  if (!normalizado) return null

  return `https://wa.me/${normalizado}`
}
