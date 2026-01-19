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
                <q-icon name="fa-regular fa-folder-open" color="secondary" />
              </template>
            </q-input>
          </template>
          <template v-else>
            <q-input class="col-12" outlined readonly :label="defaultOutput" label-color="accent" :model-value="''">
              <template #before>
                <q-icon name="fa-regular fa-folder-open" color="secondary" />
              </template>
            </q-input>
          </template>
        </div>
      </div>

      <q-card-section class="column items-stretch justify-center">
        <div class="col">
          <div class="row items-center justify-start">
            <div class="col-auto">
              <q-checkbox ref="keepOnServerRef" v-model="keepOnServer" class="q-ml-sm" :disable="!isNullOrEmpty(fileLoaded)" />
            </div>
            <div :class="!isNullOrEmpty(fileLoaded) ? 'text-strike' : '' + ' col-auto q-ml-sm q-mr-lg'">Conserver le fichier d'entrée sur le serveur ?</div>
            <div class="col-auto q-ml-lg">
              <q-banner v-if="!isNullOrEmpty(fileLoaded)" class="bg-yellow-3" dense rounded>
                <template v-slot:avatar>
                  <q-icon name="warning" color="orange" size="sm" />
                </template>
                Impossible de décocher cette option car un fichier est déjà chargé.
              </q-banner>
            </div>
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
          <q-icon name="info" size="sm" />
        </template>
        Si l'option « Conserver le fichier » est décochée, celui-ci sera supprimé à la fin du traitement et un dossier de sortie sera créé par défaut dans
        <span class="text-bold text-dark">"data/storage/outputs/"</span>.
      </q-banner>
    </q-card-section>

    <template v-if="fileInfos">
      <q-separator vertical />
      <q-card-section class="col-3">
        <q-banner class="bg-blue-1 text-primary text-center" dense rounded> Détails : </q-banner>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import { storeToRefs } from 'pinia';
import { useConfigStore } from 'src/stores/config-store';
import { emitter } from 'src/event-emitter';
import { isNullOrEmpty } from 'src/utils';
import { QCheckbox } from 'quasar';

const fileInfos = ref<string | null>(null);
const fileLoaded = ref<string | null>(null);
const keepOnServer = ref<boolean>(false);
const keepOnServerRef = ref<QCheckbox | null>(null);
const showFileExplorer = ref<boolean>(true);
const fileStore = useFilesStore();
const configStore = useConfigStore();
const { currentFolderDisplayPath, currentFolder } = storeToRefs(fileStore);

const emit = defineEmits<{
  fileLoaded: [value: string | null];
}>();

const defaultOutput = computed(() => `${configStore.apiSettings?.defaultOutputDir}/yyymmdd_hhmmss`);

const folderId = computed(() => {
  return currentFolder.value?.id || 'root';
});

const folderPath = computed(() => {
  return currentFolderDisplayPath.value.join('/');
});

emitter.on('existing-file-event', (payload) => {
  fileLoaded.value = payload.file ? payload.file.name : null;
});

const fileInfosEmitter = (msg: Record<string, string>) => {
  if (msg['claspy_msg']) {
    fileInfos.value = msg['claspy_msg'];
  }
  if (msg['path']) {
    fileLoaded.value = msg['path'];
  }
};

watch(
  () => fileLoaded.value,
  (newVal) => {
    emit('fileLoaded', newVal);
  }
);

onMounted(async () => {
  await nextTick();
  const el = keepOnServerRef.value?.$el as HTMLElement;
  el?.focus();
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
</script>
