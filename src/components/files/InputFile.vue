<template>
  <div class="q-pa-md column items-start q-gutter-y-md">
    <q-file
      :model-value="file"
      @update:model-value="updateFile"
      label="Uploader un fichier"
      outlined
      :clearable="!isUploading"
      style="max-width: 400px"
    >

    <template v-slot:before>
      <q-icon name="attach_file" />
    </template>

      <template #file="{ file }">
        <q-chip
          class="full-width q-my-xs"
          :removable="isUploading && fileUploadProgress.percent < 1"
          square
          @remove="cancelFile"
        >
          <q-linear-progress
            class="absolute-full full-height"
            :value="fileUploadProgress.percent"
            :color="fileUploadProgress.color"
            track-color="grey-2"
          />

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
        <q-btn
          color="primary"
          dense
          icon="cloud_upload"
          round
          @click="upload"
          :disable="!canUpload"
          :loading="isUploading"
        />
      </template>
    </q-file>
  </div>
</template>

<script setup lang="ts">
import type { AxiosProgressEvent } from 'axios'
import type { FileUploadProgress } from 'src/types/files.type'
import { api } from 'src/boot/axios'
import { ref, computed, onBeforeUnmount } from 'vue'

const file = ref<File | null>(null)

const fileUploadProgress = ref<FileUploadProgress>({
  error: false,
  color: 'green-2',
  percent: 0,
  icon: 'insert_drive_file'
})

const uploading = ref<ReturnType<typeof setTimeout> | null>(null)
const isUploading = computed(() => uploading.value !== null)
const canUpload = computed(() => file.value !== null)

function cleanUp(): void {
  if (uploading.value !== null) {
    clearTimeout(uploading.value)
    uploading.value = null
  }
}



function cancelFile(): void {
  fileUploadProgress.value = {
    ...fileUploadProgress.value,
    error: true,
    color: 'orange-2'
  }
}


function updateFile(newFile: File | null): void {
  file.value = newFile

  console.log(newFile);

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

async function upload(): Promise<void> { // TODO : Ajouter spinner et notifications Error / Success
  if (!file.value) return

  cleanUp()

  fileUploadProgress.value = {
    ...fileUploadProgress.value,
    error: false,
    color: 'green-2',
    percent: 0
  }

  const formData = new FormData()
  formData.append('file', file.value)

  try {
    uploading.value = null

    const res = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && progressEvent.loaded) {
          const percent = progressEvent.loaded / progressEvent.total
          fileUploadProgress.value.percent = percent
          fileUploadProgress.value.color = percent < 1 ? 'green-2' : 'green-4'
        }
      },
    })

    console.log('✅ Upload réussi :', res.data)
  } catch (error) {
    console.error('❌ Erreur upload :', error)
    fileUploadProgress.value.error = true
    fileUploadProgress.value.color = 'red-4'
  } finally {
    uploading.value = null
  }
}

onBeforeUnmount(cleanUp)
</script>

<style scoped lang="scss">
</style>
