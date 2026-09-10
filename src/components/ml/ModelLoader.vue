<template>
  <div style="height: 75vh">
    <!-- Chargement du fichier -->
    <q-splitter v-model="splitter" horizontal style="height: 100%">
      <template v-slot:before>
        <q-card flat class="row justify-between">
          <q-card-section class="col">
            <div class="row items-center justify-start col-12 q-mb-sm">
              <div class="text-subtitle1 q-mb-sm col-2">Modèle d'entrée :</div>
              <div class="col">
                <template v-if="modeleLoaded == null">
                  <InputFile class="col-12" :is-predict-mode="true" :folderId="folderId" />
                </template>

                <template v-if="modeleLoaded">
                  <q-input class="col-12" outlined readonly :label="modeleLoaded" label-color="accent" :model-value="''">
                    <template #before>
                      <q-icon :name="farFile" color="primary" />
                    </template>
                  </q-input>
                </template>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card v-if="modelFile" flat>
          <div class="row items-center q-ma-md text-center text-bold">
            <div class="col q-mr-md model-details rounded-borders">
              Algorithme :
              <span class="text-primary">{{ modelFile.algorithm }}</span>
            </div>
            <div class="col q-mr-md model-details rounded-borders">
              PCA :
              <span class="text-primary">{{ modelFile.pca }}</span>
            </div>
            <div class="col q-mr-md model-details rounded-borders">
              <strong>Scaler : </strong> <span class="text-primary">{{ modelFile.scaler }}</span>
            </div>
            <div class="col q-mr-md model-details rounded-borders justify-between">
              <span class="text-accent text-bold" style="cursor: pointer; color: #1976d2" @click="showModelFeatures = true"> Nombre d'attributs : {{ selectedFeatures.size }} </span>
            </div>
          </div>
        </q-card>
      </template>
      <template v-slot:separator>
        <q-icon color="black" size="md" :name="mdiArrowSplitHorizontal" />
      </template>
      <template v-slot:after>
        <div style="height: 100%">
          <q-card v-if="showFileExplorer" flat class="column">
            <FileExplorer :show-input="false" :show-title="false" :predict-mode="true" />
          </q-card>
        </div>
      </template>
    </q-splitter>
  </div>

  <q-dialog v-if="modelFile" v-model="showModelFeatures">
    <FeaturesList style="width: 95vh" :item-clickable="true" @close="showModelFeatures = false" :model-features="modelFile.featuresList" />
  </q-dialog>
</template>
<script lang="ts" setup>
import { farFile } from '@quasar/extras/fontawesome-v7';
import InputFile from '../files/InputFile.vue';
import FileExplorer from '../files/FileExplorer.vue';
import FeaturesList from './FeaturesList.vue';
import { storeToRefs } from 'pinia';
import { useMLStore } from '@/stores/ml-store';
import { computed, ref } from 'vue';
import { mdiArrowSplitHorizontal } from '@quasar/extras/mdi-v7';

const mlStore = useMLStore();
const { existingModel, uploadedModelName, folderId, modelFile, selectedFeatures } = storeToRefs(mlStore);

defineProps({
  showFileExplorer: { type: Boolean, default: true },
});

const showModelFeatures = ref<boolean>(false);
const splitter = ref(25);
const modeleLoaded = computed(() => (existingModel.value ? existingModel.value.name : uploadedModelName.value));
</script>
<style lang="scss" scoped>
.model-details {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  min-height: 60px;
  background-color: $grey-2;
  border: 3px solid $grey-5;
}
</style>
