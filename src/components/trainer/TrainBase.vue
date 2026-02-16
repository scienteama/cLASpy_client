<template>
  <q-stepper v-model="step" horizontal animated keep-alive done-color="positive" active-color="accent" inactive-color="primary" header-class="stepper-header" class="column">
    <q-step :name="1" title="Sélection du nuage de points" icon="file" :done="step > 1" class="column full-height">
      <FileLoader key="file-loader" />
      <q-stepper-navigation v-if="canUpload || canContinue" class="q-pa-md bg-blue-1">
        <div class="row justify-end">
          <q-btn v-if="canUpload" color="secondary" label="Upload" icon="cloud_upload" @click="sendUploadEvent()" />
          <q-btn v-if="canContinue" @click="step = 2" color="primary" label="Continuer" />
        </div>
      </q-stepper-navigation>
    </q-step>

    <q-step :name="2" title="Sélection des paramètres d'entraînement" icon="fa-solid fa-gears" :done="step > 2" class="column full-height">
      <AlgoSelector ref="algoSelect" @go-to-continue="focusToContinue" />
      <q-stepper-navigation class="q-pa-md bg-blue-1 row justify-end">
        <q-btn @click="step = 1" color="secondary" label="Retour" outline />
        <q-btn color="negative" outline @click="resetConfig()" label="Annuler" class="q-ml-sm" />
        <q-btn v-if="!formValid" @click="validateForm()" color="primary" label="Valider" class="q-ml-sm"/>
        <q-btn ref="continueBtn" v-if="canContinue" @click="step = 3" color="primary" label="Continuer" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>

    <q-step :name="3" title="Récapitulatifs" icon="fa-solid fa-list" :done="step > 3" class="column full-height">
      <TrainSummary />
      <q-stepper-navigation class="q-pa-md bg-blue-1 row justify-end">
        <q-btn @click="step = 2" color="secondary" label="Retour" outline />
        <q-btn v-if="canContinue" @click="runTrain()" color="primary" label="Executer" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>
<script setup lang="ts">
import { type ComponentPublicInstance, computed, nextTick, ref, watch } from 'vue';
import { useTrainerStore } from 'src/stores/train-store';
import { storeToRefs } from 'pinia';
import { QBtn, useQuasar } from 'quasar';
import FileLoader from './FileLoader.vue';
import AlgoSelector from './AlgoSelector.vue';
import TrainSummary from './TrainSummary.vue';
import ConfirmDialog from '../tools/ConfirmDialog.vue';

const $q = useQuasar();
const trainerStore = useTrainerStore();
const { fileToUpload, existingFile, uploadedFileName, pointCloudFile, step } = storeToRefs(trainerStore);

const continueBtn = ref<QBtn | null>(null);
const algoSelect = ref<ComponentPublicInstance<{ validateForm: () => Promise<boolean>; submitTrain: () => boolean; resetTrainForm: () => void }> | null>(null);
const formValid = ref(false);

const canUpload = computed(() => (fileToUpload.value ? true : false));
const fileIsLoaded = computed(() => (existingFile.value ? existingFile.value.name : uploadedFileName.value));
const canContinue = computed(() => {
  switch (step.value) {
    case 1:
      return !!fileIsLoaded.value && !!pointCloudFile.value;
    case 2:
      return formValid.value;
    case 3:
      return true;
    default:
      return false;
  }
});

async function validateForm() {
  if (!algoSelect.value) return;
  formValid.value = await algoSelect.value.validateForm();
  if (formValid.value) {
    submitConfig();
  }
}

function submitConfig() {
  if (algoSelect.value) {
    algoSelect.value.submitTrain();
  }
}

function resetConfig() {
  if (algoSelect.value) {
    algoSelect.value.resetTrainForm();
  }
}

function runTrain() {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: "Confirmer l'action",
      message: 'Êtes-vous sûr de vouloir lancer un entraînement avec ces paramètres ?',
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
  }).onOk(() => {
    void trainerStore.runTrainAsync();
  });
}

watch(step, (newStep) => {
  if (newStep === 2) {
    formValid.value = false;
  }
});

async function focusToContinue() {
  await nextTick(() => {
    continueBtn.value?.$el.focus();
  });
}

async function sendUploadEvent() {
  await trainerStore.uploadPointCloudFile();
}
</script>
<style scoped lang="scss">
::v-deep(.stepper-header) {
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 0px;
  border-bottom: 1px solid $grey-8;
  background-color: $blue-1;
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
</style>
