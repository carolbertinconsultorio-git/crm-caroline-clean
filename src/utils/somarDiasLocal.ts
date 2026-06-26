/**
 * Formata uma data do calendário local como YYYY-MM-DD, sem conversão UTC.
 */
export function formatarDataIsoLocal(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/**
 * Retorna o início do dia no fuso local (meia-noite local).
 */
export function inicioDoDiaLocal(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

/**
 * Soma dias no calendário local a partir de uma data-base (padrão: hoje).
 * +N significa exatamente N dias corridos à frente no calendário local.
 */
export function somarDiasLocal(dias: number, dataBase: Date = new Date()): string {
  const data = inicioDoDiaLocal(dataBase)
  data.setDate(data.getDate() + dias)
  return formatarDataIsoLocal(data)
}
