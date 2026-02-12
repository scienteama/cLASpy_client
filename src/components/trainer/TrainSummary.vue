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
              <q-item-label caption>Fichier</q-item-label>
              <q-item-label> <strong>ID :</strong> {{ trainConfig.fileId }} </q-item-label>
              <q-item-label>
                <strong>Dossier :</strong>
                <q-badge color="primary" outline>{{ trainConfig.folderId }}</q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item>
            <q-item-section>
              <q-item-label caption>Paramètres généraux</q-item-label>

              <div class="row q-col-gutter-sm q-mt-xs">
                <q-chip outline>Points : {{ trainConfig.samples * 1_000_000 }}</q-chip>
                <q-chip outline>Ratio : {{ trainConfig.trainingRatio }}</q-chip>
                <q-chip outline>Scaler : {{ trainConfig.scaler }}</q-chip>
                <q-chip outline>Scorer : {{ trainConfig.scorer }}</q-chip>
                <q-chip outline>Graine : {{ trainConfig.randomState }}</q-chip>
                <q-chip outline>FillNaN : {{ trainConfig.fillnan }}</q-chip>
                <q-chip outline>Jobs CV : {{ trainConfig.nJobsCv }}</q-chip>
                <q-chip outline>ACP : {{ trainConfig.pca || 'désactivée' }}</q-chip>
              </div>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item>
            <q-item-section>
              <q-item-label caption>Algorithme</q-item-label>
              <q-item-label class="text-weight-medium">
                {{ trainConfig.algorithm }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item>
            <q-item-section>
              <q-item-label caption> Features ({{ trainConfig.featureNames.length }}) </q-item-label>

              <div class="row q-col-gutter-xs q-mt-xs">
                <q-chip v-for="feature in trainConfig.featureNames" :key="feature" dense outline color="grey-7">
                  {{ feature }}
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <q-card flat bordered class="col-auto bg-grey-1 column full-height q-ml-md">
        <q-banner rounded class="bg-teal-1">
          <div class="row items-center no-wrap full-width">
            <q-icon name="mdi-code-json" size="md" color="warning" class="q-mr-sm" />

            <div class="col text-bold text-center">Configuration JSON</div>

            <q-btn flat dense @click="downloadJSON(trainConfig as object, 'config')">
              <q-icon name="mdi-file-download-outline" size="md" color="secondary" />
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
import { useTrainerStore } from 'src/stores/train-store';
import HighLight from '../tools/HighLight.vue';
import { downloadJSON } from 'src/helpers/files-utils';

const trainerStore = useTrainerStore();
const { trainConfig } = storeToRefs(trainerStore);
</script>
