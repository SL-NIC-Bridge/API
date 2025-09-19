export interface SendNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: any;
}

export interface NotificationResponseDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}