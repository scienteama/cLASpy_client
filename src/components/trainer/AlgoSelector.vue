<template>
  <q-card flat bordered class="q-pa-lg">
    <div class="row items-start justify-between">
      <!-- Sélecteur -->
      <div class="col-5">
        <q-card flat bordered>
          <q-select v-model="currentAlgoName" :options="algorithms" filled clearable color="secondary" label="Choix de l'algorithme" class="bg-teal-1" @update:model-value="getAlgoParams()">
            <template #prepend>
              <q-icon name="fa-solid fa-gears" color="secondary" size="sm" />
            </template>
          </q-select>

          <div v-if="currentAlgoName && selectedAlgorithm">
            <q-expansion-item v-model="tableOpen" :label="(tableOpen ? 'Masquer' : 'Afficher') + ' les paramètres'" switch-toggle-side dense class="q-mt-md">
              <q-table :rows="paramRows" :columns="columns" row-key="name" flat bordered dense square separator="cell" class="sticky-params-table" :rows-per-page-options="[0]" :hide-pagination="true">
                <template v-slot:body-cell-value="props">
                  {{ props.row.value === null ? 'None' : props.row.value }}
                </template>
                <template v-slot:body-cell-choices="props">
                  <span v-if="props.row.choices && props.row.choices.length">
                    {{ props.row.choices.join(', ') }}
                  </span>
                  <span v-else>-</span>
                </template>
              </q-table>
            </q-expansion-item>
          </div>
        </q-card>
      </div>

      <q-separator vertical inset />

      <!-- Zone droite -->
      <div class="col-6">
        <!-- Algo sélectionné -->
        <template v-if="currentAlgoName && selectedAlgorithm">
          <q-card flat bordered>
            <!-- Titre -->
            <q-card-section class="row items-center bg-teal-1">
              <q-icon name="fa-solid fa-brain" color="secondary" size="sm" />

              <div class="text-h6 q-ml-md text-secondary">
                {{ currentAlgoName }}
              </div>

              <q-icon name="fa-solid fa-up-right-from-square" class="q-ml-auto cursor-pointer" size="sm" color="secondary" tag="a" :href="algoDocUrl" target="_blank" rel="noopener">
                <q-tooltip>Ouvrir la documentation</q-tooltip>
              </q-icon>
            </q-card-section>

            <q-separator />

            <!-- Description -->
            <q-expansion-item v-model="descriptionOpen" :label="(descriptionOpen ? 'Masquer' : 'Afficher') + ' la description'" switch-toggle-side dense class="q-mt-md">
              <q-card-section class="scroll bg-teal-1" style="max-height: 380px">
                <pre class="text-body2">
                {{ selectedAlgorithm.description }}
                </pre>
              </q-card-section>
            </q-expansion-item>
          </q-card>
        </template>

        <!-- État vide -->
        <template v-else>
          <q-banner rounded class="bg-teal-1" inline-actions>
            <template v-slot:avatar>
              <q-icon name="fa-solid fa-diagram-project" size="sm" color="secondary" />
            </template>

            <div class="text-subtitle1">Algorithmes de Machine Learning</div>

            <div class="text-body2 q-mt-sm">
              Les algorithmes disponibles ici proviennent de la librairie
              <a href="https://scikit-learn.org" target="_blank" rel="noopener" class="text-primary"> Scikit-Learn </a>.
            </div>
            <template v-slot:action>
              <q-btn flat color="secondary" icon="fa-solid fa-up-right-from-square" href="https://scikit-learn.org/stable/api/sklearn.ensemble.html" target="_blank" size="md" />
            </template>
          </q-banner>
        </template>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { type QTableColumn } from 'quasar';
import { trainerService } from 'src/services/training.service';
import type { SklearnAlgorithmName, SklearnAlgorithmParams } from 'src/types/sklearn/algorithms.types';
import { computed, onMounted, ref } from 'vue';

const algorithms = ref<string[]>([]);
const tableOpen = ref(true);
const descriptionOpen = ref(true);
const currentAlgoName = ref<string | null>(null);
const selectedAlgorithm = ref<SklearnAlgorithmParams[SklearnAlgorithmName] | null>(null);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Paramètres', field: 'name', align: 'left', sortable: true },
  { name: 'default', label: 'Défaut', field: 'default', align: 'left', sortable: true },
  { name: 'typeinfo', label: 'Type', field: 'typeinfo', align: 'left', sortable: true },
];

const paramRows = computed(() => {
  if (!selectedAlgorithm.value || !selectedAlgorithm.value.parameters) return [];

  return Object.entries(selectedAlgorithm.value.parameters).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ([name, param]: [string, any]) => ({
      name,
      default: param.default || '-',
      typeinfo: param.typeinfo || '-',
    })
  );
});

const algoDocUrl = computed(() => {
  if (!currentAlgoName.value) return '';
  return `https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.${currentAlgoName.value}`;
});

async function getAlgoParams() {
  if (currentAlgoName.value) {
    const algoName = currentAlgoName.value as SklearnAlgorithmName;
    const params = await trainerService.getAlgoParamsByName(algoName);

    if (params.isOk) {
      selectedAlgorithm.value = params.data;
    }
  }
}

onMounted(async () => {
  const res = await trainerService.getAllAlgorithms();
  if (res.isOk) {
    algorithms.value = res.data;
  }
});
</script>
<style lang="scss" scoped>
.sticky-params-table {
  max-height: 300px;

  /* Table top slot */
  ::v-deep(.q-table__top),
  ::v-deep(.q-table__bottom),
  ::v-deep(thead tr:first-child th) {
    background-color: $teal-1;
    color: $secondary;
  }

  /* Sticky headers */
  ::v-deep(thead tr th) {
    position: sticky;
    z-index: 1;
  }

  ::v-deep(thead tr:first-child th) {
    top: 0;
  }

  &.q-table--loading ::v-deep(thead tr:last-child th) {
    top: 48px;
  }

  ::v-deep(tbody) {
    scroll-margin-top: 48px;
  }
}
</style>
