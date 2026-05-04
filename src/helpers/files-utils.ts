import { farFile, farFileAudio, farFileExcel, farFileImage, farFileLines, farFilePdf, farFilePowerpoint, farFileVideo, farFileWord, farFolder, farFolderOpen } from '@quasar/extras/fontawesome-v6';
import { mdiDataMatrix, mdiFileCog } from '@quasar/extras/mdi-v7';
import { storeToRefs } from 'pinia';
import { useNotifier } from 'src/composables/notifier';
import type { FileModel, FolderModel } from 'src/models/types/files.type';
import { useUserStore } from 'src/stores/users-store';

/**
 * Retourne l’icône associée à un type MIME de fichier.
 * @param mimetype Type MIME du fichier
 * @returns Classe d’icône (FontAwesome / MDI)
 */
export function iconForFile(mimetype: string) {
  if (!mimetype) return farFile;
  if (mimetype.startsWith('image/')) return farFileImage;
  if (mimetype.startsWith('video/')) return farFileVideo;
  if (mimetype.startsWith('audio/')) return farFileAudio;
  if (mimetype === 'application/pdf') return farFilePdf;
  if (mimetype === 'application/las') return mdiDataMatrix;
  if (mimetype === 'application/model') return mdiFileCog;
  if (mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return farFileWord;
  if (mimetype === 'application/vnd.ms-excel' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return farFileExcel;
  if (mimetype === 'application/vnd.ms-powerpoint' || mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return farFilePowerpoint;
  if (mimetype.startsWith('text/')) return farFileLines;

  // Icône par défaut
  return farFile;
}

/**
 * Retourne l’icône d’un dossier selon son état (ouvert / fermé).
 * @param isOpen Indique si le dossier est ouvert
 * @returns Classe d’icône
 */
export function iconForFolder(isOpen: boolean) {
  return isOpen ? farFolderOpen : farFolder;
}

/**
 * Retourne une couleur associée à un type MIME.
 * @param mimetype Type MIME du fichier
 * @returns Nom de couleur Quasar
 */
export function colorForFile(mimetype: string) {
  if (!mimetype) return 'grey';

  if (mimetype.startsWith('image/')) return 'blue';
  if (mimetype.startsWith('video/')) return 'purple';
  if (mimetype.startsWith('audio/')) return 'orange';
  if (mimetype === 'application/pdf') return 'red';
  if (mimetype === 'application/las') return 'orange';
  if (mimetype === 'application/model') return 'black';
  if (mimetype === 'application/msword' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'blue-grey';
  if (mimetype === 'application/vnd.ms-excel' || mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'green';
  if (mimetype === 'application/vnd.ms-powerpoint' || mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'deep-orange';
  if (mimetype.startsWith('text/')) return 'teal';

  // Couleur par défaut
  return 'grey';
}

/**
 * Formate une taille de fichier en unités lisibles.
 * @param bytes Taille en octets
 * @returns Taille formatée
 */
export function formatFileSize(bytes: number | undefined) {
  if (bytes === undefined || bytes === null) return '';

  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

/**
 * Calcule récursivement la taille totale d’un dossier.
 * @param folder Dossier racine
 * @returns Taille formatée du dossier
 */
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

/**
 * Calcule la taille brute (en octets) d’un dossier.
 * @param folder Dossier
 * @returns Taille en octets
 */
function computeFolderSizeRaw(folder: FolderModel): number {
  let totalSize = 0;
  for (const child of folder.children) {
    if (child.type === 'file') totalSize += child.size_bytes ?? 0;
    else if (child.type === 'folder') totalSize += computeFolderSizeRaw(child);
  }
  return totalSize;
}

/**
 * Mapping entre types MIME et libellés lisibles.
 *
 * Clé   : type MIME (ex: 'application/pdf')
 *
 * Valeur: libellé lisible (ex: 'Document PDF')
 */
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
  'application/model': 'Modèle',
};

export const AllowedTypesForViewing = ['application/json', 'text/plain', 'text/html', 'application/pdf', 'text/csv', 'image/jpeg', 'image/png', 'image/gif'];

/**
 * Convertit un type MIME en libellé lisible.
 * @param mimeType Type MIME
 * @returns Libellé utilisateur
 */
export function convertMimeType(mimeType: string | undefined): string {
  if (!mimeType) return 'Inconnu';

  if (MIME_TYPE_MAP[mimeType]) return MIME_TYPE_MAP[mimeType];

  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Vidéo';
  if (mimeType.startsWith('audio/')) return 'Audio';
  if (mimeType.startsWith('text/')) return 'Texte';

  return 'Fichier';
}

/**
 * Sépare le nom d’un fichier et son extension.
 * @param fullName Nom complet du fichier
 * @returns Objet contenant le nom de base et l’extension
 */
export function splitFileName(fullName: string) {
  const lastDotIndex = fullName.lastIndexOf('.');
  if (lastDotIndex <= 0) {
    return { base: fullName, ext: '' };
  }

  const base = fullName.substring(0, lastDotIndex);
  const ext = fullName.substring(lastDotIndex);
  return { base, ext };
}

/**
 * Affiche récursivement l’arborescence d’un dossier dans la console.
 * @param folder Dossier racine
 * @param depth Niveau de profondeur
 */
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

/**
 * Type guard permettant de distinguer un dossier d’un fichier.
 * @param item Fichier ou dossier
 * @returns true si dossier
 */
export function isFolder(item: FileModel | FolderModel): item is FolderModel {
  return item.type === 'folder';
}

/**
 * Télécharge un fichier.
 * @param name Nom du fichier
 * @param content Contenu texte
 */
export function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Télécharge un objet au format JSON.
 * @param o Objet à sérialiser
 * @param filename Nom du fichier (sans extension)
 */
export function downloadJSON(o: object, filename: string) {
  const json = JSON.stringify(o, null, 2);
  downloadFile(`${filename}.json`, json);
}

export function checkFileSize(file: File) {
  if (!file) return false;

  const $n = useNotifier();
  const userStore = useUserStore();
  const { maxDiskSpace, spaceDiskUsed } = storeToRefs(userStore);

  const available = maxDiskSpace.value - spaceDiskUsed.value;

  const ok = file.size <= available;

  if (!ok) {
    $n.notifyWarning("L'espace disque est insuffisant pour ce fichier.");
  }

  return ok;
}
