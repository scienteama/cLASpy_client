<template>
  <div style="min-height: 75vh">
    <q-card flat>
      <q-form ref="formTrain" @submit="submitTrain" @reset="resetTrainForm">
        <q-splitter v-model="splitterModel" vertical :limits="[30, 60]">
          <!-- Colonne de gauche -->
          <template v-slot:before>
            <div class="q-pa-md">
              <q-select
                v-model="currentAlgoName"
                :options="algorithms"
                filled
                clearable
                color="secondary"
                label="Choix de l'algorithme"
                class="bg-teal-1 fixed-uniform-field"
                hide-bottom-space
                @update:model-value="getAlgoParams()"
                :rules="[(val) => !!val]"
              >
                <template #prepend>
                  <q-icon name="fa-solid fa-gears" color="secondary" size="sm" />
                </template>

                <template v-slot:error> Vous devez sélectionner un algorithme de ML </template>
              </q-select>

              <q-expansion-item
                v-model="showTrainParams"
                :label="(showTrainParams ? 'Masquer' : 'Afficher') + ' les paramètres d\'entraînement'"
                switch-toggle-side
                dense
                class="q-mt-md fixed-uniform-field"
              >
                <q-card class="row items-start q-pa-md" flat>
                  <q-card-section class="q-pa-none q-my-md fit">
                    <div class="row items-center justify-between">
                      <q-input
                        v-model.number="numberOfSamples"
                        style="width: 100%"
                        outlined
                        dense
                        hint="Nombre d'échantillons : (million de points)"
                        mask="#.######"
                        fill-mask="0"
                        clearable
                        @clear="resetNumberOfSamples()"
                        :rules="[(val) => NumericInputRule(val, false, false, 6)]"
                      >
                        <template v-slot:before>
                          <q-icon name="mdi-plus-minus-variant" color="primary" />
                        </template>
                      </q-input>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pa-none q-mb-md fit">
                    <div class="row items-center justify-between">
                      <q-input v-model="trainingRatio" outlined dense type="number" hint="Ratio d'entraînement" style="width: 100%" :rules="ratioRules">
                        <template v-slot:before>
                          <q-icon name="mdi-target-variant" color="primary" />
                        </template>
                      </q-input>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pa-none q-mb-md fit">
                    <div class="row items-center justify-between">
                      <q-select v-model="scaler" :options="scalerOpts" outlined dense color="primary" hint="Scaler" :rules="[(val) => !!val]" style="width: 50%">
                        <template v-slot:before>
                          <q-icon name="mdi-tune-vertical" color="primary" />
                        </template>
                        <q-tooltip>Définit la méthode de mise à l'échelle des données.</q-tooltip>
                      </q-select>
                      <q-select class="q-ml-md" v-model="scorer" :options="scorerList" outlined dense color="primary" hint="Scorer" :rules="[(val) => !!val]" style="width: 45%">
                        <template v-slot:before>
                          <q-icon name="mdi-tune-vertical" color="primary" />
                        </template>
                        <q-tooltip>Définit le score pour la validation croisée (voir la documentation de scikit-learn).</q-tooltip>
                      </q-select>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pa-none q-mb-md fit">
                    <div class="row items-center justify-between">
                      <q-input v-model="pca" outlined dense type="number" hint="ACP" min="0" style="width: 100%">
                        <template v-slot:before>
                          <q-icon name="mdi-wrench-cog-outline" color="primary" />
                        </template>
                        <q-tooltip>Définit l'analyse en composantes principales (ACP) et le nombre de composantes principales.</q-tooltip>
                      </q-input>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pa-none q-mb-md fit">
                    <div class="row items-center justify-between">
                      <q-input v-model="_randomState" outlined dense type="number" hint="État aléatoire" min="0" style="width: 80%" clearable>
                        <template v-slot:before>
                          <q-icon name="mdi-dice-multiple-outline" color="primary" />
                        </template>
                        <q-tooltip>Génération aléatoire utilisée pour séparer les données en ensembles d'entraînement et de test lors de la validation croisée.</q-tooltip>
                      </q-input>
                      <q-btn class="q-ml-md self-start" outline color="primary" icon="add" @click="setRandomState()" style="width: 10%"> </q-btn>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pa-none q-mb-md fit">
                    <div class="row items-center justify-between">
                      <q-input v-model="nJobsCv" outlined dense type="number" hint="N_Jobs CV" min="-1" style="width: 100%">
                        <template v-slot:before>
                          <q-icon name="fa-solid fa-microchip" color="primary" />
                        </template>
                        <q-tooltip
                          >Définit le nombre de threads pour la validation croisée. Dans le cas de RandomForest, le nombre total de CPU utilisés = N_jobs CV x n_jobs. <br />
                          -1 = Tous les threads disponibles.
                        </q-tooltip>
                      </q-input>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <q-expansion-item v-model="showFeatures" :label="getFeatsItemExpansionLabel()" switch-toggle-side dense class="q-mt-md fixed-uniform-field">
                <q-card flat>
                  <FeaturesList style="width: auto" :show-title="false" @close="showFeatures = false" />
                </q-card>
              </q-expansion-item>
            </div>
          </template>

          <!-- Colonne de droite -->
          <template v-slot:after>
            <div class="q-pa-md">
              <template v-if="currentAlgoName && selectedAlgorithm">
                <q-banner rounded class="bg-teal-1 fixed-uniform-field" inline-actions>
                  <template v-slot:avatar>
                    <q-icon name="fa-solid fa-brain" color="secondary" size="sm" />
                  </template>

                  <div class="text-h6 q-ml-md text-secondary">
                    {{ currentAlgoName }}
                  </div>

                  <template v-slot:action>
                    <q-icon name="fa-solid fa-up-right-from-square" class="q-ml-auto cursor-pointer" size="sm" color="secondary" tag="a" :href="algoDocUrl" target="_blank" rel="noopener">
                      <q-tooltip>Ouvrir la documentation</q-tooltip>
                    </q-icon>
                  </template>
                </q-banner>
              </template>

              <!-- État vide -->
              <template v-else>
                <q-banner rounded class="bg-teal-1 fixed-uniform-field" inline-actions>
                  <template v-slot:avatar>
                    <q-icon name="fa-solid fa-diagram-project" size="sm" color="secondary" />
                  </template>
                  <div class="text-bold">Algorithmes de Machine Learning</div>
                  <div>Les algorithmes disponibles ici proviennent de la librairie <a href="https://scikit-learn.org" target="_blank" rel="noopener" class="text-primary"> Scikit-Learn </a>.</div>
                  <template v-slot:action>
                    <q-btn flat color="secondary" icon="fa-solid fa-up-right-from-square" href="https://scikit-learn.org/stable/api/sklearn.ensemble.html" target="_blank" size="md">
                      <q-tooltip>Ouvrir la documentation</q-tooltip>
                    </q-btn>
                  </template>
                </q-banner>
              </template>

              <div v-if="currentAlgoName && selectedAlgorithm">
                <q-expansion-item v-model="descriptionOpen" :label="(descriptionOpen ? 'Masquer' : 'Afficher') + ' la description'" switch-toggle-side dense class="q-mt-md fixed-uniform-field">
                  <q-card-section class="scroll bg-teal-1" style="max-height: 380px">
                    <pre class="text-body2">
                {{ selectedAlgorithm.description }}
              </pre
                    >
                  </q-card-section>
                </q-expansion-item>

                <q-card flat>
                  <q-card-section class="q-pa-none q-my-md">
                    <q-expansion-item
                      v-model="showAlgoParams"
                      :label="(showAlgoParams ? 'Masquer' : 'Afficher') + ' les paramètres d\'algorithme'"
                      switch-toggle-side
                      dense
                      class="q-mt-md fixed-uniform-field"
                    >
                      <q-table
                        :rows="paramRows"
                        :columns="columns"
                        row-key="name"
                        flat
                        bordered
                        dense
                        square
                        separator="cell"
                        class="sticky-params-table"
                        :rows-per-page-options="[0]"
                        :hide-pagination="true"
                        :grid="$q.screen.lt.md"
                        style="table-layout: fixed; width: 100%"
                      >
                        <template v-slot:body-cell-value="props">
                          <q-td style="border-bottom: 1px solid rgba(0, 0, 0, 0.12)" :class="{ 'bg-red-2': isInvalid(props.row, getInputProps(props.row, props.row.name).rules) }">
                            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%">
                              <component
                                :is="getInputType(props.row.typeinfo, props.row.default, props.row.name)"
                                v-model="props.row.value"
                                v-bind="getInputProps(props.row, props.row.name)"
                                style="width: 100%"
                              >
                                <!-- injection du slot select si présent -->
                                <template v-if="getInputProps(props.row, props.row.name).selectedItemSlot" v-slot:selected-item="scope">
                                  <component :is="getInputProps(props.row, props.row.name).selectedItemSlot" v-bind="scope" />
                                </template>
                              </component>
                            </div>
                          </q-td>
                        </template>
                      </q-table>
                    </q-expansion-item>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </template>
        </q-splitter>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type { TrainParameters } from 'src/types/trainer/train.types';
import type { AlgoParameter, AlgoParameters, SklearnAlgorithmName, SklearnAlgorithmParams } from 'src/types/trainer/algorithms.types';
import { storeToRefs } from 'pinia';
import { QCard, QCheckbox, type QForm, QInput, QSelect, type QTableColumn, QTooltip, useQuasar } from 'quasar';
import { NumericInputRule, ratioRules } from 'src/rules';
import { trainerService } from 'src/services/training.service';
import { useTrainerStore } from 'src/stores/train-store';
import { getInputProps, isInvalid, newSeed, parseTypeInfo, scorerList } from 'src/utils';
import { computed, type ComputedRef, onMounted, ref, watch } from 'vue';
import { useNotifier } from 'src/composables/notifier';
import FeaturesList from './FeaturesList.vue';
import ConfirmDialog from '../tools/ConfirmDialog.vue';

const splitterModel = ref(50);

/* Stores and composables */
const $q = useQuasar();
const $n = useNotifier();
const trainerStore = useTrainerStore();
const { existingFile, folderId, trainConfig } = storeToRefs(trainerStore);

/* Emitters */
const emit = defineEmits<{
  (e: 'go-to-continue'): void;
  (e: 'validate-config'): void;
}>();

/* Refs, computed refs and const */
const pointsNumber = computed(() => trainerStore.getNumberOfSamples());
const formTrain = ref<QForm | null>(null);
const numberOfSamples = ref(pointsNumber.value);
const trainingRatio = ref(0.5);
const pca = ref(0);
const randomState = ref(0);
const nJobsCv = ref(-1);
const scalerOpts = ['Standard', 'Robust', 'MinMax'];
const scaler = ref(scalerOpts[0]);
const scorer = ref(scorerList[0]);
const algorithms = ref<string[]>([]);
const showAlgoParams = ref(false);
const showTrainParams = ref(false);
const currentAlgoName = ref<string | null>(null);
const selectedAlgorithm = ref<SklearnAlgorithmParams[SklearnAlgorithmName] | null>(null);
const features = computed<string[]>(() => Array.from(trainerStore.selectedFeatures));

/* Tables */
const columns: QTableColumn[] = [
  { name: 'name', label: 'Paramètres', field: 'name', align: 'left', sortable: true },
  { name: 'value', label: 'Valeur', field: 'value', align: 'left', sortable: true },
  { name: 'default', label: 'Défaut', field: 'default', align: 'left', sortable: true },
  { name: 'typeinfo', label: 'Type', field: 'typeinfo', align: 'left', sortable: true },
];

/* Two-way computed refs */
const _randomState: ComputedRef<number> = computed({
  get() {
    return randomState.value;
  },
  set(val: number | null) {
    if (val === null) {
      randomState.value = 0;
    } else {
      randomState.value = val;
    }
  },
});

const showFeatures = computed({
  get: () => !showTrainParams.value,
  set: (val) => {
    showTrainParams.value = !val;
  },
});

const descriptionOpen = computed({
  get: () => !showAlgoParams.value,
  set: (val) => {
    showAlgoParams.value = !val;
  },
});

const paramRows = computed(() => {
  if (!selectedAlgorithm.value) return [];

  // Init, Display and Edit params
  return Object.entries(selectedAlgorithm.value.parameters).map(([name, param]) => ({
    name,
    default: param.default,
    typeinfo: param.typeinfo,
    get value() {
      return param.value;
    },
    set value(val) {
      param.value = val;
    },
  }));
});

// Train config payload
const algoParams = computed(() => {
  if (!selectedAlgorithm.value) return {};

  const payload: AlgoParameters = {};

  Object.entries(selectedAlgorithm.value.parameters).forEach(([name, param]: [string, AlgoParameter]) => {
    payload[name] = param.value;
  });
  return payload;
});

/* Functions */
function buildTrainConfig(): TrainParameters {
  const now = new Date().toISOString();
  const config: TrainParameters = {
    fileId: existingFile.value!.id,
    folderId: folderId.value,
    createdAt: now,
    samples: numberOfSamples.value,
    trainingRatio: trainingRatio.value,
    scaler: scaler.value!,
    scorer: scorer.value!,
    randomState: randomState.value,
    fillnan: 'median',
    nJobsCv: nJobsCv.value,
    pca: pca.value,
    featureNames: features.value,
    pngFeatures: false,
    algorithm: currentAlgoName.value!,
    parameters: algoParams.value,
  };
  return config;
}

function isFormValid(): boolean {
  return !!existingFile.value && !!currentAlgoName.value;
}

function getInputType(typeinfo: string, defaultValue: string, name: string) {
  const t = parseTypeInfo(typeinfo, defaultValue, name);

  if (t.isBool) return QCheckbox;
  if (t.hasEnum) return QSelect;
  if (t.isArray) return QInput;
  return QInput;
}

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

function resetNumberOfSamples() {
  numberOfSamples.value = pointsNumber.value;
}

function setRandomState() {
  randomState.value = newSeed();
}

function getFeatsItemExpansionLabel() {
  let label = showFeatures.value ? 'Masquer' : 'Afficher' + ' la sélection des attributs';
  if (features.value.length > 0) {
    label = `${features.value.length} attributs sont déjà sélectionnés`;
  }
  return label;
}

async function submitTrain() {
  if (features.value.length === 0) {
    $n.notifyError('Veuillez sélectionner un ou plusieurs attributs.');
    return;
  }

  if (!isFormValid()) {
    $n.notifyError('Veuillez sélectionner un algorithme et/ou un fichier.');
    return;
  }

  if (formTrain.value) {
    const valid = await formTrain.value.validate();

    if (!valid) {
      $n.notifyInfo('Paramètres invalides.');
      return;
    }
  }

  trainConfig.value = buildTrainConfig();
  if (trainConfig.value) {
    $n.notifyInfo('Configuration chargée, cliquez sur continuer.');
    emit('go-to-continue');
    //downloadJSON(trainConfig.value, 'train_config');
  } else {
    $n.notifyError('Impossible de construire la configuration.');
  }
}

function resetTrainForm() {
  $q.dialog({
    component: ConfirmDialog,
    componentProps: {
      title: "Confirmer l'action",
      message: "Êtes-vous sûr de vouloir réinitialiser les paramètres d'entraînement ?",
      confirmLabel: 'Confirmer',
      cancelLabel: 'Annuler',
    },
  }).onOk(() => {
    // Reset train config
    resetNumberOfSamples();
    trainerStore.selectedFeatures.clear();
    trainingRatio.value = 0.5;
    scaler.value = scalerOpts[0];
    scorer.value = scorerList[0];
    randomState.value = 0;
    nJobsCv.value = -1;
    pca.value = 0;
    currentAlgoName.value = null;
    selectedAlgorithm.value = null;
    trainConfig.value = undefined;
  });
}

watch(pointsNumber, (newVal) => {
  numberOfSamples.value = newVal;
});

watch(selectedAlgorithm, (newVal) => {
  if (newVal) descriptionOpen.value = true;
  showTrainParams.value = true;
});

onMounted(async () => {
  const res = await trainerService.getAllAlgorithms();
  if (res.isOk) {
    algorithms.value = res.data;
  }
});

defineExpose({ submitTrain, resetTrainForm });
</script>
<style lang="scss" scoped>
.dynamic-input {
  ::v-deep(.q-field--error),
  ::v-deep(.q-field__bottom) {
    background-color: aqua;
  }
}

.scroll-no-bar {
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scroll-no-bar::-webkit-scrollbar {
  display: none;
}

.sticky-params-table {
  max-height: 500px;

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

.fixed-uniform-field {
  border: 1.25px solid #c0c0c0;
  border-radius: 4px;

  // q-banner
  &.q-banner {
    ::v-deep(.q-banner__avatar) {
      align-self: center !important;
    }
    ::v-deep(.q-banner__content) {
      min-height: 56px !important;
      padding: 8px 16px !important;
    }
  }

  // q-select
  &.q-field {
    ::v-deep(.q-field__control) {
      min-height: 56px !important;
      padding: 8px 16px !important;
    }
    ::v-deep(.q-field__control:before) {
      border: 1.25px solid $secondary;
      transition: border-color 0.36s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
}
</style>
