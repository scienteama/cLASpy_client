/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Règle de validation pour un champ numérique.
 *
 * Vérifie :
 * - obligatoire
 * - nombre valide
 * - négatif autorisé ou non
 * - zéro autorisé ou non
 * - nombre maximal de décimales
 *
 * @param value Valeur à valider
 * @param allowNegative Autoriser les nombres négatifs (par défaut false)
 * @param allowZero Autoriser la valeur 0 (par défaut false)
 * @param maxDecimals Nombre maximal de décimales autorisées (par défaut 2)
 * @returns true si valide, ou message d'erreur
 */
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

/**
 * Règles pour valider un ratio compris entre 0 et 1.
 */
export const ratioRules = [
  (val: number) => (val !== null && val !== undefined) || 'Valeur requise',
  (val: number) => val >= 0 || 'Le ratio doit être ≥ 0',
  (val: number) => val <= 1 || 'Le ratio doit être ≤ 1',
];

/**
 * Génère une règle “obligatoire” personnalisée pour un champ.
 *
 * @param name Nom du champ (affiché dans le message)
 * @param verbose Afficher le message ou non
 * @returns Fonction de validation
 */
export const requiredRule =
  (name: string, verbose = true) =>
  (val: any) =>
    (val !== null && val !== undefined && val !== '') || (verbose ? `${name} est requis` : '');

/**
 * Génère une règle de valeur minimale.
 *
 * @param min Valeur minimale autorisée
 * @param verbose Afficher le message ou non
 * @returns Fonction de validation
 */
export const minRule =
  (min: number, verbose = true) =>
  (val: any) =>
    val === null || val >= min || (verbose ? `Valeur minimale : ${min}` : '');

/**
 * Génère une règle de valeur maximale.
 *
 * @param max Valeur maximale autorisée
 * @param verbose Afficher le message ou non
 * @returns Fonction de validation
 */
export const maxRule =
  (max: number, verbose = true) =>
  (val: any) =>
    val === null || val <= max || (verbose ? `Valeur maximale : ${max}` : '');

/**
 * Règle de validation pour vérifier qu’une valeur est un entier.
 *
 * @param verbose Afficher le message ou non
 * @returns Fonction de validation
 */
export const intRule =
  (verbose = true) =>
  (val: any) =>
    val === null || Number.isInteger(+val) || (verbose ? 'Doit être un entier' : '');

export const credentialsRegex = {
  password: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/,
  email: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
};

/**
 * Règles de validation pour les formulaires utilisateurs.
 */
export const formUserRules = {
  /**
   * Champ obligatoire
   * @param field Nom du champ (optionnel)
   */
  required:
    (field = 'Ce champ') =>
    (val: string) =>
      !!val || `${field} est requis`,

  /**
   * Mot de passe avec majuscule, chiffre, caractère spécial, 8-16 caractères
   */
  password: (val: string) => credentialsRegex.password.test(val) || 'Au moins 1 majuscule, 1 chiffre, 1 caractère spécial et 8 à 16 caractères',

  /**
   * Validation d’adresse email
   */
  email: (val: string) => credentialsRegex.email.test(val) || "Merci d'entrer une adresse mail valide",
};

/**
 * Vérifie si une valeur est non vide.
 *
 * @param val Valeur à tester
 * @returns true si remplie
 */
export function isRequired(val: string) {
  return !!val && val.length > 0;
}

/**
 * Vérifie si une valeur échoue une ou plusieurs règles de validation.
 *
 * @param row Objet contenant au moins la propriété `value`
 * @param rules Tableau de fonctions de validation
 * @returns true si au moins une règle échoue
 */
export function isInvalid(row: any, rules: any[]) {
  return rules.some((r) => r(row.value) !== true);
}
