<template>
  <div style="height: 75vh">
    <!-- Chargement du fichier -->
    <q-card flat class="row justify-between">
      <q-card-section class="col">
        <div class="row items-center justify-start col-12 q-mb-sm">
          <div class="text-subtitle1 q-mb-sm col-2">Fichier d'entrée :</div>
          <div class="col">
            <template v-if="fileLoaded == null">
              <InputFile class="col-12" :is-train-mode="true" :folderId="folderId" />
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

      <template v-if="pointCloudFile">
        <q-separator vertical />
        <q-card-section class="col-3" style="max-height: 30vh; overflow-y: scroll">
          <q-banner class="bg-blue-1 text-primary text-center" style="border: 1px solid rgba(0, 0, 0, 0.12)" dense rounded> Détails : </q-banner>
          <q-card-section flat>
            <q-list dense bordered class="bg-blue-1 text-primary">
              <q-item>
                <q-item-section>Nom :</q-item-section>
                <q-item-section class="text-accent text-bold" style="word-break: break-word"> {{ pointCloudFile.name }}</q-item-section>
              </q-item>

              <q-item>
                <q-item-section>Type :</q-item-section>
                <q-item-section class="text-accent text-bold">{{ pointCloudFile.type }}</q-item-section>
              </q-item>

              <q-item>
                <q-item-section>Nombre de points :</q-item-section>
                <q-item-section class="text-accent text-bold">{{ pointCloudFile.pointsNumber }}</q-item-section>
              </q-item>

              <q-item v-if="pointCloudFile.lasVersion">
                <q-item-section>Version LAS :</q-item-section>
                <q-item-section class="text-accent text-bold">{{ pointCloudFile.lasVersion }}</q-item-section>
              </q-item>

              <q-item v-if="pointCloudFile.lasPointFormat">
                <q-item-section>LAS Point Format :</q-item-section>
                <q-item-section class="text-accent text-bold">{{ pointCloudFile.lasPointFormat }}</q-item-section>
              </q-item>

              <q-item v-if="pointCloudFile.featuresList">
                <q-item-section>Attributs :</q-item-section>
                <q-item-section>
                  <span class="text-accent text-bold" style="cursor: pointer; color: #1976d2" @click="showFeaturesDialog = true">
                    {{ pointCloudFile.featuresList.length }}
                  </span>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card-section>
      </template>
    </q-card>

    <q-card v-if="showFileExplorer" flat>
      <FileExplorer :show-input="false" :show-title="false" :train-mode="true" />
    </q-card>

    <q-dialog v-model="showFeaturesDialog">
      <FeaturesList style="width: 95vh" :item-clickable="false" @close="showFeaturesDialog = false" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import InputFile from 'src/components/files/InputFile.vue';
import FileExplorer from 'src/components/files/FileExplorer.vue';
import FeaturesList from './FeaturesList.vue';
import { computed, nextTick, onMounted, ref } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import { storeToRefs } from 'pinia';
import { useConfigStore } from 'src/stores/config-store';
import { isNullOrEmpty } from 'src/helpers/global-utils';
import { QCheckbox } from 'quasar';
import { useTrainerStore } from 'src/stores/train-store';

const trainerStore = useTrainerStore();
const fileStore = useFilesStore();
const configStore = useConfigStore();
const { pointCloudFile, existingFile, uploadedFileName, keepOnServer, folderId } = storeToRefs(trainerStore);
const { currentFolderDisplayPath } = storeToRefs(fileStore);

const keepOnServerRef = ref<QCheckbox | null>(null);
const showFileExplorer = ref<boolean>(true);
const showFeaturesDialog = ref<boolean>(false);

const fileLoaded = computed(() => (existingFile.value ? existingFile.value.name : uploadedFileName.value));
const defaultOutput = computed(() => `${configStore.apiSettings?.defaultOutputDir}/yyymmdd_hhmmss`);
const folderPath = computed(() => {
  return currentFolderDisplayPath.value.join('/');
});

onMounted(async () => {
  await nextTick();
  const el = keepOnServerRef.value?.$el as HTMLElement;
  el?.focus();
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
</script>
