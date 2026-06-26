/**
 * Converte valores de data vindos do parser XLSX (CSV/XLSX LiveClin).
 * O SheetJS frequentemente entrega datas como serial numérico do Excel (ex.: 46285.87),
 * não como string ISO. String(serial) quebra o formatarData() do CRM.
 */
export function normalizarDataArquivoLiveClin(valor: unknown): string {
  if (valor == null || valor === '') return ''

  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) return ''
    const ano = valor.getUTCFullYear()
    const mes = String(valor.getUTCMonth() + 1).padStart(2, '0')
    const dia = String(valor.getUTCDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  if (typeof valor === 'number') {
    if (!Number.isFinite(valor) || valor <= 0) return ''
    return serialExcelParaIso(valor)
  }

  const texto = String(valor).trim()
  if (!texto) return ''

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return texto.slice(0, 10)
  }

  const serial = Number(texto)
  if (Number.isFinite(serial) && serial > 1000) {
    return serialExcelParaIso(serial)
  }

  return ''
}

function serialExcelParaIso(serial: number): string {
  const parteInteira = Math.floor(serial)
  const epoch = Date.UTC(1899, 11, 30)
  const data = new Date(epoch + parteInteira * 86400000)

  if (Number.isNaN(data.getTime())) return ''

  const ano = data.getUTCFullYear()
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(data.getUTCDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}
