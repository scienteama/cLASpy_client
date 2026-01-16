<template>
  <q-page class="q-pa-md column q-gutter-md bg-grey-3">
    <q-stepper v-model="step" vertical animated keep-alive>
      <q-step :name="1" title="Sélection du nuage de points :" icon="file" :done="step > 1">
        <FileLoader key="file-loader" @file-loaded="fileLoaderEmitter" />
        <q-stepper-navigation>
          <q-btn v-if="canUpload" color="primary" label="Upload" icon="cloud_upload" @click="sendUploadEvent()" />
          <q-btn v-if="canContinue" @click="step = 2" color="primary" label="Continue" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Sélection de l'algorithme" icon="fa-solid fa-gears" :done="step > 2">
        Sélection de l'algorithme de machine learning.
        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" label="Continue" />
          <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import FileLoader from './FileLoader.vue';
import { emitter } from 'src/event-emitter';


const step = ref(1);
const canUpload = ref(false);
const canContinue = ref(false);

function sendUploadEvent() {
  emitter.emit('finished', undefined);
}

const fileLoaderEmitter = (evt: string | null) => {
  if (evt) {
    canUpload.value = false;
  }
  canContinue.value = evt ? true : false;
};

emitter.on('upload-file-event', (payload) => {
  canUpload.value = payload.file ? true : false;
});
</script>
