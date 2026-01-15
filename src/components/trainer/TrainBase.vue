<template>
  <q-page class="q-pa-md column q-gutter-md bg-grey-3">
    <q-stepper v-model="step" vertical animated keep-alive>
      <q-step :name="1" title="Sélection du nuage de points :" icon="file" :done="step > 1">
        <FileLoader key="file-loader" @upload-is-done="fileLoaderEmitter" />
        <q-stepper-navigation>
          <q-btn v-if="canUpload" color="primary" label="Upload" icon="cloud_upload" @click="sendUploadEvent()" />
          <q-btn v-if="canContinue" @click="step = 2" color="primary" label="Continue" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Suite" icon="create_new_folder" :done="step > 2">
        An ad group contains one or more ads which target a shared set of keywords.
        <q-stepper-navigation>
          <q-btn @click="step = 4" color="primary" label="Continue" />
          <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import FileLoader from './FileLoader.vue';
import { emitter } from 'src/event-bus';

const step = ref(1);
const canUpload = ref(false);
const canContinue = ref(false);

function sendUploadEvent() {
  emitter.emit('finished');
}

const fileLoaderEmitter = (evt: boolean) => {
  if (evt) {
    canUpload.value = false;
    canContinue.value = true;
  }
};

emitter.on('data', (payload) => {
  if (payload) {
    canUpload.value = true;
  }
});
</script>
