export interface Notification {
  id: number;
  userId: number;
  senderId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
