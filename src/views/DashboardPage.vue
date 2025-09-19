// @ts-nocheck
<template>
  <ion-page>
    <ion-content>
      <div class="dashboard-container">
        <!-- Статусная строка -->
        <div class="status-bar">
          <div class="user-avatar">
            <ion-avatar @click="navigateToProfile">
              <img v-if="userStore.user?.avatar_url" :src="userStore.user.avatar_url" alt="User" />
              <ion-icon v-else :icon="personCircleOutline" class="default-avatar-icon"></ion-icon>
            </ion-avatar>
          </div>
          <div class="status-icons">
            <div class="theme-toggle" @click="toggleDarkMode">
              <ion-icon :icon="isDarkMode ? sunnyOutline : moonOutline" class="theme-icon"></ion-icon>
            </div>
            <div class="notification-icon-container" @click="navigateToNotifications">
              <img src="@/assets/icons/bell.svg" alt="Notifications" class="status-icon" />
              <div v-if="notificationsStore.unreadCount > 0" class="notification-dot"></div>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Загрузка данных...</p>
        </div>
        
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
          <ion-button @click="loadData" fill="clear">Повторить</ion-button>
        </div>

        <div v-else class="progress-section">
          <div class="main-progress">
            <div class="progress-semicircle-container">
              <svg viewBox="0 0 100 50" class="progress-semicircle">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#A38FE4" />
                    <stop offset="100%" stop-color="#79F879" />
                  </linearGradient>
                </defs>
                <path d="M5,50 A45,45 0 0,1 95,50" class="semicircle-bg" />
                <path d="M5,50 A45,45 0 0,1 95,50" class="semicircle-progress" stroke="url(#gradient)" :stroke-dasharray="141.3" :stroke-dashoffset="calculateProgressOffset(visualProgress)" />
                <circle 
                  v-if="visualProgress > 0"
                  :cx="calculateDotPosition(visualProgress).x" 
                  :cy="calculateDotPosition(visualProgress).y" 
                  r="4" 
                  class="progress-dot" 
                />
              </svg>
              <div class="progress-percentage">{{ Math.round(visualProgress) }}%</div>
            </div>
          </div>
          <h1 class="progress-title">Дневной прогресс</h1>

          <!-- Apple Watch Integration Card -->
          <div class="apple-watch-card">
            <div class="apple-watch-content">
              <div class="apple-watch-info">
                <h3>Apple Watch</h3>
                <p>Доступна интеграция с смарт часами чтобы все показатели были в одном месте</p>
                <button class="connect-button" @click="connectAppleWatch">Подключить</button>
              </div>
              <div class="apple-watch-image">
                <img src="@/assets/images/apple.png" alt="Apple Watch">
              </div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-circle yellow">
                <div class="inner-circle">
                  <img src="@/assets/icons/fire.svg" alt="Calories" class="icon-svg yellow-icon" />
                </div>
                <svg viewBox="0 0 100 100" class="circle-stat">
                  <circle cx="50" cy="50" r="45" class="circle-bg" />
                  <circle cx="50" cy="50" r="45" class="circle-progress yellow-progress" stroke-dasharray="282.6" :stroke-dashoffset="calculateCaloriesOffset(progressData?.calories || 0)" />
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ progressData?.calories || 0 }}</span>
                <span class="stat-label">Ккал</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-circle pink">
                <div class="inner-circle">
                  <img src="@/assets/icons/running.svg" alt="Steps" class="icon-svg pink-icon" />
                </div>
                <svg viewBox="0 0 100 100" class="circle-stat">
                  <circle cx="50" cy="50" r="45" class="circle-bg" />
                  <circle cx="50" cy="50" r="45" class="circle-progress pink-progress" stroke-dasharray="282.6" :stroke-dashoffset="calculateStepsOffset(progressData?.steps || 0)" />
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ formatSteps(progressData?.steps || 0) }}</span>
                <span class="stat-label">Шаги</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-circle green">
                <div class="inner-circle">
                  <img src="@/assets/icons/clock.svg" alt="Time" class="icon-svg green-icon" />
                </div>
                <svg viewBox="0 0 100 100" class="circle-stat">
                  <circle cx="50" cy="50" r="45" class="circle-bg" />
                  <circle cx="50" cy="50" r="45" class="circle-progress green-progress" stroke-dasharray="282.6" :stroke-dashoffset="calculateWorkoutOffset(progressData?.workout_time || 0)" />
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ progressData?.workout_time || 0 }} мин</span>
                <span class="stat-label">Тренировки</span>
              </div>
            </div>
            <div class="stat-item" @click="openWaterModal">
              <div class="stat-circle blue">
                <div class="inner-circle">
                  <img src="@/assets/icons/droplet.svg" alt="Water" class="icon-svg blue-icon" />
                </div>
                <svg viewBox="0 0 100 100" class="circle-stat">
                  <circle cx="50" cy="50" r="45" class="circle-bg" />
                  <circle cx="50" cy="50" r="45" class="circle-progress blue-progress" stroke-dasharray="282.6" :stroke-dashoffset="calculateWaterOffset(localWaterIntake)" />
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ localWaterIntake.toFixed(2) }} л</span>
                <span class="stat-label">Вода</span>
              </div>
            </div>
          </div>

          <!-- Week Days (Restored and Adapted with Background Progress) -->
          <div class="week-days">
            <template v-if="weekPlanDaysDashboard && weekPlanDaysDashboard.length > 0">
              <template v-for="(day, index) in weekPlanDaysDashboard" :key="day.date">
                <div 
                  class="day day-background-progress" 
                  :class="{ 
                    active: day.date === weekPlanStore.selectedDate,
                    current: isToday(day.date),
                    'high-progress': getOverallProgressByDate(day.date) > 50,
                    'has-data': (day.meals && day.meals.length > 0) || (day.workouts && day.workouts.length > 0)
                  }"
                  @click="selectDayInPlan(index)"
                  :style="{ '--progress-percent': getOverallProgressByDate(day.date) + '%' }"
                >
                  <div class="day-content">
                    <span>{{ weekLabels[index] }}</span>
                    <span class="day-date-label">{{ new Date(day.date).getDate() }}</span>
                  </div>
                </div>
                <div v-if="index < weekPlanDaysDashboard.length - 1" 
                     class="day-connection"
                     :class="{ active: getOverallProgressByDate(day.date) > 0 && getOverallProgressByDate(weekPlanDaysDashboard[index+1]?.date) > 0 }">
                </div>
              </template>
            </template>
            <div v-else class="loading-days">
              <ion-spinner name="crescent"></ion-spinner>
            </div>
          </div>

          <!-- Schedule Section Updated -->
          <div class="schedule-section">
            <div class="plan-header-row">
              <h2 class="section-title-main">
                План на
                {{ isToday(weekPlanStore.selectedDate)
                  ? 'сегодня'
                  : new Date(weekPlanStore.selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                }}
              </h2>
              <div class="plan-switcher-custom">
                <button :class="{active: planViewMode === 'workouts'}" @click="planViewMode = 'workouts'">Тренировки</button>
                <button :class="{active: planViewMode === 'meals'}" @click="planViewMode = 'meals'">Питание</button>
              </div>
            </div>
            <div v-if="planViewMode === 'workouts'">
              <!-- Карточки тренировок (оставить как есть) -->
            <div v-if="currentDayPlan && currentDayPlan.workouts && currentDayPlan.workouts.length > 0" class="schedule-cards">
              <div v-for="workout in currentDayPlan.workouts" :key="workout.id" class="schedule-card">
                <div class="card-image">
                  <img :src="workout.image_url || 'https://magazin-sportlife.ru/uploads/images/2022/10/635908bb5a322.jpg'" :alt="workout.name">
                </div>
                <div class="card-content">
                  <div class="card-header">
                    <h3>{{ workout.name }}</h3>
                    <p v-if="workout.category">{{ getFormattedCategoryName(workout.category) }}</p>
                  </div>
                  <div class="card-details">
                    <div class="detail-row">
                      <div class="detail-icon calendar">
                        <ion-icon :icon="calendarOutline"></ion-icon>
                      </div>
                      <span>{{ formatDateForDisplay(currentDayPlan.date) }}</span>
                    </div>
                    <div class="detail-row" v-if="workout.duration">
                      <div class="detail-icon time">
                        <ion-icon :icon="timeOutline"></ion-icon>
                      </div>
                      <span>{{ workout.duration }} мин.</span>
                    </div>
                    <div class="detail-row" v-if="workout.calories_burned">
                      <div class="detail-icon flame">
                        <ion-icon :icon="flameOutline"></ion-icon>
                      </div>
                      <span>{{ workout.calories_burned }} ккал</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <button 
                      class="workout-complete-btn"
                      :class="workout.completed ? 'workout-complete-btn--undone' : 'workout-complete-btn--done'"
                      @click="togglePlannedWorkoutOnDashboard(workout)"
                    >
                      <ion-icon :icon="workout.completed ? checkmarkOutline : timeOutline"></ion-icon>
                      {{ workout.completed ? 'Отменить выполнение' : 'Отметить выполненное' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-workouts empty-list">
              Нет запланированных тренировок на этот день.
            </div>
          </div>
              <div v-else>
              <!-- Карточки питания -->
              <div v-if="currentDayPlan && currentDayPlan.meals && currentDayPlan.meals.length > 0" class="meals-cards-dashboard">
                <div
                  v-for="meal in currentDayPlan.meals" :key="meal.id"
                  :class="['meal-item-dashboard-new', { completed: meal.completed }]"
                >
                   <div class="meal-info-new">
                      <div class="meal-info-header">
                        <div class="meal-name-new">{{ meal.name || getMealTypeName(meal.mealType || meal.type) }}</div>
                        <div class="meal-badges">
                          <div v-if="meal.time" class="badge"><ion-icon :icon="timeOutline" />{{ meal.time }}</div>
                          <div class="badge status" :class="meal.completed ? 'ok' : 'pending'">
                            <ion-icon :icon="meal.completed ? checkmarkCircleOutline : closeCircleOutline" />
                            {{ meal.completed ? 'Выполнено' : 'Не выполнено' }}
                          </div>
                        </div>
                      </div>
                      <div class="meal-nutrition-details-new">
                        <div class="nutrition-item-new">
                           <ion-icon :icon="flameOutline" class="nutrition-icon-new"></ion-icon>
                           <span>{{ Math.round(meal.calories || 0) }} ккал</span>
                        </div>
                         <div class="nutrition-item-new">
                           <span class="nutrition-label-new">Б</span>
                           <span>{{ formatMacro(meal.proteins) }}г</span>
                        </div>
                         <div class="nutrition-item-new">
                           <span class="nutrition-label-new">Ж</span>
                           <span>{{ formatMacro(meal.fats) }}г</span>
                        </div>
                         <div class="nutrition-item-new">
                           <span class="nutrition-label-new">У</span>
                           <span>{{ formatMacro(meal.carbs) }}г</span>
                        </div>
                      </div>
                      <div v-if="meal.items && meal.items.length" class="meal-items-preview">
                        <div class="mi" v-for="(it, idx) in meal.items.slice(0,2)" :key="idx">
                          <img v-if="it.product && it.product.image" :src="it.product.image" class="mi-img" alt="" />
                          <div class="mi-body">
                            <div class="mi-title">{{ it?.product?.name || it?.free_text || it?.name || 'Продукт' }}</div>
                            <div class="mi-sub">{{ formatMacro(it.grams) }} г · {{ formatMacro(it.calories) }} ккал</div>
                          </div>
                        </div>
                        <div v-if="meal.items.length>2" class="mi-more">+ ещё {{ meal.items.length-2 }}</div>
                      </div>
                    </div>
                   <button
                     :class="['meal-toggle-button-new', { completed: meal.completed }]"
                     @click.stop="toggleMeal(meal.id)"
                   >
                     <ion-icon :icon="checkmarkOutline"></ion-icon>
                   </button>
                </div>
              </div>
              <div v-else class="empty-list">Нет приёмов пищи на этот день.</div>
            </div>
          </div>
        </div>
      </div>
      <WaterAddModal v-model="modalWaterOpen" @updated="onWaterUpdated" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useWeekPlanStore } from '@/stores/weekPlanStore';
import type { ComponentPublicInstance } from 'vue';
import type { WorkoutData } from '@/services/workoutService';
import type { WorkoutType, Meal, WeekPlan, Workout } from '@/types/weekPlan';
import { 
  personCircleOutline, 
  moonOutline, 
  sunnyOutline, 
  restaurantOutline, 
  barbellOutline, 
  checkmarkCircleOutline,
  closeCircleOutline,
  cafeOutline,
  calendarOutline,
  timeOutline,
  flameOutline,
  trashOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { useNotificationsStore } from '@/stores/notifications';
import { requestHealthKitAuthorization, syncHealthKitData, getHealthKitHistory } from '../services/healthkit';
import { ProgressService, type HealthKitSyncRequest } from '@/services/progressService';
import { WorkoutService, type WorkoutExerciseData } from '@/services/workoutService'; 
import type { ProgressStats } from '@/types/progress';
import { toastController, alertController } from '@ionic/vue';
import { 
  IonPage, 
  IonContent, 
  IonIcon, 
  IonAvatar, 
  IonSpinner, 
  IonButton, 
  IonCheckbox,
  onIonViewWillEnter
} from '@ionic/vue';
import { startOfWeek, addDays, format } from 'date-fns';
import WaterAddModal from '@/components/WaterAddModal.vue';

// Регистрируем иконки
addIcons({
  'person-circle-outline': personCircleOutline,
  'moon-outline': moonOutline,
  'sunny-outline': sunnyOutline,
  'restaurant-outline': restaurantOutline,
  'barbell-outline': barbellOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'close-circle-outline': closeCircleOutline,
  'cafe-outline': cafeOutline,
  'calendar-outline': calendarOutline,
  'time-outline': timeOutline,
  'flame-outline': flameOutline,
  'trash-outline': trashOutline,
  'checkmark-outline': checkmarkOutline
});

const router = useRouter();
const userStore = useUserStore();
const notificationsStore = useNotificationsStore();

const progressService = ProgressService.getInstance();
const workoutService = WorkoutService.getInstance();

// --- Week Plan Integration ---
const weekPlanStore = useWeekPlanStore();

// Обновляем computed свойства
const weekPlanDaysDashboard = computed<WeekPlan[]>(() => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Начинаем неделю с понедельника
  const weekDays: WeekPlan[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const dateString = format(date, 'yyyy-MM-dd');

    // Находим данные для этого дня в сторе
    const dayData = weekPlanStore.weekPlan.find(day => day.date === dateString);

    // Если данные найдены, используем их, иначе создаем заглушку
    const dayPlan: WeekPlan = dayData || {
      // Используем уникальный или временный ID, чтобы избежать конфликтов, если потребуется
      // Если id не нужен для ключей или логики, можно использовать null или другой индикатор
      id: -1, // Временный ID для дней без данных
      user_id: 0, // Или null, в зависимости от типа в WeekPlan
      date: dateString,
      meals: [],
      workouts: [],
      progress: 0,
      created_at: new Date().toISOString(), // Заглушка
      updated_at: new Date().toISOString() // Заглушка
    };
    return dayPlan;
  });
  return weekDays;
});

const selectedDayIndexDashboard = computed<number>(() => {
  const days = weekPlanDaysDashboard.value;
  if (!days || !days.length) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = days.findIndex((d: WeekPlan) => d.date === today);
  return todayIndex !== -1 ? todayIndex : 0;
});

// Новое вычисляемое свойство для плана выбранного дня
const currentDayPlan = computed<WeekPlan | null>(() => {
  return weekPlanStore.weekPlan.find(day => day.date === weekPlanStore.selectedDate) || null;
});

const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Обновляем onMounted
onMounted(async () => {
  await loadData();
  // Устанавливаем выбранную дату после загрузки данных
  const todayString = format(new Date(), 'yyyy-MM-dd');
  weekPlanStore.setSelectedDate(todayString);
  loadHealthHistory();
  // Выводим в консоль ссылки запуска Telegram Mini App
  logTelegramLaunchLinks();
});

const savedSettings = JSON.parse(localStorage.getItem('fizio_settings') || '{}');
const isLoading = ref(true);
const error = ref('');
const progressData = ref<ProgressStats | null>(null);
const workouts = ref<Workout[]>([]);
const isDarkMode = ref(savedSettings.darkMode || false);
const today = new Date();
const localWaterIntake = ref(0.0);

const getWaterStorageKey = () => {
  const today = new Date();
  return `water_intake_${format(today, 'yyyy-MM-dd')}`;
};

const loadLocalWaterIntake = () => {
  const storedValue = localStorage.getItem(getWaterStorageKey());
  if (storedValue) {
    const glasses = parseInt(storedValue, 10);
    localWaterIntake.value = glasses * 0.25; // 0.25L per glass
  } else {
    localWaterIntake.value = 0;
  }
};

onIonViewWillEnter(() => {
  loadLocalWaterIntake();
});

// Модалка воды на главной
const modalWaterOpen = ref(false);
const openWaterModal = () => { modalWaterOpen.value = true; };
const onWaterUpdated = (liters:number) => {
  localWaterIntake.value = Math.max(0, liters);
  const glasses = Math.round(liters / 0.25);
  localStorage.setItem(getWaterStorageKey(), String(glasses));
};

interface HealthHistoryItem {
  date: string;
  steps: number;
  calories: number;
  workout_time: number;
  water_intake: number;
  daily_progress: number;
}

const healthHistory = ref<HealthHistoryItem[]>([]);

// Определяем интерфейс для данных HealthKit
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface HealthData {
  steps: number;
  calories: number;
  distance: number;
  workout_time: number;
  water_intake: number;
  daily_progress: number;
}

// Определяем типы для Vue компонентов
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $refs: {
      [key: string]: ComponentPublicInstance | HTMLElement | undefined;
    };
  }
}

// Загрузка данных
const loadData = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    await Promise.all([
      weekPlanStore.loadWeekPlan(),
      (async () => {
        if (!userStore.user) {
          await userStore.loadProfile();
        }
      })(),
      (async () => {
        const progressResponse = await progressService.getDailyProgress();
        if (progressResponse.success && progressResponse.data) {
          progressData.value = progressResponse.data;
        }
      })(),
      (async () => {
        await notificationsStore.fetchUnreadCount();
      })()
    ]);
    
    loadLocalWaterIntake(); // Загружаем данные о воде после основных данных
  } catch (err: any) {
    console.error('Общая ошибка при загрузке данных:', err);
    error.value = err.response?.data?.message || 'Произошла ошибка при загрузке данных';
  } finally {
    isLoading.value = false;
  }
};

const dashboardWeekProgress = computed(() => {
  const progressArray = Array(weekPlanDaysDashboard.value.length).fill(0);
  if (currentDayPlan.value && weekPlanDaysDashboard.value.length > 0) {
    const currentIndex = weekPlanDaysDashboard.value.findIndex(day => day.date === currentDayPlan.value?.date);
    if (currentIndex !== -1) {
      progressArray[currentIndex] = currentDayPlan.value.progress || 0;
    }
  }
  return progressArray;
});

const waterProgress = computed(() => {
  const waterGoal = 2; // 2 литра
  return Math.min(localWaterIntake.value / waterGoal, 1) * 100;
});

const visualProgress = computed(() => {
  // Используем актуальный расчет дня из питания (новая система) + тренировки
  const planProgress = dayProgress.value || 0;
  // План (тренировки и питание) = 80%, Вода = 20%
  const weightedPlanProgress = planProgress * 0.8;
  const weightedWaterProgress = waterProgress.value * 0.2;
  return weightedPlanProgress + weightedWaterProgress;
});

// Форматирование и расчеты для отображения
const calculateProgressOffset = (progress: number): number => {
  const circumference = 141.3; // Длина полуокружности (π * r, где r = 45)
  return circumference * (1 - progress / 100);
};

const calculateCaloriesOffset = (calories: number) => {
  // Предполагаем, что цель - 2000 ккал
  const percent = Math.min(calories / 2000, 1);
  return 282.6 - (percent * 282.6);
};

const calculateStepsOffset = (steps: number) => {
  // Предполагаем, что цель - 10000 шагов
  const percent = Math.min(steps / 10000, 1);
  return 282.6 - (percent * 282.6);
};

const calculateWorkoutOffset = (minutes: number) => {
  // Предполагаем, что цель - 150 минут в неделю
  const percent = Math.min(minutes / 150, 1);
  return 282.6 - (percent * 282.6);
};

const calculateWaterOffset = (liters: number) => {
  // Предполагаем, что цель - 2 литра
  const percent = Math.min(liters / 2, 1);
  return 282.6 - (percent * 282.6);
};

const formatSteps = (steps: number) => {
  if (steps >= 1000) {
    return (steps / 1000).toFixed(1) + ' км';
  }
  return steps + ' шаг.';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
};

const navigateToProfile = () => {
  router.push('/profile');
};

const navigateToWater = () => {
  router.push('/water-intake');
};

// Функция для перехода на страницу уведомлений
const navigateToNotifications = () => {
  router.push('/notifications');
};

// Функция переключения темы
const toggleDarkMode = () => {
  // Добавляем класс для анимации
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.classList.add('theme-icon-rotate');
    setTimeout(() => {
      themeIcon.classList.remove('theme-icon-rotate');
    }, 500);
  }

  isDarkMode.value = !isDarkMode.value;
  console.log('Переключаем тему, новое значение isDarkMode:', isDarkMode.value);
  
  // Правильное переключение темы в соответствии с документацией Ionic
  document.documentElement.classList.toggle('ion-palette-dark', isDarkMode.value);
  console.log('Классы на documentElement:', document.documentElement.className);
  
  // Обновляем мета-тег color-scheme для соответствия с темой
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (metaColorScheme) {
    // При установке светлой темы, content должен быть 'light dark' или 'light', 
    // чтобы система могла переключаться на темную, если пользователь изменит системные настройки.
    // При установке темной темы, 'dark' достаточно.
    metaColorScheme.setAttribute('content', isDarkMode.value ? 'dark' : 'light');
    console.log('Обновлен мета-тег color-scheme:', metaColorScheme.getAttribute('content'));
  }
  
  // Сохраняем настройку в localStorage
  let settings = {};
  const savedSettings = localStorage.getItem('fizio_settings');
  if (savedSettings) {
    try {
      settings = JSON.parse(savedSettings);
    } catch (e) {
      console.error('Ошибка при загрузке настроек:', e);
    }
  }
  
  settings = {
    ...settings,
    darkMode: isDarkMode.value
  };
  
  localStorage.setItem('fizio_settings', JSON.stringify(settings));
  console.log('Настройки сохранены в localStorage:', JSON.stringify(settings));
};

const connectAppleWatch = async () => {
      const toast = await toastController.create({
    message: 'Интеграция с Apple Watch временно недоступна',
      duration: 3000,
      position: 'bottom',
    color: 'warning'
    });
    await toast.present();
};

const loadHealthHistory = async () => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // За последние 7 дней
    
    const response = await progressService.getDailyProgress();

    if (response.success) {
      if(response.data) {
        console.log("Данные для healthHistory (требуется адаптация типа):", response.data);
      } else {
        console.log("Нет данных для healthHistory от getDailyProgress");
      }
    } else {
      console.error('Ошибка загрузки истории (getDailyProgress):', response.message);
    }
  } catch (error) {
    console.error('Ошибка загрузки истории:', error);
  }
};

// ===== Telegram Mini App launch links =====
function getTelegramBotUsername(): string | null {
  try {
    // Предпочитаем env-переменную (Vite)
    const envName = (import.meta as any)?.env?.VITE_TELEGRAM_BOT_USERNAME;
    if (envName && String(envName).trim()) return String(envName).trim();
  } catch (_) {}
  try {
    const stored = localStorage.getItem('tg_bot_username');
    if (stored && stored.trim()) return stored.trim();
  } catch (_) {}
  return null;
}

function logTelegramLaunchLinks(): void {
  // Строим ссылку-эмуляцию WebApp через hash-параметр tgWebAppData
  let initData = '';
  try {
    initData = (window as any)?.Telegram?.WebApp?.initData || '';
  } catch (_) {}
  if (!initData) {
    try {
      const raw = sessionStorage.getItem('__telegram__initParams');
      if (raw) {
        const parsed = JSON.parse(raw);
        initData = parsed?.tgWebAppData || '';
      }
    } catch (_) {}
  }
  if (!initData) {
    console.log('[TG] initData пуст — нет данных для эмуляции');
    return;
  }
  const baseUrl = (() => {
    try {
      const origin = window.location.origin;
      let base = (import.meta as any)?.env?.BASE_URL || (import.meta as any)?.env?.BASE || '/';
      if (base === '/') base = '';
      return origin + base;
    } catch (_) {
      return window.location.origin;
    }
  })();
  const emuUrl = `${baseUrl}#tgWebAppData=${encodeURIComponent(initData)}`;
  const emuUrlWithDebug = `${emuUrl}&debug=1`;
  console.log('[TG] Ссылки для эмуляции WebApp в обычном браузере:', {
    emulate: emuUrl,
    emulate_with_debug: emuUrlWithDebug,
    note: 'Открой в обычном браузере. Приложение воспримет данные как из Telegram.'
  });
}

const isToday = (dateString: string): boolean => {
  const today = new Date();
  const todayYYYYMMDD = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  // console.log(`isToday: comparing ${dateString} with ${todayYYYYMMDD}`); // Удаляем этот лог
  return dateString === todayYYYYMMDD;
};

// Функция для перевода типа тренировки на русский (как в WorkoutsPage.vue)
const getFormattedCategoryName = (type: string | undefined): string => {
  if (!type) return 'Не указано';
  switch (type.toLowerCase()) {
    case 'strength':
      return 'Силовая';
    case 'cardio':
      return 'Кардио';
    case 'hiit':
      return 'HIIT';
    case 'flexibility':
      return 'Гибкость';
    case 'yoga':
      return 'Йога';
    case 'walking':
      return 'Ходьба';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

const handleToggleWorkout = async (workoutToToggle: WorkoutData) => {
  if (!currentDayPlan.value || !workoutToToggle || typeof workoutToToggle.id === 'undefined') {
    console.error('Необходимые данные для изменения статуса тренировки отсутствуют (selectedDay, workoutToToggle, or workoutToToggle.id).');
    return;
  }

  const workoutId = workoutToToggle.id.toString();

  try {
    const response = await workoutService.markWorkoutInPlanAsComplete(
      currentDayPlan.value.date,
      workoutId,
      !workoutToToggle.completed
    );

    if (response.success) {
      // Обновляем статус в локальном состоянии
      const day = weekPlanDaysDashboard.value.find(d => d.date === currentDayPlan.value?.date);
      if (day) {
        const workoutInPlan = day.workouts.find(w => w.id.toString() === workoutId);
        if (workoutInPlan) {
          workoutInPlan.completed = !workoutInPlan.completed;
        }
      }
    } else {
      console.error('Ошибка при изменении статуса тренировки:', response.message);
    }
  } catch (error) {
    console.error('Ошибка при изменении статуса тренировки:', error);
  }
};

const formatDateForDisplay = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
};

const togglePlannedWorkoutOnDashboard = async (workout: Workout) => {
  if (!currentDayPlan.value || !workout || !workout.id) {
    console.error('Необходимые данные для изменения статуса тренировки отсутствуют');
    return;
  }

  try {
    await weekPlanStore.markAsCompleted(
      currentDayPlan.value.date,
      'workout',
      Number(workout.id)
    );
  } catch (error) {
    console.error('Ошибка при изменении статуса тренировки:', error);
  }
};

const removePlannedWorkoutFromDashboard = async (workoutToRemove: WorkoutData) => {
  if (!currentDayPlan.value || !currentDayPlan.value.date || typeof workoutToRemove.id === 'undefined') {
    toastController.create({
      message: 'Ошибка: Не удалось определить тренировку или выбранный день для удаления.',
      duration: 3000,
      color: 'danger'
    }).then(t => t.present());
    return;
  }

  const workoutId = workoutToRemove.id.toString();

  const alert = await alertController.create({
    header: 'Удалить из плана',
    message: `Вы уверены, что хотите удалить тренировку "${workoutToRemove.name}" из плана на этот день?`,
    buttons: [
      { text: 'Отмена', role: 'cancel' },
      {
        text: 'Удалить',
        handler: async () => {
          try {
            const date = currentDayPlan.value!.date;
            await workoutService.removeWorkoutFromDayPlan(date, workoutId);
            
            const day = weekPlanDaysDashboard.value.find(d => d.date === date);
            if (day && day.workouts) {
              day.workouts = day.workouts.filter(w => w.id.toString() !== workoutId);
            }

            toastController.create({
              message: `Тренировка "${workoutToRemove.name}" удалена из плана.`,
              duration: 2000,
              color: 'success'
            }).then(t => t.present());
          } catch (error: any) {
             toastController.create({
              message: error.response?.data?.message || error.message || 'Ошибка удаления тренировки из плана.',
              duration: 3000,
              color: 'danger'
            }).then(t => t.present());
          }
        }
      }
    ]
  });
  await alert.present();
};

const planViewMode = ref<'workouts' | 'meals'>('workouts');

function getMealTypeIcon(type: string) {
  switch ((type || '').toLowerCase()) {
    case 'завтрак':
    case 'breakfast': return sunnyOutline;
    case 'обед':
    case 'lunch': return restaurantOutline;
    case 'ужин':
    case 'dinner': return moonOutline;
    case 'перекус':
    case 'snack': return cafeOutline;
    default: return cafeOutline;
  }
}

function getMealTypeName(type: string | undefined) {
  const t = (type || '').toLowerCase();
  if (t === 'breakfast' || t === 'завтрак') return 'Завтрак';
  if (t === 'lunch' || t === 'обед') return 'Обед';
  if (t === 'dinner' || t === 'ужин') return 'Ужин';
  if (t === 'snack' || t === 'перекус') return 'Перекус';
  return 'Приём пищи';
}

function formatMacro(v:any){
  const n = typeof v === 'string' ? parseFloat(v) : (v||0);
  return Math.round(n*10)/10;
}

// Прогресс дня с учётом и питания, и тренировок
const dayProgress = computed(() => {
  if (!currentDayPlan.value) return 0;
  const day = currentDayPlan.value;
  const total = (day.meals?.length || 0) + (day.workouts?.length || 0);
  if (!total) return 0;
  const completed = (day.meals?.filter(m => m.completed).length || 0) + (day.workouts?.filter(w => w.completed).length || 0);
  return Math.round((completed / total) * 100);
});

const selectDayInPlan = (index: number) => {
  if (weekPlanDaysDashboard.value[index]) {
    const day = weekPlanDaysDashboard.value[index];
    weekPlanStore.setSelectedDate(day.date);
  }
};

const getOverallProgressByDate = (date: string) => {
  return weekPlanStore.getProgressForDate(date);
};

const toggleMeal = async (mealId: number) => {
  if (!currentDayPlan.value) return;
  
  try {
    await weekPlanStore.markAsCompleted(
      currentDayPlan.value.date,
      'meal',
      mealId
    );
  } catch (error) {
    console.error('Ошибка при изменении статуса приема пищи:', error);
  }
};

// Добавляем функцию для расчета позиции точки
const calculateDotPosition = (progress: number): { x: number; y: number } => {
  const radius = 45;
  const centerX = 50;
  const effectiveCenterY = 48.8;

  const theta = Math.PI * (1 - progress / 100);
  
  const x = centerX + radius * Math.cos(theta);
  const y = effectiveCenterY - radius * Math.sin(theta);
  
  return { x, y };
};
</script>

<style scoped>
/* Общие стили, не зависящие от темы */
.dashboard-container {
  padding: 16px;
  min-height: 100%;
  position: relative;
}

/* Стили для светлой темы (по умолчанию) */
:root .dashboard-container {
  background: linear-gradient(to bottom, #f5f7fa 0%, #ffffff 220px, #ffffff 100%);
  color: #333333;
}

/* Стили для темной темы */
.ion-palette-dark .dashboard-container {
  background: linear-gradient(to bottom, #261c3a 0%, #1a191b 220px, #1a191b 100%);
  color: white;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-avatar ion-avatar {
  width: 40px;
  height: 40px;
}

.status-icons {
  display: flex;
  gap: 16px;
}

/* Светлая тема для иконок */
:root .status-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0);
}

/* Темная тема для иконок */
.ion-palette-dark .status-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.theme-icon {
  transition: transform var(--theme-transition-duration) var(--theme-transition-timing);
}

.theme-icon-rotate {
  animation: rotate 0.5s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Светлая тема для иконки темы */
:root .theme-icon {
  width: 24px;
  height: 24px;
  color: #333333;
}

/* Темная тема для иконки темы */
.ion-palette-dark .theme-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.notification-icon-container {
  position: relative;
  display: inline-block;
}

/* Светлая тема для уведомлений */
:root .notification-dot {
  position: absolute;
  top: -5px;
  right: 0;
  width: 12px;
  height: 12px;
  background: #8560ff;
  border: 2px solid #f5f7fa;
  border-radius: 50%;
  z-index: 10;
}

/* Темная тема для уведомлений */
.ion-palette-dark .notification-dot {
  position: absolute;
  top: -5px;
  right: 0;
  width: 12px;
  height: 12px;
  background: #A38FE4;
  border: 2px solid #261c3a;
  border-radius: 50%;
  z-index: 10;
}

.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -50px;
}

.main-progress {
  position: relative;
  margin-top: 0px;
  margin-bottom: 10px;
}

.progress-semicircle-container {
  width: 220px;
  height: 123px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.progress-semicircle {
  width: 100%;
  height: 100%;
}

/* Светлая тема для фона прогресса */
:root .semicircle-bg {
  fill: none;
  stroke: rgba(0, 0, 0, 0.1);
  stroke-width: 5;
  stroke-linecap: round;
}

/* Темная тема для фона прогресса */
.ion-palette-dark .semicircle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 5;
  stroke-linecap: round;
}

.semicircle-progress {
  fill: none;
  stroke-width: 5;
  stroke-linecap: round;
}

.progress-dot {
  fill: #8AFF8C;
  filter: drop-shadow(0 0 1px rgba(138, 255, 140, 0.9));
  border-radius: 50%;
}

/* Светлая тема для процента */
:root .progress-percentage {
  position: absolute;
  bottom: -8px;
  font-size: 48px;
  font-weight: bold;
  color: #795DD1;
}

/* Темная тема для процента */
.ion-palette-dark .progress-percentage {
  position: absolute;
  bottom: -8px;
  font-size: 48px;
  font-weight: bold;
  color: #795DD1;
}

/* Светлая тема для заголовка */
:root .progress-title {
  margin-top: 8px;
  font-size: 24px;
  font-weight: normal;
  text-align: center;
  color: #333333;
}

/* Темная тема для заголовка */
.ion-palette-dark .progress-title {
  margin-top: 8px;
  font-size: 24px;
  font-weight: normal;
  text-align: center;
  color: white;
}

/* Светлая тема для карточки Apple Watch */
:root .apple-watch-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 20px;
  margin: 16px 0 24px 0;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(133, 96, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:root .apple-watch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* Темная тема для карточки Apple Watch */
.ion-palette-dark .apple-watch-card {
  background: linear-gradient(135deg, #2a2a2c 0%, #1a191b 100%);
  border-radius: 16px;
  padding: 20px;
  margin: 16px 0 24px 0;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(133, 96, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ion-palette-dark .apple-watch-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.apple-watch-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.apple-watch-info {
  flex: 1;
}

/* Светлая тема для заголовка Apple Watch */
:root .apple-watch-info h3 {
  font-family: 'SF UI Display', sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333333;
  line-height: 1.2;
}

/* Темная тема для заголовка Apple Watch */
.ion-palette-dark .apple-watch-info h3 {
  font-family: 'SF UI Display', sans-serif;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #FDFDFD;
  line-height: 1.2;
}

/* Светлая тема для текста Apple Watch */
:root .apple-watch-info p {
  font-family: 'SF UI Display', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #666666;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

/* Темная тема для текста Apple Watch */
.ion-palette-dark .apple-watch-info p {
  font-family: 'SF UI Display', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #979797;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

/* Светлая тема для кнопки */
:root .apple-watch-info .connect-button {
  background: linear-gradient(135deg, #8560ff 0%, #6b4aff 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #FFFFFF;
  font-family: 'SF UI Display', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:root .apple-watch-info .connect-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(133, 96, 255, 0.3);
}

/* Темная тема для кнопки */
.ion-palette-dark .apple-watch-info .connect-button {
  background: linear-gradient(135deg, #a38fe4 0%, #8560ff 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: #000000;
  font-family: 'SF UI Display', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ion-palette-dark .apple-watch-info .connect-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(163, 143, 228, 0.3);
}

.apple-watch-image {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.apple-watch-image:hover {
  transform: scale(1.05);
}

.apple-watch-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.13;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 24px 0;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Светлая тема для круга статистики */
:root .stat-circle {
  width: 70px;
  height: 70px;
  position: relative;
  margin-bottom: 8px;
  border-radius: 50%;
  background: #f0f0f0;
  box-sizing: border-box;
  box-shadow: inset 2px -2px 5px rgba(0, 0, 0, 0.1);
}

/* Темная тема для круга статистики */
.ion-palette-dark .stat-circle {
  width: 70px;
  height: 70px;
  position: relative;
  margin-bottom: 8px;
  border-radius: 50%;
  background: #212121;
  box-sizing: border-box;
  box-shadow: inset 4px -4px 10px rgba(0, 0, 0, 0.29);
}

/* Светлая тема для внутреннего круга */
:root .inner-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  background: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

/* Темная тема для внутреннего круга */
.ion-palette-dark .inner-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  background: #2a2a2c;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
}

.icon-svg {
  width: 24px;
  height: 24px;
}

.circle-stat {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

/* Светлая тема для фона круга */
:root .circle-bg {
  fill: none;
  stroke: #e5e5e5;
  stroke-width: 10;
  filter: drop-shadow(2px -2px 5px rgba(0, 0, 0, 0.1));
}

/* Темная тема для фона круга */
.ion-palette-dark .circle-bg {
  fill: none;
  stroke: #2a2a2c;
  stroke-width: 10;
  filter: drop-shadow(4px -4px 10px rgba(0, 0, 0, 0.29));
}

.circle-progress {
  fill: none;
  stroke-width: 10px;
  stroke-linecap: round;
}

.yellow-progress { stroke: #FFCC00; }
.pink-progress { stroke: #FB8787; }
.green-progress { stroke: #00FFB7; }
.blue-progress { stroke: #87B1FF; }

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

/* Светлая тема для значения */
:root .stat-value {
  font-weight: 600;
  font-size: 18px;
  color: #333333;
}

/* Темная тема для значения */
.ion-palette-dark .stat-value {
  font-weight: 600;
  font-size: 18px;
  color: #FFFFFF;
}

/* Светлая тема для метки */
:root .stat-label {
  font-size: 14px;
  color: #666666;
}

/* Темная тема для метки */
.ion-palette-dark .stat-label {
  font-size: 14px;
  color: #D7D7D7;
}

.week-days {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 24px 0;
  position: relative;
  align-items: center;
}

/* Светлая тема для соединения дней */
:root .day-connection {
  height: 3px;
  flex: 1;
  background: #e5e5e5;
  margin: 0;
  transition: background 0.3s ease;
}

/* Темная тема для соединения дней */
.ion-palette-dark .day-connection {
  height: 3px;
  flex: 1;
  background: #373638;
  margin: 0;
  transition: background 0.3s ease;
}

/* Светлая тема для дня */
:root .day {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--day-bg-color, #f0f0f0);
  color: var(--day-text-color, #666666);
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: color 0.3s ease, background-color 0.3s ease, transform 0.2s ease;
  overflow: hidden;
}

/* Темная тема для дня */
.ion-palette-dark .day {
  background: var(--day-bg-color-dark, #2a2a2c);
  color: var(--day-text-color-dark, #888);
}

.day-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-align: center;
}

.day span {
  font-size: 14px;
  font-weight: 500;
  color: var(--day-text-color, #666666);
}

.ion-palette-dark .day span {
  color: var(--day-text-color-dark, #ccc);
}

.day .day-date-label {
  font-size: 10px;
  margin-top: 1px;
  opacity: 0.8;
}

/* Светлая тема для активного/текущего дня */
:root .day.active {
  transform: scale(1.1);
  /* box-shadow: 0 0 8px rgba(76, 175, 80, 0.5); /* Убираем тень */
}

:root .day.high-progress .day-content span {
  color: #fff;
}

:root .day.current {
  border: 2px solid var(--ion-color-secondary, #3dc2ff);
}

/* Темная тема для активного/текущего дня */
.ion-palette-dark .day.active {
  transform: scale(1.1);
  /* box-shadow: 0 0 8px rgba(76, 175, 80, 0.7); /* Убираем тень */
}

.ion-palette-dark .day.active .day-content span {
  color: #fff !important;
}

.ion-palette-dark .day.current {
  border: 2px solid var(--ion-color-secondary-tint, #52c8ff);
}

/* Стили для модального окна */
ion-modal {
  --border-radius: 16px;
  --box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

ion-modal::part(backdrop) {
  background: rgba(0, 0, 0, 0.75);
}

/* Светлая тема для модального окна */
:root ion-modal {
  --background: #ffffff;
  --color: #1a1a1a;
}

/* Темная тема для модального окна */
.ion-palette-dark ion-modal {
  --background: #1e1e1e;
  --color: #eeeeee;
}

/* Стили для заголовка модального окна */
ion-header {
  box-shadow: none;
}

ion-toolbar {
  --background: transparent;
  --border-color: transparent;
  padding: 20px 20px 10px 20px;
}

ion-title {
  font-size: 24px;
  font-weight: 800;
  padding: 0;
}

ion-buttons {
  margin-inline-start: 0;
}

ion-buttons ion-button {
  --color: var(--ion-color-primary);
  font-size: 16px;
  font-weight: 600;
}

/* Стили для содержимого модального окна */
ion-content {
  /* Восстанавливаем стандартные отступы для ion-content, если они не нужны специфичные для модалки */
  /* --padding-top: 0; */
  /* --padding-bottom: 0; */
  /* --padding-start: 0; */
  /* --padding-end: 0; */
  display: block; /* избегаем пустого ruleset предупреждения */
}

.day-details-content {
  padding: 20px;
}

.section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  border-bottom: none;
  margin-bottom: 0;
}

.item:hover {
  background: #f0f0f0;
}

.item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background: #e0e0e0;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-icon ion-icon {
  font-size: 24px;
  color: #8560ff;
}

.item-content {
  flex: 1;
}

.item-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #333;
}

.item-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.item-checkbox {
  margin-left: 15px;
}

.custom-checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid #999;
  border-radius: 8px;
  appearance: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox:checked {
  background-color: #a38fe4;
  border-color: #a38fe4;
}

.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 5px;
  width: 8px;
  height: 14px;
  border: solid white;
  border-width: 0 3px 3px 0;
  border-radius: 1px;
  transform: rotate(45deg);
  box-sizing: border-box;
}

/* Для тёмной темы */
.ion-palette-dark .custom-checkbox {
  border-color: #666;
  background-color: #333;
}

.ion-palette-dark .custom-checkbox:checked {
  background-color: #a38fe4;
  border-color: #a38fe4;
}

.progress-section-modal {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: none;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8560ff 0%, #6b4aff 100%);
  transition: width 0.6s ease;
}

.progress-percentage-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  width: 50px;
  text-align: right;
}

.progress-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.progress-footer ion-icon {
  color: #8560ff;
  font-size: 20px;
}

.progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* Темная тема для модального окна (общие стили) */
.ion-palette-dark .section {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.ion-palette-dark .section h3 {
  color: #fff;
}

.ion-palette-dark .items-list { display: block; }

.ion-palette-dark .item {
  background: #2a2a2a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.ion-palette-dark .item:hover {
  background: #3a3a3a;
}

.ion-palette-dark .item-icon {
  background: #3a3a3a;
}

.ion-palette-dark .item-icon ion-icon {
  color: #a38fe4;
}

.ion-palette-dark .item-content h4 {
  color: #fff;
}

.ion-palette-dark .item-content p {
  color: #bbb;
}

.ion-palette-dark .custom-checkbox {
  border-color: #666;
  background-color: #333;
}

.ion-palette-dark .custom-checkbox:checked {
  background-color: #a38fe4;
  border-color: #a38fe4;
}

.progress-section-modal {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: none;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8560ff 0%, #6b4aff 100%);
  transition: width 0.6s ease;
}

.progress-percentage-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  width: 50px;
  text-align: right;
}

.progress-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.progress-footer ion-icon {
  color: #8560ff;
  font-size: 20px;
}

.progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* Темная тема для модального окна (общие стили) */
.ion-palette-dark .section {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.ion-palette-dark .section h3 {
  color: #fff;
}

.ion-palette-dark .items-list { display: block; }

.ion-palette-dark .item {
  background: #2a2a2a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.ion-palette-dark .item:hover {
  background: #3a3a3a;
}

.ion-palette-dark .item-icon {
  background: #3a3a3a;
}

.ion-palette-dark .item-icon ion-icon {
  color: #a38fe4;
}

.ion-palette-dark .item-content h4 {
  color: #fff;
}

.ion-palette-dark .item-content p {
  color: #bbb;
}

.ion-palette-dark .custom-checkbox {
  border-color: #666;
  background-color: #333;
}

.ion-palette-dark .custom-checkbox:checked {
  background-color: #a38fe4;
  border-color: #a38fe4;
}

.ion-palette-dark .progress-bar {
  background: #3a3a3a;
}

.ion-palette-dark .progress-fill {
  background: linear-gradient(90deg, #a38fe4 0%, #8560ff 100%);
}

.ion-palette-dark .progress-footer ion-icon {
  color: #a38fe4;
}

.ion-palette-dark .progress-text {
  color: #fff;
}

/* Обновленные стили для блока расписания */
.schedule-section {
  width: 100%;
  margin: 16px 0;
}

.schedule-section h2 {
  font-size: 22px;
  margin-bottom: 16px;
  font-weight: 500;
  color: #181818;
}

.schedule-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.schedule-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 220px; /* увеличена минимальная высота */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
}

.card-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.6;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 16px;
  padding-bottom: 32px; /* еще больше отступ снизу */
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  box-sizing: border-box;
}

.card-header {
  flex-shrink: 0;
}

.card-details {
  flex-grow: 1;
  margin-top: 10px;
}

.card-actions {
  flex-shrink: 0;
  margin-top: auto;
  box-sizing: border-box;
}

.workout-complete-btn {
  width: 100%;
  padding: 14px 10px 14px 10px;
  border: none;
  border-radius: 8px;
  /* background: rgba(255, 255, 255, 0.1);  убираем прозрачный фон */
  color: white;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  margin-top: 0;
}

.workout-complete-btn--done {
  background: rgba(76, 175, 80, 0.9)!important;
  color: #fff;
}
.workout-complete-btn--done:hover {
  background: rgba(56, 142, 60, 1)!important;
}

.workout-complete-btn--undone {
  background: rgba(244, 67, 54, 0.9)!important;
  color: #fff;
}
.workout-complete-btn--undone:hover {
  background: rgba(183, 28, 28, 1)!important;
}

.workout-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px 0;
  line-height: 1.2;
}

.workout-desc {
  font-size: 13px;
  color: #e0e0e0;
  margin: 0 0 10px 0;
}

.card-details {
  margin-top: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.detail-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  background: #23232b;
}

.detail-icon.calendar { background: #5271ff; }
.detail-icon.time { background: #4CAF50; }
.detail-icon.flame { background: #FF9800; }
.detail-row span {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.done-button {
  position: absolute;
  right: 16px;
  bottom: 12px;
  --background: rgba(0, 0, 0, 0.7);
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  --color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.done-button:hover {
  --background: rgba(0, 0, 0, 0.8);
  transform: translateY(-1px);
}

.done-button[aria-pressed="true"] {
  --background: rgba(76, 175, 80, 0.9);
  --color: #ffffff;
}

.done-button ion-icon {
  font-size: 16px;
  margin-right: 4px;
}

.no-workouts {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: 20px;
  color: #bdbdbd;
}

.ion-palette-dark .schedule-section h2 {
  color: #fff;
}

/* Стили для обновленной секции расписания на главной */
.schedule-section .section-title-main {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--ion-text-color, #333);
}

.ion-palette-dark .schedule-section .section-title-main {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.daily-plan-subsection {
  margin-bottom: 24px;
  background-color: var(--ion-card-background, var(--ion-color-light-contrast));
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.ion-palette-dark .daily-plan-subsection {
  background-color: var(--ion-card-background, var(--ion-color-dark-tint));
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.subsection-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.subsection-header ion-icon {
  font-size: 22px;
  margin-right: 10px;
  color: var(--ion-color-primary);
}

.subsection-header h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: var(--ion-text-color, #333);
}

.ion-palette-dark .subsection-header h3 {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.plan-list {
  background: transparent; /* Убираем фон списка, т.к. фон уже на subsection */
  margin-top: 0;
  padding-top: 0;
}

.plan-list-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --background: transparent; /* Убираем фон элемента списка */
  border-bottom: 1px solid var(--ion-border-color, rgba(0,0,0,0.08));
  transition: background-color 0.2s ease;
}

.ion-palette-dark .plan-list-item {
   border-bottom: 1px solid var(--ion-border-color, rgba(255,255,255,0.08));
}

.plan-list-item:last-child {
  border-bottom: none;
}

.plan-list-item ion-checkbox {
  --size: 22px;
  --checkbox-background-checked: var(--ion-color-primary);
  --border-color-checked: var(--ion-color-primary);
  --border-color: var(--ion-color-medium-shade);
  --checkmark-color: var(--ion-color-primary-contrast, #ffffff);
  margin:0;
}

.plan-list-item.item-done ion-checkbox::part(label) {
  text-decoration: line-through;
  color: var(--ion-color-medium-shade);
  opacity: 0.7;
}

.ion-palette-dark .plan-list-item.item-done ion-checkbox::part(label) {
  color: var(--ion-color-medium-tint);
}

.empty-plan-message {
  text-align: center;
  padding: 16px 0;
  color: var(--ion-color-medium-shade);
}

/* Новый стиль для фона с прогрессом */
:root .day-background-progress {
  --day-progress-fill-color: #4CAF50;
  --day-progress-bg-color-base: #e0e0e0;
  background: linear-gradient(to right, 
    var(--day-progress-fill-color) var(--progress-percent, 0%), 
    var(--day-progress-bg-color-base) var(--progress-percent, 0%)
  );
}

.ion-palette-dark .day-background-progress {
  --day-progress-bg-color-base-dark: var(--day-bg-color-dark, #2a2a2c);
  background: linear-gradient(to right, 
    var(--day-progress-fill-color) var(--progress-percent, 0%), 
    var(--day-progress-bg-color-base-dark) var(--progress-percent, 0%)
  );
}

.workout-category-label {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(134, 96, 255, 0.95);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(134,96,255,0.12);
}

.workout-complete-btn {
  width: calc(100% - 12px);
  margin: 20px 6px 6px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 0;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 7px;
  background: #8560ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(133,96,255,0.10);
  cursor: pointer;
  transition: background 0.15s;
}
.workout-complete-btn.completed {
  background: #4CAF50;
}
.workout-complete-btn ion-icon {
  font-size: 14px;
}

.workout-category-label.cat-cardio    { background: #8560ff; }
.workout-category-label.cat-strength  { background: #3daaff; }
.workout-category-label.cat-hiit      { background: #ff9800; }
.workout-category-label.cat-flexibility { background: #00bfae; }
.workout-category-label.cat-yoga      { background: #4caf50; }
.workout-category-label.cat-walking   { background: #e040fb; }
.workout-category-label.cat-          { background: #888; }

.ion-palette-dark .no-workouts {
  background: var(--ion-card-background, var(--ion-color-dark-tint, #1e1e1e));
  color: var(--ion-color-medium-tint, #888888);
}

/* Стили для запланированных тренировок, скопированные из WorkoutsPage.vue и адаптированные */
/* (могут потребоваться префиксы :root и .ion-palette-dark для темной темы, если исходные стили их использовали) */

.empty-list { /* Используется вместо .no-workouts в новом шаблоне */
  text-align: center;
  color: var(--ion-color-medium);
  padding: 16px 0;
}
.ion-palette-dark .empty-list {
  color: var(--ion-color-medium-tint);
}

.planned-workouts-list {
  background: transparent;
  --ion-background-color: transparent;
  padding: 0; /* Убрал верхний отступ, т.к. он может быть у .schedule-cards */
}

.workout-plan-item-sliding {
  margin-bottom: 8px;
  border-radius: 10px;
  overflow: hidden; /* Важно для border-radius с ion-item */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.ion-palette-dark .workout-plan-item-sliding {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1); /* Чуть темнее для темной темы, если нужно */
}

.workout-plan-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
  /* Светлая тема по умолчанию для item */
  --background: var(--ion-color-light-contrast); /* или конкретный цвет типа #fff */
  /* --color: var(--ion-text-color); */
}
.ion-palette-dark .workout-plan-item {
  --background: var(--ion-color-step-150, #262626) !important; 
  /* --color: var(--ion-color-light-contrast, #ffffff) !important; */
}

.workout-plan-item ion-checkbox {
  margin-right: 12px;
  --size: 22px;
  /* Светлая тема для checkbox */
  --checkbox-background: var(--ion-color-light-tint);
  --border-color: var(--ion-color-medium-shade);
  --checkmark-color: var(--ion-color-primary-contrast, #ffffff);
  --checkbox-background-checked: var(--ion-color-primary);
  --border-color-checked: var(--ion-color-primary);
}

.ion-palette-dark .workout-plan-item ion-checkbox {
  /* Темная тема для checkbox */
  --checkbox-background: var(--ion-color-step-250, #3b3b3b);
  --border-color: var(--ion-color-step-500, #757575);
  /* --checkmark-color остается var(--ion-color-primary-contrast, #ffffff) */
  --checkbox-background-checked: var(--ion-color-primary-tint); /* Чуть светлее основного primary для темной темы */
  --border-color-checked: var(--ion-color-primary-tint);
}

.workout-plan-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
  /* Цвет текста для светлой темы уже должен быть нормальным */
   color: var(--ion-text-color);
}
.ion-palette-dark .workout-plan-name {
  color: var(--ion-color-light-contrast, #ffffff); /* Явно для темной темы */
}

.workout-plan-details {
  font-size: 13px;
  color: var(--ion-color-medium-shade); /* Для светлой темы */
  display: flex;
  align-items: center;
  gap: 4px; /* Расстояние между иконкой и текстом, и между элементами */
}
.ion-palette-dark .workout-plan-details {
  color: var(--ion-color-medium-tint); /* Для темной темы */
}
.workout-plan-details ion-icon {
  font-size: 14px; 
  /* Цвет иконок в деталях будет унаследован или можно задать явно */
  /* color: var(--ion-color-primary); */ /* Если хотим их в цвет акцента */
}

/* Обновленные стили для секции расписания */
.schedule-section {
  width: 100%;
  margin: 16px 0;
}

.schedule-section .section-title-main {
  font-size: 22px;
  margin-bottom: 20px;
  font-weight: 500;
  color: var(--ion-text-color, #333);
}

.schedule-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  height: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%);
}

.card-image {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.6;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header h3 {
  font-size: 20px;
  margin: 0 0 4px 0;
  color: white;
  font-weight: 600;
}

.card-header p {
  font-size: 14px;
  color: #cccccc;
  margin: 0;
}

.card-details {
  margin-top: 10px;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.detail-icon ion-icon {
  font-size: 18px;
  color: white;
}

.detail-icon.calendar {
  background-color: #5271ff;
}

.detail-icon.time {
  background-color: #4CAF50;
}

.detail-icon.flame {
  background-color: #FF9800;
}

.detail-row span {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.workout-complete-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.workout-complete-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.workout-complete-btn.completed {
  background: rgba(76, 175, 80, 0.9);
}

.workout-complete-btn ion-icon {
  font-size: 18px;
}

/* Темная тема для секции расписания */
.ion-palette-dark .schedule-section .section-title-main {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.ion-palette-dark .schedule-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.ion-palette-dark .no-workouts {
  color: var(--ion-color-medium-tint, #888);
}

.plan-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.plan-segment {
  width: 100%;
  max-width: 340px;
}
.meals-cards-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.meal-item-dashboard {
  background: var(--ion-color-light-tint, #23232b);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(80,80,120,0.08);
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.meal-header-dashboard {
  display: flex;
  align-items: center;
  gap: 10px;
}
.meal-type-icon-dashboard {
  background: var(--ion-color-primary-tint, #e0e0ff);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.meal-name-dashboard {
  font-size: 16px;
  font-weight: 600;
}
.meal-nutrition-details-dashboard {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
}

.plan-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.plan-switcher-custom {
  display: flex;
  gap: 8px;
}
.plan-switcher-custom button {
  background: none;
  border: none;
  padding: 6px 18px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  color: var(--ion-color-medium-shade);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.plan-switcher-custom button.active {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast, #fff);
}

.loading-days {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin-top: 24px;
}

.loading-days ion-spinner {
  --color: var(--ion-color-primary);
}

/* Обновленные стили для секции расписания */
.schedule-section {
  width: 100%;
  margin: 16px 0;
}

/* Светлая тема */
:root .meal-item-dashboard {
  background: var(--ion-color-step-50, #f2f2f2); /* Более светлый фон */
  color: var(--ion-text-color, #333);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Раскидываем контент и чекбокс */
  gap: 12px; /* Немного увеличиваем gap */
}

/* Темная тема */
.ion-palette-dark .meal-item-dashboard {
  background: var(--ion-color-step-150, #262626); /* Более темный фон */
  color: var(--ion-text-color-rgb-contrast, #fff);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.meal-content-wrapper {
  display: flex;
  align-items: center;
  gap: 10px; /* Расстояние между иконкой и деталями */
  flex-grow: 1; /* Позволяет деталям занять доступное место */
}

/* Светлая тема */
:root .meal-icon-container {
  background: var(--ion-color-primary-tint, #e0e0ff);
  border-radius: 50%;
  width: 36px; /* Немного уменьшаем размер иконки */
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Темная тема */
.ion-palette-dark .meal-icon-container {
  background: var(--ion-color-primary-shade, #6f50d1); /* Более насыщенный цвет для темной темы */
}

/* Светлая тема */
:root .meal-item-icon {
  font-size: 20px; /* Уменьшаем размер иконки */
  color: var(--ion-color-primary, #8560ff);
}

/* Темная тема */
.ion-palette-dark .meal-item-icon {
   color: var(--ion-color-primary-contrast, #fff);
}

.meal-details {
  display: flex;
  flex-direction: column;
  gap: 4px; /* Уменьшаем расстояние между заголовком и деталями питания */
}

.meal-header-dashboard {
  /* Уже есть, возможно, потребуется небольшая корректировка отступов */
   margin-bottom: 0;
   gap: 0; /* Убираем gap, т.к. название - одна строка */
}

.meal-name-dashboard {
  font-size: 16px; /* Возвращаем стандартный размер названия */
  font-weight: 600;
  color: var(--ion-text-color, #333);
}
.ion-palette-dark .meal-name-dashboard {
   color: var(--ion-text-color-rgb-contrast, #fff);
}

.meal-nutrition-details-dashboard {
  display: flex;
  align-items: center;
  gap: 12px; /* Расстояние между элементами нутриентов */
  font-size: 13px; /* Уменьшаем размер текста */
  color: var(--ion-color-medium-shade, #999);
}
.ion-palette-dark .meal-nutrition-details-dashboard {
   color: var(--ion-color-medium-tint, #bbb);
}

.nutrition-item {
    display: flex;
    align-items: center;
    gap: 3px; /* Уменьшаем расстояние между иконкой/лейблом и значением */
}

.nutrition-icon {
  font-size: 16px;
  color: var(--ion-color-warning, #ffc409); /* Цвет для иконки калорий */
}

.nutrition-label {
  font-size: 10px; /* Уменьшаем размер лейбла БЖУ */
  font-weight: 600;
  width: 14px; /* Уменьшаем размер квадрата */
  height: 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.nutrition-item:nth-child(2) .nutrition-label { background-color: #4CAF50; /* Зеленый для Б */ }
.nutrition-item:nth-child(3) .nutrition-label { background-color: #FF9800; /* Оранжевый для Ж */ }
.nutrition-item:nth-child(4) .nutrition-label { background-color: #2196F3; /* Синий для У */ }

/* Стили для кнопки переключения статуса выполнения */
.meal-toggle-button {
    background: none; /* Убираем фон */
    border: 2px solid var(--ion-color-medium-shade); /* Рамка */
    border-radius: 8px; /* Скругляем углы */
    width: 30px; /* Фиксированный размер кнопки */
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0; /* Предотвращаем сжатие */
    padding: 0; /* Убираем внутренние отступы */
}

.ion-palette-dark .meal-toggle-button {
    border-color: var(--ion-color-medium-tint); /* Цвет рамки в темной теме */
}

.meal-toggle-button ion-icon {
    font-size: 18px; /* Размер иконки */
    color: transparent; /* По умолчанию иконка невидима */
    transition: color 0.2s ease;
}

/* Стили для выполненного состояния */
.meal-toggle-button.completed {
    background: var(--ion-color-success, #2fdd92); /* Зеленый фон при выполнении */
    border-color: var(--ion-color-success, #2fdd92); /* Зеленая рамка при выполнении */
}

.meal-toggle-button.completed ion-icon {
    color: var(--ion-color-success-contrast, #fff); /* Белая галочка при выполнении */
}

/* Ховер эффект */
:root .meal-toggle-button:hover {
   background: var(--ion-color-step-100, #e6e6e6);
}
.ion-palette-dark .meal-toggle-button:hover {
   background: var(--ion-color-step-200, #333333);
}

/* Эффект при нажатии */
.meal-toggle-button:active {
    transform: scale(0.95);
}


/* Стили для текста и иконок при выполненном состоянии */
.meal-item-dashboard.completed .meal-name-dashboard,
.meal-item-dashboard.completed .meal-nutrition-details-dashboard,
.meal-item-dashboard.completed .meal-nutrition-details-dashboard span {
  text-decoration: line-through;
  color: var(--ion-color-medium-shade, #999);
}

.ion-palette-dark .meal-item-dashboard.completed .meal-name-dashboard,
.ion-palette-dark .meal-item-dashboard.completed .meal-nutrition-details-dashboard,
.ion-palette-dark .meal-item-dashboard.completed .meal-nutrition-details-dashboard span {
  color: var(--ion-color-medium-tint, #bbb);
}

/* Иконки в выполненном состоянии */
.meal-item-dashboard.completed .meal-icon-container ion-icon {
   color: var(--ion-color-medium-shade, #999);
}

.ion-palette-dark .meal-item-dashboard.completed .meal-icon-container ion-icon {
   color: var(--ion-color-medium-tint, #bbb);
}

.meal-item-dashboard.completed .nutrition-icon {
   color: var(--ion-color-medium-shade, #999) !important;
}
.ion-palette-dark .meal-item-dashboard.completed .nutrition-icon {
   color: var(--ion-color-medium-tint, #bbb) !important;
}

.meal-item-dashboard.completed .nutrition-label {
   background-color: var(--ion-color-medium-shade, #999) !important;
}
.ion-palette-dark .meal-item-dashboard.completed .nutrition-label {
   background-color: var(--ion-color-medium-tint, #bbb) !important;
}

/* НОВЫЕ СТИЛИ ДЛЯ meal-item-dashboard-new */
:root .meal-item-dashboard-new {
    background: var(--ion-color-step-50, #f2f2f2);
    color: var(--ion-text-color, #333);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    padding: 14px 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.ion-palette-dark .meal-item-dashboard-new {
    background: var(--ion-color-step-150, #262626);
    color: var(--ion-text-color-rgb-contrast, #fff);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

:root .meal-item-dashboard-new:hover {
    background: var(--ion-color-step-100, #e6e6e6);
}
.ion-palette-dark .meal-item-dashboard-new:hover {
    background: var(--ion-color-step-200, #333333);
}

/* Стили для выполненного состояния самой карточки */
/* Стиль выполненного: нежная подсветка и чек-бейдж вместо заливки */
:root .meal-item-dashboard-new.completed {
   background: var(--ion-color-step-75, #ececec);
   border-color: rgba(76, 175, 80, 0.35);
   position: relative;
}
.ion-palette-dark .meal-item-dashboard-new.completed {
   background: var(--ion-color-step-200, #333333);
   border-color: rgba(76, 175, 80, 0.45);
}


/* Контейнер иконки приема пищи */
:root .meal-icon-container-new {
  background: var(--ion-color-primary-tint, #e0e0ff); /* Цвет фона иконки */
  border-radius: 10px; /* Скругляем углы, но не полностью */
  width: 48px; /* Увеличиваем размер */
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ion-palette-dark .meal-icon-container-new {
  background: var(--ion-color-primary-shade, #6f50d1);
}

/* Иконка самого приема пищи */
:root .meal-item-icon-new {
  font-size: 28px; /* Увеличиваем размер иконки */
  color: var(--ion-color-primary, #8560ff);
}
.ion-palette-dark .meal-item-icon-new {
   color: var(--ion-color-primary-contrast, #fff);
}

/* Блок с названием и деталями */
.meal-info-new { display:flex; flex-direction:column; gap:8px; }
.meal-info-header{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.meal-badges{ display:flex; align-items:center; gap:6px; }
.badge{ display:flex; align-items:center; gap:6px; background:rgba(0,0,0,.06); border:1px solid rgba(0,0,0,.08); border-radius:999px; padding:4px 8px; font-size:12px; }
.ion-palette-dark .badge{ background:#2b2b2e; border-color: rgba(255,255,255,.08); }
.badge.status.ok{ border-color:#2fdd92; background:rgba(47,221,146,.12); }
.badge.status.pending{ border-color:#999; }

/* Название приема пищи */
:root .meal-name-new {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color, #333);
}
.ion-palette-dark .meal-name-new {
   color: var(--ion-text-color-rgb-contrast, #fff);
}

/* Детали питания (БЖУК) */
.meal-nutrition-details-new {
  display: flex;
  align-items: center;
  gap: 10px; /* Расстояние между элементами нутриентов */
  font-size: 13px;
  color: var(--ion-color-medium-shade, #999);
}
.ion-palette-dark .meal-nutrition-details-new {
   color: var(--ion-color-medium-tint, #bbb);
}

.nutrition-item-new {
    display: flex;
    align-items: center;
    gap: 3px; /* Расстояние между иконкой/лейблом и значением */
}

.nutrition-icon-new {
  font-size: 16px;
  color: var(--ion-color-warning, #ffc409); /* Цвет для иконки калорий */
}

.nutrition-label-new {
  font-size: 11px;
  font-weight: 600;
  width: 18px; /* Немного увеличиваем размер квадрата */
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.nutrition-item-new:nth-child(2) .nutrition-label-new { background-color: #4CAF50; /* Зеленый для Б */ }
.nutrition-item-new:nth-child(3) .nutrition-label-new { background-color: #FF9800; /* Оранжевый для Ж */ }
.nutrition-item-new:nth-child(4) .nutrition-label-new { background-color: #2196F3; /* Синий для У */ }

/* Стили для кнопки переключения статуса выполнения */
.meal-toggle-button-new {
    background: none; /* Убираем фон по умолчанию */
    border: 2px solid var(--ion-color-medium-shade); /* Рамка */
    border-radius: 8px; /* Скругляем углы */
    width: 30px; /* Фиксированный размер кнопки */
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer; /* Указываем, что элемент кликабельный */
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;
}

.ion-palette-dark .meal-toggle-button-new {
    border-color: var(--ion-color-medium-tint); /* Цвет рамки в темной теме */
    background: var(--ion-color-step-200, #333333); /* Темный фон для кнопки в темной теме */
}

.meal-toggle-button-new ion-icon {
    font-size: 18px;
    color: transparent; /* По умолчанию иконка невидима */
    transition: color 0.2s ease;
}

/* Стили для выполненного состояния кнопки */
.meal-toggle-button-new.completed {
    background: var(--ion-color-success, #2fdd92); /* Зеленый фон при выполнении */
    border-color: var(--ion-color-success, #2fdd92); /* Зеленая рамка при выполнении */
}

.ion-palette-dark .meal-toggle-button-new.completed {
    background: var(--ion-color-success-shade, #29c786); /* Темный зеленый фон */
    border-color: var(--ion-color-success-tint, #38e09c); /* Рамка */
}

.meal-toggle-button-new.completed ion-icon {
    color: var(--ion-color-success-contrast, #fff); /* Белая галочка при выполнении */
}

/* Ховер эффект кнопки */
:root .meal-toggle-button-new:hover {
   background: var(--ion-color-step-100, #e6e6e6);
}
.ion-palette-dark .meal-toggle-button-new:hover {
   background: var(--ion-color-step-250, #3b3b3b);
}

/* Эффект при нажатии кнопки */
.meal-toggle-button-new:active {
    transform: scale(0.95);
}


/* Стили текста и иконок при выполненном состоянии */
/* Не перечёркиваем контент; используем более мягкую окраску */
.meal-item-dashboard-new.completed .meal-name-new,
.meal-item-dashboard-new.completed .meal-nutrition-details-new,
.meal-item-dashboard-new.completed .meal-nutrition-details-new span {
  opacity: .9;
}

.ion-palette-dark .meal-item-dashboard-new.completed .meal-name-new,
.ion-palette-dark .meal-item-dashboard-new.completed .meal-nutrition-details-new,
.ion-palette-dark .meal-item-dashboard-new.completed .meal-nutrition-details-new span {
  opacity: .95;
}

/* Иконки в выполненном состоянии */
/* Иконки остаются в обычном цвете */

/* Метки БЖУ без смены цвета при выполнении */

/* Превью продуктов в карточке питания */
.meal-items-preview{ margin-top:8px; display:flex; flex-direction:column; gap:8px; }
.meal-items-preview .mi{ display:flex; align-items:center; gap:10px; }
.meal-items-preview .mi-img{ width:28px; height:28px; border-radius:6px; object-fit:cover; background:rgba(0,0,0,.08); }
.meal-items-preview .mi-body{ display:flex; flex-direction:column; }
.meal-items-preview .mi-title{ font-size:13px; font-weight:600; }
.meal-items-preview .mi-sub{ font-size:12px; color: var(--ion-color-medium); }
.meal-items-preview .mi-more{ font-size:12px; color: var(--ion-color-medium); }

/* Пустой список */
.empty-list {
  text-align: center;
  color: var(--ion-color-medium);
  padding: 16px 0;
}
.ion-palette-dark .empty-list {
  color: var(--ion-color-medium-tint);
}

.default-avatar-icon {
  font-size: 40px;
  color: #8560ff;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 