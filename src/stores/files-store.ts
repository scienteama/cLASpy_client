import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { fileService } from 'src/services/files.services';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import type { FileUploadProgress, FolderModel } from 'src/types/files.type';
import type { AxiosProgressEvent } from 'axios';

export const useFilesStore = defineStore('files', () => {
  const $q = useQuasar();

  // --- État principal ---
  const rootTree = ref<FolderModel | null>(null);
  const currentPath = ref<string[]>([]);
  const loading = ref(false);

  // --- Suivi upload ---
  const fileUploadProgress = ref<FileUploadProgress>({
    percent: 0,
    color: 'green-2',
    error: false,
    icon: 'insert_drive_file',
    uploading: false,
    speed: 0,
  });

  // --- Getters ---
  const canGoBack = computed(() => currentPath.value.length > 0);
  const currentPathDisplay = computed(() => '/' + (currentPath.value.join('/') || ''));

  function findFolderByPath(folder: FolderModel | null, path: string[] = []): FolderModel | null {
    if (!folder) return null;
    if (path.length === 0) return folder;

    let cur: FolderModel | undefined = folder;
    for (const segment of path) {
      const next = cur.children.find(
        (c) => (c as FolderModel).type === 'folder' && c.name === segment,
      ) as FolderModel | undefined;
      if (!next) return null;
      cur = next;
    }
    return cur || null;
  }

  const currentFolder = computed(() => findFolderByPath(rootTree.value, currentPath.value));
  const rows = computed(() => currentFolder.value?.children || []);

  // --- Actions principales ---
  async function reloadRoot() {
    loading.value = true;
    try {
      const res = await fileService.getRoot();
      rootTree.value = res;
    } catch (err) {
      console.error(err);
      $q.notify({ type: 'negative', message: 'Impossible de charger les fichiers.' });
    } finally {
      loading.value = false;
    }
  }

  function goBack() {
    if (canGoBack.value) currentPath.value.pop();
  }

  function goToFolder(name: string) {
    currentPath.value = [...currentPath.value, name];
  }

  function goToHome() {
    currentPath.value = [];
  }

  // --- Upload fichier ---
  async function uploadFile(file: File, subPath: string): Promise<void> {
    if (!file) return;

    // Déterminer une icône selon le type du fichier
    const icon = file.type.startsWith('video/')
      ? 'movie'
      : file.type.startsWith('image/')
        ? 'photo'
        : file.type.startsWith('audio/')
          ? 'audiotrack'
          : 'insert_drive_file';

    fileUploadProgress.value = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon,
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
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total && progressEvent.loaded) {
            const now = Date.now();
            const deltaTime = now - lastTime; // ms
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

      await reloadRoot();
      fileUploadProgress.value.color = 'green-4';
      $q.notify({ type: 'positive', message: 'Fichier uploadé avec succès ✅' });
    } catch (err) {
      console.error('❌ Erreur upload :', err);
      fileUploadProgress.value.error = true;
      fileUploadProgress.value.color = 'red-4';
      $q.notify({ type: 'negative', message: 'Erreur lors du téléversement.' });
    } finally {
      fileUploadProgress.value.uploading = false;
      fileUploadProgress.value.speed = 0;
    }
  }

  async function createFolder(name: string, subPath: string): Promise<void> {
    try {
      const ok = await fileService.createDirectory(name, subPath);
      if (ok) {
        await reloadRoot();
        $q.notify({ type: 'positive', message: 'Dossier créé.' });
      } else {
        $q.notify({ type: 'negative', message: 'Échec création dossier.' });
      }
    } catch (err) {
      console.error(err);
      $q.notify({ type: 'negative', message: 'Erreur serveur.' });
    }
  }

  // --- Renommer un fichier ou dossier ---
  async function renameItem(id: string, newName: string) {
    try {
      const ok = await fileService.renameFileOrDir(id, newName);
      if (ok) {
        await reloadRoot();
        $q.notify({ type: 'positive', message: 'Nom modifié.' });
      } else {
        $q.notify({ type: 'negative', message: 'Échec du renommage.' });
      }
    } catch (err) {
      console.error(err);
      $q.notify({ type: 'negative', message: 'Erreur serveur.' });
    }
  }

  // --- Supprimer un fichier ou dossier ---
  async function deleteItem(id: string) {
    try {
      const ok = await fileService.removeFileOrDir(id);
      if (ok) {
        await reloadRoot();
        $q.notify({ type: 'positive', message: 'Supprimé.' });

        // Vérifie que le dossier courant existe toujours
        const stillExists = findFolderByPath(rootTree.value, currentPath.value);
        if (!stillExists) currentPath.value = [];
      } else {
        $q.notify({ type: 'negative', message: 'Échec suppression.' });
      }
    } catch (err) {
      console.error(err);
      $q.notify({ type: 'negative', message: 'Erreur serveur.' });
    }
  }

  return {
    rootTree,
    currentPath,
    loading,
    rows,
    currentFolder,
    canGoBack,
    currentPathDisplay,
    fileUploadProgress,
    createFolder,
    reloadRoot,
    goToHome,
    goBack,
    goToFolder,
    uploadFile,
    renameItem,
    deleteItem,
  };
});
