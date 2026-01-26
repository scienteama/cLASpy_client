/* eslint-disable @typescript-eslint/no-explicit-any */
export function NumericInputRule(value: number, allowNegative = false, allowZero = false, maxDecimals = 2) {
  if (value === null || value === undefined) {
    return 'Ce champ est obligatoire !';
  }

  if (isNaN(value)) {
    return 'La valeur doit être un nombre valide !';
  }

  if (!allowNegative && value < 0) {
    return 'Valeur positive requise !';
  }

  if (!allowZero && value == 0) {
    return 'Valeur ne peut pas être zéro !';
  }

  const decimals = String(value).split('.')[1] || '';
  if (decimals.length > maxDecimals) {
    return `Maximum ${maxDecimals} décimales autorisées !`;
  }

  return true;
}

export const ratioRules = [
  (val: number) => val !== null && val !== undefined || 'Valeur requise',
  (val: number) => val >= 0 || 'Le ratio doit être ≥ 0',
  (val: number) => val <= 1 || 'Le ratio doit être ≤ 1'
]

export const requiredRule = (name: string, verbose=true) =>

  (val: any) =>
    val !== null && val !== undefined && val !== ''
      ||  (verbose ? `${name} est requis` : '');

export const minRule = (min: number, verbose=true) =>
  (val: any) =>
    val === null || val >= min || (verbose ? `Valeur minimale : ${min}` : '');

export const maxRule = (max: number, verbose=true) =>
  (val: any) =>
    val === null || val <= max || (verbose ? `Valeur maximale : ${max}` : '');

export const intRule = (verbose=true) =>
  (val: any) =>
    val === null || Number.isInteger(+val) || (verbose ? 'Doit être un entier' : '');
