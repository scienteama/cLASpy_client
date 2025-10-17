<template>
  <div class="row items-center q-my-xs q-pl-md">
    <q-icon name="blur_on" size="20px" class="q-mr-sm text-grey" />

    <!-- Nom du fichier -->
    <span ref="nameLength">
      {{ file.name }}
      <!-- Popup edit -->
      <q-popup-edit v-model="newFilename" v-model:showing="isRenaming" buttons label-set="Renommer" ref="qEdit"
        label-cancel="Annuler" @save="renameFile" v-slot="scope" :style="{ width: finalWidth + 'px' }" anchor="top left"
        self="top left">
        <q-input v-model="scope.value" dense autofocus @keyup.enter="scope.set" :placeholder="file.name"></q-input>
      </q-popup-edit>
    </span>

    <!-- Menu actions -->
    <q-btn flat dense round icon="more_vert" size="sm" class="q-ml-auto">
      <q-menu>
        <q-list style="min-width: 150px">
          <q-item clickable>
            <q-item-section>Télécharger</q-item-section>
          </q-item>
          <q-item clickable @click="isRenaming = true">
            <q-item-section>Renommer</q-item-section>
          </q-item>
          <q-item clickable @click="deleteFile(file.id)">
            <q-item-section>Supprimer</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>


<script setup lang="ts">
import { dom, useQuasar } from 'quasar';
import { fileService } from 'src/services/files.services';
import type { FileModel } from 'src/types/files.type';
import { computed, ref } from 'vue';

const nameLength = ref(null)
const computedWidth = computed(() => nameLength.value ? dom.width(nameLength.value) + 50 : 200)
const finalWidth = computed(() => Math.max(computedWidth.value || 0, 300))

const props = defineProps<{
  file: FileModel
}>();

const isRenaming = ref(false);
const newFilename = ref("");
const $q = useQuasar();

async function deleteFile(fileId: string) {
  await fileService.removeFileOrDir(fileId);
}

const renameFile = async (newName: string) => {
  console.log(computedWidth.value);
  try {
    if (newName && newName !== props.file.name) {
      const success = await fileService.renameFileOrDir(props.file.id, newName)
      if (success) {
        $q.notify({ type: 'positive', message: 'Nom modifié avec succès ✅' })
      } else {
        $q.notify({ type: 'negative', message: 'Échec du renommage ❌' })
      }
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Erreur de communication avec le serveur.' })
  } finally {
    isRenaming.value = false
  }
}

</script>
