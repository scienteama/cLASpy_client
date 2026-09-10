import { defineStore } from 'pinia';
import { useNotifier } from '@/composables/notifier';
import { ref, watch } from 'vue';

export interface ComputeProgress {
  label: string;
  percent: number;
  current: number;
  total: number;
  elapsed: string;
  eta: string;
  speed: string;
}

type LogEntry = { type: 'log'; message: string } | { type: 'progress'; label: string };

export const useConsoleStore = defineStore('console', () => {
  const $n = useNotifier();

  const isOpen = ref(false);
  const keepClosed = ref(false);
  const entries = ref<LogEntry[]>([]);
  const progressBars = ref<Record<string, ComputeProgress>>({});

  function open() {
    isOpen.value = true;
  }
  function close() {
    isOpen.value = false;
  }
  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function clear() {
    entries.value = [];
    progressBars.value = {};
  }

  function log(message: string) {
    entries.value.push({ type: 'log', message });
  }

  function updateProgressBar(data: ComputeProgress) {
    const alreadyInEntries = entries.value.some((e) => e.type === 'progress' && e.label === data.label);
    if (!alreadyInEntries) {
      entries.value.push({ type: 'progress', label: data.label });
    }
    progressBars.value[data.label] = data;
  }

  watch(isOpen, (newValue) => {
    if (newValue && entries.value.length === 0) {
      $n.notifyInfo('Aucun message à afficher pour le moment.');
    }
  });

  return {
    isOpen,
    keepClosed,
    entries,
    progressBars,
    open,
    close,
    toggle,
    clear,
    log,
    updateProgressBar,
  };
});
