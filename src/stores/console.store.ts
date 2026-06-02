import { defineStore } from 'pinia';
import { useNotifier } from 'src/composables/notifier';
import { ref, watch } from 'vue';

export const useConsoleStore = defineStore('console', () => {
  const $n = useNotifier();

  const isOpen = ref(false);
  const logs = ref<string[]>([]);

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
    logs.value = [];
  }

  function log(message: string) {
    logs.value.push(message);
  }

  watch(isOpen, (newValue) => {
    if (newValue && logs.value.length == 0) {
      $n.notifyInfo('Aucun message à afficher pour le moment.');
    }
  });

  return {
    isOpen,
    logs,
    open,
    close,
    toggle,
    clear,
    log,
  };
});
