// @ts-nocheck
<template>
  <ion-page>
    <ion-content>
      <div class="notifications-container">
        <!-- Заголовок с кнопкой назад -->
        <div class="header">
          <div class="back-button" @click="goBack">
            <ion-icon :icon="arrowBackOutline" class="back-icon"></ion-icon>
          </div>
          <h1>Уведомления</h1>
          <div class="action-buttons">
            <ion-button fill="clear" class="action-button">
              <ion-icon :icon="settingsOutline"></ion-icon>
            </ion-button>
            <ion-button 
              fill="clear" 
              class="action-button" 
              @click="markAllAsRead"
              :disabled="!hasUnreadNotifications"
            >
              <ion-icon :icon="checkmarkDoneOutline"></ion-icon>
            </ion-button>
          </div>
        </div>

        <!-- Фильтр уведомлений -->
        <div class="filter-tabs">
          <div 
            class="filter-tab" 
            :class="{ 'active': activeFilter === 'all' }"
            @click="setFilter('all')"
          >
            Все
          </div>
          <div 
            class="filter-tab" 
            :class="{ 'active': activeFilter === 'unread' }"
            @click="setFilter('unread')"
          >
            Непрочитанные
          </div>
        </div>

        <!-- Список уведомлений -->
        <div class="notifications-list">
          <div v-if="loading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка уведомлений...</p>
          </div>
          
          <div v-else-if="filteredNotifications.length === 0" class="empty-state">
            <ion-icon :icon="notificationsOffOutline" class="empty-icon"></ion-icon>
            <p>{{ emptyStateMessage }}</p>
          </div>
          
          <div v-else>
            <div v-for="(notification, index) in filteredNotifications" 
                :key="notification.id" 
                class="notification-item"
                :class="{ 'unread': !notification.read }"
                @click="markAsRead(notification)">
              <!-- Индикатор непрочитанного уведомления (слева) -->
              <div v-if="!notification.read" class="unread-indicator-left"></div>

              <div class="notification-icon" :class="notification.type">
                <ion-icon :icon="getIconForType(notification.type)"></ion-icon>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <h3>{{ notification.title }}</h3>
                  <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
                </div>
                <p class="notification-message">{{ notification.message }}</p>
                <div class="notification-actions" v-if="notification.action">
                  <ion-button size="small" class="action-btn">{{ notification.action }}</ion-button>
                </div>
              </div>
            </div>

            <!-- Кнопка "Загрузить еще" -->
            <div v-if="hasNextPage && !isAllLoaded" class="load-more-container">
              <ion-button 
                fill="clear" 
                class="load-more-btn"
                @click="loadNextPage"
                :disabled="loading"
              >
                <ion-spinner v-if="loading" name="crescent" class="load-more-spinner"></ion-spinner>
                <span v-else>Загрузить еще</span>
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  toastController
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  arrowBackOutline,
  settingsOutline, 
  checkmarkDoneOutline,
  notificationsOffOutline,
  fitnessOutline,
  waterOutline,
  personOutline, 
  ribbonOutline,
  pulseOutline,
  calendarOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/api/notifications';
import type { Notification } from '@/services/api/types';
import { notificationSocketService } from '@/services/notificationSocket';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const loading = ref(true);
const activeFilter = ref<'all' | 'unread'>('all');
const notifications = ref<Notification[]>([]);
const paginationMeta = ref<PaginationMeta | null>(null);
const paginationLinks = ref<PaginationLinks | null>(null);
const userStore = useUserStore();

// Вычисляемое свойство для проверки наличия непрочитанных уведомлений
const hasUnreadNotifications = computed(() => {
  return notifications.value?.some(notification => !notification.read) ?? false;
});

// Вычисляемое свойство для сообщения в пустом состоянии
const emptyStateMessage = computed(() => {
  if (activeFilter.value === 'unread') {
    return 'У вас нет непрочитанных уведомлений';
  }
  return 'У вас пока нет уведомлений';
});

// Фильтрованные уведомления
const filteredNotifications = computed(() => {
  if (!notifications.value || notifications.value.length === 0) {
    return [];
  }
  if (activeFilter.value === 'unread') {
    return notifications.value.filter(notification => !notification.read);
  }
  return notifications.value;
});

// Вернуться назад
const goBack = () => {
  router.go(-1);
};

// Установить фильтр
const setFilter = async (filter: 'all' | 'unread') => {
  activeFilter.value = filter;
  await loadNotifications();
};

// Загрузить уведомления
const loadNotifications = async () => {
  try {
    loading.value = true;
    const response = await getNotifications(activeFilter.value) as ApiResponse;
    
    if (response?.data) {
      notifications.value = response.data;
      paginationMeta.value = response.meta;
      paginationLinks.value = response.links;
    } else {
      notifications.value = [];
      paginationMeta.value = null;
      paginationLinks.value = null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке уведомлений:', error);
    notifications.value = [];
    paginationMeta.value = null;
    paginationLinks.value = null;
    const toast = await toastController.create({
      message: 'Не удалось загрузить уведомления',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  } finally {
    loading.value = false;
  }
};

// Загрузить следующую страницу
const loadNextPage = async () => {
  if (paginationLinks.value?.next) {
    try {
      loading.value = true;
      const response = await getNotifications(activeFilter.value, paginationMeta.value?.current_page + 1) as ApiResponse;
      
      if (response?.data) {
        notifications.value = [...notifications.value, ...response.data];
        paginationMeta.value = response.meta;
        paginationLinks.value = response.links;
      }
    } catch (error) {
      console.error('Ошибка при загрузке следующей страницы:', error);
      const toast = await toastController.create({
        message: 'Не удалось загрузить уведомления',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      loading.value = false;
    }
  }
};

// Проверяем, есть ли следующая страница
const hasNextPage = computed(() => {
  return paginationLinks.value?.next !== null;
});

// Проверяем, загружены ли все уведомления
const isAllLoaded = computed(() => {
  if (!paginationMeta.value) return true;
  return paginationMeta.value.current_page >= paginationMeta.value.last_page;
});

// Отметить все как прочитанные
const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead();
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      read: true
    }));
  
  const toast = await toastController.create({
    message: 'Все уведомления отмечены как прочитанные',
    duration: 2000,
    position: 'bottom'
  });
    await toast.present();
  } catch (error) {
    console.error('Ошибка при отметке уведомлений:', error);
    const toast = await toastController.create({
      message: 'Не удалось отметить уведомления',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
  await toast.present();
  }
};

// Отметить уведомление как прочитанное
const markAsRead = async (notification: Notification) => {
  try {
    await markNotificationAsRead(notification.id);
  notification.read = true;
  
  // Если есть действие, то переходим по соответствующему маршруту
    if (notification.action_url) {
      router.push(notification.action_url);
  }
  } catch (error) {
    console.error('Ошибка при отметке уведомления:', error);
    const toast = await toastController.create({
      message: 'Не удалось отметить уведомление',
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }
};

// Получить иконку для типа уведомления
const getIconForType = (type: Notification['type']) => {
  switch (type) {
    case 'workout':
      return fitnessOutline;
    case 'water':
      return waterOutline;
    case 'achievement':
      return ribbonOutline;
    case 'profile':
      return personOutline;
    case 'health':
      return pulseOutline;
    case 'reminder':
      return calendarOutline;
    default:
      return alertCircleOutline;
  }
};

// Форматировать время уведомления
const formatTime = (timestamp: string) => {
  try {
    // Разбираем строку даты вручную
    const [datePart, timePart] = timestamp.split(' ');
    if (!datePart || !timePart) {
      return 'Дата не указана';
    }

    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Проверяем валидность компонентов даты
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return 'Дата не указана';
    }

    const now = new Date();
    const date = new Date(year, month - 1, day, hours, minutes);
    const diff = now.getTime() - date.getTime();
    
    // Если меньше 60 минут
    if (diff < 60 * 60000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} мин назад`;
    }
    
    // Если меньше 24 часов
    if (diff < 24 * 60 * 60000) {
      const hours = Math.floor(diff / (60 * 60000));
      return `${hours} ч назад`;
    }
    
    // Если меньше 7 дней
    if (diff < 7 * 24 * 60 * 60000) {
      const days = Math.floor(diff / (24 * 60000));
      return `${days} дн назад`;
    }
    
    // Иначе полная дата
    return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Дата не указана';
  }
};

// Подписка на новые уведомления
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  loadNotifications();
  
  // Инициализируем WebSocket
  unsubscribe = notificationSocketService.setup();
  
  // Подписываемся на новые уведомления
  notificationSocketService.subscribe(handleNewNotification);
});

// Отключение от WebSocket при размонтировании компонента
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Обработка новых уведомлений
const handleNewNotification = (notification: Notification) => {
  // Добавляем новое уведомление в начало списка
  notifications.value.unshift(notification);
  
  // Показываем toast-сообщение
  toastController.create({
    message: notification.message,
    duration: 3000,
    position: 'bottom',
    color: 'primary'
  }).then(toast => toast.present());
};

// Подписываемся на новые уведомления
watch(() => notificationSocketService.connected, (isConnected) => {
  if (isConnected && notificationSocketService.authenticated) {
    console.log('WebSocket для уведомлений готов к работе');
  }
}, { immediate: true });
</script>

<style scoped>
/* Общие стили */
.notifications-container {
  padding: 16px;
  min-height: 100%;
}

/* Светлая тема */
:root .notifications-container {
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  color: #333;
}

/* Темная тема */
.ion-palette-dark .notifications-container {
  background: linear-gradient(180deg, #261c3a 0%, #1a191b 220px, #1a191b 100%);
  color: white;
}

/* Заголовок */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-icon {
  font-size: 24px;
  color: #8560ff;
}

:root .header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
  flex-grow: 1;
  text-align: center;
}

.ion-palette-dark .header h1 {
  color: white;
}

.action-buttons {
  display: flex;
}

.action-button {
  --padding-start: 8px;
  --padding-end: 8px;
}

/* Светлая тема для иконок */
:root .action-button ion-icon {
  font-size: 24px;
  color: #8560ff;
}

/* Темная тема для иконок */
.ion-palette-dark .action-button ion-icon {
  font-size: 24px;
  color: #a38fe4;
}

/* Фильтр уведомлений */
.filter-tabs {
  display: flex;
  background: #f0f0f0;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.ion-palette-dark .filter-tabs {
  background: #2a2a2c;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

:root .filter-tab {
  color: #666;
}

.ion-palette-dark .filter-tab {
  color: #aaa;
}

:root .filter-tab.active {
  background: #8560ff;
  color: white;
}

.ion-palette-dark .filter-tab.active {
  background: #8560ff;
  color: white;
}

/* Загрузка и пустое состояние */
.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  color: #ccc;
  margin-bottom: 16px;
}

.ion-palette-dark .empty-icon {
  color: #444;
}

.empty-state p {
  font-size: 16px;
  color: #888;
  margin: 0;
}

.ion-palette-dark .empty-state p {
  color: #aaa;
}

/* Список уведомлений */
.notification-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root .notification-item {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ion-palette-dark .notification-item {
  background: #2a2a2c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:root .notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ion-palette-dark .notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

:root .notification-item.unread {
  background: #f6f3ff;
}

.ion-palette-dark .notification-item.unread {
  background: #33323a;
}

/* Иконка уведомления */
.notification-icon {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.notification-icon.workout {
  background: linear-gradient(135deg, #a38fe4 0%, #8560ff 100%);
}

.notification-icon.water {
  background: linear-gradient(135deg, #87b1ff 0%, #5a91ff 100%);
}

.notification-icon.achievement {
  background: linear-gradient(135deg, #ffcc00 0%, #ff9900 100%);
}

.notification-icon.system {
  background: linear-gradient(135deg, #fa8e8e 0%, #ff6b6b 100%);
}

.notification-icon.profile {
  background: linear-gradient(135deg, #7ed957 0%, #4caf50 100%);
}

.notification-icon.health {
  background: linear-gradient(135deg, #ff8f8f 0%, #ff5252 100%);
}

.notification-icon.reminder {
  background: linear-gradient(135deg, #b0a4e1 0%, #8e7cda 100%);
}

.notification-icon ion-icon {
  font-size: 24px;
}

/* Контент уведомления */
.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

:root .notification-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.ion-palette-dark .notification-header h3 {
  color: white;
}

:root .notification-time {
  font-size: 12px;
  color: #888;
}

.ion-palette-dark .notification-time {
  color: #aaa;
}

:root .notification-message {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #666;
  line-height: 1.4;
}

.ion-palette-dark .notification-message {
  color: #bbb;
}

/* Кнопка действия */
.notification-actions {
  display: flex;
  justify-content: flex-start;
}

:root .action-btn {
  --background: #f0f0f0;
  --color: #8560ff;
  --border-radius: 16px;
  --padding-top: 6px;
  --padding-bottom: 6px;
  --padding-start: 12px;
  --padding-end: 12px;
  font-weight: 500;
  font-size: 12px;
  margin-left: -4px;
}

.ion-palette-dark .action-btn {
  --background: #333;
  --color: #a38fe4;
}

/* Индикатор непрочитанного уведомления (слева) */
.unread-indicator-left {
  width: 0px; /* Ширина полоски */
  background: #8560ff; /* Используем более заметный цвет */
  margin-right: 0px; /* Отступ справа */
  border-radius: 0px; /* Скругление углов */
  flex-shrink: 0;
}

/* Убираем старые стили индикатора, если они еще есть */
/* .unread-indicator { display: none; } */

/* Делаем notification-item flex-контейнером */
.notification-item {
  display: flex;
  align-items: center; /* Выравниваем элементы по центру вертикали */
  padding: 16px; /* Возможно, потребуется скорректировать padding-left */
  border-radius: 12px;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

:root .notification-item {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ion-palette-dark .notification-item {
  background: #2a2a2c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:root .notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ion-palette-dark .notification-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

:root .notification-item.unread {
  background: #f6f3ff;
}

.ion-palette-dark .notification-item.unread {
  background: #33323a;
}

/* Адаптивность */
@media (min-width: 768px) {
  .notifications-container {
    max-width: 768px;
    margin: 0 auto;
  }
}

@media (max-width: 360px) {
  .notification-icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
  
  :root .notification-header h3 {
    font-size: 15px;
  }
  
  :root .notification-message {
    font-size: 13px;
  }
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  margin-top: 8px;
}

.load-more-btn {
  --color: var(--ion-color-primary);
  font-weight: 500;
}

.load-more-spinner {
  margin-right: 8px;
}

.ion-palette-dark .load-more-btn {
  --color: var(--ion-color-primary-shade);
}
</style> 