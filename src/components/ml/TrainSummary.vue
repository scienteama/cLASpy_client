<template>
  <div style="height: 72vh">
    <div class="row full-height justify-between q-pa-md">
      <q-card flat bordered class="col bg-white full-height column">
        <q-card-section v-if="trainConfig" class="bg-teal-1">
          <div class="text-h6">Paramètres d'entraînement</div>
          <div class="text-caption text-grey">Créé le {{ new Date(trainConfig.createdAt).toLocaleString() }}</div>
        </q-card-section>

        <q-separator />

        <q-list v-if="trainConfig">
          <q-item>
            <q-item-section>
              <q-item-label class="text-bold">Fichier d'entrée :</q-item-label>
              <q-item-label class="text-weight-medium text-primary q-ml-sm">
                {{ pointCloudFile?.name }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset />
          <q-item>
            <q-item-section>
              <q-item-label class="text-bold">Dossier de sortie :</q-item-label>
              <q-item-label class="text-weight-medium text-primary q-ml-sm">
                {{ outputDir }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item>
            <q-item-section>
              <q-item-label class="text-bold">Paramètres généraux :</q-item-label>

              <div class="row q-col-gutter-sm q-mt-xs q-ml-sm">
                <q-chip outline color="primary">Points : {{ trainConfig.samples * 1_000_000 }}</q-chip>
                <q-chip outline color="primary">Ratio : {{ trainConfig.trainingRatio }}</q-chip>
                <q-chip outline color="primary">Scaler : {{ trainConfig.scaler }}</q-chip>
                <q-chip outline color="primary">Scorer : {{ trainConfig.scorer }}</q-chip>
                <q-chip outline color="primary">Graine : {{ trainConfig.randomState }}</q-chip>
                <q-chip outline color="primary">FillNaN : {{ trainConfig.fillnan }}</q-chip>
                <q-chip outline color="primary">Jobs CV : {{ trainConfig.nJobsCv }}</q-chip>
                <q-chip outline color="primary">ACP : {{ trainConfig.pca || 'désactivée' }}</q-chip>
              </div>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item>
            <q-item-section>
              <q-item-label class="text-bold">Algorithme :</q-item-label>
              <q-item-label class="text-weight-medium text-primary q-ml-sm">
                {{ trainConfig.algorithm }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item>
            <q-item-section>
              <q-item-label class="text-bold">Attributs sélectionnés ({{ trainConfig.featureNames.length }}) :</q-item-label>
              <div class="row q-col-gutter-sm q-my-md q-ml-sm">
                <q-chip v-for="feature in trainConfig.featureNames" :key="feature" removable color="teal" outline @remove="removeFeature(feature)">
                  {{ feature }}
                </q-chip>
              </div>
            </q-item-section>
          </q-item>

          <q-separator inset v-if="removedFeatures.length > 0" />

          <q-item v-if="removedFeatures.length > 0">
            <q-item-section>
              <q-item-label class="text-bold">Attributs supprimés ({{ removedFeatures.length }}) :</q-item-label>
              <div class="row q-col-gutter-sm q-my-md q-ml-sm">
                <q-chip v-for="feature in removedFeatures" :key="feature" removable outline color="negative" @remove="restoreFeature(feature)">
                  <span class="text-strike">{{ feature }}</span>
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <q-card flat bordered class="col-auto bg-grey-1 column full-height q-ml-md">
        <q-banner rounded class="bg-teal-1">
          <div class="row items-center no-wrap full-width">
            <q-icon :name="mdiCodeJson" size="md" color="warning" class="q-mr-sm" />

            <div class="col text-bold text-center">Configuration JSON</div>

            <q-btn flat dense @click="downloadJSON(trainConfig as object, 'config')">
              <q-icon :name="mdiFileDownloadOutline" size="md" color="secondary" />
              <q-tooltip>Télécharger le fichier</q-tooltip>
            </q-btn>
          </div>
        </q-banner>
        <q-separator />

        <div class="col scroll">
          <HighLight :code="JSON.stringify(trainConfig, null, 2)" :language="'json'" />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import HighLight from '../tools/HighLight.vue';
import { downloadJSON } from 'src/helpers/files-utils';
import { mdiCodeJson, mdiFileDownloadOutline } from '@quasar/extras/mdi-v7';
import { useMLStore } from 'src/stores/ml-store';
import { computed, ref } from 'vue';
import { useFilesStore } from 'src/stores/files-store.js';

const mlStore = useMLStore();
const fileStore = useFilesStore();
const { trainConfig, pointCloudFile } = storeToRefs(mlStore);
const { currentFolderDisplayPath } = storeToRefs(fileStore);
const removedFeatures = ref<string[]>([]);

function removeFeature(feature: string) {
  trainConfig.value?.featureNames.splice(trainConfig.value.featureNames.indexOf(feature), 1);
  removedFeatures.value.push(feature);
}

function restoreFeature(feature: string) {
  if (trainConfig.value && removedFeatures.value.includes(feature)) {
    trainConfig.value.featureNames.push(feature);
    removedFeatures.value.splice(removedFeatures.value.indexOf(feature), 1);
  }
}

const outputDir = computed(() => {
  return currentFolderDisplayPath.value.join('/');
});
</script>
