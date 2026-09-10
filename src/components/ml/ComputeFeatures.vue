<template>
  <FileLoader />
  <q-btn label="click" @click="computeFeats()"></q-btn>
</template>
<script setup lang="ts">
import FileLoader from '@/components/ml/FileLoader.vue';
import { useNotifier } from '@/composables/notifier';
import type { FeatureComputationParams } from '@/models/types/ml/train.types';
import { mlService } from '@/services/ml.service';
import { useMLStore } from '@/stores/ml-store';
import { storeToRefs } from 'pinia';

const $n = useNotifier();
const mlStore = useMLStore();
const { existingFile, folderId } = storeToRefs(mlStore);

function buildParams(): FeatureComputationParams {
  return {
    fileId: existingFile.value!.id,
    folderId: folderId.value,
    featureNames: ['anisotropy', 'planarity', 'linearity', 'sphericity'],
    searchRadius: [1, 2.5, 5],
    nJobsCv: -1,
    batchSize: 100000,
  };
}

async function computeFeats() {
  try {
    const res = await mlService.computeFeatures(buildParams());
    if (res.isOk) {
      $n.notifySuccess(res.result);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erreur lors de l'envoi du modèle : ${error}`, {
        cause: error,
      });
    }
  }
}
</script>
<style lang="scss" scoped></style>
