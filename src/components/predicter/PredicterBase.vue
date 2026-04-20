<template>
  <q-btn @click="print()">TEST</q-btn>
  <q-stepper
    v-model="step"
    horizontal
    animated
    keep-alive
    done-color="positive"
    active-color="primary"
    header-class="predict-stepper-header"
    :style="{ '--computed-bg': computedStyle.background }"
    class="column"
  >
    <q-step :name="1" title="NUAGE DE POINTS" :icon="mdiFileOutline" :done="step > 1" class="column full-height">
      <FileLoader key="file-loader-prediction" />
      <q-stepper-navigation v-if="canUpload || canContinue" class="q-pa-md bg-blue-1">
        <div class="row justify-end">
          <q-btn v-if="canUpload" color="secondary" label="Upload" :icon="matCloudUpload" @click="sendUploadEvent()" />
          <q-btn v-if="canContinue" @click="step = 2" color="primary" label="Continuer" />
        </div>
      </q-stepper-navigation>
    </q-step>

    <q-step :name="2" title="MODÈLE" :icon="fasGears" :done="step > 2" class="column full-height">
      <q-stepper-navigation class="q-pa-md bg-blue-1 row justify-end">
        <q-btn @click="step = 1" color="secondary" label="Retour" outline />
        <q-btn ref="continueBtn" @click="step = 3" color="primary" label="Continuer" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>

    <q-step :name="3" title="RÉCAPITULATIF" :icon="fasList" :done="step > 3" class="column full-height">
      <q-stepper-navigation class="q-pa-md bg-blue-1 row justify-end">
        <q-btn @click="step = 2" color="secondary" label="Retour" outline />
        <q-btn color="primary" label="Executer" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import FileLoader from '../trainer/FileLoader.vue';
import { mdiFileOutline } from '@quasar/extras/mdi-v7';
import { fasGears, fasList } from '@quasar/extras/fontawesome-v6';
import { useRoute, useRouter } from 'vue-router';
import { useConfigStore } from 'src/stores/config-store';
import { storeToRefs } from 'pinia';
import { useTrainerStore } from 'src/stores/train-store';
import { matCloudUpload } from '@quasar/extras/material-icons';

const route = useRoute();
const router = useRouter();
const configStore = useConfigStore();
const mlStore = useTrainerStore();
const { computedStyle } = storeToRefs(configStore);
const { fileToUpload, existingFile, uploadedFileName, pointCloudFile } = storeToRefs(mlStore);

const step = computed({
  get: () => {
    const s = Number(route.params.step);
    return [1, 2, 3].includes(s) ? s : 1;
  },
  set: (val: number) => {
    void router.push({ name: 'ml-predict', params: { step: val } });
  },
});

const canUpload = computed(() => (fileToUpload.value ? true : false));
const fileIsLoaded = computed(() => (existingFile.value ? existingFile.value.name : uploadedFileName.value));
const canContinue = computed(() => {
  switch (step.value) {
    case 1:
      return !!fileIsLoaded.value && !!pointCloudFile.value;
    case 2:
      return true;
    case 3:
      return true;
    default:
      return false;
  }
});

async function sendUploadEvent() {
  await mlStore.uploadPointCloudFile();
}

function print() {
  console.log(fileToUpload.value);
  console.log(existingFile.value);
  console.log(uploadedFileName.value);
  console.log(pointCloudFile.value);

  console.log('fileIsLoaded : ', fileIsLoaded.value);
  console.log('step : ', step.value);
}
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
