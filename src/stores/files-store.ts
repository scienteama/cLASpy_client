import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import { fileService } from 'src/services/files.service';
import { type FileType, isFolder, type FileUploadProgress, type FolderModel } from 'src/types/files.type';
import { type ErrorResponse, isAxiosErrorResponse } from 'src/types/api.type';
import { useUserStore } from './users-store';
import { farFile } from '@quasar/extras/fontawesome-v6';
import { matInsertDriveFile } from '@quasar/extras/material-icons';
import { useRoute } from 'vue-router';

export const useFilesStore = defineStore('files', () => {
  const $q = useQuasar();
  const route = useRoute();
  const userStore = useUserStore();
  const { currentUser } = storeToRefs(userStore);

  // --- État principal ---
  const rootTree = ref<FolderModel | null>(null);
  const currentFolder = ref<FolderModel | null>(null);
  const currentFolderDisplayPath = ref<string[]>([]);
  const loading = ref(false);

  // --- État upload ---
  const fileUploadProgress = ref<FileUploadProgress>({
    percent: 0,
    color: 'green-2',
    error: false,
    icon: matInsertDriveFile,
    uploading: false,
    speed: 0,
  });

  // --- Getters ---
  const canGoBack = computed(() => (currentFolder.value?.depth ?? 0) > 0);
  const rows = computed(() => currentFolder.value?.children || []);

  // --- Helpers récursifs ---
  function findFolderById(folder: FolderModel | null, id: string): FolderModel | null {
    if (!folder) return null;
    if (folder.id === id) return folder;

    for (const child of folder.children) {
      if (child.type === 'folder') {
        const found = findFolderById(child, id);
        if (found) return found;
      }
    }
    return null;
  }

  function findParent(folder: FolderModel, childId: string): FolderModel | null {
    for (const child of folder.children) {
      if (child.id === childId) return folder;
      if (child.type === 'folder') {
        const found = findParent(child, childId);
        if (found) return found;
      }
    }
    return null;
  }

  // --- Actions principales ---
  async function reloadRoot(): Promise<void> {
    loading.value = true;

    let fileType: FileType;
    switch (route.path) {
      case '/ml/predict/1':
        fileType = 'las';
        break;
      case '/ml/predict/2':
        fileType = 'model';
        break;
      default:
        fileType = 'all';
    }

    try {
      const res = await fileService.fileLoaders[fileType]();

      if (res.isOk) {
        rootTree.value = res.data;
        currentFolder.value = rootTree.value;
      }
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: 'Impossible de charger les fichiers.',
      });

      throw err;
    } finally {
      loading.value = false;
    }
  }

  function listDirectories(): FolderModel[] {
    if (!currentFolder.value) return [];
    return currentFolder.value.children.filter(isFolder).map((child) => ({
      ...child,
      children: [],
    }));
  }

  function goToFolder(folder: FolderModel) {
    if (folder && folder.type === 'folder') {
      currentFolder.value = folder;
      currentFolderDisplayPath.value.push(folder.name || '');
    }
  }

  function goBack() {
    if (!rootTree.value || !currentFolder.value) return;
    const parent = findParent(rootTree.value, currentFolder.value.id);
    if (parent) currentFolder.value = parent;
    currentFolderDisplayPath.value.pop();
  }

  function goToHome() {
    if (!rootTree.value) return;
    currentFolder.value = rootTree.value;
    currentFolderDisplayPath.value = [rootTree.value.name];
  }

  // --- Upload ---
  async function uploadFile(file: File): Promise<void> {
    if (!file || !currentFolder.value || !currentUser.value) return;

    fileUploadProgress.value = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon: farFile,
      uploading: true,
      speed: 0,
    };

    $q.notify({ message: `Téléversement de "${file.name}"...`, color: 'primary', timeout: 1000 });

    const formData = new FormData();
    formData.append('file', file);

    if (currentFolder.value.id !== 'root') {
      formData.append('parent_id', currentFolder.value.id);
    }

    let lastLoaded = 0;
    let lastTime = Date.now();

    try {
      const res = await fileService.uploadFile({
        data: formData,
        onUploadProgress: (progressEvent?: AxiosProgressEvent) => {
          if (progressEvent?.total && progressEvent.loaded) {
            const now = Date.now();
            const deltaTime = now - lastTime;
            const deltaBytes = progressEvent.loaded - lastLoaded;

            if (deltaTime > 0 && deltaBytes > 0) {
              const bytesPerSecond = (deltaBytes / deltaTime) * 1000;
              const megaPerSecond = bytesPerSecond / (1024 * 1024);
              fileUploadProgress.value.speed = parseFloat(megaPerSecond.toFixed(2));
            }

            lastLoaded = progressEvent.loaded;
            lastTime = now;

            const percent = progressEvent.loaded / progressEvent.total;
            fileUploadProgress.value.percent = percent;
            fileUploadProgress.value.color = percent < 1 ? 'green-2' : 'green-4';
          }
        },
      });

      fileUploadProgress.value.uploading = false;
      fileUploadProgress.value.speed = 0;

      if (res.isOk) {
        fileUploadProgress.value.percent = 1;
        fileUploadProgress.value.color = 'green-4';
        await refreshCurrentFolder();
        $q.notify({ type: 'positive', message: res.result || 'Fichier uploadé avec succès.' });
      } else {
        throw new Error(res.result || 'Erreur upload.');
      }
    } catch (err) {
      fileUploadProgress.value.error = true;
      fileUploadProgress.value.color = 'red-4';
      fileUploadProgress.value.uploading = false;
      fileUploadProgress.value.speed = 0;

      let msg = 'Erreur lors du téléversement';
      if ((err as AxiosError)?.response?.data && isAxiosErrorResponse((err as AxiosError).response?.data)) {
        const data = (err as AxiosError).response?.data as ErrorResponse;
        msg = data.data?.detail || data.result || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      $q.notify({ type: 'negative', message: msg });
      throw err;
    }
  }

  // --- Créer un dossier ---
  async function createFolder(name: string): Promise<void> {
    if (!currentFolder.value || !currentUser.value) return;

    try {
      const parentId = currentFolder.value.id === 'root' ? null : currentFolder.value.id;
      const res = await fileService.createDirectory(name, parentId);
      if (res.isOk) {
        await refreshCurrentFolder();
        $q.notify({ type: 'positive', message: 'Dossier créé.' });
      } else {
        $q.notify({ type: 'negative', message: res.result || 'Échec de la création du dossier.' });
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: (err as Error).message || 'Erreur serveur.' });
      throw err;
    }
  }

  // --- Renommer ---
  async function renameItem(id: string, newName: string): Promise<void> {
    try {
      const res = await fileService.renameFileOrDir(id, newName);
      if (res.isOk) {
        await refreshCurrentFolder();
        $q.notify({ type: 'positive', message: 'Nom modifié.' });
      } else {
        $q.notify({ type: 'negative', message: 'Échec du renommage.' });
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Erreur serveur.' });
    }
  }

  // --- Supprimer ---
  async function deleteItem(id: string): Promise<void> {
    try {
      const res = await fileService.removeFileOrDir(id);
      if (res.isOk) {
        await refreshCurrentFolder();
        $q.notify({ type: 'positive', message: 'Supprimé.' });
      } else {
        $q.notify({ type: 'negative', message: 'Échec de la suppression.' });
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Erreur serveur.' });
    }
  }

  async function deleteItems(ids: string[]): Promise<void> {
    try {
      const res = await fileService.deleteItems(ids);
      if (res.isOk) {
        await refreshCurrentFolder();
        $q.notify({ type: 'positive', message: 'Éléments supprimés.' });
      } else {
        $q.notify({ type: 'negative', message: 'Échec de la suppression.' });
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: (err as Error).message || 'Erreur serveur.' });
    }
  }

  async function refreshCurrentFolder(): Promise<void> {
    const oldId = currentFolder.value?.id;

    await reloadRoot();

    if (oldId && rootTree.value) {
      const sameFolder = findFolderById(rootTree.value, oldId);
      if (sameFolder) {
        currentFolder.value = sameFolder;
      }
    }
  }

  return {
    rootTree,
    currentFolder,
    currentFolderDisplayPath,
    loading,
    rows,
    canGoBack,
    fileUploadProgress,
    reloadRoot,
    goToHome,
    goBack,
    goToFolder,
    uploadFile,
    createFolder,
    renameItem,
    deleteItem,
    deleteItems,
    findFolderById,
    refreshCurrentFolder,
    listDirectories,
  };
});
