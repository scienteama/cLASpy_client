<template>
  <div class="q-pa-md column items-start q-gutter-y-md">
    <q-file :model-value="file" @update:model-value="updateFile" label="Uploader un fichier" outlined
      :clearable="!isUploading" style="max-width: 400px">

      <template v-slot:before>
        <q-icon name="attach_file" />
      </template>

      <template #file="{ file }">
        <q-chip class="full-width q-my-xs" :removable="isUploading && fileUploadProgress.percent < 1" square
          @remove="cancelFile">
          <q-linear-progress class="absolute-full full-height" :value="fileUploadProgress.percent"
            :color="fileUploadProgress.color" track-color="grey-2" />

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
        <q-btn color="primary" dense icon="cloud_upload" round @click="upload" :disable="!canUpload"
          :loading="isUploading" />
      </template>
    </q-file>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useFilesStore } from 'src/stores/files-store'
import { QLinearProgress, QChip, QAvatar, QIcon, QFile, QBtn, QTooltip } from 'quasar'
import type { FileUploadProgress } from 'src/types/files.type'

const props = defineProps<{ currentPath: string }>()

// --- Store ---
const filesStore = useFilesStore()
const { uploadFile } = filesStore

// --- Local state ---
const file = ref<File | null>(null)
const fileUploadProgress = ref<FileUploadProgress>({
  error: false,
  color: 'green-2',
  percent: 0,
  icon: 'insert_drive_file'
})

const uploading = ref<boolean>(false)
const isUploading = computed(() => uploading.value)
const canUpload = computed(() => file.value !== null)

// --- Helpers ---
function cleanUp() {
  uploading.value = false
  fileUploadProgress.value = {
    error: false,
    color: 'green-2',
    percent: 0,
    icon: 'insert_drive_file'
  }
}

function cancelFile() {
  cleanUp()
  file.value = null
}

function updateFile(newFile: File | null) {
  file.value = newFile

  if (newFile) {
    fileUploadProgress.value = {
      error: false,
      color: 'green-2',
      percent: 0,
      icon:
        newFile.type.startsWith('video/')
          ? 'movie'
          : newFile.type.startsWith('image/')
            ? 'photo'
            : newFile.type.startsWith('audio/')
              ? 'audiotrack'
              : 'insert_drive_file'
    }
  }
}

// --- Upload via store ---
async function upload() {
  if (!file.value) return

  uploading.value = true
  fileUploadProgress.value.percent = 0
  fileUploadProgress.value.color = 'green-2'
  fileUploadProgress.value.error = false

  try {
    await uploadFile(file.value, props.currentPath)
    cleanUp()
    file.value = null
  } catch (err) {
    console.error('❌ Upload error:', err)
    fileUploadProgress.value.error = true
    fileUploadProgress.value.color = 'red-4'
  } finally {
    uploading.value = false
  }
}

onBeforeUnmount(cleanUp)
</script>
