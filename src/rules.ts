export function NumericInputRule(value: number, allowNegative = false, allowZero = false, maxDecimals = 2) {
  if (value === null || value === undefined) {
    return 'Ce champ est obligatoire !';
  }

  console.log(isNaN(value));
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
