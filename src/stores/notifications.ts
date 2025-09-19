import { defineStore } from 'pinia';
import { getNotifications } from '@/services/api/notifications'; // Импортируем существующую функцию
import { notificationSocketService } from '@/services/notificationSocket';
import type { Notification } from '@/services/api/types';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    unreadCount: 0,
    // Возможно, здесь будет храниться список уведомлений для других целей
    // notifications: [] as Notification[], // Если нужно хранить список
    _unsubscribeSocket: null as (() => void) | null,
  }),
  getters: {
    // Геттер для проверки наличия непрочитанных уведомлений
    hasUnreadNotifications: (state) => state.unreadCount > 0,
  },
  actions: {
    // Действие для получения количества непрочитанных уведомлений
    async fetchUnreadCount() {
      try {
        // Используем существующую функцию getNotifications
        // Обратите внимание: это может загрузить только первую страницу.
        // Если непрочитанные уведомления могут быть на других страницах,
        // потребуется либо загружать все страницы (неэффективно), либо новый эндпоинт на бэкенде.
        const response = await getNotifications('all', 1); // Загружаем первую страницу всех уведомлений
        
        // Считаем количество непрочитанных в полученном списке
        const unread = response.data.filter(notification => !notification.read).length;
        
        this.unreadCount = unread;
        console.log('Количество непрочитанных уведомлений загружено:', this.unreadCount);
      } catch (error) {
        console.error('Ошибка при загрузке количества непрочитанных уведомлений:', error);
        this.unreadCount = 0;
      }
    },

    // Действие для инициализации подписки на новые уведомления через сокет
    initSocketSubscription() {
      if (this._unsubscribeSocket) {
        this._unsubscribeSocket();
      }

      this._unsubscribeSocket = notificationSocketService.subscribe((notification) => {
        console.log('Новое уведомление получено через сокет:', notification);
        // Увеличиваем счетчик непрочитанных, если новое уведомление непрочитано
        if (!notification.read) {
           this.unreadCount++;
        }
        // Если нужно хранить список в сторе и добавлять новое уведомление:
        // if (this.notifications) {
        //   this.notifications.unshift(notification);
        //   // Возможно, потребуется пересчитать unreadCount, если список ведется здесь
        // }

        // Optionally: show a toast notification here if the store should handle that
      });
      console.log('Подписка на WebSocket уведомления инициализирована.');
    },

    cleanupSocketSubscription() {
      if (this._unsubscribeSocket) {
        this._unsubscribeSocket();
        this._unsubscribeSocket = null;
        console.log('Подписка на WebSocket уведомления очищена.');
      }
    },
    
    // Возможно, потребуется действие для уменьшения счетчика при отметке уведомления как прочитанного
    markNotificationAsReadLocally(notificationId: number) {
        // Если у вас ведется список в сторе, найдите уведомление и обновите его read статус
        // const notification = this.notifications.find(n => n.id === notificationId);
        // if (notification && !notification.read) {
        //     notification.read = true;
        //     this.unreadCount--;
        // }
        
        // Если список не ведется в сторе, просто уменьшаем счетчик на 1
        // Если счетчик > 0, чтобы не уйти в отрицательное значение
        if (this.unreadCount > 0) {
            this.unreadCount--;
        }
         console.log(`Уведомление #${notificationId} отмечено как прочитанное. Новый счетчик: ${this.unreadCount}`);
    }
  },
}); 