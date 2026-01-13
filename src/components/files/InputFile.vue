<template>
  <div class="items-start q-gutter-y-md" style="width: auto; min-width: 70%">
    <q-file :model-value="file" @update:model-value="updateFile" label="Uploader un fichier" outlined :clearable="!fileUploadProgress.uploading">
      <template #before>
        <q-icon name="attach_file" />
      </template>

      <template #file="{ file }">
        <q-chip class="full-width q-my-xs" :removable="fileUploadProgress.uploading && fileUploadProgress.percent < 1" square @remove="cancelFile">
          <q-linear-progress class="absolute-full full-height" :value="fileUploadProgress.percent" :color="fileUploadProgress.color" track-color="grey-2">
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="green-4" :label="fileUploadProgress.speed + ' Mo/s'" />
            </div>
          </q-linear-progress>

          <q-avatar>
            <q-icon :name="fileUploadProgress.icon" />
          </q-avatar>

          <div class="ellipsis relative-position">
            {{ file.name }}
          </div>

          <q-tooltip>{{ file.name }}</q-tooltip>
        </q-chip>
      </template>

      <template #after v-if="canUpload">
        <q-btn v-if="!fileUploadProgress.uploading" color="primary" dense icon="cloud_upload" round @click="upload" :disable="!canUpload" />
        <q-badge v-else color="accent" text-color="white" rounded size="md" :label="(fileUploadProgress.percent * 100).toFixed(0) + '%'" />
      </template>
    </q-file>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import { storeToRefs } from 'pinia';
import { trainerService } from 'src/services/training.service';
import { useQuasar } from 'quasar';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import { type ErrorResponse, isAxiosErrorResponse } from 'src/types/api.type';

const $q = useQuasar();

const props = defineProps({
  pointCloudLoader: { type: Boolean, default: false },
  keepOnServer: { type: Boolean, default: false },
  folderId: { type: String, default: null }, // parent_id pour le backend FS
});

const emit = defineEmits<{
  fileInfos: [value: string | null];
}>();

const filesStore = useFilesStore();
const { uploadFile } = filesStore;
const { fileUploadProgress } = storeToRefs(filesStore);

const file = ref<File | null>(null);
const canUpload = computed(() => file.value !== null);

function cancelFile() {
  file.value = null;
}

function updateFile(newFile: File | null) {
  file.value = newFile;
}

async function upload() {
  if (!file.value) return;

  try {
    if (!props.pointCloudLoader) {
      // Upload classique FS-like → filesStore.uploadFile gère parent_id
      await uploadFile(file.value);
    } else {
      // Upload point cloud → spécifique
      await uploadPointCloudFile(file.value, props.keepOnServer, props.folderId);
    }
  } catch (err) {
    console.error('Upload error:', err);
  } finally {
    cancelFile();
    filesStore.fileUploadProgress = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon: 'fa-regular fa-file',
      uploading: false,
      speed: 0,
    };
  }
}

async function uploadPointCloudFile(file: File, keepOnServer: boolean, folderId: string): Promise<void> {
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
  formData.append('keepOnServer', keepOnServer ? 'true' : 'false');
  formData.append('folderId', folderId);

  let lastLoaded = 0;
  let lastTime = Date.now();

  try {
    const res = await trainerService.loadPointCloudFile({
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
      $q.notify({ type: 'positive', message: res.result || 'Fichier uploadé avec succès.' });
      emit('fileInfos', res.data || null);
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

onBeforeUnmount(cancelFile);
</script>
