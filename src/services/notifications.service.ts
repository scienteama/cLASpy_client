import { api } from '@/boot/axios';
import { type WorkDone } from '@/models/types/api.type';
import { type Notification } from '@/models/types/notifications.type';

/**
 * Gestion des notifications
 *
 */
class NotificationService {
  async getNotificationsForUser(userId: number): Promise<WorkDone<Notification[]>> {
    const notifications = await api.get<WorkDone<Notification[]>>(`/events/notifications/user/${userId}`);
    return notifications.data;
  }

  async getAllNotifications(): Promise<WorkDone<Notification[]>> {
    const notifications = await api.get<WorkDone<Notification[]>>('/events/notifications/all');
    return notifications.data;
  }

  async getUnredCountForUser(userId: number): Promise<WorkDone<number>> {
    const count = await api.get<WorkDone<number>>(`/events/notifications/unread-count/${userId}`);
    return count.data;
  }

  async markAsRead(notificationId: number): Promise<WorkDone<string>> {
    const result = await api.patch<WorkDone<string>>(`/events/notifications/mark-as-read/${notificationId}`);
    return result.data;
  }

  async markAllAsReadForUser(userId: number): Promise<WorkDone<string>> {
    const result = await api.patch<WorkDone<string>>(`/events/notifications/mark-all-as-read/${userId}`);
    return result.data;
  }

  async deleteNotification(notificationId: number): Promise<WorkDone<string>> {
    const result = await api.delete<WorkDone<string>>(`/events/notifications/delete/${notificationId}`);
    return result.data;
  }

  async deleteAllNotificationsForUser(userId: number): Promise<WorkDone<string>> {
    const result = await api.delete<WorkDone<string>>(`/events/notifications/delete-all/${userId}`);
    return result.data;
  }
}

export const notificationService = new NotificationService();
