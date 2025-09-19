// @ts-nocheck
<template>
  <ion-page>
    <ion-content>
      <div class="profile-container">
        <!-- Статусная строка -->
        <div class="status-bar">
          <div class="status-title">
            <h1>Профиль</h1>
          </div>
          <div class="status-icons">
            <div class="notification-icon-wrapper" @click="goToNotifications">
              <ion-icon :icon="notificationsOutline" class="status-icon"></ion-icon>
              <div v-if="notificationsStore.hasUnreadNotifications" class="unread-indicator"></div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Загрузка профиля...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
          <p>{{ error }}</p>
          <ion-button @click="loadProfile" fill="clear">Повторить</ion-button>
        </div>
        
        <div v-else-if="userStore.user" class="user-profile">
          <div class="avatar-container">
            <div class="avatar-circle">
              <div class="avatar">
                <img v-if="userStore.user.avatar_url" :src="userStore.user.avatar_url" alt="Аватар пользователя" class="avatar-image"/>
                <ion-icon v-else :icon="personCircleOutline" class="default-avatar-icon"></ion-icon>
              </div>
            </div>
            <h2>{{ userStore.user.name }}</h2>
            <p class="email">{{ userStore.user.email }}</p>
          </div>
          
          <div class="stats-section">
            <div class="stats-container">
              <div class="stat-card" @click="editFitnessGoal">
                <div class="stat-icon-wrapper goal">
                  <ion-icon :icon="fitnessOutline"></ion-icon>
                </div>
                <div class="stat-content">
                  <h3>Цель тренировок</h3>
                  <p>{{ formatFitnessGoal(userStore.user.fitness_goal) }}</p>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="arrow-icon"></ion-icon>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon-wrapper activity">
                  <ion-icon :icon="speedometerOutline"></ion-icon>
                </div>
                <div class="stat-content">
                  <h3>Уровень активности</h3>
                  <p>{{ formatActivityLevel(userStore.user.activity_level) }}</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon-wrapper date">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                </div>
                <div class="stat-content">
                  <h3>Дата регистрации</h3>
                  <p>{{ formatDate(userStore.user.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="account-section">
            <h2>Аккаунт</h2>
            
            <div class="account-options">
              <div class="account-option" @click="editProfile">
                <div class="option-icon-wrapper edit">
                  <ion-icon :icon="createOutline"></ion-icon>
                </div>
                <div class="option-text">
                  <h3>Редактировать профиль</h3>
                  <p>Изменить личные данные и пароль</p>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="arrow-icon"></ion-icon>
              </div>
              
              <div class="account-option" @click="showSettings">
                <div class="option-icon-wrapper settings">
                  <ion-icon :icon="settingsOutline"></ion-icon>
                </div>
                <div class="option-text">
                  <h3>Настройки</h3>
                  <p>Уведомления, приватность, язык</p>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="arrow-icon"></ion-icon>
              </div>
              
              <div class="account-option" @click="logout">
                <div class="option-icon-wrapper logout">
                  <ion-icon :icon="logOutOutline"></ion-icon>
                </div>
                <div class="option-text">
                  <h3>Выйти из аккаунта</h3>
                  <p>Завершить текущую сессию</p>
                </div>
                <ion-icon :icon="chevronForwardOutline" class="arrow-icon"></ion-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
  alertController,
  modalController
} from '@ionic/vue';
import { 
  personCircleOutline, 
  alertCircleOutline, 
  settingsOutline, 
  notificationsOutline,
  fitnessOutline,
  speedometerOutline,
  calendarOutline,
  createOutline,
  logOutOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { } from '../services';
import { useUserStore } from '../stores/user';
import FitnessGoalModal from '../components/FitnessGoalModal.vue';
import { useNotificationsStore } from '../stores/notifications';

const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(true);
const error = ref('');
const notificationsStore = useNotificationsStore();

const loadProfile = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // Загружаем профиль из хранилища
    await userStore.loadProfile();
    
    if (userStore.error) {
      error.value = userStore.error;
    }
  } catch (err: any) {
    console.error('Error loading profile:', err);
    error.value = err.response?.data?.message || 'Произошла ошибка при загрузке профиля';
  } finally {
    isLoading.value = false;
  }
};

const formatFitnessGoal = (goal: string | undefined) => {
  if (!goal) return 'Не указана';
  
  const goalMap: Record<string, string> = {
    'weight-loss': 'Похудение',
    'muscle-gain': 'Набор массы',
    'maintenance': 'Удержание веса'
  };
  
  return goalMap[goal] || goal;
};

const formatActivityLevel = (level: string | undefined) => {
  if (!level) return 'Не указан';
  
  const levelMap: Record<string, string> = {
    'sedentary': 'Малоподвижный',
    'light': 'Легкая активность',
    'moderate': 'Умеренная активность',
    'active': 'Активный',
    'very-active': 'Очень активный'
  };
  
  return levelMap[level] || level;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const editProfile = () => {
  // Переход на страницу редактирования профиля
  router.push('/edit-profile');
};

// Редактирование цели тренировки
const editFitnessGoal = async () => {
  const modal = await modalController.create({
    component: FitnessGoalModal,
    componentProps: {
      currentGoal: userStore.user?.fitness_goal
    },
    cssClass: 'fitness-goal-modal'
  });
  
  await modal.present();
  
  // Ожидание результата из модального окна
  const { data } = await modal.onDidDismiss();
  
  // Если успешно обновили цель, обновляем профиль
  if (data && data.success) {
    // При необходимости можно перезагрузить профиль
    // await loadProfile();
  }
};

const showSettings = () => {
  // Переход на страницу настроек
  router.push('/settings');
};

const logout = async () => {
  const alert = await alertController.create({
    header: 'Выход из аккаунта',
    message: 'Вы уверены, что хотите выйти?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Выйти',
        role: 'confirm',
        handler: async () => {
          try {
            // Используем хранилище для выхода
            await userStore.logout();
            router.push('/');
          } catch (err) {
            console.error('Logout error:', err);
            router.push('/');
          }
        }
      }
    ]
  });
  
  await alert.present();
};

// New function to navigate to notifications page
const goToNotifications = () => {
  router.push('/notifications');
};

onMounted(() => {
  loadProfile();
  // Fetch unread count when component is mounted
  notificationsStore.fetchUnreadCount();
  // Initialize socket subscription
  notificationsStore.initSocketSubscription();
});

onBeforeUnmount(() => {
  // Cleanup socket subscription when component is unmounted
  notificationsStore.cleanupSocketSubscription();
});
</script>

<style scoped>
/* Стили для светлой темы (по умолчанию) */
:root .profile-container {
  padding: 16px;
  background: linear-gradient(to bottom, #f5f7fa 0%, #ffffff 220px, #ffffff 100%);
  min-height: 100%;
  color: #333333;
  position: relative;
}

/* Стили для темной темы */
.ion-palette-dark .profile-container {
  padding: 16px;
  background: linear-gradient(to bottom, #261c3a 0%, #1a191b 220px, #1a191b 100%);
  min-height: 100%;
  color: white;
  position: relative;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* Светлая тема для заголовка */
:root .status-title h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #333333;
}

/* Темная тема для заголовка */
.ion-palette-dark .status-title h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.status-icons {
  display: flex;
  gap: 16px;
}

.notification-icon-wrapper {
  position: relative;
  cursor: pointer;
}

/* Светлая тема для иконок статуса */
:root .status-icon {
  font-size: 24px;
  color: #333333;
}

/* Темная тема для иконок статуса */
.ion-palette-dark .status-icon {
  font-size: 24px;
  color: white;
}

.unread-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: #8560ff;
  border-radius: 50%;
  z-index: 10;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.error-container ion-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  padding: 6px;
  margin-bottom: 16px;
  box-shadow: 0 8px 16px rgba(133, 96, 255, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Светлая тема для фона аватара */
:root .avatar {
  background-color: #f5f5f5;
}

/* Темная тема для фона аватара */
.ion-palette-dark .avatar {
  background-color: #1a191b;
}

.avatar ion-icon {
  font-size: 70px;
  color: #8560ff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Светлая тема для имени пользователя */
:root .avatar-container h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0 0;
  color: #333333;
}

/* Темная тема для имени пользователя */
.ion-palette-dark .avatar-container h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 8px 0 0;
  color: white;
}

/* Светлая тема для email */
:root .email {
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
  font-size: 14px;
}

/* Темная тема для email */
.ion-palette-dark .email {
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  font-size: 14px;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Светлая тема для карточек статистики */
:root .stat-card {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Темная тема для карточек статистики */
.ion-palette-dark .stat-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.stat-icon-wrapper ion-icon {
  font-size: 24px;
  color: white;
}

.stat-icon-wrapper.goal {
  background-color: #8560ff;
}

.stat-icon-wrapper.activity {
  background-color: #4CAF50;
}

.stat-icon-wrapper.date {
  background-color: #2196F3;
}

/* Светлая тема для заголовков статистики */
:root .stat-content h3 {
  font-size: 13px;
  margin: 0 0 4px;
  color: rgba(0, 0, 0, 0.7);
  font-weight: 400;
}

/* Темная тема для заголовков статистики */
.ion-palette-dark .stat-content h3 {
  font-size: 13px;
  margin: 0 0 4px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

/* Светлая тема для значений статистики */
:root .stat-content p {
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  color: #333333;
}

/* Темная тема для значений статистики */
.ion-palette-dark .stat-content p {
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  color: white;
}

.account-section {
  margin-top: 32px;
}

/* Светлая тема для заголовка секции */
:root .account-section h2 {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #333333;
}

/* Темная тема для заголовка секции */
.ion-palette-dark .account-section h2 {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 600;
  color: white;
}

.account-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Светлая тема для опций аккаунта */
:root .account-option {
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Темная тема для опций аккаунта */
.ion-palette-dark .account-option {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Светлая тема для активной опции */
:root .account-option:hover,
:root .account-option:active {
  background-color: rgba(0, 0, 0, 0.06);
}

/* Темная тема для активной опции */
.ion-palette-dark .account-option:hover,
.ion-palette-dark .account-option:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.option-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.option-icon-wrapper ion-icon {
  font-size: 22px;
  color: white;
}

.option-icon-wrapper.edit {
  background-color: #4CAF50;
}

.option-icon-wrapper.settings {
  background-color: #2196F3;
}

.option-icon-wrapper.logout {
  background-color: #F44336;
}

.option-text {
  flex-grow: 1;
}

/* Светлая тема для заголовка опции */
:root .option-text h3 {
  font-size: 16px;
  margin: 0 0 4px;
  font-weight: 500;
  color: #333333;
}

/* Темная тема для заголовка опции */
.ion-palette-dark .option-text h3 {
  font-size: 16px;
  margin: 0 0 4px;
  font-weight: 500;
  color: white;
}

/* Светлая тема для описания опции */
:root .option-text p {
  font-size: 13px;
  margin: 0;
  color: rgba(0, 0, 0, 0.6);
}

/* Темная тема для описания опции */
.ion-palette-dark .option-text p {
  font-size: 13px;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
}

/* Светлая тема для иконки-стрелки */
:root .arrow-icon {
  color: rgba(0, 0, 0, 0.4);
  font-size: 20px;
}

/* Темная тема для иконки-стрелки */
.ion-palette-dark .arrow-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 20px;
}

/* Светлая тема для карточек статистики при наведении */
:root .stat-card:hover,
:root .stat-card:active {
  background-color: rgba(0, 0, 0, 0.06);
}

/* Темная тема для карточек статистики при наведении */
.ion-palette-dark .stat-card:hover,
.ion-palette-dark .stat-card:active {
  background-color: rgba(255, 255, 255, 0.1);
}

.default-avatar-icon {
  font-size: 70px;
  color: #8560ff;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 