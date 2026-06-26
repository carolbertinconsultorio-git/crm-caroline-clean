function carregarEmailsAutorizados(): string[] {
  const bruto = import.meta.env.VITE_AUTH_ALLOWED_EMAILS ?? ''

  return bruto
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0)
}

const emailsAutorizados = carregarEmailsAutorizados()

export function emailPermitido(email: string | null | undefined): boolean {
  if (!email) return false
  if (emailsAutorizados.length === 0) return false

  return emailsAutorizados.includes(email.trim().toLowerCase())
}
