// interface Notification {
//   id: string;
//   userId: string;
//   title: string;
//   message: string;
//   type?: string;
//   data?: any;
//   isRead: boolean;
//   createdAt: Date;
// }

// export class NotificationRepository {
//   deleteAll(userId: string) {
//       throw new Error('Method not implemented.');
//   }
//   delete(id: string) {
//       throw new Error('Method not implemented.');
//   }
//   private static notifications: Notification[] = [];

//   // Create a notification
//   async create(data: {
//     userId: string;
//     title: string;
//     message: string;
//     type?: string;
//     data?: any;
//   }): Promise<Notification> {
//     const notification: Notification = {
//       id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
//       ...data,
//       isRead: false,
//       createdAt: new Date(),
//     };

//     NotificationRepository.notifications.push(notification);
//     return notification;
//   }

//   // Find notifications by user
//   async findByUserId(userId: string): Promise<Notification[]> {
//     return NotificationRepository.notifications
//       .filter(n => n.userId === userId)
//       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
//   }

//   // Mark a single notification as read
//   async markAsRead(id: string): Promise<Notification | null> {
//     const notification = NotificationRepository.notifications.find(n => n.id === id);
//     if (notification) {
//       notification.isRead = true;
//     }
//     return notification || null;
//   }

//   // Mark all notifications for a user as read
//   async markAllAsRead(userId: string): Promise<void> {
//     NotificationRepository.notifications
//       .filter(n => n.userId === userId)
//       .forEach(n => n.isRead = true);
//   }

//   // Delete a notification by id
//   async deleteById(id: string): Promise<void> {
//     const index = NotificationRepository.notifications.findIndex(n => n.id === id);
//     if (index > -1) {
//       NotificationRepository.notifications.splice(index, 1);
//     }
//   }
// }



interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export class NotificationRepository {
  private static notifications: Notification[] = [];

  // Create a notification
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    data?: any;
  }): Promise<Notification> {
    const notification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...data,
      isRead: false,
      createdAt: new Date(),
    };

    NotificationRepository.notifications.push(notification);
    return notification;
  }

  // Find notifications by user
  async findByUserId(userId: string): Promise<Notification[]> {
    return NotificationRepository.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Mark a single notification as read
  async markAsRead(id: string): Promise<Notification | null> {
    const notification = NotificationRepository.notifications.find((n) => n.id === id);
    if (notification) {
      notification.isRead = true;
      return notification;
    }
    return null;
  }

  // Mark all notifications for a user as read
  async markAllAsRead(userId: string): Promise<void> {
    NotificationRepository.notifications
      .filter((n) => n.userId === userId)
      .forEach((n) => (n.isRead = true));
  }

  // Delete a notification by id
  async deleteById(id: string): Promise<void> {
    const index = NotificationRepository.notifications.findIndex((n) => n.id === id);
    if (index > -1) {
      NotificationRepository.notifications.splice(index, 1);
    }
  }

  // Delete all notifications for a user
  async deleteAll(userId: string): Promise<void> {
    NotificationRepository.notifications = NotificationRepository.notifications.filter(
      (n) => n.userId !== userId
    );
  }
}
