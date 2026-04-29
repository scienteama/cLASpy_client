import { socketClient } from './services/socket.service';
import { useFilesStore } from './stores/files-store';

let initialized = false;

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
}
