import type { FolderModel } from './types/files.type';

export function iconForFile(mimetype: string) {
  if (!mimetype) return 'fa-regular fa-file';

  if (mimetype.startsWith('image/')) return 'fa-regular fa-file-image';
  if (mimetype.startsWith('video/')) return 'fa-regular fa-file-video';
  if (mimetype.startsWith('audio/')) return 'fa-regular fa-file-audio';
  if (mimetype === 'application/pdf') return 'fa-regular fa-file-pdf';
  if (mimetype === 'application/las') return 'blur_on';
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'fa-regular fa-file-word';
  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'fa-regular fa-file-excel';
  if (
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  )
    return 'fa-regular fa-file-powerpoint';
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
  if (mimetype === 'application/las') return 'amber';
  if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return 'blue-grey';
  if (
    mimetype === 'application/vnd.ms-excel' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
    return 'green';
  if (
    mimetype === 'application/vnd.ms-powerpoint' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  )
    return 'deep-orange';
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
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    'Présentation PowerPoint',

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
  password: (val: string) =>
    regex.password.test(val) ||
    'Au moins 1 majuscule, 1 chiffre, 1 caractère spécial et 8 à 16 caractères',
  email: (val: string) => regex.email.test(val) || "Merci d'entrer une adresse mail valide",
};

export function isRequired(val: string) {
  return !!val && val.length > 0;
}
