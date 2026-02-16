import type { User } from '../types/users.type';
import { camelCase, mapKeys } from 'lodash';

/**
 * Vérifie si une chaîne de caractères ou un tableau est vide ou null
 * @param value - La valeur à vérifier (string ou array)
 * @returns true si la valeur est null, undefined, une chaîne vide ou un tableau vide ; sinon false
 */
export function isNullOrEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
}

/**
 * Retourne initiales utilisateur
 * @param user
 */
export function getUserInitials(user: User): string {
  if (!user) return '';
  const firstInitial = user.firstname?.[0]?.toUpperCase() || '';
  const lastInitial = user.lastname?.[0]?.toUpperCase() || '';
  return firstInitial + lastInitial;
}

/**
 * Transforme les clés d'un objet en camelCase.
 * @param obj Objet
 * @returns Nouvel objet avec les clés en camelCase
 */
export const transformToCamelCase = <T extends object>(obj: T): T => mapKeys(obj, (_, key) => camelCase(key)) as T;

/**
 * Arrondit un nombre à un nombre donné de décimales.
 * @param value Number
 * @param decimals Nombre de décimales (par défaut 0)
 * @returns Nombre arrondi
 */
export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Génère une nouvelle seed pseudo-aléatoire.
 * @returns Nombre entier positif inférieur à 2^31 - 1
 */
export function newSeed(): number {
  const highValue = Math.pow(2, 31) - 1; // 2147483647
  const seed = Math.floor(Math.random() * highValue);
  return seed;
}

export const xor = (a: boolean, b: boolean) => {
  return a !== b;
};
