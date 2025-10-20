<template>
  <div class="q-pa-md items-start q-gutter-y-md" style="width: auto; min-width: 70%;">
    <q-file :model-value="file" @update:model-value="updateFile" label="Uploader un fichier" outlined
      :clearable="!fileUploadProgress.uploading">
      <template #before>
        <q-icon name="attach_file" />
      </template>

      <template #file="{ file }">
        <q-chip class="full-width q-my-xs" :removable="fileUploadProgress.uploading && fileUploadProgress.percent < 1"
          square @remove="cancelFile">
          <q-linear-progress class="absolute-full full-height" :value="fileUploadProgress.percent"
            :color="fileUploadProgress.color" track-color="grey-2">
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
        <q-btn v-if="!fileUploadProgress.uploading" color="primary" dense icon="cloud_upload" round @click="upload"
          :disable="!canUpload" :loading="fileUploadProgress.uploading" />
        <q-badge v-else color="accent" text-color="white" rounded size="md"
          :label="(fileUploadProgress.percent * 100).toFixed(0) + '%'" />
      </template>
    </q-file>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useFilesStore } from 'src/stores/files-store'

const props = defineProps<{ currentPath: string }>()
const filesStore = useFilesStore()
const { uploadFile } = filesStore
const fileUploadProgress = computed(() => filesStore.fileUploadProgress);

const file = ref<File | null>(null)
const canUpload = computed(() => file.value !== null)

function cancelFile() {
  file.value = null
}

function updateFile(newFile: File | null) {
  file.value = newFile
}

async function upload() {
  if (!file.value) return
  try {
    await uploadFile(file.value, props.currentPath)
    cancelFile()
  } catch (err) {
    console.error('Upload error:', err)
  }
}

onBeforeUnmount(cancelFile)
</script>
