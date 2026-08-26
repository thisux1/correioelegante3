/**
 * Utilitários para formatação e validação de CPF (Cadastro de Pessoas Físicas)
 * Conforme regras oficiais da Receita Federal do Brasil.
 */

export function cleanCpf(value: string): string {
  return value.replace(/\D/g, '')
}

export function formatCpf(value: string): string {
  const digits = cleanCpf(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

export function isValidCpf(cpf: string): boolean {
  const clean = cleanCpf(cpf)
  if (clean.length !== 11) return false

  // Bloqueia CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false

  // Validação do 1º dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i)
  }
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(clean.charAt(9), 10)) return false

  // Validação do 2º dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i)
  }
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  return rev === parseInt(clean.charAt(10), 10)
}
