/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from 'vue';
import type { FileModel, FolderModel } from './types/files.type';
import type { User } from './types/users.type';
import { camelCase, mapKeys } from 'lodash';
import { intRule, minRule, requiredRule } from './rules';
import type { HSL } from './types/global.types';

export function iconForFile(mimetype: string) {
  if (!mimetype) return 'fa-regular fa-file';

  // for .model => mdi-file-cog
  if (mimetype.startsWith('image/')) return 'fa-regular fa-file-image';
  if (mimetype.startsWith('video/')) return 'fa-regular fa-file-video';
  if (mimetype.startsWith('audio/')) return 'fa-regular fa-file-audio';
  if (mimetype === 'application/pdf') return 'fa-regular fa-file-pdf';
  if (mimetype === 'application/las') return 'mdi-data-matrix';
  if (mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'fa-regular fa-file-word';
  if (mimetype === 'application/vnd.ms-excel' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'fa-regular fa-file-excel';
  if (mimetype === 'application/vnd.ms-powerpoint' || mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'fa-regular fa-file-powerpoint';
  if (mimetype.startsWith('text/')) return 'fa-regular fa-file-lines';

  // Icône par défaut
  return 'fa-regular fa-file';
}

export function iconForFolder(isOpen: boolean) {
  return isOpen ? 'fa-regular fa-folder-open' : 'fa-regular fa-folder';
}

export function colorForFile(mimetype: string) {
  if (!mimetype) return 'grey';

  if (mimetype.startsWith('image/')) return 'blue';
  if (mimetype.startsWith('video/')) return 'purple';
  if (mimetype.startsWith('audio/')) return 'orange';
  if (mimetype === 'application/pdf') return 'red';
  if (mimetype === 'application/las') return 'orange';
  if (mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'blue-grey';
  if (mimetype === 'application/vnd.ms-excel' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'green';
  if (mimetype === 'application/vnd.ms-powerpoint' || mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'deep-orange';
  if (mimetype.startsWith('text/')) return 'teal';

  // Couleur par défaut
  return 'grey';
}

// --- Format taille fichier ---
export function formatFileSize(bytes: number | undefined) {
  if (bytes === undefined || bytes === null) return '';

  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// --- Taille d'un dossier ---
export function computeFolderSize(folder: FolderModel): string {
  let totalSize = 0;

  for (const child of folder.children) {
    if (child.type === 'file') {
      totalSize += child.size_bytes ?? 0;
    } else if (child.type === 'folder') {
      const childSize = computeFolderSizeRaw(child);
      totalSize += childSize;
    }
  }

  return formatFileSize(totalSize);
}

function computeFolderSizeRaw(folder: FolderModel): number {
  let totalSize = 0;
  for (const child of folder.children) {
    if (child.type === 'file') totalSize += child.size_bytes ?? 0;
    else if (child.type === 'folder') totalSize += computeFolderSizeRaw(child);
  }
  return totalSize;
}

// --- Mapping mimetype ---
const MIME_TYPE_MAP: Record<string, string> = {
  // Documents
  'application/pdf': 'Document PDF',
  'application/msword': 'Document Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document Word',
  'application/vnd.ms-excel': 'Tableur Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Tableur Excel',
  'application/vnd.ms-powerpoint': 'Présentation PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Présentation PowerPoint',

  // Archives
  'application/zip': 'Archive',
  'application/x-rar-compressed': 'Archive',
  'application/gzip': 'Archive',

  // Media
  'image/jpeg': 'Image',
  'image/png': 'Image',
  'image/gif': 'Image',
  'image/svg+xml': 'Image',
  'video/mp4': 'Vidéo',
  'video/mpeg': 'Vidéo',
  'audio/mpeg': 'Audio',
  'audio/wav': 'Audio',

  // Textes
  'text/plain': 'Texte',
  'text/csv': 'Fichier CSV',
  'text/html': 'HTML',
  'text/css': 'CSS',
  'application/json': 'JSON',

  // Autres
  'application/las': 'Fichier LAS',
};
export function convertMimeType(mimeType: string | undefined): string {
  if (!mimeType) return 'Inconnu';

  if (MIME_TYPE_MAP[mimeType]) return MIME_TYPE_MAP[mimeType];

  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Vidéo';
  if (mimeType.startsWith('audio/')) return 'Audio';
  if (mimeType.startsWith('text/')) return 'Texte';

  return 'Fichier';
}

export function splitFileName(fullName: string) {
  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return { base: fullName, ext: '' };
  }

  const base = fullName.substring(0, lastDotIndex);
  const ext = fullName.substring(lastDotIndex);
  return { base, ext };
}

// Expressions régulières pour les validations
export const regex = {
  password: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/,
  email: /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/,
};

// Règles de validation pour les formulaires utilisateurs
export const formUserRules = {
  required:
    (field = 'Ce champ') =>
    (val: string) =>
      !!val || `${field} est requis`,
  password: (val: string) => regex.password.test(val) || 'Au moins 1 majuscule, 1 chiffre, 1 caractère spécial et 8 à 16 caractères',
  email: (val: string) => regex.email.test(val) || "Merci d'entrer une adresse mail valide",
};

export function isRequired(val: string) {
  return !!val && val.length > 0;
}

/**
 * Vérifie si une chaîne de caractères ou un tableau est vide ou null
 * @param value - La valeur à vérifier (string ou array)
 * @returns true si la valeur est null, undefined, une chaîne vide ou un tableau vide ; sinon false
 */
export function isNullOrEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
}

export function getUserInitials(user: User): string {
  if (!user) return '';
  const firstInitial = user.firstname?.[0]?.toUpperCase() || '';
  const lastInitial = user.lastname?.[0]?.toUpperCase() || '';
  return firstInitial + lastInitial;
}

export function printFolderTree(folder: FolderModel, depth = 0) {
  const indent = '  '.repeat(depth);
  console.log(`${indent}- 📁 ${folder.name}`);
  for (const child of folder.children) {
    if (isFolder(child)) {
      printFolderTree(child, depth + 1);
    } else {
      console.log(`${indent}  - 📄 ${child.name}`);
    }
  }
}

export function isFolder(item: FileModel | FolderModel): item is FolderModel {
  return item.type === 'folder';
}

export const transformToCamelCase = <T extends object>(obj: T): T => mapKeys(obj, (_, key) => camelCase(key)) as T;

export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export const scorerList = [
  'accuracy',
  'balanced_accuracy',
  'top_k_accuracy',
  'average_precision',
  'neg_brier_score',
  'f1_micro',
  'f1_macro',
  'f1_weighted',
  'precision_micro',
  'precision_macro',
  'precision_weighted',
  'recall_micro',
  'recall_macro',
  'recall_weighted',
  'roc_auc',
  'roc_auc_ovr',
  'roc_auc_ovo',
  'roc_ovr_weighted',
  'roc_ovo_weighted',
];

export function newSeed() {
  const highValue = Math.pow(2, 31) - 1; // 2147483647
  const seed = Math.floor(Math.random() * highValue);
  return seed;
}

export function parseTypeInfo(typeinfo: string, defaultValue: string, name: string) {
  const info = typeinfo.toLowerCase();
  return {
    name: name,
    isBool: info.includes('bool'),
    isInt: info.includes('int'),
    isFloat: info.includes('float'),
    isNumeric: info.includes('int') || info.includes('float'),
    isNonNegative: info.includes('non-negative'),
    isArray: info.includes('array') || info.includes('list'),
    allowsNone: defaultValue === 'None',
    hasEnum: /\{.*\}/.test(info),
    enumValues: extractEnumValues(typeinfo),
  };
}

function extractEnumValues(typeinfo: string): string[] | null {
  const match = typeinfo.match(/\{([^}]+)\}/);
  if (!match) return null;

  return match[1]!.split(',').map((v) => v.replace(/['"]/g, '').trim());
}

export function getInputProps(row: any, name: string) {
  const props: Record<string, any> = {};
  const t = parseTypeInfo(row.typeinfo, row.default, name);
  props.hideBottomSpace = true;
  props.noErrorIcon = true;
  props.rules = [];

  if (!t.allowsNone) {
    props.rules.push(requiredRule(name, false));
  }

  /* =======================
     QCheckbox
  ======================= */
  if (t.isBool) {
    props.trueValue = true;
    props.falseValue = false;
    props.dense = true;
    return props;
  }

  /* =======================
     QSelect (enum)
  ======================= */
  if (t.hasEnum && t.enumValues?.length) {
    props.options = [...t.enumValues];
    props.useInput = true;
    props.newValueMode = 'add';
    props.emitValue = true;
    props.mapOptions = false;
    props.dense = true;
    props.clearable = t.allowsNone;
    props.hideDropdownIcon = false;
    props.inputDebounce = 0;
    props.borderless = true;

    // Slot pour styliser la valeur sélectionnée
    props.selectedItemSlot = (scope: any) => {
      return h(
        'span',
        {
          style: {
            color: '#9c27b0',
            fontWeight: 'bold',
          },
        },
        scope.opt
      );
    };

    return props;
  }

  /* =======================
     QInput numérique
  ======================= */
  if (t.isNumeric) {
    props.type = 'number';
    props.step = t.isInt ? 1 : 'any';
    if (t.isNonNegative) props.min = 0;

    if (t.isNonNegative) {
      props.min = 0;
      props.rules.push(minRule(0, false));
    }

    if (t.isInt) {
      props.rules.push(intRule(false));
    }
  }

  /* =======================
     QInput array / autre
  ======================= */
  if (t.isArray) {
    props.type = 'text';
    props.placeholder = '[1, 2, 3]';
  }

  /* =======================
     Commun
  ======================= */
  props.dense = true;
  props.borderless = true;
  props.clearable = t.allowsNone;
  props.inputClass = 'text-bold text-accent';

  return props;
}

export function isInvalid(row: any, rules: any[]) {
  return rules.some((r) => r(row.value) !== true);
}

export function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(o: object, filename: string) {
  const json = JSON.stringify(o, null, 2);
  downloadFile(`${filename}.json`, json);
}

export function hexToHSL(hex: string): HSL {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: HSL): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generatePalette(baseHex: string, steps: number = 8): string[] {
  const baseHSL = hexToHSL(baseHex);
  const palette: string[] = [];

  for (let i = 0; i < steps; i++) {
    // Variation linéaire de luminosité
    const l = Math.min(100, Math.max(0, baseHSL.l + (i - steps / 2) * (50 / steps)));
    const color: HSL = { h: baseHSL.h, s: baseHSL.s, l };
    palette.push(hslToHex(color));
  }

  return palette;
}

export const defaultPals: Record<string, string[]> = {
  ocean: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8'],
  sunset: ['#cc5803', '#e2711d', '#ff9505', '#ffb627', '#ffc971'],
  earth: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29'],
  forest: ['#797d62', '#9b9b7a', '#baa587', '#d9ae94', '#f1dca7', '#ffcb69', '#e8ac65', '#d08c60', '#b58463', '#997b66'],
  fire: ['#7f0000', '#b30000', '#e60000', '#ff1a1a', '#ff4d4d', '#ff8080', '#ffb3b3', '#ffe6e6'],
  grayscale: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'],
};
