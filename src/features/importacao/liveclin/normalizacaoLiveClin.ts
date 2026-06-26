export function normalizarEmailLiveClin(email: string): string | null {
  const normalizado = email.trim().toLowerCase()
  if (!normalizado || !normalizado.includes('@')) return null
  return normalizado
}

/** Apenas dígitos para comparação — sem DDI automático (diferente do WhatsApp). */
export function telefoneNormalizadoLiveClin(telefone: string): string | null {
  const numeros = telefone.replace(/\D/g, '')
  if (!numeros) return null
  return numeros
}
