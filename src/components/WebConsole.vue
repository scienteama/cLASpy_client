<template>
  <q-card class="terminal-card" flat>
    <div ref="terminalContainer" class="terminal-container">
      <q-btn class="copy-btn" icon="content_copy" round dense flat color="primary" @click="_copyToClipboard(logs.join(''))">
        <q-tooltip>Copier</q-tooltip>
      </q-btn>

      <div v-for="(line, i) in logs" :key="i" class="terminal-line">
        {{ line }}
      </div>
    </div>

    <q-separator />

    <q-card-actions align="right" class="bg-white">
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

const consoleStore = useConsoleStore();
const { logs, isOpen } = storeToRefs(consoleStore);

const terminalContainer = ref<HTMLElement | null>(null);

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
