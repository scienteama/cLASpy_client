<template>
  <q-stepper
    v-model="step"
    horizontal
    animated
    keep-alivedone-color="positive"
    active-color="primary"
    header-class="predict-stepper-header"
    :style="{ '--computed-bg': computedStyle.background }"
    class="column"
  >
    <q-step :name="1" title="NUAGE DE POINTS" :icon="mdiFileOutline" :done="step > 1" class="column full-height">
      <FileLoader key="file-loader-prediction" />
      <q-stepper-navigation v-if="canUploadFile || canContinue" class="q-pa-md bg-blue-1">
        <div class="row justify-end">
          <q-btn v-if="canUploadFile" color="secondary" label="Upload" :icon="matCloudUpload" @click="sendUploadEvent()" />
          <q-btn v-if="canContinue" @click="step = 2" color="primary" label="Continuer" />
        </div>
      </q-stepper-navigation>
    </q-step>

    <q-step :name="2" title="MODÈLE" :icon="fasGears" :done="step > 2" class="column full-height">
      <ModelLoader key="model-loader-prediction" :show-file-explorer="showFileExplorer" />
      <q-stepper-navigation class="q-pa-md bg-blue-1">
        <div class="row items-center">
          <div>
            <q-toggle v-model="showFileExplorer" color="primary" label="Afficher l'explorateur de fichiers" />
          </div>
          <div class="col"></div>
          <div>
            <q-btn @click="step = 1" color="secondary" label="Retour" outline />
            <q-btn v-if="canUploadModel" color="secondary" label="Upload Model" class="q-ml-sm" :icon="matCloudUpload" @click="sendUploadModelEvent()" />
            <q-btn v-if="canContinue" @click="step = 3" color="primary" label="Continuer" class="q-ml-sm" />
          </div>
        </div>
      </q-stepper-navigation>
    </q-step>

    <q-step :name="3" title="RÉCAPITULATIF" :icon="fasList" :done="step > 3" class="column full-height">
      <!-- Récapitulatif des choix effectués -->
      <div class="row full-height justify-between q-pa-md">
        <q-card flat bordered class="col bg-white full-height column">
          <q-card-section class="bg-teal-1">
            <div class="text-h6">Prédiction</div>
            <div class="text-caption text-grey">Créé le {{ new Date().toLocaleString() }}</div>
          </q-card-section>

          <q-separator />

          <q-list v-if="pointCloudFile">
            <q-item>
              <q-item-section>
                <q-item-label class="text-bold">Nuage de points :</q-item-label>
                <q-item-label class="text-weight-medium text-primary q-ml-sm">
                  {{ pointCloudFile?.name }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator inset />
            <q-item>
              <q-item-section>
                <q-item-label class="text-bold">Modèle sélectionné :</q-item-label>
                <q-item-label class="text-weight-medium text-primary q-ml-sm">
                  {{ mlStore.modelFile?.name || 'Aucun fichier sélectionné' }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator inset />

            <q-item>
              <q-item-section>
                <q-item-label class="text-bold">Algorithme :</q-item-label>
                <q-item-label class="text-weight-medium text-primary q-ml-sm">
                  {{ mlStore.modelFile?.algorithm || 'Aucun modèle chargé' }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator inset />

            <q-item>
              <q-item-section>
                <q-item-label class="text-bold">Attributs sélectionnés ({{ selectedFeatures.size }}) :</q-item-label>
                <div class="row q-col-gutter-sm q-my-md q-ml-sm">
                  <q-chip v-for="feature in selectedFeatures" :key="feature" removable color="teal" outline @remove="removeFeature(feature)">
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
      </div>

      <q-stepper-navigation class="q-pa-md bg-blue-1 row justify-end">
        <q-btn @click="step = 2" color="secondary" label="Retour" outline />
        <q-btn color="primary" label="Executer" @click="runPredict()" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>
<script setup lang="ts">
import ConfirmDialog from '../tools/ConfirmDialog.vue';
import { computed, ref, watch } from 'vue';
import FileLoader from '../ml/FileLoader.vue';
import ModelLoader from '../ml/ModelLoader.vue';
import { mdiFileOutline } from '@quasar/extras/mdi-v7';
import { fasGears, fasList } from '@quasar/extras/fontawesome-v6';
import { useRoute, useRouter } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import { storeToRefs } from 'pinia';
import { matCloudUpload } from '@quasar/extras/material-icons';
import { useMLStore } from 'src/stores/ml-store';
import { useFilesStore } from 'src/stores/files-store';
import { farFile } from '@quasar/extras/fontawesome-v7';
import { checkFileSize } from 'src/helpers/files-utils';
import { useQuasar } from 'quasar';
import type { PredictParameters } from 'src/models/types/ml/predict.types.js';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const filesStore = useFilesStore();
const configStore = useConfigStore();
const mlStore = useMLStore();
const { computedStyle } = storeToRefs(configStore);
const { fileToUpload, existingFile, uploadedFileName, pointCloudFile, modelToUpload, existingModel, uploadedModelName, selectedFeatures } = storeToRefs(mlStore);
const removedFeatures = ref<string[]>([]);
const showFileExplorer = ref(true);

const step = computed({
  get: () => {
    const s = Number(route.params.step);
    return [1, 2, 3].includes(s) ? s : 1;
  },
  set: (val: number) => {
    void router.push({ name: 'ml-predict', params: { step: val } });
  },
});

const canUploadFile = computed(() => (fileToUpload.value ? true : false));
const canUploadModel = computed(() => (modelToUpload.value ? true : false));

const fileIsLoaded = computed(() => (existingFile.value ? existingFile.value.name : uploadedFileName.value));
const modeleLoaded = computed(() => (existingModel.value ? existingModel.value.name : uploadedModelName.value));

const canContinue = computed(() => {
  switch (step.value) {
    case 1:
      return !!fileIsLoaded.value && !!pointCloudFile.value;
    case 2:
      return !!modeleLoaded.value;
    case 3:
      return true;
    default:
      return false;
  }
});

async function sendUploadEvent() {
  await mlStore.uploadPointCloudFile();
}

async function sendUploadModelEvent() {
  if (!modelToUpload.value) return;
  if (!checkFileSize(modelToUpload.value)) return;
  try {
    const res = await filesStore.uploadFile(modelToUpload.value);
    if (res) {
      mlStore.uploadedModelName = res.name;
    }
    mlStore.markUploadDone();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de l'envoi du modèle : ${error}`);
    } else {
      throw new Error("Erreur inconnue lors de l'envoi du modèle");
    }
  } finally {
    filesStore.fileUploadProgress = {
      percent: 0,
      color: 'green-2',
      error: false,
      icon: farFile,
      uploading: false,
      speed: 0,
    };
  }
}

function removeFeature(feature: string) {
  selectedFeatures.value.delete(feature);
  removedFeatures.value.push(feature);
}

function restoreFeature(feature: string) {
  if (selectedFeatures.value && removedFeatures.value.includes(feature)) {
    selectedFeatures.value.add(feature);
    removedFeatures.value.splice(removedFeatures.value.indexOf(feature), 1);
  }
}

function runPredict() {
  if (!existingFile.value || !pointCloudFile.value || !existingModel.value) {
    return;
  }

  const params: PredictParameters = {
    inputFileId: existingFile.value.id,
    modelFileId: existingModel.value.id,
    folderId: filesStore.currentFolder?.id || 'root',
  };

  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: "Confirmer l'action",
      message: 'Êtes-vous sûr de vouloir lancer une prédiction avec ces paramètres ?',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
  }).onOk(() => {
    void (async () => {
      const res = await mlStore.runPredictAsync(params);
      if (res) step.value = 1;
    })();
  });
}

watch(
  [() => route.params.step, pointCloudFile],
  ([step, file]) => {
    if (!file && step !== '1') {
      void router.replace({ name: 'ml-predict', params: { step: '1' } });
    }
  },
  { immediate: true }
);
</script>
<style scoped lang="scss">
::v-deep(.predict-stepper-header) {
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 0px;
  border-bottom: 1px solid $grey-8;
  background: var(--computed-bg);
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.2),
    0 2px 2px rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

::v-deep(.q-stepper),
::v-deep(.q-stepper__horizontal) {
  border: 1px solid $grey-8;
  border-radius: 4px;
  padding: 0;
  background: none;
}

::v-deep(.q-stepper__step-inner) {
  padding: 0;
  box-sizing: border-box;
}

::v-deep(.q-stepper__nav) {
  border-top: 1px solid $grey-8;
}

::v-deep(.q-stepper__title) {
  background-color: $grey-3;
  padding: 5px;
  border-radius: 10px;
}
</style>
