<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="workout-programs-container">
        <!-- Header with back button -->
        <div class="page-header">
          <ion-button fill="clear" @click="goBack">
            <ion-icon :icon="arrowBackOutline" slot="icon-only"></ion-icon>
          </ion-button>
          <h1>{{ category?.name || 'Программы' }}</h1>
          <div class="header-spacer"></div>
        </div>

        <!-- Category Info -->
        <div v-if="category" class="category-info">
          <div class="category-description">
            <p>{{ category.description }}</p>
          </div>
          <div class="category-stats">
            <div class="stat-item">
              <ion-icon :icon="fitnessOutline"></ion-icon>
              <span>{{ programs.length }} {{ getProgramWord(programs.length) }}</span>
            </div>
            <div class="stat-item">
              <ion-icon :icon="timeOutline"></ion-icon>
              <span>{{ category.workout_programs?.length || 0 }} {{ getProgramWord(category.workout_programs?.length || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Category Error -->
        <div v-if="categoryError" class="error-container">
          <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
          <h3>Категория не найдена</h3>
          <p>{{ categoryError }}</p>
          <ion-button @click="goBack" fill="solid">
            <ion-icon :icon="arrowBackOutline" slot="start"></ion-icon>
            Вернуться к категориям
          </ion-button>
        </div>

        <!-- Programs List -->
        <div v-if="!categoryError" class="programs-section">
          <div v-if="programsLoading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Загрузка программ...</p>
          </div>

          <div v-else-if="programsError" class="error-container">
            <ion-icon :icon="alertCircleOutline" size="large" color="danger"></ion-icon>
            <p>{{ programsError }}</p>
            <ion-button @click="loadPrograms" fill="clear">Повторить</ion-button>
          </div>

          <div v-else-if="programs.length > 0" class="programs-list">
            <div
              v-for="program in programs"
              :key="program.id"
              class="program-card"
              @click="selectProgram(program)"
            >
              <div class="program-image">
                <img
                  :src="getThumbnailUrl(program)"
                  :alt="program.name"
                  @error="onImageError"
                />
                <div class="program-overlay">
                  <div class="program-badges">
                    <span class="difficulty-badge" :class="program.difficulty_level">
                      {{ getDifficultyLabel(program.difficulty_level) }}
                    </span>
                    <span v-if="program.is_free" class="free-badge">
                      <ion-icon :icon="giftOutline"></ion-icon>
                      Бесплатно
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="program-content">
                <div class="program-header">
                  <h3 class="program-title">{{ program.name }}</h3>
                  <div class="program-status" :class="getProgramStatus(program)">
                    <ion-icon :icon="getStatusIcon(program)"></ion-icon>
                    <span>{{ getStatusText(program) }}</span>
                  </div>
                </div>
                
                <p class="program-description">{{ program.short_description }}</p>
                
                <div class="program-stats">
                  <div class="stat-item">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span>{{ program.duration_weeks }} нед.</span>
                  </div>
                  <div class="stat-item">
                    <ion-icon :icon="flameOutline"></ion-icon>
                    <span>{{ program.calories_per_workout }} ккал</span>
                  </div>
                  <div class="stat-item">
                    <ion-icon :icon="fitnessOutline"></ion-icon>
                    <span>{{ program.workout_exercises?.length || 0 }} упр.</span>
                  </div>
                </div>
                
                <div class="program-actions">
                  <ion-button 
                    fill="solid" 
                    :color="getActionColor(program)"
                    @click.stop="handleProgramAction(program)"
                  >
                    <ion-icon :icon="getActionIcon(program)" slot="start"></ion-icon>
                    {{ getActionText(program) }}
                  </ion-button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <ion-icon :icon="fitnessOutline" size="large" color="medium"></ion-icon>
            <h3>Программы не найдены</h3>
            <p>В этой категории пока нет программ тренировок</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  arrowBackOutline,
  fitnessOutline,
  timeOutline,
  flameOutline,
  giftOutline,
  alertCircleOutline,
  playOutline,
  refreshOutline,
  checkmarkCircleOutline
} from 'ionicons/icons'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { WorkoutServiceV2 } from '@/services/workoutServiceV2'
import type { WorkoutProgram, WorkoutCategory, UserWorkoutProgress } from '@/types/workout'

const route = useRoute()
const router = useRouter()
const workoutService = WorkoutServiceV2.getInstance()

// Reactive data
const category = ref<WorkoutCategory | null>(null)
const programs = ref<WorkoutProgram[]>([])
const programsLoading = ref(false)
const programsError = ref<string | null>(null)
const categoryError = ref<string | null>(null)
const activeWorkouts = ref<UserWorkoutProgress[]>([])

// Computed
const categoryId = computed(() => route.params.categoryId as string)

// Methods
const loadCategory = async () => {
  try {
    console.log('🚀 WorkoutProgramsPage: Loading category:', categoryId.value)
    console.log('🚀 WorkoutProgramsPage: Category ID type:', typeof categoryId.value)
    
    const categories = await workoutService.getWorkoutCategories()
    console.log('📋 WorkoutProgramsPage: Available categories:', categories.map(cat => ({ id: cat.id, name: cat.name, idType: typeof cat.id })))
    
    // Пробуем найти по точному совпадению
    let foundCategory = categories.find(cat => cat.id === categoryId.value)
    
    // Если не найдено, пробуем найти по числовому ID
    if (!foundCategory) {
      const numericId = parseInt(categoryId.value)
      if (!isNaN(numericId)) {
        foundCategory = categories.find(cat => cat.id === numericId.toString())
        console.log('🔄 WorkoutProgramsPage: Trying numeric ID:', numericId)
      }
    }
    
    // Если все еще не найдено, пробуем найти по строковому ID
    if (!foundCategory) {
      foundCategory = categories.find(cat => cat.id.toString() === categoryId.value)
      console.log('🔄 WorkoutProgramsPage: Trying string conversion')
    }
    
    if (foundCategory) {
      category.value = foundCategory
      categoryError.value = null
      console.log('✅ WorkoutProgramsPage: Category loaded:', foundCategory.name)
    } else {
      console.error('❌ WorkoutProgramsPage: Category not found:', categoryId.value)
      console.error('❌ WorkoutProgramsPage: Available category IDs:', categories.map(cat => cat.id))
      categoryError.value = `Категория с ID "${categoryId.value}" не найдена`
    }
  } catch (error: any) {
    console.error('❌ WorkoutProgramsPage: Error loading category:', error)
    router.push('/workouts')
  }
}

const loadPrograms = async () => {
  if (!categoryId.value || categoryError.value || !category.value) return

  programsLoading.value = true
  programsError.value = null

  try {
    console.log('🚀 WorkoutProgramsPage: Loading programs for category:', categoryId.value)
    console.log('🚀 WorkoutProgramsPage: Category slug:', category.value.slug)
    
    // Сначала попробуем получить программы из кэша
    let programsFromCategory = workoutService.getProgramsFromCategory([category.value], categoryId.value)
    
    if (programsFromCategory.length > 0) {
      programs.value = programsFromCategory
      console.log('✅ WorkoutProgramsPage: Programs loaded from cache:', programsFromCategory.length)
    } else {
      // Если в кэше нет, загружаем с API по slug
      console.log('🔄 WorkoutProgramsPage: Loading programs from API by slug')
      const result = await workoutService.getWorkoutProgramsByCategory(category.value.slug)
      
      if (result && result.length > 0) {
        programs.value = result
        console.log('✅ WorkoutProgramsPage: Programs loaded from API:', result.length)
      } else {
        console.warn('⚠️ WorkoutProgramsPage: No programs received')
        programs.value = []
      }
    }
  } catch (error: any) {
    console.error('❌ WorkoutProgramsPage: Error loading programs:', error)
    programsError.value = error.message || 'Ошибка загрузки программ'
  } finally {
    programsLoading.value = false
  }
}

const loadActiveWorkouts = async () => {
  try {
    console.log('🚀 WorkoutProgramsPage: Loading active workouts...')
    const result = await workoutService.getUserWorkoutProgress()
    activeWorkouts.value = result
    console.log('✅ WorkoutProgramsPage: Active workouts loaded:', activeWorkouts.value.length)
  } catch (error: any) {
    console.error('❌ WorkoutProgramsPage: Error loading active workouts:', error)
    activeWorkouts.value = []
  }
}

const selectProgram = (program: WorkoutProgram) => {
  console.log('🎯 WorkoutProgramsPage: Selecting program:', program.name)
  router.push(`/workout-program-details/${program.id}`)
}

const handleProgramAction = async (program: WorkoutProgram) => {
  const isStarted = workoutService.isProgramStarted(program.id, activeWorkouts.value)
  const isCompleted = workoutService.isProgramCompleted(program.id, activeWorkouts.value)
  
  if (isStarted && !isCompleted) {
    // Продолжить активную тренировку
    console.log('🔄 WorkoutProgramsPage: Continuing active workout:', program.name)
    router.push(`/workout-session/${program.id}`)
  } else if (isCompleted) {
    // Повторить завершенную тренировку
    console.log('🔄 WorkoutProgramsPage: Repeating completed workout:', program.name)
    await startProgram(program)
  } else {
    // Начать новую тренировку
    console.log('🎯 WorkoutProgramsPage: Starting new workout:', program.name)
    await startProgram(program)
  }
}

const startProgram = async (program: WorkoutProgram) => {
  try {
    console.log('🚀 WorkoutProgramsPage: Starting program:', program.name)
    
      const progressData = {
        program_id: program.id,
        exercise_id: 'default-exercise-id',
        sets_completed: 0,
        reps_completed: 0,
        weight_used: 0,
        duration_seconds: 0,
        notes: `Начата тренировка: ${program.name}`
      }

    const progressResult = await workoutService.startWorkoutProgress(progressData)
    console.log('✅ WorkoutProgramsPage: Workout progress created:', progressResult)

    // Обновляем список активных тренировок
    await loadActiveWorkouts()

    // Переходим на страницу тренировки
    router.push(`/workout-session/${program.id}`)
  } catch (error: any) {
    console.error('❌ WorkoutProgramsPage: Error starting program:', error)
  }
}

const goBack = () => {
  router.push('/workouts')
}

const getThumbnailUrl = (program: WorkoutProgram) => {
  return workoutService.getThumbnailUrl(program) || '/assets/images/program-placeholder.jpg'
}

const getDifficultyLabel = (level: string) => {
  const labels = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  }
  return labels[level as keyof typeof labels] || level
}

const getProgramStatus = (program: WorkoutProgram) => {
  return workoutService.getProgramStatus(program.id, activeWorkouts.value)
}

const getStatusIcon = (program: WorkoutProgram) => {
  const status = getProgramStatus(program)
  switch (status) {
    case 'completed': return checkmarkCircleOutline
    case 'active': return playOutline
    default: return fitnessOutline
  }
}

const getStatusText = (program: WorkoutProgram) => {
  const status = getProgramStatus(program)
  switch (status) {
    case 'completed': return 'Завершено'
    case 'active': return 'В процессе'
    default: return 'Новое'
  }
}

const getActionColor = (program: WorkoutProgram) => {
  const status = getProgramStatus(program)
  switch (status) {
    case 'completed': return 'secondary'
    case 'active': return 'primary'
    default: return 'primary'
  }
}

const getActionIcon = (program: WorkoutProgram) => {
  const status = getProgramStatus(program)
  switch (status) {
    case 'completed': return refreshOutline
    case 'active': return playOutline
    default: return playOutline
  }
}

const getActionText = (program: WorkoutProgram) => {
  const status = getProgramStatus(program)
  switch (status) {
    case 'completed': return 'Повторить'
    case 'active': return 'Продолжить'
    default: return 'Начать'
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/assets/images/program-placeholder.jpg'
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

// Lifecycle
onMounted(async () => {
  console.log('🚀 WorkoutProgramsPage: Component mounted')
  console.log('🚀 WorkoutProgramsPage: Category ID:', categoryId.value)
  
  await Promise.all([
    loadCategory(),
    loadActiveWorkouts()
  ])
  
  if (category.value && !categoryError.value) {
    await loadPrograms()
  }
})
</script>

<style scoped>
.workout-programs-container {
  min-height: 100vh;
  background: var(--background);
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  text-align: center;
}

.header-spacer {
  width: 40px;
}

.category-info {
  padding: 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-color);
}

.category-description p {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.category-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--text-secondary);
}

.programs-section {
  padding: 16px;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.program-card {
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.program-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.program-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.program-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.program-badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.difficulty-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.beginner {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.difficulty-badge.intermediate {
  background: rgba(255, 152, 0, 0.9);
  color: white;
}

.difficulty-badge.advanced {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.free-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.program-content {
  padding: 16px;
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.program-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.3;
}

.program-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.program-status.completed {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.program-status.active {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.program-status.new {
  background: rgba(133, 96, 255, 0.1);
  color: #8560ff;
}

.program-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.program-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.program-stats .stat-item {
  font-size: 12px;
}

.program-actions {
  display: flex;
  justify-content: flex-end;
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

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-container h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.error-container p {
  margin: 0 0 24px 0;
  color: var(--text-secondary);
}

/* CSS Variables for theming */
:root {
  --background: #f5f7fa;
  --surface: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
}

.ion-palette-dark {
  --background: #1a191b;
  --surface: #2a2a2c;
  --text-color: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #4a4a4c;
}
</style>
