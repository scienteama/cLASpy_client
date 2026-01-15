<template>
  <!-- Chargement du fichier -->
  <q-card flat class="q-pa-md row justify-between">
    <q-card-section class="col">
      <div class="row items-center justify-start col-12 q-mb-md">
        <div class="text-subtitle1 q-mb-sm col-2">Fichier d'entrée :</div>
        <div class="col">
          <template v-if="fileLoaded === null">
            <InputFile class="col-12" :point-cloud-loader="true" :keep-on-server="keepOnServer" :folderId="folderId" @file-infos="fileInfosEmitter" />
          </template>

          <template v-if="fileLoaded">
            <q-input class="col-12" outlined readonly :label="fileLoaded" label-color="accent" :model-value="''">
              <template #before>
                <q-icon name="fa-regular fa-file" color="primary" />
              </template>
            </q-input>
          </template>
        </div>
      </div>
      <div class="row items-center justify-start col-12">
        <div class="text-subtitle1 q-mb-sm col-2">Dossier de sortie :</div>

        <div class="col">
          <template v-if="keepOnServer">
            <q-input class="col-12" outlined label="Sélectionner un dossier dans l'explorateur" v-model="folderPath">
              <template #before>
                <q-icon name="fa-regular fa-folder" color="primary" />
              </template>
            </q-input>
          </template>
          <template v-else>
            <q-input class="col-12" outlined readonly :label="defaultOutput" label-color="accent" :model-value="''">
              <template #before>
                <q-icon name="fa-regular fa-folder" color="primary" />
              </template>
            </q-input>
          </template>
        </div>
      </div>

      <q-card-section class="column items-stretch justify-center">
        <div class="col">
          <div class="row items-center justify-start">
            <div class="col-auto">
              <q-checkbox v-model="keepOnServer" class="q-ml-sm" />
            </div>
            <div class="col-auto q-ml-sm">Conserver le fichier d'entrée sur le serveur ?</div>
          </div>
        </div>

        <div class="col">
          <div class="row items-center justify-start">
            <div class="col-auto">
              <q-toggle v-model="showFileExplorer" color="primary" />
            </div>
            <div class="col-auto">Afficher l'explorateur de fichiers</div>
          </div>
        </div>
      </q-card-section>

      <q-banner v-if="!keepOnServer" class="bg-blue-1 text-primary">
        <template v-slot:avatar>
          <q-icon name="info" />
        </template>
        Si l'option « Conserver le fichier » est décochée, celui-ci sera supprimé à la fin du traitement et un dossier de sortie sera créé par défaut dans
        <span class="text-bold text-dark">"data/storage/outputs/"</span>.
      </q-banner>
    </q-card-section>

    <template v-if="fileInfos">
      <q-separator vertical />
      <q-card-section class="col-3">
        <q-card-section flat class="q-pa-md">
          <pre class="text-accent text-center">{{ fileInfos }}</pre>
        </q-card-section>
      </q-card-section>
    </template>
  </q-card>

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
import { useConfigStore } from 'src/stores/config-store';

const fileInfos = ref<string | null>(null);
const fileLoaded = ref<string | null>(null);
const keepOnServer = ref<boolean>(false);
const showFileExplorer = ref<boolean>(true);
const fileStore = useFilesStore();
const configStore = useConfigStore();
const { currentFolderDisplayPath, currentFolder } = storeToRefs(fileStore);

const emit = defineEmits<{
  uploadIsDone: [value: boolean];
}>();

const defaultOutput = computed(() => `${configStore.apiSettings?.defaultOutputDir}/yyymmdd_hhmmss`);

const folderId = computed(() => {
  return currentFolder.value?.id || 'root';
});

const folderPath = computed(() => {
  return currentFolderDisplayPath.value.join('/');
});

const fileInfosEmitter = (msg: Record<string, string>) => {
  if (msg['claspy_msg']) {
    fileInfos.value = msg['claspy_msg'];
    emit('uploadIsDone', true);
  }
  if (msg['path']) {
    fileLoaded.value = msg['path'];
  }
};
</script>
