<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Уведомления</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Загрузка уведомлений...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="notifications.length === 0" class="no-notifications">
        <ion-icon :icon="notificationsOutline" class="no-notifications-icon"></ion-icon>
        <p>У вас пока нет уведомлений</p>
      </div>
      
      <ion-list v-else class="notifications-list">
        <ion-item
          v-for="notification in notifications"
          :key="notification.id"
          :class="{ 'unread': !notification.read }"
          button
          @click="handleNotificationClick(notification)"
        >
          <ion-icon 
            :icon="getNotificationIcon(notification.type)" 
            slot="start"
            :color="notification.read ? 'medium' : 'primary'"
            class="notification-icon"
          ></ion-icon>
          <ion-label>
            <div class="notification-content">
              <div class="notification-header">
                <h3>{{ notification.title }}</h3>
                <div class="notification-time">{{ formatDate(notification.created_at) }}</div>
              </div>
              <p class="notification-message">
                {{  notification }}
                {{ notification.message }}</p>
            </div>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="pagination">
        <ion-button 
          fill="clear" 
          :disabled="currentPage === 1"
          @click="loadPage(currentPage - 1)"
        >
          <ion-icon :icon="chevronBackOutline" slot="start"></ion-icon>
          Назад
        </ion-button>
        
        <span class="page-info">{{ currentPage }} из {{ totalPages }}</span>
        
        <ion-button 
          fill="clear" 
          :disabled="currentPage === totalPages"
          @click="loadPage(currentPage + 1)"
        >
          Вперед
          <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
// @ts-nocheck
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  modalController,
  toastController
} from '@ionic/vue';
import {
  closeOutline,
  notificationsOutline,
  alertCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  informationCircleOutline,
  warningOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useNotificationsStore } from '@/stores/notifications';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  action: string | null;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

const notificationsStore = useNotificationsStore();
const notifications = ref<Notification[]>([]);
const isLoading = ref(true);
const error = ref('');
const currentPage = ref(1);
const totalPages = ref(1);

const loadNotifications = async (page: number = 1) => {
  try {
    isLoading.value = true;
    error.value = '';
    
    const response = await notificationsStore.getNotifications(page);
    
    if (response.success && response.data?.notifications) {
      notifications.value = response.data.notifications.data;
      currentPage.value = response.data.notifications.current_page;
      totalPages.value = response.data.notifications.last_page;
    } else {
      error.value = 'Не удалось загрузить уведомления';
    }
  } catch (err) {
    console.error('Error loading notifications:', err);
    error.value = 'Ошибка при загрузке уведомлений';
  } finally {
    isLoading.value = false;
  }
};

const loadPage = (page: number) => {
  loadNotifications(page);
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'system':
      return informationCircleOutline;
    case 'warning':
      return warningOutline;
    case 'success':
      return checkmarkCircleOutline;
    default:
      return notificationsOutline;
  }
};

const formatDate = (dateString: string) => {
  try {
    // Разбираем ISO строку вручную
    const [datePart, timePart] = dateString.split('T');
    if (!datePart || !timePart) {
      return 'Дата не указана';
    }

    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Проверяем валидность компонентов даты
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return 'Дата не указана';
    }

    // Форматируем дату вручную
    return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Дата не указана';
  }
};

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read) {
    try {
      await notificationsStore.markAsRead(notification.id);
      notification.read = true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      const toast = await toastController.create({
        message: 'Ошибка при обновлении статуса уведомления',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  if (notification.action_url) {
    // TODO: Обработка действия уведомления
    console.log('Notification action:', notification.action, notification.action_url);
  }
};

const closeModal = () => {
  modalController.dismiss();
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.loading-container,
.error-container,
.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.loading-container ion-spinner {
  margin-bottom: 16px;
}

.error-container .error-icon,
.no-notifications-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.notifications-list {
  margin: 0 -16px;
}

.notification-icon {
  font-size: 24px;
  margin-right: 12px;
}

.notifications-list ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: var(--ion-color-light);
}

.notifications-list ion-item.unread {
  background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.notifications-list ion-item ion-label h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.notifications-list ion-item ion-label p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.notifications-list ion-item ion-label .notification-time {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  gap: 16px;
}

.page-info {
  font-size: 14px;
  color: var(--ion-color-medium);
}

/* Темная тема */
.ion-palette-dark .notifications-list ion-item {
  background: rgba(255, 255, 255, 0.05);
}

.ion-palette-dark .notifications-list ion-item.unread {
  background: rgba(var(--ion-color-primary-rgb), 0.15);
}

/* Светлая тема */
:root .notifications-list ion-item {
  background: rgba(0, 0, 0, 0.02);
}

:root .notifications-list ion-item.unread {
  background: rgba(var(--ion-color-primary-rgb), 0.08);
}

.notification-content {
  width: 100%;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--ion-color-dark);
}

.notification-time {
  font-size: 12px;
  color: var(--ion-color-medium);
  white-space: nowrap;
  margin-left: 8px;
}

.notification-message {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
  line-height: 1.4;
}

/* Темная тема */
.ion-palette-dark .notification-header h3 {
  color: var(--ion-color-light);
}

.ion-palette-dark .notification-message {
  color: var(--ion-color-light-shade);
}
</style> 