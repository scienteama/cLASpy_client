<template>
  <!-- Titre -->
  <q-card flat bordered class="q-pa-md">
    <div class="text-h7 q-mb-sm">Sélection du nuage de points :</div>
  </q-card>

  <!-- Chargement du fichier -->
  <q-card flat bordered class="q-pa-md row justify-between">
    <q-card-section class="col">
      <div class="row items-center justify-start col-12 q-mb-md">
        <div class="text-subtitle1 q-mb-sm col-2">Fichier d'entrée :</div>
        <div class="col">
          <InputFile class="col-12" :point-cloud-loader="true" :keep-on-server="keepOnServer" :folderId="folderId" @file-infos="fileInfosEmitter" />
        </div>
      </div>
      <div class="row items-center justify-start col-12">
        <div class="text-subtitle1 q-mb-sm col-2">Dossier de sortie :</div>
        <div class="col">
          <q-input class="col-12" outlined label="Sélectionner un dossier dans l'explorateur" v-model="folderPath">
            <template #before>
              <q-icon name="folder" />
            </template>
          </q-input>
        </div>
      </div>

      <q-card-section class="column">
        <q-checkbox v-model="keepOnServer" label="Conserver le fichier sur le serveur ?" class="q-mt-md self-start" />

        <q-toggle v-model="showFileExplorer" label="Afficher explorateur de fichiers" color="primary" class="self-start" />
      </q-card-section>
    </q-card-section>

    <q-separator vertical />
    <q-card-section class="col-3">
      <q-card-section flat class="q-pa-md">
        <pre v-if="fileInfos === null" class="text-grey text-center">Aucune informations sur le fichier</pre>
        <pre v-else class="text-accent text-center">{{ fileInfos }}</pre>
      </q-card-section>
    </q-card-section>
  </q-card>

  <!-- Mode SERVEUR display FileExplorer -->
  <q-card v-if="showFileExplorer" flat bordered class="q-pa-md">
    <FileExplorer :show-input="false" :show-title="false" />
  </q-card>
</template>

<script setup lang="ts">
import InputFile from 'src/components/files/InputFile.vue';
import FileExplorer from 'src/components/files/FileExplorer.vue';
import { computed, ref } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import { storeToRefs } from 'pinia';

const fileInfos = ref<string | null>(null);
const keepOnServer = ref<boolean>(false);
const showFileExplorer = ref<boolean>(true);
const fileStore = useFilesStore();
const { currentFolderDisplayPath, currentFolder } = storeToRefs(fileStore);

const folderId = computed(() => {
  return currentFolder.value?.id || 'root';
});

const folderPath = computed(() => {
  return currentFolderDisplayPath.value.join('/');
});

const fileInfosEmitter = (event: string | null) => {
  if (event) {
    fileInfos.value = event;
  }
};
</script>
