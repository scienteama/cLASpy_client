<template>
  <q-card flat bordered v-if="showMetrics" class="q-pa-md q-mb-md row items-start bg-grey-2">
    <div class="col-auto q-mb-sm text-center">
      <div class="text-weight-bold q-mb-sm">Moyenne (30min)</div>
      <MetricsStats :isRealTime="false" :auto-refresh-time="2000" />
    </div>
    <q-separator vertical color="grey-4" class="q-mx-sm" />
    <div class="col-auto q-mb-sm text-center">
      <div class="text-weight-bold q-mb-sm">Temps réel</div>
      <MetricsStats :isRealTime="true" />
    </div>
  </q-card>

  <q-card class="terminal-card" flat>
    <div v-if="showConsole" ref="terminalContainer" class="terminal-container">
      <q-btn class="copy-btn" icon="content_copy" round dense flat color="primary" @click="_copyToClipboard(logs.join(''))">
        <q-tooltip>Copier</q-tooltip>
      </q-btn>

      <div v-for="(line, i) in logs" :key="i" class="terminal-line">
        {{ line }}
      </div>
    </div>

    <q-separator v-if="showConsole" />

    <q-card-actions align="right" class="bg-white">
      <q-btn flat label="Performances" :icon="mdiChartAreaspline" outline color="primary" @click="showMetrics = !showMetrics" />
      <q-btn flat label="Console" :icon="mdiConsole" outline color="primary" @click="showConsole = !showConsole" />
      <q-btn flat label="Effacer" outline color="secondary" @click="consoleStore.clear()" />
      <q-btn flat label="Fermer" outline color="negative" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { _copyToClipboard } from 'src/helpers/global-utils';
import { useConsoleStore } from 'src/stores/console.store';
import { ref, watch, nextTick } from 'vue';
import MetricsStats from 'src/components/widgets/MetricsStats.vue';
import { mdiChartAreaspline, mdiConsole } from '@quasar/extras/mdi-v7';

const consoleStore = useConsoleStore();
const { logs, isOpen } = storeToRefs(consoleStore);

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
  logs,
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
