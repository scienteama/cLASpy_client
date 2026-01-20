<template>
  <div class="items-start q-gutter-y-md" style="width: auto; min-width: 70%">
    <q-file
      :model-value="file"
      @update:model-value="updateFile"
      :label="isTrainMode ? 'Uploader ou sélectionner un fichier' : 'Uploader un fichier'"
      outlined
      :clearable="!fileUploadProgress.uploading"
    >
      <template #before>
        <q-icon name="fa-solid fa-paperclip" color="primary" />
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
        <div v-if="!isTrainMode">
          <q-btn v-if="!fileUploadProgress.uploading" color="primary" dense icon="cloud_upload" round @click="upload" :disable="!canUpload" />
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
import { useTrainerStore } from 'src/stores/train-store';

const props = defineProps({
  isTrainMode: { type: Boolean, default: false },
});

const filesStore = useFilesStore();
const trainerStore = useTrainerStore();
const { fileToUpload } = storeToRefs(trainerStore);
const { fileUploadProgress } = storeToRefs(filesStore);

const file = ref<File | null>(null);
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

  try {
    if (!props.isTrainMode) {
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
      icon: 'fa-regular fa-file',
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
    }
  }
);

onBeforeUnmount(cancelFile);
</script>
