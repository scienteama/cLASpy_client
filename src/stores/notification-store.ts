import { defineStore, storeToRefs } from 'pinia';
import { useNotifier } from 'src/composables/notifier';
import { computed, ref } from 'vue';
import { useUserStore } from './users-store';
import { type Notification } from 'src/models/types/notifications.type';
import { notificationService } from 'src/services/notifications.service';

export const useNotificationStore = defineStore('notifications', () => {
  const $n = useNotifier();
  const userStore = useUserStore();
  const { currentUser } = storeToRefs(userStore);

  const userNotifications = ref<Notification[]>([]);
  const allNotifications = ref<Notification[]>([]);

  const userId = computed(() => currentUser.value?.id ?? 0);

  const unreadCount = computed(() => userNotifications.value.filter((n) => !n.isRead).length);

  async function fetchUserNotifications() {
    const result = await notificationService.getNotificationsForUser(userId.value);

    if (result.isOk) {
      userNotifications.value = result.data;
    } else {
      $n.notifyError('Erreur lors du chargement des notifications');
    }
  }

  async function markNotificationAsRead(notificationId: number) {
    const result = await notificationService.markAsRead(notificationId);
    if (result.isOk) {
      const notif = userNotifications.value.find((n) => n.id === notificationId);
      if (notif) {
        notif.isRead = true;
      }
    }
  }

  async function markAllNotificationsAsRead() {
    const result = await notificationService.markAllAsReadForUser(userId.value);
    if (result.isOk) {
      userNotifications.value.forEach((n) => {
        n.isRead = true;
      });
      await fetchUserNotifications();
    }
  }

  async function deleteNotification(notificationId: number) {
    const result = await notificationService.deleteNotification(notificationId);
    if (result.isOk) {
      userNotifications.value = userNotifications.value.filter((n) => n.id !== notificationId);
    }
  }

  async function deleteAllNotifications() {
    const result = await notificationService.deleteAllNotificationsForUser(userId.value);
    if (result.isOk) {
      userNotifications.value = [];
    }
  }

  async function init() {
    if (userId.value != 0) {
      await fetchUserNotifications();
    }
  }

  return {
    userNotifications,
    allNotifications,
    unreadCount,
    fetchUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    init,
  };
});
