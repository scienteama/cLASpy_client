import { socketClient } from './services/socket.service';
import { useConsoleStore } from './stores/console.store';
import { useFilesStore } from './stores/files-store';
import { useMetricsStore } from './stores/metrics-store';

let initialized = false;
const metricStore = useMetricsStore();
const consoleStore = useConsoleStore();

export function initSocketEvents() {
  if (initialized) return;
  initialized = true;

  socketClient.on('ml_task_done', () => {
    void (async () => {
      try {
        await useFilesStore().reloadRoot();
      } catch (err) {
        console.error('ml_task_done handler error:', err);
      }
    })();
  });

  socketClient.on('ml_task_progress', (data) => {
    consoleStore.log(data.message);
    if (!consoleStore.isOpen) {
      consoleStore.open();
    }
  });

  socketClient.on('metrics', (data) => {
    try {
      metricStore.setMetrics(data);
    } catch (err) {
      console.error('metrics handler error:', err);
    }
  });
}
