import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import { fileService } from 'src/services/files.service';
import type { FileUploadProgress, FolderModel } from 'src/types/files.type';
import { type ErrorResponse, isAxiosErrorResponse } from 'src/types/api.type';
import { useUserStore } from './users-store';

export const useFilesStore = defineStore('files', () => {
  const $q = useQuasar();
  const userStore = useUserStore();
  const { isAdmin, currentUser } = storeToRefs(userStore);

  // --- État principal ---
  const rootTree = ref<FolderModel | null>(null);
  const currentFolder = ref<FolderModel | null>(null);
  const loading = ref(false);

  // --- État upload ---
  const fileUploadProgress = ref<FileUploadProgress>({
    percent: 0,
    color: 'green-2',
    error: false,
    icon: 'insert_drive_file',
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
  async function reloadRoot() {
    loading.value = true;
    try {
      const res = await fileService.getRoot();
      if (res.isOk) {
        rootTree.value = res.data;

        // --- Définition du dossier courant selon le rôle ---
        if (isAdmin.value) {
          currentFolder.value = rootTree.value;
        } else {
          const myId = currentUser.value?.id;
          const myFolder = rootTree.value.children.find(
            (f) => f.type === 'folder' && f.name.toLowerCase().startsWith(`${myId}_`),
          ) as FolderModel | undefined;

          currentFolder.value = myFolder || rootTree.value;
        }
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Impossible de charger les fichiers.' });
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function goToFolder(folder: FolderModel) {
    if (folder && folder.type === 'folder') {
      currentFolder.value = folder;
    }
  }

  function goBack() {
    if (!rootTree.value || !currentFolder.value) return;
    const parent = findParent(rootTree.value, currentFolder.value.id);
    if (parent) currentFolder.value = parent;
  }

  function goToHome() {
    if (!rootTree.value) return;

    if (isAdmin.value) {
      currentFolder.value = rootTree.value;
    } else {
      const myId = currentUser.value?.id;
      const myFolder = rootTree.value.children.find(
        (f) => f.type === 'folder' && f.name.toLowerCase().startsWith(`${myId}_`),
      ) as FolderModel | undefined;

      currentFolder.value = myFolder || rootTree.value;
    }
  }

  // --- Upload ---
  async function uploadFile(file: File, subPath: string): Promise<void> {
    if (!file) return;

    fileUploadProgress.value = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon: 'fa-regular fa-file',
      uploading: true,
      speed: 0,
    };

    $q.notify({ message: `Téléversement de "${file.name}"...`, color: 'primary', timeout: 1000 });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sub_path', subPath);

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
      if (
        (err as AxiosError)?.response?.data &&
        isAxiosErrorResponse((err as AxiosError).response?.data)
      ) {
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
  async function createFolder(name: string, subPath: string): Promise<void> {
    try {
      const res = await fileService.createDirectory(name, subPath);
      if (res.isOk) {
        await refreshCurrentFolder();
        $q.notify({ type: 'positive', message: 'Dossier créé.' });
      } else {
        $q.notify({ type: 'negative', message: res.result || 'Échec de la création du dossier.' });
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Erreur serveur.' });
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
    findFolderById,
    refreshCurrentFolder,
  };
});
