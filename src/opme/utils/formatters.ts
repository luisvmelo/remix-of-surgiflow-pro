/**
 * Formata número com separador de milhar (ponto)
 * Exemplo: 20030 => "20.030"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

/**
 * Formata valor em moeda brasileira (Real)
 * Exemplo: 1250000 => "R$ 1.250.000,00"
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata data no padrão DD/MM/AAAA
 * Aceita string no formato "DD/MM/AAAA" ou objeto Date
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    // Já está no formato correto
    return date;
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Valida se uma data está no formato DD/MM/AAAA
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(dateString);
}
