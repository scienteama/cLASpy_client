<template>
  <q-card flat bordered style="min-width: 300px !important; max-width: 90vw; max-height: 80vh; overflow: auto">
    <q-bar style="position: sticky; top: 0; z-index: 1" class="bg-grey-4">
      <q-icon :name="mdiTextBoxCheckOutline"></q-icon>

      <div>{{ props.file?.name }}</div>

      <q-space></q-space>

      <q-btn dense flat :icon="matClose" v-close-popup>
        <q-tooltip>Fermer</q-tooltip>
      </q-btn>
    </q-bar>

    <template v-if="props.file && props.fileContent">
      <q-card-section v-if="['text/plain', 'text/csv'].includes(props.file?.mimeType || '')">
        <pre>{{ content }}</pre>
      </q-card-section>

      <q-card-section v-else-if="['application/json', 'text/html'].includes(props.file?.mimeType || '')">
        <HighLight v-if="content" :code="content" language="json" />
      </q-card-section>

      <q-card-section v-else-if="props.file?.mimeType?.startsWith('image/') && fileUrl">
        <img :src="fileUrl" alt="Image preview" style="max-width: 100%; max-height: 70vh; object-fit: contain" />
      </q-card-section>

      <q-card-section v-else-if="props.file?.mimeType === 'application/pdf' && fileUrl" style="height: 70vh; width: 700px">
        <iframe :src="fileUrl" style="height: 100%; width: 100%; border: none"></iframe>
      </q-card-section>

      <q-card-section v-else> Contenu non supporté </q-card-section>
    </template>
  </q-card>
</template>
<script setup lang="ts">
import { ref, watch, onUnmounted, onMounted } from 'vue';
import HighLight from '@/components/tools/HighLight.vue';
import type { FileModel } from '@/models/types/files.type';
import { mdiTextBoxCheckOutline } from '@quasar/extras/mdi-v7';
import { matClose } from '@quasar/extras/material-icons';

const props = defineProps<{
  file: FileModel | null;
  fileContent: Blob | null;
}>();

const content = ref<string>('');
const fileUrl = ref<string | null>(null);

async function readFileContent(file: Blob | null): Promise<string> {
  if (!file) return '';
  content.value = await file.text();
  return content.value;
}

watch(
  () => props.fileContent,
  (blob) => {
    if (fileUrl.value) {
      URL.revokeObjectURL(fileUrl.value);
      fileUrl.value = null;
    }

    if (blob) {
      fileUrl.value = URL.createObjectURL(blob);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (props.fileContent) {
    await readFileContent(props.fileContent);
  }
});

onUnmounted(() => {
  if (fileUrl.value) {
    URL.revokeObjectURL(fileUrl.value);
  }
});
</script>
