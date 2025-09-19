// @ts-nocheck
<template>
  <ion-page>
    <ion-content>
      <div class="workouts-container">
        <!-- Заголовок и поиск -->
        <div class="header">
          <div class="title-section">
            <ion-icon :icon="fitnessOutline" class="header-icon"></ion-icon>
            <h1>Тренировки</h1>
          </div>
          <div class="search-bar">
            <ion-searchbar 
              v-model="searchQuery" 
              placeholder="Поиск тренировок" 
              animated
              :debounce="500"
              @ionInput="handleSearch"
            ></ion-searchbar>
          </div>
        </div>

        <!-- Прогресс недели -->
        <div class="weekly-progress">
          <div class="section-header">
            <div class="section-title">
              <ion-icon :icon="calendarOutline" class="section-icon"></ion-icon>
              <h2>Ваш прогресс по тренировкам</h2>
            </div>
          </div>
          
          <!-- НОВЫЙ UI недельного плана тренировок -->
          <div class="week-switcher">
            <div v-for="(dayLabel, idx) in weekLabels" 
                 :key="idx" 
                 class="week-day" 
                 :class="{active: idx === selectedDayIndex}" 
                 @click="selectWorkoutDay(idx)">
              <span class="week-day-label">{{ dayLabel }}</span>
              <span class="week-day-date">{{ weekDays && weekDays[idx] && weekDays[idx].date ? new Date(weekDays[idx].date).getDate() : '' }}</span>
            </div>
          </div>

          <!-- Отображение запланированных тренировок для выбранного дня -->
          <div v-if="selectedDay" class="planned-workouts-section">
            <h3 class="planned-title">Запланировано на {{ selectedDay.date ? formatDateForDisplay(selectedDay.date) : '' }}:</h3>
            <div v-if="!selectedDay.workouts || selectedDay.workouts.length === 0" class="empty-list">
              Нет запланированных тренировок на этот день.
            </div>
            <ion-list lines="none" class="planned-workouts-list" v-else>
              <ion-item-sliding v-for="workout_item in selectedDay.workouts" :key="workout_item.id" class="workout-plan-item-sliding">
                <ion-item class="workout-plan-item">
                  <ion-checkbox 
                    slot="start"
                    :checked="workout_item.completed" 
                    @ionChange="togglePlannedWorkout(workout_item.id)"
                    aria-label="Отметить выполнение"
                  ></ion-checkbox>
                  <ion-label>
                    <h4 class="workout-plan-name">{{ workout_item.name }}</h4>
                    <p class="workout-plan-details">
                      <span v-if="workout_item.durationMinutes"><ion-icon :icon="timeOutline"></ion-icon> {{ workout_item.durationMinutes }} мин | </span>
                      <span v-if="workout_item.caloriesBurned"><ion-icon :icon="flameOutline"></ion-icon> {{ workout_item.caloriesBurned }} ккал</span>
                    </p>
                  </ion-label>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" @click="removePlannedWorkout(workout_item.id)">
                    <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-list>
          </div>
          <!-- КОНЕЦ НОВОГО UI -->

          <!-- Переключатель режима добавления тренировок -->
          <!-- <div class="add-mode-switcher">
            <ion-segment v-model="workoutAddMode" value="singleDay">
              <ion-segment-button value="singleDay">
                <ion-label>На день</ion-label>
              </ion-segment-button>
              <ion-segment-button value="allWeek">
                <ion-label>На неделю</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div> -->

        </div>

        <!-- Рекомендуемые тренировки карусель -->
        <!-- Удаляем всю секцию -->

        <!-- Категории тренировок -->
        <div class="workout-categories">
          <div class="section-header">
            <div class="section-title">
              <ion-icon :icon="layersOutline" class="section-icon"></ion-icon>
              <h2>Категории</h2>
            </div>
          </div>
          
          <div class="categories-grid">
            <div class="category-card" v-for="category in categories" :key="category.name" :class="{ active: activeCategory === category.name }" @click="setCategory(category.name)">
              <ion-icon :icon="category.icon" class="category-icon"></ion-icon>
              <div class="category-name">{{ category.name }}</div>
            </div>
          </div>
        </div>

        <!-- Список тренировок -->
        <div class="workouts-list">
          <div class="section-header">
            <div class="section-title">
              <ion-icon :icon="listOutline" class="section-icon"></ion-icon>
              <h2>{{ activeCategory !== 'Все' ? activeCategory : 'Все тренировки' }}</h2>
            </div>
            <div class="sort-button">
              <ion-button fill="clear" size="small" @click="toggleSortMenu">
                <ion-icon :icon="optionsOutline"></ion-icon>
              </ion-button>
            </div>
          </div>
          
          <div v-if="isLoadingAll" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка тренировок...</p>
          </div>
          <div v-else-if="errorAll" class="error-container">
            <p>{{ errorAll }}</p>
          </div>
          <div v-else-if="filteredWorkouts.length === 0" class="empty-state">
            <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
            <p>Тренировки не найдены</p>
          </div>
          
          <div v-else>
            <div class="workout-card" v-for="workout in filteredWorkouts" :key="workout.id">
              <div class="workout-image">
                <img :src="workout.imageUrl" :alt="workout.name" />
                <div class="workout-actions">
                  <ion-button fill="clear" class="action-button favorite" @click.stop="toggleFavorite(workout)">
                    <ion-icon :icon="workout.isFavorite ? heart : heartOutline" slot="icon-only"></ion-icon>
                  </ion-button>
                </div>
              </div>
              <div class="workout-info">
                <h3>{{ workout.name }}</h3>
                <p>{{ workout.duration }} мин • {{ getExerciseCountDisplay(workout.exercises) }} упражнений</p>
                <div class="workout-details">
                  <div class="stats-row">
                    <div class="stat">
                      <ion-icon :icon="flameOutline"></ion-icon>
                      <span>{{ workout.caloriesBurned ?? 0 }} ккал</span>
                    </div>
                    <div class="stat">
                      <ion-icon :icon="barbellOutline"></ion-icon>
                      <span>{{ getFormattedDifficulty(workout.difficulty) }}</span>
                    </div>
                    <div class="stat">
                      <ion-icon :icon="pricetagOutline"></ion-icon>
                      <span>{{ getFormattedCategoryName(workout.type) }}</span>
                    </div>
                  </div>
                  <!-- <ion-button expand="block" class="start-button" @click.stop="startWorkout(workout)">
                    Начать
                  </ion-button> -->
                  <!-- Кнопка добавления в план для списка всех тренировок -->
                  <ion-button fill="outline" size="small" class="add-to-plan-button list-view" @click.stop="addWorkoutFromCatalogToPlan(workout)">
                    <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                    В план
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Всплывающее меню сортировки -->
      <ion-action-sheet
        :is-open="showSortMenu"
        header="Сортировать по"
        :buttons="sortOptions"
        @didDismiss="showSortMenu = false"
      ></ion-action-sheet>
      
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonButton,
  IonFab,
  IonFabButton,
  IonActionSheet,
  toastController,
  alertController,
  modalController,
  IonSpinner,
  IonList,
  IonItemSliding,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  actionSheetController
} from '@ionic/vue';
import { useRouter } from 'vue-router';
// import { Swiper, SwiperSlide } from 'swiper/vue'; // Закомментировано, если не используется
// import 'swiper/css'; // Закомментировано, если не используется
import { 
  fitnessOutline, 
  flameOutline, 
  barbellOutline,
  calendarOutline,
  starOutline,
  timeOutline,
  listOutline,
  layersOutline,
  optionsOutline,
  searchOutline,
  chevronForwardOutline,
  checkmarkOutline,
  heart,
  heartOutline,
  addCircleOutline,
  bicycleOutline,
  bodyOutline,
  walkOutline,
  barChartOutline,
  waterOutline,
  trashOutline,
  pricetagOutline
} from 'ionicons/icons';
// import { useUserStore } from '@/stores/user'; // Закомментировано или удалить, если не используется
import { WorkoutService, type WorkoutData as WorkoutListItem, type WorkoutExerciseData, type AddWorkoutToDayPlanRequest } from '@/services/workoutService'; // WorkoutData as WorkoutListItem
// import { useWeekPlan, type DayPlan, type Workout } from '@/composables/useWeekPlan'; // УДАЛЯЕМ useWeekPlan
import { v4 as uuidv4 } from 'uuid'; // Может понадобиться для временных ID, если API не дает ID для записей в плане

// Используем WorkoutData (переименован в WorkoutListItem) как основной тип для элементов списка каталога
// type WorkoutListItem = WorkoutData; // Уже сделано в импорте

const router = useRouter();
// const userStore = useUserStore(); // Если не используется, удалить
const workoutService = WorkoutService.getInstance();

// Состояние для поиска
const searchQuery = ref('');

// Состояние для категорий
const categories = ref([
  { name: 'Все', systemName: 'all', icon: listOutline },
  { name: 'Силовые', systemName: 'strength', icon: barbellOutline },
  { name: 'Кардио', systemName: 'cardio', icon: bicycleOutline },
  { name: 'HIIT', systemName: 'hiit', icon: bodyOutline }, 
  { name: 'Гибкость', systemName: 'flexibility', icon: walkOutline },
]);
const activeCategory = ref('Все');

// Состояние для списка всех тренировок (каталог)
const allWorkouts = ref<WorkoutListItem[]>([]);
const isLoadingAll = ref(false); // Для каталога
const errorAll = ref<string | null>(null); // Для каталога

// Состояние для сортировки
const showSortMenu = ref(false);
const currentSort = ref({ field: 'date', order: 'desc' }); // Поле 'date' может быть не у всех WorkoutListItem из каталога, уточнить
const sortOptions = [
  { text: 'По названию (А-Я)', handler: () => setSort('name', 'asc') },
  { text: 'По названию (Я-А)', handler: () => setSort('name', 'desc') },
  { text: 'По сложности', handler: () => setSort('difficulty', 'asc') },
  // { text: 'По дате (новые)', handler: () => setSort('date', 'desc') }, // Если 'date' это дата создания/публикации
  // { text: 'По дате (старые)', handler: () => setSort('date', 'asc') },
];


// --- Логика недельного плана тренировок ---
interface WorkoutInPlan extends WorkoutListItem { // Расширяем WorkoutListItem, т.к. запланированная тренировка - это та же тренировка + статус выполнения
  // id здесь будет ID самой тренировки из каталога, если API плана не возвращает отдельный ID для записи в плане.
  // Если API плана возвращает свой ID для записи, нужно будет изменить структуру.
  // Пока считаем, что workout.id из каталога используется для идентификации в плане на конкретный день.
  // completed уже есть в WorkoutListItem (WorkoutData) как опциональное поле.
}

interface DayWithWorkouts {
  date: string; // YYYY-MM-DD
  workouts: WorkoutInPlan[];
  isToday?: boolean;
}

const weekDays = ref<DayWithWorkouts[]>([]);
const selectedDayIndex = ref(0); // 0 для Понедельника - 6 для Воскресенья
const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const selectedDay = computed<DayWithWorkouts | null>(() => {
  if (selectedDayIndex.value >= 0 && selectedDayIndex.value < weekDays.value.length) {
    return weekDays.value[selectedDayIndex.value];
  }
  return null;
});

const isLoadingPlan = ref(false); // Отдельный лоадер для плана

// Вспомогательная функция для парсинга строки exercises, если это необходимо
function parseExercisesString(rawExercises: string | WorkoutExerciseData[]): WorkoutExerciseData[] {
  if (typeof rawExercises === 'string') {
    try {
      const parsed = JSON.parse(rawExercises);
      if (Array.isArray(parsed)) {
        return parsed.map(ex => ({
          ...ex,
          sets: Array.isArray(ex.sets) ? ex.sets : []
        }));
      }
      return [];
    } catch (e) {
      console.error('Failed to parse exercises string in WorkoutsPage:', rawExercises, e);
      return [];
    }
  } else {
    // Если это уже массив, просто возвращаем его (с проверкой)
    return Array.isArray(rawExercises) ? rawExercises : [];
  }
}

// Вспомогательная функция для получения количества упражнений
const getExerciseCountDisplay = (exercisesInput: string | WorkoutExerciseData[] | undefined): number => {
  if (!exercisesInput) return 0;
  if (Array.isArray(exercisesInput)) {
    return exercisesInput.length;
  }
  if (typeof exercisesInput === 'string') {
    try {
      const parsed = JSON.parse(exercisesInput);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch (e) {
      console.error("Failed to parse exercises string in getExerciseCountDisplay:", e);
      return 0;
    }
  }
  return 0;
};

// Функция для безопасного получения класса категории
const getCategoryClass = (workout: WorkoutListItem): string => {
  if (workout && typeof workout.type === 'string') { 
    return workout.type.toLowerCase();
  }
  return 'default-category';
};

const getFormattedCategoryName = (type: string | undefined): string => {
  if (!type) return 'Не указан';
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

const getFormattedDifficulty = (difficulty: string | undefined): string => {
  if (!difficulty) return 'Не указан';
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'Новичок';
    case 'intermediate':
      return 'Средний';
    case 'advanced':
      return 'Продвинутый';
    default:
      return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }
};

// Отфильтрованные и отсортированные тренировки (каталог)
const filteredWorkouts = computed(() => {
  let workoutsToFilter = allWorkouts.value;
  
  // Фильтрация по категории
  if (activeCategory.value !== 'Все') {
    const selectedCategoryObject = categories.value.find(cat => cat.name === activeCategory.value);
    if (selectedCategoryObject && selectedCategoryObject.systemName && selectedCategoryObject.systemName !== 'all') {
      const systemCategoryToFilter = selectedCategoryObject.systemName.toLowerCase();
      workoutsToFilter = workoutsToFilter.filter(w => 
        w.type && w.type.toLowerCase() === systemCategoryToFilter
      );
    }
  }
  
  // Фильтрация по поисковому запросу только если выбрана категория 'Все'
  if (activeCategory.value === 'Все' && searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase();
    workoutsToFilter = workoutsToFilter.filter(w => 
      (w.name && w.name.toLowerCase().includes(lowerQuery)) ||
      (w.type && w.type.toLowerCase().includes(lowerQuery)) ||
      (getFormattedCategoryName(w.type).toLowerCase().includes(lowerQuery)) ||
      (w.difficulty && getFormattedDifficulty(w.difficulty).toLowerCase().includes(lowerQuery))
    );
  }
  
  return [...workoutsToFilter].sort((a, b) => {
    const fieldA = a[currentSort.value.field as keyof WorkoutListItem];
    const fieldB = b[currentSort.value.field as keyof WorkoutListItem];

    if (fieldA == null && fieldB == null) return 0;
    if (fieldA == null) return currentSort.value.order === 'asc' ? -1 : 1;
    if (fieldB == null) return currentSort.value.order === 'asc' ? 1 : -1;

    let comparison = 0;
    // Более надежное сравнение для разных типов
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      comparison = fieldA.localeCompare(fieldB);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      comparison = fieldA - fieldB;
    } else if (typeof fieldA === 'boolean' && typeof fieldB === 'boolean') {
      comparison = (fieldA === fieldB) ? 0 : (fieldA ? -1 : 1);
    } else if (fieldA instanceof Date && fieldB instanceof Date) {
      comparison = fieldA.getTime() - fieldB.getTime();
    } else {
        // Попытка сравнить как строки, если типы разные или неизвестные
        comparison = String(fieldA).localeCompare(String(fieldB));
    }
    
    return currentSort.value.order === 'desc' ? comparison * -1 : comparison;
  });
});

// Методы для каталога
const loadAllWorkoutsCatalog = async () => { // Переименовано для ясности
  isLoadingAll.value = true;
  errorAll.value = null;
  try {
    const response = await workoutService.getAllWorkouts({ perPage: 100 }); // Загружаем больше, или добавить пагинацию
    if (response.success && response.data) {
      allWorkouts.value = response.data; 
    } else {
      errorAll.value = response.message || 'Не удалось загрузить список тренировок.';
      allWorkouts.value = []; 
    }
  } catch (err: any) {
    console.error('Ошибка загрузки всех тренировок:', err);
    errorAll.value = err.response?.data?.message || err.message || 'Произошла ошибка при загрузке тренировок.';
    allWorkouts.value = []; 
  } finally {
    isLoadingAll.value = false;
  }
};

const handleSearch = (event: CustomEvent) => {
  searchQuery.value = event.detail.value || '';
};

const setCategory = (categoryName: string) => {
  activeCategory.value = categoryName;
};

const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value;
};

const setSort = (field: string, order: 'asc' | 'desc') => {
  currentSort.value = { field, order };
  showSortMenu.value = false;
};

const navigateToCreateWorkout = () => {
  router.push('/create-workout'); // Или ваш путь к созданию тренировки
};

const openWorkoutDetails = (workoutId: string) => {
 router.push(`/workouts/${workoutId}`);
};

// --- Методы для недельного плана ---

const initializeWeekDays = () => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Вс) - 6 (Сб)
  const days: DayWithWorkouts[] = [];
  
  // Находим понедельник текущей недели
  let monday = new Date(today);
  monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));

  for (let i = 0; i < 7; i++) { // Только текущая неделя
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      workouts: [], 
      isToday: date.toDateString() === today.toDateString()
    });
  }
  // selectedDayIndex — индекс сегодняшнего дня в пределах недели
  selectedDayIndex.value = days.findIndex(d => d.isToday) !== -1 ? days.findIndex(d => d.isToday) : 0;
  weekDays.value = days;
};

const selectWorkoutDay = (dayIndex: number) => {
  selectedDayIndex.value = dayIndex;
  // Можно добавить здесь загрузку деталей дня, если getWorkoutPlan не загружает всё сразу
};

const formatDateForDisplay = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
};

const loadWorkoutPlan = async () => {
  isLoadingPlan.value = true;
  try {
    const response = await workoutService.getWorkoutPlan();
    // Перед обновлением, очистим существующие тренировки, но сохраним структуру дней
    weekDays.value.forEach(day => day.workouts = []);

    if (response.success && response.data) {
      response.data.forEach(plannedWorkoutFromApi => {
        // Убедимся, что plannedWorkoutFromApi.date существует
        if (!plannedWorkoutFromApi.date) {
          console.warn('Тренировка из API не содержит дату:', plannedWorkoutFromApi);
          return; // Пропускаем эту тренировку
        }

        // d.date уже в формате YYYY-MM-DD из initializeWeekDays
        // plannedWorkoutFromApi.date также в формате YYYY-MM-DD после mapRawWorkoutToWorkout
        const dayInPlan = weekDays.value.find(d => d.date === plannedWorkoutFromApi.date);

        if (dayInPlan) {
          dayInPlan.workouts.push({
            ...plannedWorkoutFromApi,
            exercises: parseExercisesString(plannedWorkoutFromApi.exercises),
          } as WorkoutInPlan);
    } else {
          // Логируем, если не найден соответствующий день в текущей настройке weekDays
          console.log(`Тренировка на дату ${plannedWorkoutFromApi.date} не добавлена. Нет соответствующего дня в weekDays.value.`);
          // Для детальной отладки выводим сравниваемые даты:
          console.log('Дата тренировки из API:', plannedWorkoutFromApi.date);
          console.log('Даты в текущем weekDays:', weekDays.value.map(wd => wd.date));
        }
      });
    } else {
      console.log('Не удалось загрузить план тренировок или данные не получены:', response.message || 'Нет данных');
    }
  } catch (error: any) {
    console.error('Ошибка загрузки плана тренировок:', error);
    await toastController.create({ 
      message: error.message || 'Ошибка загрузки плана тренировок.', 
      duration: 3000, 
      color: 'danger' 
    }).then(t => t.present());
  } finally {
    isLoadingPlan.value = false;
  }
};


const addWorkoutFromCatalogToPlan = async (workout: WorkoutListItem) => {
  if (!selectedDay.value || !selectedDay.value.date) {
    await toastController.create({
      message: 'Пожалуйста, выберите день в календаре для добавления тренировки.',
      duration: 3000,
      color: 'warning'
    }).then(toast => toast.present());
    return;
  }

  if (!workout || !workout.id) {
    console.error('Workout ID is missing in addWorkoutFromCatalogToPlan');
    toastController.create({
      message: 'Ошибка: ID тренировки не найден.',
      duration: 3000,
      color: 'danger'
    }).then(toast => toast.present());
    return;
  }

  const actionSheet = await actionSheetController.create({
    header: `Добавить "${workout.name}" в план?`,
    buttons: [
      {
        text: `На выбранный день (${formatDateForDisplay(selectedDay.value.date)})`,
        handler: async () => {
          try {
            const date = selectedDay.value!.date;

            if (!date) {
                await toastController.create({ message: 'Дата не выбрана.', duration: 2000, color: 'danger'}).then(t => t.present());
                return;
            }
            
            await workoutService.addWorkoutToDayPlan(date, { workout_id: workout.id! });
            await loadWorkoutPlan(); // Обновляем план после добавления

            await toastController.create({
              message: `Тренировка "${workout.name}" добавлена на ${formatDateForDisplay(selectedDay.value!.date)}.`,
              duration: 2000,
              color: 'success'
            }).then(toast => toast.present());
          } catch (error) {
            console.error('Ошибка при добавлении тренировки на день:', error);
            toastController.create({
              message: 'Не удалось добавить тренировку на выбранный день.',
              duration: 3000,
              color: 'danger'
            }).then(toast => toast.present());
          }
        }
      }, 
      {
        text: 'На всю текущую неделю',
        handler: async () => {
          // Здесь будет вызов функции добавления на всю неделю из useWeekPlan
          // Например: await addWorkoutToWholeWeek(workout.id!);
          // Пока заглушка:
          console.log(`Placeholder: Добавить тренировку ${workout.id} на всю неделю`);
          toastController.create({
            message: `Функция "Добавить на всю неделю" для "${workout.name}" еще не реализована.`,
            duration: 3000,
            color: 'medium'
          }).then(toast => toast.present());
          // try {
          //   // Предполагаем, что такая функция будет в useWeekPlan
          //   // await addWorkoutToWholeWeek(workout.id!); 
          //   toastController.create({
          //     message: `Тренировка "${workout.name}" добавлена на всю неделю.`,
          //     duration: 2000,
          //     color: 'success'
          //   }).then(toast => toast.present());
          // } catch (error) {
          //   console.error('Ошибка при добавлении тренировки на всю неделю:', error);
          //   toastController.create({
          //     message: 'Не удалось добавить тренировку на всю неделю.',
          //     duration: 3000,
          //     color: 'danger'
          //   }).then(toast => toast.present());
          // }
        }
      },
      {
        text: 'Отмена',
        role: 'cancel',
        data: {
          action: 'cancel'
        }
      }
    ]
  });
  await actionSheet.present();
};

const removePlannedWorkout = async (workoutIdInPlan?: string) => { 
  if (!selectedDay.value || !selectedDay.value.date || !workoutIdInPlan) return;
  
  const alert = await alertController.create({
    header: 'Удалить из плана',
    message: 'Вы уверены, что хотите удалить эту тренировку из плана на день?',
    buttons: [
      { text: 'Отмена', role: 'cancel' },
      {
        text: 'Удалить',
        handler: async () => {
          try {
            const date = selectedDay.value!.date;
            if (!date) {
              await toastController.create({ message: 'Ошибка: дата не определена.', duration: 2000, color: 'danger'}).then(t => t.present());
              return;
            }
            // Используем workoutService.removeWorkoutFromDayPlan(date, workoutIdInPlan)
            // Старый вызов removeWorkoutFromPlan(workoutIdInPlan) должен быть удален.
            await workoutService.removeWorkoutFromDayPlan(date, workoutIdInPlan); // 2 аргумента
            await loadWorkoutPlan(); 

            await toastController.create({
              message: 'Запрос на удаление отправлен (API заглушен).',
    duration: 2000,
              color: 'medium'
            }).then(t => t.present());
          } catch (error: any) {
             await toastController.create({
              message: error.message || 'Ошибка удаления тренировки из плана.',
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

const togglePlannedWorkout = async (workoutIdInPlan?: string) => { 
   if (!selectedDay.value || !selectedDay.value.date || !workoutIdInPlan) return;
   
   if (!selectedDay.value.workouts) { 
     await toastController.create({ message: 'Тренировки для выбранного дня не загружены.', duration: 3000, color: 'danger' }).then(t => t.present());
     return;
   }

   const workoutToToggle = selectedDay.value.workouts.find((w: WorkoutInPlan) => w.id === workoutIdInPlan);
   if (!workoutToToggle) {
     await toastController.create({ message: 'Тренировка не найдена в плане на этот день.', duration: 3000, color: 'danger' }).then(t => t.present());
     return;
   }

   try {
     const date = selectedDay.value.date;
     const newCompletedStatus = !workoutToToggle.completed;
    
     // Используем workoutService.markWorkoutInPlanAsComplete(date, workoutIdInPlan, newCompletedStatus)
     // Старый вызов toggleWorkoutCompletionInPlan(workoutIdInPlan) должен быть удален.
     await workoutService.markWorkoutInPlanAsComplete(date, workoutIdInPlan, newCompletedStatus); // 3 аргумента
     await loadWorkoutPlan(); 

     await toastController.create({
       message: newCompletedStatus ? 'Тренировка отмечена как выполненная.' : 'Тренировка отмечена как невыполненная.',
       duration: 2000,
       color: 'success'
     }).then(t => t.present());
   } catch (error: any) {
     await toastController.create({
        message: error.message || 'Ошибка обновления статуса тренировки.',
        duration: 3000,
        color: 'danger'
      }).then(t => t.present());
   }
};

const toggleFavorite = (workout: WorkoutListItem) => {
  // Implementation of toggleFavorite method
};

// Инициализация
onMounted(async () => {
  initializeWeekDays(); // Сначала инициализируем структуру дней
  await loadWorkoutPlan(); // Затем загружаем данные плана
  await loadAllWorkoutsCatalog(); // И каталог тренировок
});

// Если есть другие функции, использующие `workout.category.toLowerCase()`,
// их также нужно будет обновить для использования `getCategoryClass` или аналогичной проверки.
// Например, в `filteredWorkouts` при фильтрации по категории.

</script>

<style scoped>
/* Основные стили контейнера */
:root .workouts-container {
  padding: 16px;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  color: #333;
  min-height: 100%;
}

.ion-palette-dark .workouts-container {
  padding: 16px;
  background: linear-gradient(180deg, #121212 0%, #1a1a1a 100%);
  color: white;
  min-height: 100%;
}

/* Заголовок и поиск */
.header {
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.header-icon {
  font-size: 28px;
  margin-right: 12px;
  color: #8560ff;
}

:root .header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.ion-palette-dark .header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.search-bar {
  margin-bottom: 4px;
}

ion-searchbar {
  --background: rgba(240, 240, 240, 0.7);
  --border-radius: 12px;
  --box-shadow: none;
  --placeholder-color: #666;
  --icon-color: #8560ff;
  padding: 0;
}

.ion-palette-dark ion-searchbar {
  --background: rgba(40, 40, 40, 0.7);
  --placeholder-color: #aaa;
}

/* Общие стили для разделов */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
}

.section-icon {
  font-size: 22px;
  margin-right: 10px;
  color: #8560ff;
}

:root h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.ion-palette-dark h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.see-all-button {
  --color: #8560ff;
  font-size: 14px;
  font-weight: 500;
}

/* Прогресс недели */
:root .weekly-progress {
  background: rgba(240, 240, 240, 0.7);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.ion-palette-dark .weekly-progress {
  background: rgba(40, 40, 40, 0.7);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.completed-text {
  font-size: 14px;
  color: #8560ff;
  font-weight: 500;
}

.days-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: rgba(200, 200, 200, 0.3);
  color: #888;
  font-size: 14px;
  transition: all 0.3s ease;
}

.ion-palette-dark .day-circle {
  background: rgba(70, 70, 70, 0.3);
}

.day-item.completed .day-circle {
  background: #8560ff;
  color: white;
}

.day-name {
  font-size: 12px;
  color: #666;
}

.ion-palette-dark .day-name {
  color: #bbb;
}

.day-item.completed .day-name {
  color: #8560ff;
  font-weight: 600;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.ion-palette-dark .progress-stats {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #8560ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

.ion-palette-dark .stat-label {
  color: #bbb;
}

/* Рекомендуемые тренировки карусель */
.recommended-workouts {
  margin-bottom: 32px;
}

.workout-slides {
  margin: 0 -16px;
  padding: 0 16px 8px 16px;
}

.swiper-slide-item {
  padding: 0 5px;
}

.slide-card {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 4px 0;
}

.ion-palette-dark .slide-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Категории тренировок */
.workout-categories {
  margin-bottom: 24px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

:root .category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(240, 240, 240, 0.7);
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ion-palette-dark .category-card {
  background: rgba(40, 40, 40, 0.7);
}

.category-card.active {
  background: #8560ff;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #666;
}

.ion-palette-dark .category-icon {
  color: #bbb;
}

.category-card.active .category-icon {
  color: white;
}

.category-name {
  font-size: 12px;
  text-align: center;
  color: #666;
}

.ion-palette-dark .category-name {
  color: #bbb;
}

.category-card.active .category-name {
  color: white;
  font-weight: 500;
}

/* Список тренировок */
.workouts-list {
  margin-bottom: 16px;
}

.workout-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.ion-palette-dark .workout-card {
  background: #2a2a2a;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.workout-image {
  position: relative;
  height: 180px;
}

.workout-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.workout-actions {
  position: absolute;
  top: 12px;
  right: 12px;
}

.action-button {
  width: 36px; /* Задаем явную ширину */
  height: 36px; /* Задаем явную высоту, равную ширине для круга */
  --padding-start: 0; /* Убираем внутренние отступы */
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --border-radius: 50%;
  --background: rgba(0, 0, 0, 0.3);
  margin: 0;
  display: flex; /* Включаем flex для центрирования содержимого */
  align-items: center; /* Вертикальное центрирование иконки */
  justify-content: center; /* Горизонтальное центрирование иконки */
}

.action-button ion-icon {
  font-size: 20px;
  color: white;
}

.action-button.favorite ion-icon[icon="heart"] {
  color: #ff6b6b;
}

.workout-info {
  padding: 16px;
}

.workout-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.ion-palette-dark .workout-info h3 {
  color: white;
}

.workout-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.ion-palette-dark .workout-info p {
  color: #bbb;
}

.workout-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.ion-palette-dark .stat {
  color: #bbb;
}

.stat ion-icon {
  font-size: 16px;
  color: #8560ff;
}

.start-button {
  --background: linear-gradient(135deg, #8560ff 0%, #a474ff 100%);
  --border-radius: 10px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  font-weight: 600;
  margin: 0;
  min-height: 42px;
}

/* Стили для кнопки "Добавить в план" */
.add-to-plan-button {
  --border-color: var(--ion-color-primary);
  --color: var(--ion-color-primary);
  --border-radius: 10px;
  margin-top: 8px; /* Отступ сверху */
  font-weight: 500;
}

.add-to-plan-button.list-view {
  width: 100%; /* Растягиваем на всю ширину в списковом представлении */
}

.ion-palette-dark .add-to-plan-button {
  --border-color: var(--ion-color-primary-tint);
  --color: var(--ion-color-primary-tint);
}

/* Пустое состояние, когда нет результатов поиска */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
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
  color: #666;
}

/* Адаптивность для маленьких экранов */
@media (max-width: 360px) {
  .workouts-container {
    padding: 12px;
  }

  .header-icon {
    font-size: 24px;
  }

  .section-icon {
    font-size: 20px;
  }

  .days-progress {
    gap: 4px;
  }

  .day-circle {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .day-name {
    font-size: 10px;
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Адаптивность для планшетов */
@media (min-width: 768px) {
  .workouts-container {
    max-width: 768px;
    margin: 0 auto;
  }

  .categories-grid {
    grid-template-columns: repeat(7, 1fr);
  }

  .workouts-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .workout-card {
    margin-bottom: 0;
  }

  .progress-stats {
    justify-content: space-around;
  }
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  text-align: center;
}

/* Темная тема для добавленных продуктов */
.ion-palette-dark .added-product-item {
  background: rgba(255, 255, 255, 0.05);
}

.ion-palette-dark .added-product-item ion-thumbnail {
  background: rgba(255, 255, 255, 0.1);
}

/* Светлая тема для добавленных продуктов */
:root .added-product-item {
  background: rgba(0, 0, 0, 0.02);
}

:root .added-product-item ion-thumbnail {
  background: rgba(0, 0, 0, 0.05);
}

/* Стили для недельного плана (скопированы из NutritionPage и адаптированы) */
.week-switcher {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
  background-color: rgba(var(--ion-color-primary-rgb), 0.08); /* Фон для светлой темы */
  padding: 8px;
  border-radius: 10px;
}

.ion-palette-dark .week-switcher {
  background-color: rgba(var(--ion-color-primary-rgb), 0.15); /* Фон для темной темы */
}

.week-day {
  padding: 8px 4px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease, color 0.3s ease;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: var(--ion-color-medium-tint);
}

.week-day-label {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.week-day-date {
  font-size: 10px;
  color: var(--ion-color-medium-shade);
}

.ion-palette-dark .week-day-date {
  color: var(--ion-color-medium-tint);
}

.week-day.active {
  background-color: var(--ion-color-primary);
  color: white;
}

.week-day.active .week-day-date {
  color: rgba(255,255,255,0.8);
}

/* Стили для отображения запланированных тренировок */
.planned-workouts-section {
  margin-top: 20px;
  border-radius: 12px;
  /* box-shadow: 0 1px 3px rgba(0,0,0,0.05); */ /* Удаляем тень */
}
.ion-palette-dark .planned-workouts-section {
   /* box-shadow: 0 1px 3px rgba(0,0,0,0.1); */ /* Удаляем тень для темной темы */
}

.planned-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-list {
  text-align: center;
  color: var(--ion-color-medium);
  padding: 16px 0;
}

.planned-workouts-list {
  background: transparent;
  --ion-background-color: transparent;
  padding: 0;
}

.workout-plan-item-sliding {
  margin-bottom: 8px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.ion-palette-dark .workout-plan-item-sliding {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.workout-plan-item {
  --padding-start: 12px;
  --inner-padding-end: 12px;
  --background: var(--ion-color-light-contrast);
}
.ion-palette-dark .workout-plan-item {
  --background: var(--ion-color-step-150, #262626) !important; /* Темный фон для элемента списка */
  --color: var(--ion-color-light-contrast, #ffffff) !important; /* Светлый цвет текста по умолчанию для элемента */
}

.workout-plan-item ion-checkbox {
  margin-right: 12px;
  --size: 22px;
  --checkbox-background: var(--ion-color-light-tint);
  --border-color: var(--ion-color-medium-shade);
  --checkmark-color: var(--ion-color-primary-contrast, #ffffff); /* Цвет галочки для светлой темы */
  --checkbox-background-checked: var(--ion-color-primary);
  --border-color-checked: var(--ion-color-primary);
}

.ion-palette-dark .workout-plan-item ion-checkbox {
  --checkbox-background: var(--ion-color-step-250, #3b3b3b);
  --border-color: var(--ion-color-step-500, #757575);
  --checkmark-color: var(--ion-color-primary-contrast, #ffffff); /* Цвет галочки для темной темы */
  --checkbox-background-checked: var(--ion-color-primary-tint);
  --border-color-checked: var(--ion-color-primary-tint);
}

.workout-plan-name {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
  color: var(--ion-color-dark-contrast, var(--ion-text-color)); /* Цвет текста для темной темы */
}
.ion-palette-dark .workout-plan-name {
  color: var(--ion-color-light-contrast, #ffffff);
}

.workout-plan-details {
  font-size: 13px;
  color: var(--ion-color-medium-shade);
  display: flex;
  align-items: center;
  gap: 4px;
}
.ion-palette-dark .workout-plan-details {
  color: var(--ion-color-medium-tint);
}
.workout-plan-details ion-icon {
  font-size: 14px; /* Чуть меньше основного текста */
}

/* Стили для переключателя режима добавления */
/* <div class="add-mode-switcher">
  <ion-segment v-model="workoutAddMode" value="singleDay">
    <ion-segment-button value="singleDay">
      <ion-label>На день</ion-label>
    </ion-segment-button>
    <ion-segment-button value="allWeek">
      <ion-label>На неделю</ion-label>
    </ion-segment-button>
  </ion-segment>
</div> */

</style> 