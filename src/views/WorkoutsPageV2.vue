<!-- @ts-nocheck -->
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="workouts-v2-container">
        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-title">
            <div class="title-with-icon">
              <ion-icon :icon="fitnessOutline" class="header-icon"></ion-icon>
              <h1>Тренировки</h1>
            </div>
          </div>

          <!-- Кастомные фильтры в статус-баре -->
          <div class="status-icons">
            <!-- Фильтр сложности -->
            <div class="filter-chip difficulty-chip" @click="showDifficultyPopover">
              <ion-icon :icon="speedometerOutline" class="chip-icon"></ion-icon>
              <span class="chip-text">{{ getDifficultyLabel(filters.difficulty_level) }}</span>
              <ion-icon :icon="chevronDownOutline" class="chip-arrow"></ion-icon>
            </div>

            <!-- Фильтр по полу -->
            <div id="gender-chip" class="filter-chip gender-chip" @click="showGenderPopover">
              <ion-icon :icon="'person-outline'" class="chip-icon"></ion-icon>
              <span class="chip-text">{{ getGenderLabel(filters.gender) }}</span>
              <ion-icon :icon="chevronDownOutline" class="chip-arrow"></ion-icon>
            </div>

            <!-- Фильтр бесплатных -->
            <div
              class="filter-chip free-chip"
              :class="{ 'active': filters.is_free }"
              @click="toggleFreeFilter"
            >
              <ion-icon :icon="giftOutline" class="chip-icon"></ion-icon>
            </div>
          </div>
        </div>





        <!-- Categories Section -->
        <div v-if="!selectedCategory && !selectedProgram" class="categories-section" style="padding: 16px;">
          <div v-if="categoriesLoading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка категорий...</p>
          </div>

          <div v-else-if="categoriesError" class="error-container">
            <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
            <p>{{ categoriesError }}</p>
            <ion-button @click="loadCategories" fill="clear">Повторить</ion-button>
          </div>

          <div v-else class="categories-list">
            <div
              v-for="category in filteredCategories"
              :key="category.id"
              class="category-item"
              @click="selectCategory(category)"
            >
              <div class="category-content">
                <span class="category-name">{{ category.name }}</span>
                <span class="programs-count" v-if="category.workout_programs">
                  {{ category.workout_programs.length }}
                </span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="arrow-icon"></ion-icon>
            </div>
          </div>
        </div>

        <!-- Programs Section -->
        <div v-if="selectedCategory && !selectedProgram" class="programs-section" style="padding: 16px;">
          <div class="back-navigation">
            <ion-button fill="clear" @click="backToCategories">
              <ion-icon :icon="chevronBackOutline" slot="start"></ion-icon>
              Назад к категориям
            </ion-button>
          </div>

          <div v-if="programsLoading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка программ...</p>
          </div>

          <div v-else-if="programsError" class="error-container">
            <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
            <p>{{ programsError }}</p>
            <ion-button @click="loadPrograms" fill="clear">Повторить</ion-button>
          </div>

          <div v-else>
            <div class="section-title">
              <ion-icon :icon="listOutline" color="primary"></ion-icon>
              <h2>{{ selectedCategory.name }}</h2>
            </div>
            <p class="section-description">{{ selectedCategory.description }}</p>

            <div class="programs-list">
              <div
                v-for="program in programs"
                :key="program.id"
                class="program-card"
                :class="{
                  'program-active': getProgramActiveStatus(program),
                  'program-completed': getProgramCompletedStatus(program)
                }"
                @click="selectProgram(program)"
              >
                <div class="program-header">
                  <div class="program-title-row">
                    <h3 class="program-title">{{ program.name }}</h3>
                  </div>
                </div>

                <div class="program-body">
                  <p class="program-description">{{ program.short_description }}</p>

                  <div class="program-footer">
                    <div class="program-badges">
                      <span class="difficulty-badge" :class="program.difficulty_level">
                        <ion-icon :icon="speedometerOutline"></ion-icon>
                        {{ workoutService.getDifficultyDisplayName(program.difficulty_level) }}
                      </span>
                      <span v-if="getProgramActiveStatus(program)" class="status-badge in-progress">
                        <ion-icon :icon="playCircleOutline"></ion-icon>
                        В процессе
                      </span>
                      <span v-else-if="getProgramCompletedStatus(program)" class="status-badge completed">
                        <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                        Завершена
                      </span>
                    </div>

                    <div class="program-stats">
                      <div class="stat-item">
                        <ion-icon :icon="calendarOutline" class="stat-icon"></ion-icon>
                        <span>{{ program.duration_weeks }} нед</span>
                      </div>
                      <div class="stat-item">
                        <ion-icon :icon="flameOutline" class="stat-icon"></ion-icon>
                        <span>{{ program.calories_per_workout }} ккал</span>
                      </div>
                    </div>

                    <div class="program-actions">
                      <ion-button fill="solid" @click.stop="startProgram(program)" class="program-start-btn">
                        <ion-icon :icon="getProgramButtonIcon(program)" slot="start"></ion-icon>
                        {{ getProgramButtonText(program) }}
                      </ion-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="programsPagination && programsPagination.last_page > 1" class="pagination-section">
              <ion-button
                fill="clear"
                :disabled="programsPagination.current_page === 1"
                @click="loadProgramsPage(programsPagination.current_page - 1)"
              >
                <ion-icon :icon="chevronBackOutline"></ion-icon>
              </ion-button>

              <span class="pagination-info">
                {{ programsPagination.current_page }} из {{ programsPagination.last_page }}
              </span>

              <ion-button
                fill="clear"
                :disabled="programsPagination.current_page === programsPagination.last_page"
                @click="loadProgramsPage(programsPagination.current_page + 1)"
              >
                <ion-icon :icon="chevronForwardOutline"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Program Detail Section -->
        <div v-if="selectedProgram" class="program-detail-section">
          <!-- Hero Header -->
          <div class="program-hero">
            <div class="hero-background">
              <div class="hero-overlay"></div>
              <div class="hero-pattern"></div>
            </div>

            <div class="hero-content">
              <div class="hero-nav">
                <ion-button fill="clear" @click="backToPrograms" class="back-btn">
                  <ion-icon :icon="chevronBackOutline" slot="start"></ion-icon>
                  Назад к программам
                </ion-button>
              </div>

              <div class="hero-main">
                <div class="hero-image-container">
                  <div class="hero-image">
                    <img
                      v-if="workoutService.hasThumbnail(selectedProgram)"
                      :src="getThumbnailUrl(selectedProgram)"
                      :alt="selectedProgram.name"
                      @error="onImageError"
                    />
                    <div v-else class="hero-placeholder">
                      <ion-icon :icon="fitnessOutline"></ion-icon>
                    </div>
                  </div>
                  <div class="hero-image-glow"></div>
                </div>

                <div class="hero-info">
                  <div class="program-badges">
                    <span class="difficulty-badge" :class="selectedProgram.difficulty_level">
                      <ion-icon :icon="speedometerOutline"></ion-icon>
                      {{ workoutService.getDifficultyDisplayName(selectedProgram.difficulty_level) }}
                    </span>
                    <span v-if="selectedProgram.is_free" class="free-badge">
                      <ion-icon :icon="giftOutline"></ion-icon>
                      Бесплатно
                    </span>
                  </div>

                  <h1 class="program-title">{{ selectedProgram.name }}</h1>

                  <p class="program-subtitle">{{ selectedProgram.short_description }}</p>

                  <div class="hero-stats">
                    <div class="stat-card">
                      <div class="stat-icon-wrapper">
                        <ion-icon :icon="calendarOutline"></ion-icon>
                      </div>
                      <div class="stat-content">
                        <span class="stat-value">{{ selectedProgram.duration_weeks }}</span>
                        <span class="stat-label">недель</span>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon-wrapper">
                        <ion-icon :icon="flameOutline"></ion-icon>
                      </div>
                      <div class="stat-content">
                        <span class="stat-value">{{ selectedProgram.calories_per_workout }}</span>
                        <span class="stat-label">ккал</span>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon-wrapper">
                        <ion-icon :icon="barbellOutline"></ion-icon>
                      </div>
                      <div class="stat-content">
                        <span class="stat-value">{{ selectedProgram.category?.name || 'Общая' }}</span>
                        <span class="stat-label">категория</span>
                      </div>
                    </div>
                  </div>

                  <div class="hero-actions">
                    <ion-button fill="solid" @click="startProgram(selectedProgram)" class="start-btn">
                      <ion-icon :icon="playOutline" slot="start"></ion-icon>
                      Начать программу
                    </ion-button>
                    <ion-button fill="outline" @click="toggleFavorite" class="favorite-btn">
                      <ion-icon :icon="heartOutline" slot="start"></ion-icon>
                      Добавить в избранное
                    </ion-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Program Content -->
          <div class="program-content">
            <!-- Description Section -->
            <div class="content-section">
              <div class="section-card">
                <div class="section-header">
                  <ion-icon :icon="informationCircleOutline"></ion-icon>
                  <h2>О программе</h2>
                </div>
                <div class="section-content">
                  <p class="program-description">{{ selectedProgram.description }}</p>
                </div>
              </div>
            </div>

            <!-- Exercises Section -->
            <div v-if="programExercises.length > 0" class="content-section">
              <div class="section-card">
                <div class="section-header">
                  <ion-icon :icon="listOutline"></ion-icon>
                  <h2>Упражнения в программе</h2>
                  <span class="exercise-count">{{ programExercises.length }} упражнений</span>
                </div>

                <div v-if="exercisesLoading" class="loading-section">
                  <ion-spinner name="crescent"></ion-spinner>
                  <p>Загрузка упражнений...</p>
                </div>

                <div v-else class="exercises-grid">
                  <div
                    v-for="(exercise, index) in programExercises"
                    :key="exercise.id"
                    class="exercise-card"
                    :style="{ '--delay': `${index * 0.1}s` }"
                  >
                    <div class="exercise-header">
                      <div class="exercise-number">{{ index + 1 }}</div>
                      <h4 class="exercise-title">{{ exercise.name }}</h4>
                      <div class="exercise-duration">
                        <ion-icon :icon="timeOutline"></ion-icon>
                        {{ formatDuration(exercise.duration_seconds) }}
                      </div>
                    </div>

                    <p class="exercise-description">{{ exercise.description }}</p>

                    <div class="exercise-details">
                      <div class="detail-row">
                        <div class="detail-item">
                          <ion-icon :icon="repeatOutline"></ion-icon>
                          <span>{{ exercise.sets }} подходов</span>
                        </div>
                        <div class="detail-item">
                          <ion-icon :icon="fitnessOutline"></ion-icon>
                          <span>{{ exercise.reps }} повторений</span>
                        </div>
                      </div>

                      <div class="detail-row" v-if="exercise.weight_kg || exercise.rest_seconds">
                        <div class="detail-item" v-if="exercise.weight_kg">
                          <ion-icon :icon="barbellOutline"></ion-icon>
                          <span>{{ exercise.weight_kg }} кг</span>
                        </div>
                        <div class="detail-item" v-if="exercise.rest_seconds">
                          <ion-icon :icon="timeOutline"></ion-icon>
                          <span>{{ formatDuration(exercise.rest_seconds) }} отдых</span>
                        </div>
                      </div>
                    </div>

                    <div class="exercise-tags">
                      <div v-if="exercise.muscle_groups.length > 0" class="tag-group">
                        <div class="tag-list">
                          <span
                            v-for="muscle in exercise.muscle_groups.slice(0, 3)"
                            :key="muscle"
                            class="muscle-tag"
                          >
                            {{ muscle }}
                          </span>
                          <span v-if="exercise.muscle_groups.length > 3" class="more-tag">
                            +{{ exercise.muscle_groups.length - 3 }}
                          </span>
                        </div>
                      </div>

                      <div v-if="exercise.equipment_needed.length > 0" class="tag-group">
                        <div class="tag-list">
                          <span
                            v-for="equipment in exercise.equipment_needed.slice(0, 2)"
                            :key="equipment"
                            class="equipment-tag"
                          >
                            {{ equipment }}
                          </span>
                          <span v-if="exercise.equipment_needed.length > 2" class="more-tag">
                            +{{ exercise.equipment_needed.length - 2 }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div v-if="workoutService.hasVideo(exercise)" class="exercise-actions">
                      <ion-button fill="outline" size="small" @click="openExerciseVideo(exercise)" class="video-btn">
                        <ion-icon :icon="videocamOutline" slot="start"></ion-icon>
                        Видео
                      </ion-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div v-if="!selectedCategory && !selectedProgram" class="progress-section" style="padding: 16px;">
          <div class="section-header">
            <h2>Ваш прогресс</h2>
            <p class="section-description">Отслеживайте свои достижения</p>
          </div>

          <div v-if="progressLoading" class="loading-section">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка прогресса...</p>
          </div>

          <div v-else-if="progressError" class="error-section">
            <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
            <p>{{ progressError }}</p>
          </div>

          <div v-else-if="userProgress.length === 0" class="empty-progress">
            <ion-icon :icon="trophyOutline" class="empty-icon"></ion-icon>
            <h3>Начните свою первую тренировку!</h3>
            <p>Выберите программу выше и начните путь к здоровью</p>
          </div>

          <div v-else class="progress-stats">
            <div class="stat-card">
              <ion-icon :icon="fitnessOutline"></ion-icon>
              <div class="stat-content">
                <span class="stat-value">{{ totalWorkouts }}</span>
                <span class="stat-label">Тренировок</span>
              </div>
            </div>
            <div class="stat-card">
              <ion-icon :icon="timeOutline"></ion-icon>
              <div class="stat-content">
                <span class="stat-value">{{ totalDuration }}</span>
                <span class="stat-label">Минут</span>
              </div>
            </div>
            <div class="stat-card">
              <ion-icon :icon="flameOutline"></ion-icon>
              <div class="stat-content">
                <span class="stat-value">{{ totalCalories }}</span>
                <span class="stat-label">Ккал сожжено</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gender Popover -->
      <ion-popover :is-open="isGenderPopoverOpen" :show-backdrop="true" @didDismiss="isGenderPopoverOpen = false">
        <ion-content>
          <ion-list>
            <ion-item button @click="setGender(undefined)">
              <ion-label>Все</ion-label>
              <ion-icon :icon="'checkmark-outline'" v-if="!filters.gender" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="setGender(WorkoutGender.MALE)">
              <ion-label>Мужские</ion-label>
              <ion-icon :icon="'checkmark-outline'" v-if="filters.gender === WorkoutGender.MALE" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="setGender(WorkoutGender.FEMALE)">
              <ion-label>Женские</ion-label>
              <ion-icon :icon="'checkmark-outline'" v-if="filters.gender === WorkoutGender.FEMALE" slot="end"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonList,
  IonPopover,
  toastController,
  alertController,
  modalController,
  popoverController
} from '@ionic/vue';
import {
  fitnessOutline,
  filterOutline,
  alertCircleOutline,
  chevronBackOutline,
  calendarOutline,
  flameOutline,
  barbellOutline,
  informationCircleOutline,
  playOutline,
  chevronForwardOutline,
  timeOutline,
  giftOutline,
  videocamOutline,
  trophyOutline,
  maleOutline as maleIcon,
  femaleOutline as femaleIcon,
  layersOutline,
  listOutline,
  speedometerOutline,
  chevronDownOutline,
  arrowForwardOutline,
  heartOutline,
  repeatOutline,
  playCircleOutline,
  checkmarkCircleOutline,
  personOutline,
  checkmarkOutline

} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {
  type WorkoutCategory,
  type WorkoutProgram,
  type WorkoutExercise,
  type PaginatedResponse,
  type CreateWorkoutProgressDTO,
  type UserWorkoutProgress,
  WorkoutDifficulty,
  WorkoutGender
} from '@/types/workout';
import { WorkoutServiceV2 } from '@/services/workoutServiceV2';
import DifficultyPopover from '@/components/DifficultyPopover.vue';

// Регистрируем недостающие иконки
addIcons({
  'person-outline': personOutline,
  'checkmark-outline': checkmarkOutline
});

// Service instance
const workoutService = WorkoutServiceV2.getInstance();
const userStore = useUserStore();
const router = useRouter();

// Reactive state
const showFilters = ref(false);
const categoriesLoading = ref(false);
const categoriesError = ref<string | null>(null);
const programsLoading = ref(false);
const programsError = ref<string | null>(null);
const exercisesLoading = ref(false);
const progressLoading = ref(false);
const progressError = ref<string | null>(null);

// Data
const categories = ref<WorkoutCategory[]>([]);
const programs = ref<WorkoutProgram[]>([]);
const programsPagination = ref<PaginatedResponse<WorkoutProgram> | null>(null);
const programExercises = ref<WorkoutExercise[]>([]);
const userProgress = ref<UserWorkoutProgress[]>([]);
const activeWorkouts = ref<UserWorkoutProgress[]>([]);

// Navigation state
const selectedCategoryId = ref<string | null>(null);
const selectedCategory = ref<WorkoutCategory | null>(null);
const selectedProgram = ref<WorkoutProgram | null>(null);

// User gender
const userGender = ref<'male' | 'female'>('male');

// Popover states
const isGenderPopoverOpen = ref(false);

// Filters
const filters = ref({
  difficulty_level: undefined as WorkoutDifficulty | undefined,
  is_free: false,
  gender: undefined as WorkoutGender | undefined
});

// Gender filter options
const genderOptions = [
  { value: undefined, label: 'Все' },
  { value: WorkoutGender.MALE, label: 'Мужские' },
  { value: WorkoutGender.FEMALE, label: 'Женские' }
];

// Computed properties
const totalWorkouts = computed(() => userProgress.value.length);

// Filtered categories based on user gender
const filteredCategories = computed(() => {
  console.log('WorkoutsPageV2: Filtering categories for gender:', userGender.value);
  console.log('WorkoutsPageV2: Total categories:', categories.value.length);

  const filtered = categories.value.filter(category => {
    // Show all categories if user gender is not determined
    if (!userGender.value) return true;

    // Show categories that match user gender
    const matches = category.gender === userGender.value;
    console.log(`WorkoutsPageV2: Category "${category.name}" gender "${category.gender}" matches "${userGender.value}": ${matches}`);
    return matches;
  });

  console.log('WorkoutsPageV2: Filtered categories count:', filtered.length);
  return filtered;
});

const totalDuration = computed(() => {
  return userProgress.value.reduce((total, progress) => {
    return total + (progress.duration_seconds || 0);
  }, 0);
});

const totalCalories = computed(() => {
  return userProgress.value.reduce((total, progress) => {
    // Assuming we can calculate calories based on exercises
    return total + (progress.calories_burned || 0);
  }, 0);
});

// Computed для проверки статусов программы
const getProgramStatus = (program: WorkoutProgram) => {
  const result = workoutService.isProgramStarted(program.id, activeWorkouts.value);
  console.log(`WorkoutsPageV2: Program ${program.id} (${program.name}) - isStarted:`, result);
  console.log(`WorkoutsPageV2: Active workouts count:`, activeWorkouts.value.length);
  return result;
};

const getProgramActiveStatus = (program: WorkoutProgram) => {
  const result = workoutService.isProgramActive(program.id, activeWorkouts.value);
  console.log(`WorkoutsPageV2: Program ${program.id} (${program.name}) - isActive:`, result);
  return result;
};

const getProgramCompletedStatus = (program: WorkoutProgram) => {
  const result = workoutService.isProgramCompleted(program.id, activeWorkouts.value);
  console.log(`WorkoutsPageV2: Program ${program.id} (${program.name}) - isCompleted:`, result);
  return result;
};

// Computed для получения текста кнопки
const getProgramButtonText = (program: WorkoutProgram) => {
  const isActive = getProgramActiveStatus(program);
  const isCompleted = getProgramCompletedStatus(program);

  if (isActive) return 'Продолжить тренировку';
  if (isCompleted) return 'Повторить тренировку';
  return 'Начать программу';
};

// Computed для получения иконки кнопки
const getProgramButtonIcon = (program: WorkoutProgram) => {
  const isActive = getProgramActiveStatus(program);
  const isCompleted = getProgramCompletedStatus(program);

  if (isActive) return playCircleOutline;
  if (isCompleted) return repeatOutline;
  return playOutline;
};

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const onFilterChange = () => {
  if (selectedCategory.value) {
    loadPrograms();
  }
};

// Custom filter methods
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'Новичок';
    case 'intermediate': return 'Средний';
    case 'advanced': return 'Продвинутый';
    default: return 'Все';
  }
};

const getGenderLabel = (gender: WorkoutGender | undefined) => {
  switch (gender) {
    case WorkoutGender.MALE: return 'Мужские';
    case WorkoutGender.FEMALE: return 'Женские';
    default: return 'Все';
  }
};

const getSubtitle = () => {
  let subtitle = '';
  if (filters.value.difficulty_level) {
    subtitle += `Уровень: ${getDifficultyLabel(filters.value.difficulty_level)}`;
  }
  if (filters.value.gender) {
    subtitle += subtitle ? ` • ${getGenderLabel(filters.value.gender)}` : getGenderLabel(filters.value.gender);
  }
  if (filters.value.is_free) {
    subtitle += subtitle ? ' • Бесплатные' : 'Бесплатные';
  }
  return subtitle || 'Выберите категорию тренировок';
};

const showDifficultyPopover = async (event: Event) => {
  const popover = await popoverController.create({
    component: DifficultyPopover,
    componentProps: {
      currentDifficulty: filters.value.difficulty_level
    },
    event: event,
    translucent: true,
    showBackdrop: true,
    cssClass: 'difficulty-popover'
  });

  await popover.present();

  const { data } = await popover.onWillDismiss();
  if (data) {
    filters.value.difficulty_level = data;
    onFilterChange();
  }
};

const showGenderPopover = () => {
  isGenderPopoverOpen.value = true;
};

const setGender = (gender: WorkoutGender | undefined) => {
  filters.value.gender = gender;
  onFilterChange();
  isGenderPopoverOpen.value = false;
};



// Load user gender
const loadUserGender = async () => {
  try {
    if (userStore.user?.gender) {
      userGender.value = userStore.user.gender;
      console.log('WorkoutsPageV2: User gender from profile:', userGender.value);
    } else {
      // Try to get gender from API if not in profile
      const genderResult = await userStore.getGender();
      if (genderResult.success && genderResult.data) {
        // API returns { gender: 'male' | 'female' }, so extract the gender field
        userGender.value = genderResult.data.gender;
        console.log('WorkoutsPageV2: User gender from API:', userGender.value);
      }
    }
  } catch (error) {
    console.error('WorkoutsPageV2: Error loading user gender:', error);
    // Default to male if can't determine
    userGender.value = 'male';
  }
};

const loadCategories = async () => {
  categoriesLoading.value = true;
  categoriesError.value = null;

  try {
    console.log('WorkoutsPageV2: Loading categories from API...');
    const params = filters.value.gender ? { gender: filters.value.gender } : {};
    const result = await workoutService.getWorkoutCategories(params);
    console.log('WorkoutsPageV2: Categories loaded:', result.length);
    console.log('WorkoutsPageV2: First category:', result[0]);
    categories.value = result;
  } catch (error: any) {
    categoriesError.value = error.message;
    console.error('WorkoutsPageV2: Error loading categories:', error);
  } finally {
    categoriesLoading.value = false;
  }
};

// Toggle free filter
const toggleFreeFilter = () => {
  filters.value.is_free = !filters.value.is_free;
  onFilterChange();
};

const selectCategory = async (category: WorkoutCategory) => {
  selectedCategoryId.value = category.id;
  selectedCategory.value = category;
  selectedProgram.value = null;
  await loadPrograms();
};

const backToCategories = () => {
  console.log('🔙 WorkoutsPageV2: backToCategories called');
  console.log('🔙 WorkoutsPageV2: Before reset:', {
    selectedCategoryId: selectedCategoryId.value,
    selectedCategory: selectedCategory.value?.name,
    selectedProgram: selectedProgram.value?.name
  });

  selectedCategoryId.value = null;
  selectedCategory.value = null;
  selectedProgram.value = null;
  programs.value = [];
  programExercises.value = [];

  console.log('✅ WorkoutsPageV2: backToCategories completed');
  console.log('✅ WorkoutsPageV2: After reset:', {
    selectedCategoryId: selectedCategoryId.value,
    selectedCategory: selectedCategory.value,
    selectedProgram: selectedProgram.value
  });
};

const loadPrograms = async (page = 1) => {
  if (!selectedCategory.value) return;

  programsLoading.value = true;
  programsError.value = null;

  try {
    console.log('WorkoutsPageV2: Loading programs for category:', selectedCategory.value.id);

    // Сначала попробуем получить программы из уже загруженных категорий
    let programsFromCategory = workoutService.getProgramsFromCategory(categories.value, selectedCategory.value.id);

    if (programsFromCategory.length > 0) {
      console.log('WorkoutsPageV2: Found programs in cached categories:', programsFromCategory.length);
      programs.value = programsFromCategory;
      programsPagination.value = {
        success: true,
        data: programsFromCategory,
        current_page: 1,
        last_page: 1,
        per_page: programsFromCategory.length,
        total: programsFromCategory.length
      };
    } else {
      // Если программ нет в кеше, загружаем с сервера
      console.log('WorkoutsPageV2: No cached programs, fetching from API');
      const params = {
        category_id: selectedCategory.value.id,
        difficulty_level: filters.value.difficulty_level,
        is_free: filters.value.is_free || undefined,
        per_page: 10
      };

      const result = await workoutService.getWorkoutPrograms({
        ...params,
        difficulty_level: filters.value.difficulty_level,
        is_free: filters.value.is_free || undefined,
        gender: filters.value.gender
      });
      programs.value = result.data;
      programsPagination.value = result;
    }

    console.log('WorkoutsPageV2: Programs loaded:', programs.value.length);
  } catch (error: any) {
    programsError.value = error.message;
    console.error('WorkoutsPageV2: Error loading programs:', error);
  } finally {
    programsLoading.value = false;
  }
};

const loadProgramsPage = (page: number) => {
  loadPrograms(page);
};

const selectProgram = async (program: WorkoutProgram) => {
  selectedProgram.value = program;
  await loadProgramExercises(program.id);
};

const backToPrograms = () => {
  console.log('🔙 WorkoutsPageV2: backToPrograms called');
  console.log('🔙 WorkoutsPageV2: Before reset:', {
    selectedProgram: selectedProgram.value?.name,
    programExercisesCount: programExercises.value.length
  });

  selectedProgram.value = null;
  programExercises.value = [];

  console.log('✅ WorkoutsPageV2: backToPrograms completed');
  console.log('✅ WorkoutsPageV2: After reset:', {
    selectedProgram: selectedProgram.value,
    programExercisesCount: programExercises.value.length
  });
};

const loadProgramExercises = async (programId: string) => {
  exercisesLoading.value = true;

  try {
    const result = await workoutService.getWorkoutExercisesByProgram(programId);
    programExercises.value = result;
  } catch (error: any) {
    console.error('Error loading exercises:', error);
    await toastController.create({
      message: 'Не удалось загрузить упражнения',
      duration: 3000,
      color: 'danger'
    }).then(toast => toast.present());
  } finally {
    exercisesLoading.value = false;
  }
};

const viewProgramDetails = (program: WorkoutProgram) => {
  selectProgram(program);
};

const startProgram = async (program: WorkoutProgram) => {
  try {
    console.log('WorkoutsPageV2: Starting/Continuing program:', program.name);

    const isActive = getProgramActiveStatus(program);
    const isCompleted = getProgramCompletedStatus(program);

    if (isActive) {
      // Продолжаем существующую тренировку
      await toastController.create({
        message: `🔄 Продолжаем тренировку "${program.name}"`,
        duration: 3000,
        color: 'primary'
      }).then(toast => toast.present());

      // Переходим на страницу тренировки для продолжения
      console.log('WorkoutsPageV2: Continuing active workout, navigating to session:', program.id);
      console.log('WorkoutsPageV2: Navigation URL:', `/workout-session/${program.id}`);
      router.push(`/workout-session/${program.id}`);

    } else if (isCompleted) {
      // Повторяем завершенную тренировку - создаем новую запись
      console.log('WorkoutsPageV2: Starting completed program again:', program.name);

      // Получаем первое упражнение программы
      let firstExerciseId = null;
      try {
        const exercises = await workoutService.getWorkoutExercisesByProgram(program.id);
        if (exercises && exercises.length > 0) {
          firstExerciseId = exercises[0].id;
          console.log('WorkoutsPageV2: First exercise found:', firstExerciseId);
        } else {
          console.warn('WorkoutsPageV2: No exercises found for program:', program.id);
        }
      } catch (error) {
        console.warn('WorkoutsPageV2: Could not load exercises for program:', program.id, error);
        // Продолжаем без firstExerciseId
      }

      // Создаем новую запись прогресса
      const progressData: CreateWorkoutProgressDTO = {
        program_id: program.id,
        exercise_id: firstExerciseId || 'default-exercise-id',
        sets_completed: 0,
        reps_completed: 0,
        weight_used: 0,
        duration_seconds: 0,
        notes: `Повтор тренировки: ${program.name}`
      };

      console.log('WorkoutsPageV2: Creating progress with data:', progressData);

      try {
        const progressResult = await workoutService.startWorkoutProgress(progressData);
        console.log('WorkoutsPageV2: Workout progress created (repeat):', progressResult);

        if (progressResult) {
          // Обновляем список активных тренировок
          await loadActiveWorkouts();

          // Показываем успешное сообщение
          await toastController.create({
            message: `🔄 Тренировка "${program.name}" начата заново!`,
            duration: 3000,
            color: 'success'
          }).then(toast => toast.present());
        } else {
          throw new Error('Не удалось создать запись прогресса');
        }
      } catch (progressError: any) {
        console.error('WorkoutsPageV2: Error creating progress:', progressError);
        await toastController.create({
          message: progressError.message || 'Не удалось начать тренировку',
          duration: 4000,
          color: 'danger'
        }).then(toast => toast.present());
        return;
      }

    } else {
      // Начинаем новую тренировку впервые
      // Получаем первое упражнение программы
      let firstExerciseId = null;
      try {
        const exercises = await workoutService.getWorkoutExercisesByProgram(program.id);
        if (exercises && exercises.length > 0) {
          firstExerciseId = exercises[0].id;
        }
      } catch (error) {
        console.warn('WorkoutsPageV2: Could not load exercises for program:', program.id);
        // Продолжаем без firstExerciseId
      }

      // Создаем запись прогресса
      const progressData: CreateWorkoutProgressDTO = {
        program_id: program.id,
        exercise_id: firstExerciseId || 'default-exercise-id',
        sets_completed: 0,
        reps_completed: 0,
        weight_used: 0,
        duration_seconds: 0,
        notes: `Начата тренировка: ${program.name}`
      };

      const progressResult = await workoutService.startWorkoutProgress(progressData);
      console.log('WorkoutsPageV2: Workout progress created:', progressResult);

      // Обновляем список активных тренировок
      await loadActiveWorkouts();

      // Показываем успешное сообщение
      await toastController.create({
        message: `🎯 Тренировка "${program.name}" начата!`,
        duration: 3000,
        color: 'success'
      }).then(toast => toast.present());

      // Переходим на страницу тренировки
      console.log('WorkoutsPageV2: Navigating to workout session:', program.id);
      console.log('WorkoutsPageV2: Navigation URL:', `/workout-session/${program.id}`);
      router.push(`/workout-session/${program.id}`);
    }

  } catch (error: any) {
    console.error('WorkoutsPageV2: Error starting program:', error);

    // Показываем сообщение об ошибке
    await toastController.create({
      message: error.message || 'Не удалось начать тренировку',
      duration: 4000,
      color: 'danger'
    }).then(toast => toast.present());
  }
};

const loadUserProgress = async () => {
  console.log('📊 WorkoutsPageV2: === STARTING loadUserProgress ===');
  progressLoading.value = true;
  progressError.value = null;

  try {
    console.log('📊 WorkoutsPageV2: Calling workoutService.getUserWorkoutProgress()');
    const result = await workoutService.getUserWorkoutProgress();
    console.log('📊 WorkoutsPageV2: getUserWorkoutProgress result:', result);
    console.log('📊 WorkoutsPageV2: Result type:', typeof result);
    console.log('📊 WorkoutsPageV2: Result is array:', Array.isArray(result));
    console.log('📊 WorkoutsPageV2: Result length:', result?.length || 0);

    if (result && result.length > 0) {
      console.log('📊 WorkoutsPageV2: First progress item:', result[0]);
    }

    userProgress.value = result;

    console.log('✅ WorkoutsPageV2: userProgress assigned successfully');
    console.log('✅ WorkoutsPageV2: userProgress.value.length:', userProgress.value?.length || 0);
    console.log('🎯 WorkoutsPageV2: === SUCCESS loadUserProgress ===');
  } catch (error: any) {
    console.error('❌ WorkoutsPageV2: Error in loadUserProgress:', error);
    progressError.value = error.message;
  } finally {
    progressLoading.value = false;
    console.log('🎯 WorkoutsPageV2: === FINISHED loadUserProgress ===');
  }
};

const loadActiveWorkouts = async () => {
  try {
    console.log('🚀 WorkoutsPageV2: === STARTING loadActiveWorkouts ===');
    console.log('WorkoutsPageV2: Loading active workouts...');

    const result = await workoutService.getActiveUserWorkouts();
    console.log('📊 WorkoutsPageV2: Raw API result:', result);
    console.log('📊 WorkoutsPageV2: Result type:', typeof result);
    console.log('📊 WorkoutsPageV2: Result is array:', Array.isArray(result));
    console.log('📊 WorkoutsPageV2: Result length:', result?.length || 0);

    if (result && result.length > 0) {
      console.log('📊 WorkoutsPageV2: First item in result:', result[0]);
      console.log('📊 WorkoutsPageV2: Last item in result:', result[result.length - 1]);
    }

    // Проверяем состояние перед присваиванием
    console.log('🔍 WorkoutsPageV2: activeWorkouts.value BEFORE assignment:', activeWorkouts.value);
    console.log('🔍 WorkoutsPageV2: activeWorkouts.value.length BEFORE:', activeWorkouts.value?.length || 0);

    activeWorkouts.value = result;

    console.log('✅ WorkoutsPageV2: Active workouts loaded:', result?.length || 0);
    console.log('✅ WorkoutsPageV2: activeWorkouts.value.length:', activeWorkouts.value?.length || 0);

    if (result && result.length > 0) {
      console.log('📋 WorkoutsPageV2: Processing workouts data:');
      result.forEach((workout, index) => {
        console.log(`🏋️ Workout ${index + 1}:`, {
          id: workout.id,
          program_id: workout.program_id,
          program_name: workout.program?.name,
          exercise_id: workout.exercise_id,
          exercise_name: workout.exercise?.name,
          completed_at: workout.completed_at,
          created_at: workout.created_at,
          notes: workout.notes
        });
      });
    } else {
      console.log('⚠️ WorkoutsPageV2: No workouts data received or empty array');
    }

    console.log('🎯 WorkoutsPageV2: === FINISHED loadActiveWorkouts ===');
  } catch (error: any) {
    console.error('❌ WorkoutsPageV2: Error loading active workouts:', error);
    console.error('❌ WorkoutsPageV2: Error details:', error.response?.data || error.message);

    // Показываем ошибку пользователю для отладки
    await toastController.create({
      message: `Ошибка загрузки прогресса: ${error.message}`,
      duration: 5000,
      color: 'danger'
    }).then(toast => toast.present());

    // Не выбрасываем ошибку, просто продолжаем без активных тренировок
  }
};

const getThumbnailUrl = (program: WorkoutProgram): string => {
  return workoutService.getThumbnailUrl(program) || '/assets/images/program-placeholder.jpg';
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const openVideo = (videoUrl: string) => {
  window.open(videoUrl, '_blank');
};

const openExerciseVideo = (exercise: WorkoutExercise) => {
  const videoUrl = workoutService.getVideoUrl(exercise);
  if (videoUrl) {
    window.open(videoUrl, '_blank');
  }
};

const toggleFavorite = async () => {
  // TODO: Implement favorite toggle logic
  await toastController.create({
    message: 'Функция избранного скоро будет доступна!',
    duration: 2000,
    color: 'primary'
  }).then(toast => toast.present());
};

// Lifecycle
onMounted(async () => {
  console.log('🚀 WorkoutsPageV2: === COMPONENT MOUNTED ===');
  console.log('WorkoutsPageV2: Starting to load data...');

  try {
    await Promise.all([
      loadUserGender(),
      loadCategories(),
      loadUserProgress(),
      loadActiveWorkouts()
    ]);

    console.log('✅ WorkoutsPageV2: All data loaded successfully');
    console.log('✅ WorkoutsPageV2: Final activeWorkouts state:', activeWorkouts.value);
    console.log('✅ WorkoutsPageV2: Final activeWorkouts length:', activeWorkouts.value?.length || 0);

    // Дополнительная проверка через setTimeout после загрузки всех данных
    setTimeout(() => {
      console.log('🎯 WorkoutsPageV2: FINAL CHECK - activeWorkouts.value:', activeWorkouts.value);
      console.log('🎯 WorkoutsPageV2: FINAL CHECK - activeWorkouts.value.length:', activeWorkouts.value?.length || 0);
    }, 500);
  } catch (error) {
    console.error('❌ WorkoutsPageV2: Error during component mount:', error);
  }

  console.log('🎯 WorkoutsPageV2: === COMPONENT MOUNT COMPLETE ===');
});
</script>

<style scoped>
/* Основные стили контейнера */
.workouts-v2-container {
  min-height: 100%;
}

/* Светлая тема */
:root .workouts-v2-container {
  background: linear-gradient(to bottom, #f5f7fa 0%, #ffffff 220px, #ffffff 100%);
  color: #333333;
}

/* Темная тема */
.ion-palette-dark .workouts-v2-container {
  background: linear-gradient(to bottom, #261c3a 0%, #1a191b 220px, #1a191b 100%);
  color: #ffffff;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-with-icon h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--ion-text-color, #333);
}

.ion-palette-dark .title-with-icon h1 {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.header-icon {
  font-size: 32px;
  color: var(--ion-color-primary, #8560ff);
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}





/* Filter Chips */
.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ion-palette-dark .filter-chip {
  background: rgba(40, 40, 40, 0.7);
  border-color: rgba(255, 255, 255, 0.1);
}

.filter-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-chip.active {
  background: var(--ion-color-primary, #8560ff);
  color: white;
  border-color: var(--ion-color-primary, #8560ff);
}

.chip-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.chip-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-arrow {
  font-size: 12px;
  opacity: 0.7;
  flex-shrink: 0;
}

.difficulty-chip {
  min-width: 100px;
  justify-content: space-between;
}

.gender-chip {
  min-width: 90px;
  justify-content: space-between;
}

.free-chip {
  padding: 8px;
  min-width: 36px;
  justify-content: center;
}

/* Subtitle */
.subtitle {
  font-size: 14px;
  color: var(--ion-color-medium-shade);
  margin: 0;
  padding: 0 16px;
}

.ion-palette-dark .subtitle {
  color: var(--ion-color-medium-tint);
}

/* Difficulty Popover */
.difficulty-popover {
  --background: rgba(255, 255, 255, 0.95);
  --backdrop-opacity: 0.3;
  --border-radius: 12px;
  --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  --width: 200px;
}

.ion-palette-dark .difficulty-popover {
  --background: rgba(40, 40, 40, 0.95);
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-container p,
.error-container p {
  margin: 16px 0 0 0;
  color: var(--ion-color-medium-shade);
}

.ion-palette-dark .loading-container p,
.ion-palette-dark .error-container p {
  color: var(--ion-color-medium-tint);
}

/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-title h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--ion-text-color, #333);
}

.ion-palette-dark .section-title h2 {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.section-title ion-icon {
  font-size: 28px;
}

.section-description {
  font-size: 14px;
  color: var(--ion-color-medium-shade, #666);
  margin: 0 0 20px 0;
  line-height: 1.4;
  padding: 0 8px 8px;
}

.ion-palette-dark .section-description {
  color: var(--ion-color-medium-tint, #bbb);
}

/* Category List Items */
.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.category-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.ion-palette-dark .category-item:not(:last-child)::after {
  background: rgba(255, 255, 255, 0.1);
}

.category-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.ion-palette-dark .category-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}



/* Categories List Container */
.categories-list {
  background: rgb(92 72 131 / 20%);
  border-radius: 8px;
  overflow: hidden;
  margin: 0 8px;
}

.ion-palette-dark .categories-list {
  background: rgb(163 143 228 / 30%);
}

/* Category Content */
.category-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  margin-right: 12px;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color, #333);
  flex: 1;
}

.ion-palette-dark .category-name {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.arrow-icon {
  font-size: 18px;
  color: var(--ion-color-medium-shade);
  transition: transform 0.2s ease;
}

.category-item:hover .arrow-icon {
  transform: translateX(2px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-height: 60px;
}

/* Icon Wrappers */
.program-icon-wrapper {
  flex-shrink: 0;
}

.program-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.ion-palette-dark .program-icon {
  background: rgba(163, 143, 228, 0.3);
  color: #a38fe4;
}

.program-icon ion-icon {
  font-size: 18px;
}

/* Card Info */
.category-info,
.program-info {
  flex: 1;
  min-width: 0;
}

.category-info h3,
.program-info h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--ion-text-color, #333);
}

.ion-palette-dark .category-info h3,
.ion-palette-dark .program-info h3 {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.category-info p,
.program-description {
  font-size: 13px;
  color: var(--ion-color-medium-shade, #666);
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ion-palette-dark .category-info p,
.ion-palette-dark .program-description {
  color: var(--ion-color-medium-tint, #bbb);
}

/* Category Meta */
.category-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.gender-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.gender-badge ion-icon {
  font-size: 12px;
}

.gender-badge.male {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
}

.ion-palette-dark .gender-badge.male {
  background: rgba(0, 123, 255, 0.3);
}

.gender-badge.female {
  background: rgba(255, 105, 180, 0.2);
  color: #ff69b4;
}

.ion-palette-dark .gender-badge.female {
  background: rgba(255, 105, 180, 0.3);
}

.programs-count {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(133, 96, 255, 0.2);
  color: var(--ion-color-dark);
}

.ion-palette-dark .programs-count {
  background: rgba(163, 143, 228, 0.3);
}

.programs-count ion-icon {
  font-size: 11px;
}

/* Program Header */
.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.program-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

/* Difficulty Badge */
.difficulty-badge {
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  border: 1px solid transparent;
}

.difficulty-badge ion-icon {
  font-size: 12px;
}

.difficulty-badge.beginner {
  background: #E3F2FD;
  color: #1976D2;
  border-color: #1976D2;
}

.ion-palette-dark .difficulty-badge.beginner {
  background: #1E3A5F;
  color: #64B5F6;
  border-color: #64B5F6;
}

.difficulty-badge.intermediate {
  background: #FFF3E0;
  color: #F57C00;
  border-color: #F57C00;
}

.ion-palette-dark .difficulty-badge.intermediate {
  background: #4A3C1D;
  color: #FFB74D;
  border-color: #FFB74D;
}

.difficulty-badge.advanced {
  background: #FCE4EC;
  color: #C2185B;
  border-color: #C2185B;
}

.ion-palette-dark .difficulty-badge.advanced {
  background: #4A1C2A;
  color: #F06292;
  border-color: #F06292;
}



/* Program Meta */
.program-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ion-color-medium-shade, #666);
}

.ion-palette-dark .meta-item {
  color: var(--ion-color-medium-tint, #bbb);
}

.meta-item ion-icon {
  font-size: 16px;
  color: var(--ion-color-primary, #8560ff);
}

/* Arrow Icon */
.arrow-icon {
  font-size: 20px;
  color: var(--ion-color-medium-shade, #666);
  flex-shrink: 0;
}

.ion-palette-dark .arrow-icon {
  color: var(--ion-color-medium-tint, #bbb);
}

/* Back Navigation */
.back-navigation {
  margin-bottom: 20px;
}

.back-navigation ion-button {
  --color: var(--ion-color-primary);
  font-weight: 500;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-info {
  font-size: 14px;
  color: var(--ion-color-medium-shade, #666);
}

.ion-palette-dark .pagination-info {
  color: var(--ion-color-medium-tint, #bbb);
}

/* Filters Section */
.filters-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ion-palette-dark .filters-section {
  background: rgba(40, 40, 40, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group ion-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ion-text-color, #333);
}

.ion-palette-dark .filter-group ion-label {
  color: var(--ion-text-color-rgb-contrast, #fff);
}

.difficulty-segment {
  --background: rgba(255, 255, 255, 0.2);
  --background-checked: #ffd700;
  --color-checked: #333;
}

.ion-palette-dark .difficulty-segment {
  --background: rgba(40, 40, 40, 0.5);
}

/* Buttons */
ion-button {
  --border-radius: 12px;
  font-weight: 600;
}

ion-button[fill="solid"] {
  --background: linear-gradient(135deg, #8560ff 0%, #6b4aff 100%);
  --box-shadow: 0 4px 12px rgba(133, 96, 255, 0.3);
}

ion-button[fill="outline"] {
  --border-color: var(--ion-color-primary);
  --color: var(--ion-color-primary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .status-title h1 {
    font-size: 24px;
  }

  .section-title h2 {
    font-size: 20px;
  }

  .card-content {
    padding: 16px;
    gap: 12px;
  }

  .category-icon,
  .program-icon {
    width: 48px;
    height: 48px;
  }

  .category-icon ion-icon,
  .program-icon ion-icon {
    font-size: 24px;
  }

  .program-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .program-badges {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: flex-end;
  }

  .program-meta {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .program-footer .program-badges {
    gap: 6px;
  }

  .program-footer .program-badges .difficulty-badge {
    font-size: 11px;
    padding: 4px 8px;
  }

  .status-bar {
    flex-direction: row;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .status-title h1 {
    font-size: 20px;
  }

  .filters-section {
    padding: 16px;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .category-info,
  .program-info {
    text-align: center;
  }

  .category-meta {
    justify-content: center;
  }
}

/* Header Section */
.header-section {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 32px;
  color: #ffd700;
}

.title-section h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: white;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0 0;
}

.filter-button {
  --color: white;
  --background-hover: rgba(255, 255, 255, 0.1);
}

/* Filters Section */
.filters-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group ion-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.difficulty-segment {
  --background: rgba(255, 255, 255, 0.2);
  --background-checked: #ffd700;
  --color-checked: #333;
}

/* Section Headers */
.section-header {
  margin-bottom: 20px;
  text-align: center;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.section-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.back-button {
  margin-bottom: 16px;
  text-align: left;
}

.back-button ion-button {
  --color: white;
  font-weight: 500;
}

/* Loading and Error States */
.loading-section,
.error-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-section p,
.error-section p {
  margin: 16px 0 0 0;
  color: rgba(255, 255, 255, 0.8);
}

.error-icon {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 16px;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.category-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.category-card.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon ion-icon {
  font-size: 24px;
  color: #ffd700;
}

.category-badge {
  background: rgba(255, 215, 0, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.category-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.category-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.category-meta {
  display: flex;
  gap: 8px;
}

.gender-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.gender-badge.male {
  background: rgba(0, 123, 255, 0.3);
  color: #ffffff;
}

.gender-badge.female {
  background: rgba(255, 105, 180, 0.3);
  color: #ffffff;
}

/* Programs Grid */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.program-card {
  background: #ffffff;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.program-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
  transform: translateY(-1px);
}

.program-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.ion-palette-dark .program-card {
  background: #2a2a2a;
  border-color: #404040;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.ion-palette-dark .program-card:hover {
  border-color: #66BB6A;
  box-shadow: 0 4px 20px rgba(102, 187, 106, 0.2);
}

/* Program Header */
.program-header {
  padding: 16px 16px 0 16px;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
}

.ion-palette-dark .program-header {
  border-bottom-color: #404040;
}

.program-title-row {
  margin-bottom: 8px;
}

.program-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  line-height: 1.3;
  flex: 1;
}

.ion-palette-dark .program-title {
  color: #ffffff;
}

.program-badges {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
  z-index: 2;
}

/* Program Body */
.program-body {
  padding: 12px 16px 16px 16px;
}

.program-description {
  font-size: 14px;
  color: #666666;
  margin: 0 0 16px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ion-palette-dark .program-description {
  color: #cccccc;
}

/* Program Footer */
.program-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.program-footer .program-badges {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.program-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666666;
  font-weight: 500;
}

.ion-palette-dark .stat-item {
  color: #cccccc;
}

.stat-icon {
  font-size: 14px;
  color: #4CAF50;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Program Action */
.program-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.program-card:hover .program-action {
  background: rgba(76, 175, 80, 0.2);
  border-color: #388E3C;
  transform: scale(1.05);
}

.ion-palette-dark .program-action {
  background: rgba(102, 187, 106, 0.2);
  border-color: #66BB6A;
}

.ion-palette-dark .program-card:hover .program-action {
  background: rgba(102, 187, 106, 0.3);
  border-color: #4CAF50;
}

.program-action .arrow-icon {
  font-size: 16px;
  color: #4CAF50;
  transition: transform 0.2s ease;
}

.ion-palette-dark .program-action .arrow-icon {
  color: #66BB6A;
}

.program-card:hover .program-action .arrow-icon {
  color: #388E3C;
  transform: translateX(2px);
}

.program-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image ion-icon {
  font-size: 48px;
  color: rgba(255, 215, 0, 0.6);
}

.program-content {
  padding: 20px;
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.program-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
  flex: 1;
  margin-right: 12px;
}

.program-badges {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.difficulty-badge,
.free-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.difficulty-badge.beginner {
  background: rgba(40, 167, 69, 0.3);
  color: #ffffff;
}

.difficulty-badge.intermediate {
  background: rgba(255, 193, 7, 0.3);
  color: #ffffff;
}

.difficulty-badge.advanced {
  background: rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

.free-badge {
  background: rgba(255, 215, 0, 0.3);
  color: #ffffff;
}

.program-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.program-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.meta-item ion-icon {
  font-size: 16px;
  color: #ffd700;
}

.program-actions {
  display: flex;
  gap: 8px;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.pagination-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Program Detail */
.program-detail-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
}

.program-overview {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-bottom: 32px;
}

.overview-image {
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
}

.overview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.program-full-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  margin: 0;
}

.program-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.stat-icon {
  font-size: 16px;
  color: #ffd700;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Exercises Section */
.exercises-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 32px 0 20px 0;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exercise-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exercise-header h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.exercise-meta {
  display: flex;
  gap: 12px;
}

.exercise-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.exercise-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.exercise-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.detail-item strong {
  color: #ffd700;
}

.muscle-groups,
.equipment {
  margin-bottom: 16px;
}

.muscle-groups strong,
.equipment strong {
  font-size: 14px;
  color: #ffd700;
  display: block;
  margin-bottom: 8px;
}

.muscle-tags,
.equipment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.muscle-tag,
.equipment-tag {
  background: rgba(255, 215, 0, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.exercise-video {
  margin-top: 16px;
}

/* Progress Section */
.progress-section {
  margin-top: 32px;
}

.empty-progress {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  color: rgba(255, 215, 0, 0.6);
  margin-bottom: 16px;
}

.empty-progress h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.empty-progress p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.stat-card ion-icon {
  font-size: 32px;
  color: #ffd700;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .title-section h1 {
    font-size: 24px;
  }

  .categories-grid,
  .programs-grid {
    grid-template-columns: 1fr;
  }

  .program-overview {
    grid-template-columns: 1fr;
  }

  .exercise-details {
    grid-template-columns: 1fr;
  }

  .program-meta,
  .program-stats {
    flex-direction: column;
    gap: 8px;
  }

  .program-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .filters-section {
    padding: 16px;
  }

  .category-item {
    padding: 14px 16px;
  }

  .category-name {
    font-size: 15px;
  }

  .program-header {
    padding: 14px 14px 0 14px;
  }

  .program-body {
    padding: 10px 14px 14px 14px;
  }

  .program-title {
    font-size: 15px;
  }

  .program-badges {
    gap: 6px;
  }

  .difficulty-badge {
    font-size: 9px;
    padding: 3px 6px;
  }

  .difficulty-badge ion-icon {
    font-size: 11px;
  }

  .program-stats {
    gap: 12px;
  }

  .stat-item {
    font-size: 12px;
  }

  .stat-icon {
    font-size: 12px;
    width: 12px;
    height: 12px;
  }

  .program-action {
    width: 28px;
    height: 28px;
  }

  .program-action .arrow-icon {
    font-size: 14px;
  }
}

/* ===========================================
   PROGRAM DETAIL SECTION - NEW DESIGN
   =========================================== */

.program-detail-section {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 50%, #f8fafc 100%);
}

.ion-palette-dark .program-detail-section {
  background: linear-gradient(to bottom, #0f0f23 0%, #1a191b 50%, #0f0f23 100%);
}

/* Hero Section */
.program-hero {
  position: relative;
  min-height: 70vh;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(133, 96, 255, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
  backdrop-filter: blur(1px);
}

.ion-palette-dark .hero-overlay {
  background: linear-gradient(135deg, rgba(163, 143, 228, 0.15) 0%, rgba(102, 187, 106, 0.15) 100%);
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background-image:
    radial-gradient(circle at 25% 25%, #8560ff 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, #4CAF50 1px, transparent 1px);
  background-size: 50px 50px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
}

.hero-nav {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  --color: var(--ion-color-primary);
  --background-hover: rgba(133, 96, 255, 0.1);
  font-weight: 600;
  border-radius: 12px;
}

.hero-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .hero-main {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
  }
}

.hero-image-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.ion-palette-dark .hero-image {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.hero-placeholder ion-icon {
  font-size: 80px;
  opacity: 0.8;
}

.hero-image-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(133, 96, 255, 0.3) 0%, rgba(76, 175, 80, 0.3) 100%);
  filter: blur(20px);
  z-index: -1;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.program-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.ion-palette-dark .program-title {
  background: linear-gradient(135deg, #a38fe4 0%, #66bb6a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (max-width: 768px) {
  .program-title {
    font-size: 36px;
  }
}

.program-subtitle {
  font-size: 18px;
  color: var(--ion-color-medium-shade);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
}

.ion-palette-dark .program-subtitle {
  color: var(--ion-color-medium-tint);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 480px) {
  .hero-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  text-align: left;
}

.ion-palette-dark .stat-card {
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.ion-palette-dark .stat-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  position: relative;
}

.stat-icon-wrapper ion-icon {
  font-size: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  text-align: left;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--ion-text-color);
  line-height: 1;
  text-align: left;
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium-shade);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
}

.ion-palette-dark .stat-label {
  color: var(--ion-color-medium-tint);
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.start-btn {
  --background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(133, 96, 255, 0.3);
  font-weight: 600;
  font-size: 16px;
  padding: 14px 24px;
  min-height: 52px;
  width: 100%;
}

.start-btn ion-icon {
  font-size: 18px;
}

.favorite-btn {
  --border-radius: 12px;
  --border-color: rgba(133, 96, 255, 0.3);
  --color: #8560ff;
  --background: rgba(133, 96, 255, 0.05);
  --background-hover: rgba(133, 96, 255, 0.1);
  font-weight: 600;
  font-size: 16px;
  padding: 14px 24px;
  min-height: 52px;
  width: 100%;
}

.favorite-btn ion-icon {
  font-size: 18px;
}

/* Program Content */
.program-content {
  max-width: 1200px;
  margin: -80px auto 0;
  padding: 0 16px 40px;
  position: relative;
  z-index: 3;
}

.content-section {
  margin-bottom: 32px;
}

.section-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.ion-palette-dark .section-card {
  background: #2a2a2a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

.section-header {
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header ion-icon {
  font-size: 24px;
  color: #8560ff;
  flex-shrink: 0;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--ion-text-color);
  flex: 1;
}

.exercise-count {
  font-size: 14px;
  color: var(--ion-color-medium-shade);
  background: rgba(133, 96, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.ion-palette-dark .exercise-count {
  color: var(--ion-color-medium-tint);
  background: rgba(163, 143, 228, 0.2);
}

.section-content {
  padding: 24px;
}

.program-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ion-text-color);
  margin: 0;
  text-align: left;
}

/* Exercises Grid */
.exercises-grid {
  padding: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .exercises-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

.exercise-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: fadeInUp var(--delay, 0s) ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.ion-palette-dark .exercise-card {
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.ion-palette-dark .exercise-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exercise-header {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 16px;
  margin-bottom: 16px;
}

.exercise-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.exercise-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--ion-text-color);
  flex: 1;
}

.exercise-duration {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
  font-weight: 500;
}

.ion-palette-dark .exercise-duration {
  color: var(--ion-color-medium-tint);
}

.exercise-duration ion-icon {
  font-size: 16px;
  color: #8560ff;
}

.exercise-description {
  font-size: 14px;
  color: var(--ion-text-color);
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.exercise-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
  font-weight: 500;
}

.ion-palette-dark .detail-item {
  color: var(--ion-color-medium-tint);
}

.detail-item ion-icon {
  font-size: 16px;
  color: #8560ff;
  flex-shrink: 0;
}

.exercise-tags {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.tag-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.muscle-tag,
.equipment-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(8px);
}

.muscle-tag {
  background: rgba(255, 193, 7, 0.1);
  color: #f57c00;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.equipment-tag {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
  border: 1px solid rgba(156, 39, 176, 0.2);
}

.more-tag {
  background: rgba(133, 96, 255, 0.1);
  color: #8560ff;
  border: 1px solid rgba(133, 96, 255, 0.2);
  padding: 6px 8px;
  font-weight: 600;
}

.exercise-actions {
  display: flex;
  justify-content: flex-end;
}

.video-btn {
  --border-radius: 8px;
  --border-color: #8560ff;
  --color: #8560ff;
  font-weight: 500;
}

.video-btn ion-icon {
  font-size: 16px;
}

/* Loading States */
.loading-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium-shade);
}

.ion-palette-dark .loading-section {
  color: var(--ion-color-medium-tint);
}

.loading-section ion-spinner {
  margin-bottom: 16px;
}

/* Mobile Optimizations */
@media (max-width: 768px) {
  .hero-content {
    padding: 20px 16px;
  }

  .hero-main {
    gap: 24px;
  }

  .hero-image {
    width: 200px;
    height: 200px;
  }

  .program-title {
    font-size: 32px;
  }

  .hero-stats {
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 20px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 0;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .start-btn {
    width: 100%;
    padding: 12px 20px;
    min-height: 48px;
    font-size: 15px;
  }

  .favorite-btn {
    width: 100%;
    padding: 12px 20px;
    min-height: 48px;
    font-size: 15px;
  }

  .program-content {
    margin-top: -40px;
    padding: 0 12px 20px;
  }

  .section-card {
    border-radius: 16px;
  }

  .section-header {
    padding: 20px 20px 0 20px;
  }

  .section-header h2 {
    font-size: 20px;
  }

  .section-content {
    padding: 20px;
  }

  .exercises-grid {
    padding: 20px;
    gap: 16px;
  }

  .exercise-card {
    padding: 20px;
  }

  .exercise-header {
    gap: 12px;
  }

  .exercise-title {
    font-size: 16px;
  }

  .detail-row {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .program-hero {
    min-height: 60vh;
  }

  .hero-content {
    padding: 16px;
  }

  .hero-nav {
    margin-bottom: 16px;
  }

  .program-title {
    font-size: 28px;
  }

  .program-subtitle {
    font-size: 16px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .program-content {
    margin-top: -20px;
  }

  .content-section {
    margin-bottom: 24px;
  }

  .section-header {
    padding: 16px 16px 0 16px;
  }

  .section-content {
    padding: 16px;
  }

  .exercises-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .exercise-card {
    padding: 16px;
  }

  .exercise-header {
    gap: 8px;
  }

  .exercise-number {
    align-self: flex-start;
  }

  .exercise-title {
    text-align: left;
  }
}

/* ===========================================
   WORKOUT PROGRESS VISUALIZATION
   =========================================== */

/* Status Badge */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.in-progress {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.ion-palette-dark .status-badge.in-progress {
  background: rgba(102, 187, 106, 0.2);
  border-color: rgba(102, 187, 106, 0.3);
}

.status-badge.completed {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.ion-palette-dark .status-badge.completed {
  background: rgba(100, 181, 246, 0.2);
  border-color: rgba(100, 181, 246, 0.3);
}

.status-badge ion-icon {
  font-size: 12px;
}

/* Program Active State */
.program-active {
  border-color: #4CAF50 !important;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15) !important;
}

.ion-palette-dark .program-active {
  box-shadow: 0 4px 20px rgba(102, 187, 106, 0.2) !important;
}

.program-active .program-title {
  color: #4CAF50;
}

.ion-palette-dark .program-active .program-title {
  color: #66BB6A;
}

/* Program Completed State */
.program-completed {
  border-color: #2196F3 !important;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.15) !important;
}

.ion-palette-dark .program-completed {
  box-shadow: 0 4px 20px rgba(100, 181, 246, 0.2) !important;
}

.program-completed .program-title {
  color: #2196F3;
}

.ion-palette-dark .program-completed .program-title {
  color: #64B5F6;
}

/* Program Actions in Card */
.program-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.ion-palette-dark .program-actions {
  border-color: rgba(255, 255, 255, 0.1);
}

.program-start-btn {
  width: 100%;
  --border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.program-start-btn ion-icon {
  font-size: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .program-actions {
    margin-top: 12px;
    padding-top: 12px;
  }

  .program-start-btn {
    font-size: 13px;
    padding: 10px 16px;
  }

  .status-badge {
    font-size: 10px;
    padding: 3px 6px;
  }
}
</style>
