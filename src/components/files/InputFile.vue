<template>
  <div class="items-start q-gutter-y-md" style="width: auto; min-width: 70%">
    <q-file :model-value="file" @update:model-value="updateFile" :label="inputLabel" outlined :clearable="!fileUploadProgress.uploading" :accept="authorizedMimeTypes">
      <template #before>
        <q-icon :name="fasPaperclip" color="primary" />
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
        <div v-if="!isTrainMode && !isPredictMode">
          <q-btn v-if="!fileUploadProgress.uploading" color="primary" dense :icon="matCloudUpload" round @click="upload" :disable="!canUpload" />
          <q-badge v-else color="accent" text-color="white" rounded size="md" :label="(fileUploadProgress.percent * 100).toFixed(0) + '%'" />
        </div>
      </template>
    </q-file>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import { storeToRefs } from 'pinia';
import { matCloudUpload } from '@quasar/extras/material-icons';
import { farFile, fasPaperclip } from '@quasar/extras/fontawesome-v6';
import { useMLStore } from 'src/stores/ml-store';
import { checkFileSize } from 'src/helpers/files-utils';

const props = defineProps({
  isTrainMode: { type: Boolean, default: false },
  isPredictMode: { type: Boolean, default: false },
});

const filesStore = useFilesStore();
const mlStore = useMLStore();
const { fileToUpload, modelToUpload } = storeToRefs(mlStore);
const { fileUploadProgress } = storeToRefs(filesStore);

const file = ref<File | null>(null);

const inputLabel = computed(() => {
  if (props.isTrainMode) {
    return 'Uploader ou sélectionner un fichier';
  } else if (props.isPredictMode) {
    return 'Uploader ou sélectionner un modèle';
  }
  return 'Uploader un fichier';
});

const authorizedMimeTypes = computed(() => {
  if (props.isTrainMode) {
    return '.las';
  } else if (props.isPredictMode) {
    return '.model';
  }
  return undefined;
});

const canUpload = computed(() => file.value !== null);

function cancelFile() {
  file.value = null;
}

function updateFile(newFile: File | null) {
  if (!newFile) {
    file.value = null;
    return;
  }
  file.value = newFile;
}

async function upload() {
  if (!file.value) return;

  if (!checkFileSize(file.value)) return;

  try {
    if (!props.isTrainMode && !props.isPredictMode) {
      await filesStore.uploadFile(file.value);
    }
  } catch (err) {
    console.error('Upload error:', err);
  } finally {
    cancelFile();
    filesStore.fileUploadProgress = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon: farFile,
      uploading: false,
      speed: 0,
    };
  }
}

watch(
  () => file.value,
  (newVal) => {
    if (props.isTrainMode) {
      fileToUpload.value = newVal;
    } else if (props.isPredictMode) {
      modelToUpload.value = newVal;
    }
  }
);

onBeforeUnmount(cancelFile);
</script>
