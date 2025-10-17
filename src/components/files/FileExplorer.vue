<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="text-h6">
        Explorateur de fichiers
      </q-card-section>

      <q-separator />

      <q-card-section v-if="root">
        <FolderItem :root="root" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import FolderItem from './FolderItem.vue'
import { fileService } from 'src/services/files.services';
import type { FolderModel } from 'src/types/files.type';
const root = ref<FolderModel>();

onMounted(async () => {
  const files = await fileService.getRoot();
  if (files) root.value = files;

})
</script>
