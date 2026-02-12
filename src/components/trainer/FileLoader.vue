<template>
  <div style="height: 75vh">
    <!-- Chargement du fichier -->
    <q-splitter v-model="splitter" horizontal style="height: 100%">
      <template v-slot:before>
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
                <q-input class="col-12" outlined label="Sélectionner un dossier dans l'explorateur" v-model="folderPath"
                  input-class="text-bold">
                  <template v-if="folderPath" v-slot:append>
                    <q-icon name="cancel" @click.stop.prevent="fileStore.goToHome" class="cursor-pointer" />
                  </template>
                  <template #before>
                    <q-icon name="fa-regular fa-folder-open" color="secondary" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-card-section class="column items-stretch justify-center">
              <div class="col">
                <div class="row items-center justify-start">
                  <div class="col-auto">
                    <q-toggle v-model="showFileExplorer" color="primary" />
                  </div>
                  <div class="col-auto">Afficher l'explorateur de fichiers</div>
                </div>
              </div>
            </q-card-section>
          </q-card-section>

          <template v-if="pointCloudFile">
            <q-separator vertical />
            <q-card-section class="col-3" style="max-height: 30vh; overflow-y: scroll">
              <q-banner class="bg-blue-1 text-primary text-center" style="border: 1px solid rgba(0, 0, 0, 0.12)" dense
                rounded> Détails : </q-banner>
              <q-card-section flat>
                <q-list dense bordered class="bg-blue-1 text-primary">
                  <q-item>
                    <q-item-section>Nom :</q-item-section>
                    <q-item-section class="text-accent text-bold" style="word-break: break-word"> {{ pointCloudFile.name
                      }}</q-item-section>
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
                      <span class="text-accent text-bold" style="cursor: pointer; color: #1976d2"
                        @click="showFeaturesDialog = true">
                        {{ pointCloudFile.featuresList.length }}
                      </span>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card-section>
          </template>
        </q-card>
      </template>
       <template v-slot:separator>
        <q-icon color="black" size="md" name="mdi-arrow-split-horizontal" />
      </template>
      <template v-slot:after>
        <div style="height: 100%;">
          <q-card v-if="showFileExplorer" flat class="column">
            <FileExplorer :show-input="false" :show-title="false" :train-mode="true"/>
          </q-card>
        </div>
      </template>
    </q-splitter>
    <q-dialog v-model="showFeaturesDialog">
      <FeaturesList style="width: 95vh" :item-clickable="false" @close="showFeaturesDialog = false" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import InputFile from 'src/components/files/InputFile.vue';
import FileExplorer from 'src/components/files/FileExplorer.vue';
import FeaturesList from './FeaturesList.vue';
import { computed, ref } from 'vue';
import { useFilesStore } from 'src/stores/files-store';
import { storeToRefs } from 'pinia';
import { useTrainerStore } from 'src/stores/train-store';

const trainerStore = useTrainerStore();
const fileStore = useFilesStore();
const { pointCloudFile, existingFile, uploadedFileName, folderId } = storeToRefs(trainerStore);
const { currentFolderDisplayPath } = storeToRefs(fileStore);

const showFileExplorer = ref<boolean>(true);
const showFeaturesDialog = ref<boolean>(false);
const splitter = ref(50);

const fileLoaded = computed(() => (existingFile.value ? existingFile.value.name : uploadedFileName.value));

const folderPath = computed(() => {
  return currentFolderDisplayPath.value.join('/');
});
</script>
