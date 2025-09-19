<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="workout-categories-container">
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
            <!-- Фильтр по полу -->
            <div
              class="filter-chip gender-chip"
              :class="{ 'active': !showAllCategories }"
              @click="toggleCategoryFilter"
            >
              <ion-icon :icon="personOutline" class="chip-icon"></ion-icon>
              <span class="chip-text">{{ showAllCategories ? 'Все' : 'Мои' }}</span>
            </div>
          </div>
        </div>

        <!-- Categories Section -->
        <div class="categories-section" style="padding: 16px;">
          <!-- Дополнительные фильтры -->
          <div class="filters-section">
            <div class="filters-row">
              <!-- Фильтр сложности -->
              <div class="filter-chip difficulty-chip" @click="showDifficultyPopover">
                <ion-icon :icon="speedometerOutline" class="chip-icon"></ion-icon>
                <span class="chip-text">{{ getDifficultyLabel(filters.difficulty_level) }}</span>
                <ion-icon :icon="chevronDownOutline" class="chip-arrow"></ion-icon>
              </div>

              <!-- Фильтр бесплатных -->
              <div
                class="filter-chip free-chip"
                :class="{ 'active': filters.is_free }"
                @click="toggleFreeFilter"
              >
                <ion-icon :icon="giftOutline" class="chip-icon"></ion-icon>
                <span class="chip-text">Бесплатные</span>
              </div>
            </div>
          </div>

          <div v-if="categoriesLoading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка категорий...</p>
          </div>

          <div v-else-if="categoriesError" class="error-container">
            <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
            <p>{{ categoriesError }}</p>
            <ion-button @click="loadCategories" fill="clear">Повторить</ion-button>
          </div>

          <div v-else class="categories-grid">
            <div
              v-for="category in filteredCategories"
              :key="category.id"
              class="category-card"
              @click="selectCategory(category)"
            >
              <div class="category-content">
                <h3 class="category-title">{{ category.name }}</h3>
                <p class="category-description">{{ category.description }}</p>
                <div class="category-meta">
                  <div class="meta-item">
                    <ion-icon :icon="personOutline"></ion-icon>
                    <span>{{ getGenderText(category.gender) }}</span>
                  </div>
                  <div class="meta-item">
                    <ion-icon :icon="ribbonOutline"></ion-icon>
                    <span>{{ getDifficultyStats(category.workout_programs) }}</span>
                  </div>
                  <div class="meta-item">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>{{ getDurationStats(category.workout_programs) }}</span>
                  </div>
                </div>
              </div>
              <div class="category-footer">
                <div class="category-icon">
                  <ion-icon :icon="fitnessOutline"></ion-icon>
                </div>
                <div class="category-badge">
                  <span>{{ category.workout_programs?.length || 0 }} {{ getProgramWord(category.workout_programs?.length || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="progress-section" style="padding: 16px;">
          <div class="section-header">
            <h2>Ваш прогресс</h2>
            <ion-button fill="clear" @click="viewAllProgress">
              <span>Все</span>
              <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>

          <div v-if="progressLoading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка прогресса...</p>
          </div>

          <div v-else-if="progressError" class="error-container">
            <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
            <p>{{ progressError }}</p>
            <ion-button @click="loadUserProgress" fill="clear">Повторить</ion-button>
          </div>

          <div v-else-if="activeWorkouts.length > 0" class="progress-grid">
            <div
              v-for="workout in activeWorkouts.slice(0, 3)"
              :key="workout.id"
              class="progress-card"
              @click="continueWorkout(workout)"
            >
              <!-- Progress Card Header -->
              <div class="progress-header">
                <div class="progress-icon">
                  <ion-icon :icon="fitnessOutline" class="icon-large"></ion-icon>
                </div>
                <div class="progress-badge">
                  <span>{{ workout.completed_at ? 'Завершено' : 'В процессе' }}</span>
                </div>
              </div>

              <!-- Progress Card Content -->
              <div class="progress-content">
                <h4>{{ workout.program?.name || workout.program_name }}</h4>
                <p>{{ workout.category?.name || workout.category_name }}</p>

                <!-- Exercise Info -->
                <div v-if="workout.exercise" class="exercise-info">
                  <div class="exercise-name">
                    <ion-icon :icon="barbellOutline"></ion-icon>
                    <span>{{ workout.exercise.name }}</span>
                  </div>
                  <div v-if="workout.exercise.muscle_groups?.length" class="muscle-groups">
                    <ion-icon :icon="bodyOutline"></ion-icon>
                    <span>{{ workout.exercise.muscle_groups.join(', ') }}</span>
                  </div>
                </div>

                <!-- Program Details -->
                <div v-if="workout.program" class="program-details">
                  <div class="program-meta">
                    <span class="difficulty-badge" :class="workout.program.difficulty_level">
                      {{ getDifficultyLabel(workout.program.difficulty_level) }}
                    </span>
                    <span class="calories-badge">
                      <ion-icon :icon="flameOutline"></ion-icon>
                      {{ workout.program.calories_per_workout }} ккал
                    </span>
                  </div>
                </div>
              </div>

              <!-- Progress Card Footer -->
              <div class="progress-footer">
                <div class="progress-stats">
                  <span class="progress-date">
                    <ion-icon :icon="calendarOutline"></ion-icon>
                    {{ formatDate(workout.created_at) }}
                  </span>
                  <span v-if="workout.duration_seconds > 0" class="progress-duration">
                    <ion-icon :icon="timerOutline"></ion-icon>
                    {{ formatDuration(workout.duration_seconds) }}
                  </span>
                </div>
                <div class="progress-actions">
                  <ion-button
                    fill="clear"
                    size="small"
                    @click="continueWorkout(workout)"
                  >
                    <ion-icon :icon="playOutline"></ion-icon>
                  </ion-button>
                </div>
              </div>

              <!-- Workout Notes -->
              <div v-if="workout.notes" class="workout-notes">
                <ion-icon :icon="documentTextOutline"></ion-icon>
                <span>{{ workout.notes }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <ion-icon :icon="fitnessOutline" size="large" color="medium"></ion-icon>
            <h3>Нет активных тренировок</h3>
            <p>Выберите программу и начните тренироваться!</p>
          </div>
        </div>
      </div>

      <!-- Difficulty Popover -->
      <ion-popover ref="difficultyPopover" trigger="difficulty-chip" :show-backdrop="true">
        <ion-content>
          <ion-list>
            <ion-item button @click="setDifficulty('beginner')">
              <ion-label>Начинающий</ion-label>
              <ion-icon :icon="checkmarkOutline" v-if="filters.difficulty_level === 'beginner'" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="setDifficulty('intermediate')">
              <ion-label>Средний</ion-label>
              <ion-icon :icon="checkmarkOutline" v-if="filters.difficulty_level === 'intermediate'" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="setDifficulty('advanced')">
              <ion-label>Продвинутый</ion-label>
              <ion-icon :icon="checkmarkOutline" v-if="filters.difficulty_level === 'advanced'" slot="end"></ion-icon>
            </ion-item>
            <ion-item button @click="setDifficulty('all')">
              <ion-label>Все уровни</ion-label>
              <ion-icon :icon="checkmarkOutline" v-if="filters.difficulty_level === 'all'" slot="end"></ion-icon>
            </ion-item>
          </ion-list>
        </ion-content>
      </ion-popover>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonPopover,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/vue'
import {
  fitnessOutline,
  speedometerOutline,
  chevronDownOutline,
  giftOutline,
  timeOutline,
  flameOutline,
  alertCircleOutline,
  chevronForwardOutline,
  calendarOutline,
  playOutline,
  checkmarkOutline,
  personOutline,
  ribbonOutline,
  barbellOutline,
  bodyOutline,
  checkmarkCircleOutline,
  timerOutline,
  documentTextOutline
} from 'ionicons/icons'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { WorkoutServiceV2, WorkoutGender } from '@/services/workoutServiceV2'
import type { WorkoutCategory } from '@/services/workoutServiceV2'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const workoutService = WorkoutServiceV2.getInstance()
const userStore = useUserStore()

// Reactive data
const categories = ref<WorkoutCategory[]>([])
const categoriesLoading = ref(false)
const categoriesError = ref<string | null>(null)

const activeWorkouts = ref<any[]>([])
const progressLoading = ref(false)
const progressError = ref<string | null>(null)

const filters = ref({
  difficulty_level: 'all',
  is_free: false
})

const userGender = ref<'male' | 'female' | null>(null)
const showAllCategories = ref(false)

// Computed для фильтрации категорий по полу пользователя
const filteredCategories = computed(() => {
  if (showAllCategories.value || !userGender.value) {
    return categories.value
  }
  return categories.value.filter(category => category.gender === userGender.value)
})

// Methods
const loadCategories = async () => {
  categoriesLoading.value = true
  categoriesError.value = null

  try {
    console.log('🚀 WorkoutCategoriesPage: Loading categories...')
    const result = await workoutService.getWorkoutCategories()
    console.log('📋 WorkoutCategoriesPage: Raw API result:', result)
    console.log('📋 WorkoutCategoriesPage: Result type:', typeof result)
    console.log('📋 WorkoutCategoriesPage: Result length:', result?.length)

    if (result && Array.isArray(result) && result.length > 0) {
      // Проверяем, что это действительно категории, а не программы
      const firstItem = result[0]
      const hasCategoryFields = firstItem && (
        firstItem.id &&
        firstItem.name &&
        firstItem.description &&
        typeof firstItem.is_active !== 'undefined'
      )
      const hasProgramFields = firstItem && (
        (firstItem as any).difficulty_level &&
        (firstItem as any).calories_per_workout &&
        (firstItem as any).duration_weeks
      )

      if (hasCategoryFields && !hasProgramFields) {
        categories.value = result
        console.log('✅ WorkoutCategoriesPage: Categories loaded:', result.length)
        console.log('📋 WorkoutCategoriesPage: First category:', result[0])
        console.log('📋 WorkoutCategoriesPage: Categories names:', result.map(cat => cat.name))
      } else if (hasProgramFields) {
        console.error('❌ WorkoutCategoriesPage: API returned programs instead of categories!')
        console.error('❌ WorkoutCategoriesPage: First item:', firstItem)
        categoriesError.value = 'API вернул программы вместо категорий. Проверьте endpoint.'
      } else {
        console.warn('⚠️ WorkoutCategoriesPage: Unexpected data structure')
        console.warn('⚠️ WorkoutCategoriesPage: First item keys:', Object.keys(firstItem || {}))
        categories.value = result // Попробуем отобразить как есть для отладки
      }
    } else {
      console.warn('⚠️ WorkoutCategoriesPage: No categories received or invalid format')
      console.warn('⚠️ WorkoutCategoriesPage: Result is array?', Array.isArray(result))
    }
  } catch (error: any) {
    console.error('❌ WorkoutCategoriesPage: Error loading categories:', error)
    console.error('❌ WorkoutCategoriesPage: Error details:', error.response?.data)

    // Fallback: используем mock данные для тестирования
    console.log('🔄 WorkoutCategoriesPage: Using fallback mock data')
    categories.value = [
      {
        id: '1',
        name: 'Силовые тренировки',
        slug: 'power-training',
        description: 'Комплексные силовые упражнения для развития мышц',
        gender: WorkoutGender.MALE as WorkoutGender,
        is_active: true,
        sort_order: 1,
        workout_programs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Кардио тренировки',
        slug: 'cardio-training',
        description: 'Кардио упражнения для улучшения выносливости',
        gender: WorkoutGender.FEMALE as WorkoutGender,
        is_active: true,
        sort_order: 2,
        workout_programs: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ] as WorkoutCategory[]
    categoriesError.value = 'Загружены тестовые данные. Проверьте подключение к API.'
  } finally {
    categoriesLoading.value = false
  }
}

const loadUserProgress = async () => {
  progressLoading.value = true
  progressError.value = null

  try {
    console.log('🚀 WorkoutCategoriesPage: Loading user progress...')
    const result = await workoutService.getUserWorkoutProgress()
    console.log('📋 WorkoutCategoriesPage: Raw progress result:', result)
    console.log('📋 WorkoutCategoriesPage: Progress result type:', typeof result)
    console.log('📋 WorkoutCategoriesPage: Progress result length:', result?.length)

    if (result && Array.isArray(result) && result.length > 0) {
      // Группируем по program_id и берем последние записи для каждой программы
      const groupedByProgram = result.reduce((acc, workout) => {
        const programId = workout.program?.id || workout.program_id
        if (!acc[programId] || new Date(workout.created_at) > new Date(acc[programId].created_at)) {
          acc[programId] = workout
        }
        return acc
      }, {} as Record<string, any>)

      // Преобразуем обратно в массив и берем последние 3 программы
      const activePrograms = Object.values(groupedByProgram)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)

      activeWorkouts.value = activePrograms

      console.log('✅ WorkoutCategoriesPage: Progress loaded:', result.length)
      console.log('✅ WorkoutCategoriesPage: Unique programs found:', Object.keys(groupedByProgram).length)
      console.log('✅ WorkoutCategoriesPage: Active programs shown:', activePrograms.length)
      console.log('📋 WorkoutCategoriesPage: First progress item:', result[0])
      console.log('📋 WorkoutCategoriesPage: Sample grouped programs:', activePrograms.slice(0, 2).map((w: any) => ({
        program_id: w.program?.id || w.program_id,
        program_name: w.program?.name || w.program_name,
        completed_at: w.completed_at,
        created_at: w.created_at
      })))
    } else {
      console.warn('⚠️ WorkoutCategoriesPage: No progress data or invalid format')
      console.warn('⚠️ WorkoutCategoriesPage: Result is array?', Array.isArray(result))
      activeWorkouts.value = []
    }
  } catch (error: any) {
    console.error('❌ WorkoutCategoriesPage: Error loading progress:', error)
    console.error('❌ WorkoutCategoriesPage: Error details:', error.response?.data)
    progressError.value = error.message || 'Ошибка загрузки прогресса'
    activeWorkouts.value = []
  } finally {
    progressLoading.value = false
  }
}

const loadUserGender = async () => {
  try {
    console.log('🚀 WorkoutCategoriesPage: Loading user gender...')
    const genderResponse = await (userStore as any).getGender()
    if (genderResponse.success && genderResponse.data) {
      userGender.value = genderResponse.data.gender
      console.log('✅ WorkoutCategoriesPage: User gender loaded:', userGender.value)
    } else {
      console.warn('⚠️ WorkoutCategoriesPage: Gender not set for user')
      userGender.value = null
    }
  } catch (error: any) {
    console.error('❌ WorkoutCategoriesPage: Error loading user gender:', error)
    userGender.value = null
  }
}

const toggleCategoryFilter = () => {
  showAllCategories.value = !showAllCategories.value
}

const selectCategory = (category: WorkoutCategory) => {
  console.log('🎯 WorkoutCategoriesPage: Selecting category:', category.name)
  router.push(`/workout-programs/${category.id}`)
}

const continueWorkout = (workout: any) => {
  const programId = workout.program?.id || workout.program_id
  console.log('🎯 WorkoutCategoriesPage: Continuing workout:', workout.program?.name || workout.program_name)
  console.log('📋 WorkoutCategoriesPage: Program ID:', programId)
  console.log('📋 WorkoutCategoriesPage: Workout data:', workout)

  // Переходим к тренировке по ID программы
  router.push(`/workout-session/${programId}`)
}

const showDifficultyPopover = () => {
  // Popover will be shown automatically via trigger
}

const setDifficulty = (level: string) => {
  filters.value.difficulty_level = level
  // Popover will close automatically
}

const toggleFreeFilter = () => {
  filters.value.is_free = !filters.value.is_free
}

const getDifficultyLabel = (level: string) => {
  const labels = {
    beginner: 'Начинающий',
    intermediate: 'Средний', 
    advanced: 'Продвинутый',
    all: 'Все уровни'
  }
  return labels[level as keyof typeof labels] || 'Все уровни'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}


const getProgramWord = (count: number) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'программ'
  }

  if (lastDigit === 1) {
    return 'программа'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'программы'
  }

  return 'программ'
}

const getGenderText = (gender: string) => {
  return gender === 'male' ? 'Мужские' : 'Женские'
}

const getDifficultyStats = (programs: any[]) => {
  if (!programs || programs.length === 0) return 'Нет программ'

  const difficultyCount = programs.reduce((acc, program) => {
    const level = program.difficulty_level
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})

  const stats = []
  if (difficultyCount.beginner) stats.push(`${difficultyCount.beginner} нач.`)
  if (difficultyCount.intermediate) stats.push(`${difficultyCount.intermediate} сред.`)
  if (difficultyCount.advanced) stats.push(`${difficultyCount.advanced} прод.`)

  return stats.join(', ')
}

const getDurationStats = (programs: any[]) => {
  if (!programs || programs.length === 0) return 'Нет данных'

  const durations = programs.map(p => p.duration_weeks).filter(d => d)
  if (durations.length === 0) return 'Нет данных'

  const minDuration = Math.min(...durations)
  const maxDuration = Math.max(...durations)

  if (minDuration === maxDuration) {
    return `${minDuration} нед.`
  }

  return `${minDuration}-${maxDuration} нед.`
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const viewAllProgress = () => {
  // Navigate to progress page or show all progress
  console.log('📊 WorkoutCategoriesPage: View all progress')
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 WorkoutCategoriesPage: Component mounted')
  console.log('🚀 WorkoutCategoriesPage: Route path:', route.path)
  console.log('🚀 WorkoutCategoriesPage: Route name:', route.name)

  try {
    // Загружаем данные последовательно, чтобы избежать перегрузки
    await loadCategories()
    await loadUserGender()

    // Небольшая задержка перед загрузкой прогресса
    setTimeout(async () => {
      await loadUserProgress()
    }, 100)

    console.log('✅ WorkoutCategoriesPage: Data loaded')
    console.log('✅ WorkoutCategoriesPage: Categories count:', categories.value.length)
    console.log('✅ WorkoutCategoriesPage: Filtered categories count:', filteredCategories.value.length)
    console.log('✅ WorkoutCategoriesPage: User gender:', userGender.value)
    console.log('✅ WorkoutCategoriesPage: Active workouts count:', activeWorkouts.value.length)
  } catch (error) {
    console.error('❌ WorkoutCategoriesPage: Error during initial load:', error)
  }
})
</script>

<style scoped>
.workout-categories-container {
  min-height: 100vh;
  background: var(--background);
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-color);
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 24px;
  color: var(--primary-color);
}

h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color);
}

.status-icons {
  display: flex;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--surface-secondary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background: var(--surface-hover);
}

.filter-chip.active {
  background: var(--primary-color);
  color: white;
}

.chip-icon {
  font-size: 16px;
}

.chip-text {
  font-size: 14px;
  font-weight: 500;
}

.chip-arrow {
  font-size: 12px;
}

/* ===== ФИЛЬТРЫ СЕКЦИЯ ===== */
.filters-section {
  margin-bottom: 20px;
}

.filters-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filters-row .filter-chip {
  flex: 0 0 auto;
  min-width: 120px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.category-card {
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Темная тема для карточек */
.ion-palette-dark .category-card {
  background: linear-gradient(145deg, #2d2d30, #252528);
  border: 1px solid #404040;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.ion-palette-dark .category-card:hover {
  background: linear-gradient(145deg, #323236, #2a2a2d);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-color: var(--primary-color);
}

.category-content {
  flex: 1;
  padding: 16px;
}

.category-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light));
  border-radius: 0 0 16px 16px;
  margin-top: auto;
  position: relative;
}

/* Темная тема для футера */
.ion-palette-dark .category-footer {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light));
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
}

.category-icon {
  color: white;
  opacity: 0.9;
}

.category-icon ion-icon {
  font-size: 20px;
}

.category-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
}

.category-badge:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.category-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.2;
}

.category-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Темная тема для текста */
.ion-palette-dark .category-title {
  color: #ffffff;
}

.ion-palette-dark .category-description {
  color: #cccccc;
}

.category-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-secondary);
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.meta-item:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.meta-item:hover ion-icon {
  color: white;
}

.meta-item ion-icon {
  font-size: 14px;
  color: var(--primary-color);
  transition: color 0.2s ease;
}

/* Темная тема для метаданных */
.ion-palette-dark .meta-item {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.ion-palette-dark .meta-item:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.category-stats {
  display: flex;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.progress-card {
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
}

.progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Темная тема для карточек прогресса */
.ion-palette-dark .progress-card {
  background: linear-gradient(145deg, #2d2d30, #252528);
  border: 1px solid #404040;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.ion-palette-dark .progress-card:hover {
  background: linear-gradient(145deg, #323236, #2a2a2d);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-color: var(--primary-color);
}

/* ===== ПРОГРЕСС КАРТОЧКИ СТИЛИ ===== */
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0 16px;
  margin-bottom: 12px;
}

.progress-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.progress-icon ion-icon {
  font-size: 20px;
  color: white;
}

.progress-badge {
  background: var(--surface-secondary);
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.progress-badge:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Темная тема для хедера прогресса */
.ion-palette-dark .progress-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark));
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.ion-palette-dark .progress-badge {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.ion-palette-dark .progress-badge:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.progress-content {
  padding: 0 16px;
  flex: 1;
}

.progress-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.2;
}

.progress-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Темная тема для контента прогресса */
.ion-palette-dark .progress-content h4 {
  color: #ffffff;
}

.ion-palette-dark .progress-content p {
  color: #cccccc;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  background: var(--surface-secondary);
}

/* Темная тема для футера прогресса */
.ion-palette-dark .progress-footer {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
}

.progress-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.progress-date,
.progress-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface);
  padding: 6px 10px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.progress-date:hover,
.progress-duration:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.progress-date:hover ion-icon,
.progress-duration:hover ion-icon {
  color: white;
}

.progress-date ion-icon,
.progress-duration ion-icon {
  font-size: 14px;
  color: var(--primary-color);
  transition: color 0.2s ease;
}

/* Темная тема для статистики прогресса */
.ion-palette-dark .progress-date,
.ion-palette-dark .progress-duration {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.ion-palette-dark .progress-date:hover,
.ion-palette-dark .progress-duration:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.progress-actions {
  display: flex;
  align-items: center;
}

.progress-actions ion-button {
  --color: var(--primary-color);
  --background: transparent;
  --border-radius: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  transition: all 0.2s ease;
}

.progress-actions ion-button:hover {
  --background: var(--primary-color);
  --color: white;
  transform: scale(1.05);
}

/* Темная тема для кнопок прогресса */
.ion-palette-dark .progress-actions ion-button {
  --color: var(--primary-color);
}

.ion-palette-dark .progress-actions ion-button:hover {
  --background: var(--primary-color);
  --color: white;
}

/* Новые стили для расширенной информации о прогрессе */
.exercise-info {
  margin-top: 8px;
}

.exercise-name,
.muscle-groups {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.exercise-name ion-icon,
.muscle-groups ion-icon {
  font-size: 14px;
  color: var(--primary-color);
}

.program-details {
  margin-top: 8px;
}

.program-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.difficulty-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.beginner {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.difficulty-badge.intermediate {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.difficulty-badge.advanced {
  background: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.calories-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.calories-badge ion-icon {
  font-size: 12px;
}

.progress-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-secondary);
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.progress-duration ion-icon {
  font-size: 14px;
  color: var(--primary-color);
}

.workout-notes {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  margin: 16px;
  padding: 12px;
  background: var(--surface-secondary);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.workout-notes ion-icon {
  font-size: 16px;
  color: var(--primary-color);
  margin-top: 2px;
  flex-shrink: 0;
}

.workout-notes span {
  line-height: 1.4;
  font-style: italic;
}

/* Темная тема для заметок */
.ion-palette-dark .workout-notes {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: var(--primary-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.ion-palette-dark .workout-notes span {
  color: #cccccc;
}

/* Темная тема для новых элементов */
.ion-palette-dark .exercise-name,
.ion-palette-dark .muscle-groups {
  color: #cccccc;
}

.ion-palette-dark .difficulty-badge.beginner {
  background: rgba(76, 175, 80, 0.2);
  color: #81C784;
}

.ion-palette-dark .difficulty-badge.intermediate {
  background: rgba(255, 152, 0, 0.2);
  color: #FFB74D;
}

.ion-palette-dark .difficulty-badge.advanced {
  background: rgba(244, 67, 54, 0.2);
  color: #EF5350;
}

.ion-palette-dark .calories-badge {
  background: rgba(255, 152, 0, 0.2);
  color: #FFB74D;
}

.ion-palette-dark .progress-duration {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.ion-palette-dark .workout-notes {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: var(--primary-color);
  color: #cccccc;
}

.progress-actions {
  display: flex;
  justify-content: flex-end;
}

.progress-actions ion-button {
  --background: var(--primary-color);
  --background-hover: var(--primary-color-light);
  --color: white;
  --border-radius: 8px;
  transition: all 0.2s ease;
}

.progress-actions ion-button:hover {
  transform: scale(1.1);
}

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
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--text-secondary);
}

/* CSS Variables for theming */
:root {
  --background: #f5f7fa;
  --surface: #ffffff;
  --surface-secondary: #f8f9fa;
  --surface-hover: #f0f0f0;
  --text-color: #333333;
  --text-secondary: #666666;
  --primary-color: #8560ff;
  --primary-color-light: #9b7bff;
  --border-color: #e0e0e0;
}

.ion-palette-dark {
  --background: #1a191b;
  --surface: #2a2a2c;
  --surface-secondary: #3a3a3c;
  --surface-hover: #4a4a4c;
  --text-color: #ffffff;
  --text-secondary: #cccccc;
  --primary-color: #a38fe4;
  --primary-color-light: #b5a4f4;
  --border-color: #4a4a4c;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .categories-grid,
  .progress-grid {
    grid-template-columns: 1fr;
  }

  .category-card,
  .progress-card {
    margin: 0;
  }

  .category-content,
  .progress-content {
    padding: 16px;
  }

  .category-header,
  .progress-header {
    margin-bottom: 12px;
  }

  .category-icon,
  .progress-icon {
    width: 32px;
    height: 32px;
  }

  .icon-large {
    font-size: 18px;
  }

  .category-badge,
  .progress-badge {
    font-size: 12px;
    padding: 4px 8px;
  }

  .category-footer,
  .progress-footer {
    padding: 12px 16px;
  }

  .category-stats,
  .progress-stats {
    gap: 8px;
  }

  .stat-item {
    font-size: 11px;
  }

  .meta-item {
    font-size: 11px;
    padding: 4px 8px;
  }

  .progress-date,
  .progress-duration {
    font-size: 11px;
    padding: 4px 8px;
  }

  .workout-notes {
    margin: 12px;
    padding: 10px;
    font-size: 11px;
  }

  .filters-row {
    flex-direction: column;
    gap: 8px;
  }

  .filters-row .filter-chip {
    min-width: auto;
    width: 100%;
    justify-content: center;
  }
}
</style>
