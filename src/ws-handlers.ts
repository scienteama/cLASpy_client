import { useNotifier } from './composables/notifier';
import { socketClient } from './services/socket.service';
import { useConsoleStore } from './stores/console.store';
import { useFilesStore } from './stores/files-store';
import { useMetricsStore } from './stores/metrics-store';
import { useNotificationStore } from './stores/notification-store';

let initialized = false;
const metricStore = useMetricsStore();
const consoleStore = useConsoleStore();
const notifStore = useNotificationStore();
const $n = useNotifier();

export function initSocketEvents() {
  if (initialized) return;
  initialized = true;

  // ML tasks handlers
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

  // Notifications handlers
  socketClient.on('notification', (data) => {
    if (!data) return;
    void notifStore.fetchUserNotifications();
  });

  socketClient.on('notifications_all_read', (data) => {
    if (!data) return;
    if (data.count > 0) $n.notifyInfo(`${data.count} notifications marquées comme lues`);
  });

  socketClient.on('notification_deleted', (data) => {
    if (!data) return;
    $n.notifyInfo(`Notification supprimée`);
  });

  socketClient.on('notifications_deleted_all', (data) => {
    if (!data) return;
    if (data.count > 0) $n.notifyInfo(`${data.count} notifications supprimées`);
  });

  // Metrics handler
  socketClient.on('metrics', (data) => {
    try {
      metricStore.setMetrics(data);
    } catch (err) {
      console.error('metrics handler error:', err);
    }
  });
}
