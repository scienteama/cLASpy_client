<template>
  <q-page class="q-pa-md column q-gutter-md bg-grey-3">
    <q-stepper v-model="step" vertical animated keep-alive>
      <q-step :name="1" title="Sélection du nuage de points :" icon="file" :done="step > 1">
        <FileLoader key="file-loader" />
        <q-stepper-navigation>
          <q-btn v-if="canUpload" color="primary" label="Upload" icon="cloud_upload" @click="sendUploadEvent()" />
          <q-btn v-if="canContinue" @click="step = 2" color="primary" label="Continue" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Paramètres" icon="fa-solid fa-gears" :done="step > 2">
        <AlgoSelector />
        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" label="Continue" />
          <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import FileLoader from './FileLoader.vue';
import AlgoSelector from './AlgoSelector.vue';
import { useTrainerStore } from 'src/stores/train-store';
import { storeToRefs } from 'pinia';

const trainerStore = useTrainerStore();
const { fileToUpload, existingFile, uploadedFileName } = storeToRefs(trainerStore);

const step = ref(1);

const canUpload = computed(() => (fileToUpload.value ? true : false));
const fileIsLoaded = computed(() => (existingFile.value ? existingFile.value.name : uploadedFileName.value));
const canContinue = computed(() => fileIsLoaded.value);

async function sendUploadEvent() {
  await trainerStore.uploadPointCloudFile();
}
</script>
