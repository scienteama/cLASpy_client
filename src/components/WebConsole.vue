<template>
  <q-card flat bordered v-if="showMetrics" class="q-pa-md q-mb-md row items-start bg-grey-2">
    <div class="col-auto q-mb-sm text-center">
      <div class="text-weight-bold q-mb-sm">Moyenne (30min)</div>
      <MetricsStats :isRealTime="false" />
    </div>
    <q-separator vertical color="grey-4" class="q-mx-sm" />
    <div class="col-auto q-mb-sm text-center">
      <div class="text-weight-bold q-mb-sm">Temps réel</div>
      <MetricsStats :isRealTime="true" />
    </div>
  </q-card>

  <q-card class="terminal-card" flat>
    <div v-if="showConsole" ref="terminalContainer" class="terminal-container">
      <q-btn
        class="copy-btn"
        icon="content_copy"
        round
        dense
        flat
        color="primary"
        @click="
          _copyToClipboard(
            entries
              .filter((e) => e.type === 'log')
              .map((e) => e.message)
              .join('\n')
          )
        "
      >
        <q-tooltip>Copier</q-tooltip>
      </q-btn>

      <div v-for="(entry, i) in entries" :key="i" class="terminal-line">
        <template v-if="entry.type === 'log'">
          {{ entry.message }}
        </template>
        <FeatureProgressBar v-else-if="entry.type === 'progress' && progressBars[entry.label]" :bar="progressBars[entry.label]!" />
      </div>
    </div>

    <q-separator v-if="showConsole" />

    <q-card-actions align="right" class="bg-white">
      <q-btn flat :icon="mdiChartAreaspline" outline color="primary" @click="showMetrics = !showMetrics">
        <q-tooltip>Performances</q-tooltip>
      </q-btn>
      <q-btn flat :icon="mdiConsole" outline color="primary" @click="showConsole = !showConsole">
        <q-tooltip>Console</q-tooltip>
      </q-btn>
      <q-checkbox class="q-pa-md" v-model="keepClosed" color="primary" label="Garder fermé ?" keepColor dense>
        <q-tooltip>Empêche ouverture automatique</q-tooltip>
      </q-checkbox>
      <q-space />
      <q-btn flat label="Effacer" outline color="secondary" @click="consoleStore.clear()" />
      <q-btn flat label="Fermer" outline color="negative" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { _copyToClipboard } from '@/helpers/global-utils';
import { useConsoleStore } from '@/stores/console.store';
import { ref, watch, nextTick } from 'vue';
import MetricsStats from '@/components/widgets/MetricsStats.vue';
import { mdiChartAreaspline, mdiConsole } from '@quasar/extras/mdi-v7';
import FeatureProgressBar from './tools/FeatureProgressBar.vue';

const consoleStore = useConsoleStore();
const { entries, isOpen, progressBars, keepClosed } = storeToRefs(consoleStore);

const terminalContainer = ref<HTMLElement | null>(null);

const props = defineProps<{
  showMetrics: boolean;
  showConsole: boolean;
}>();

const showMetrics = ref(props.showMetrics);
const showConsole = ref(props.showConsole);

function scrollToBottom() {
  const el = terminalContainer.value;
  if (!el) return;

  el.scrollTop = el.scrollHeight;
}

watch(
  entries,
  async () => {
    await nextTick();
    scrollToBottom();
  },
  { deep: true }
);

watch(isOpen, async (val) => {
  if (val) {
    await nextTick();
    scrollToBottom();
  }
});
</script>
<style lang="scss" scoped>
.terminal-card {
  width: auto;
  max-width: 90vw;
  background: #0b0b0b;
}

.terminal-container {
  height: 400px;
  overflow-y: auto;

  padding: 12px;
  font-family: 'Roboto Mono', monospace;

  background: black;
  color: rgba(255, 255, 255, 0.9);

  line-height: 1.25;
}

.terminal-line {
  white-space: pre-wrap;
  margin: 0;
  padding: 0;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 20;
}
</style>
