<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="workout-program-details-container">
        <!-- Hero Header -->
        <div class="program-hero">
          <div class="hero-background">
            <div class="hero-image">
              <img
                v-if="program?.thumbnail?.has_media"
                :src="getThumbnailUrl(program)"
                :alt="program.name"
                @error="onImageError"
              />
              <div v-else class="placeholder-image">
                <ion-icon :icon="fitnessOutline" size="large"></ion-icon>
              </div>
            </div>
          </div>

          <div class="hero-content">
            <div class="hero-info">
              <div class="program-badges">
                <span class="difficulty-badge" :class="program?.difficulty_level">
                  <ion-icon :icon="speedometerOutline"></ion-icon>
                  {{ getDifficultyLabel(program?.difficulty_level) }}
                </span>
                <span v-if="program?.is_free" class="free-badge">
                  <ion-icon :icon="giftOutline"></ion-icon>
                  Бесплатно
                </span>
              </div>

              <h1 class="program-title">{{ program?.name }}</h1>
              <p class="program-subtitle">{{ program?.short_description }}</p>

              <div class="hero-stats">
                <div class="stat-item">
                  <div class="stat-icon">
                    <ion-icon :icon="timeOutline"></ion-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-value">{{ program?.duration_weeks }}</span>
                    <span class="stat-label">недель</span>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <ion-icon :icon="flameOutline"></ion-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-value">{{ program?.calories_per_workout }}</span>
                    <span class="stat-label">ккал</span>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <ion-icon :icon="fitnessOutline"></ion-icon>
                  </div>
                  <div class="stat-content">
                    <span class="stat-value">{{ program?.category?.name || 'Общая' }}</span>
                    <span class="stat-label">категория</span>
                  </div>
                </div>
              </div>

              <div class="hero-actions">
                <ion-button 
                  fill="solid" 
                  :color="getActionColor()"
                  @click="handleProgramAction"
                  :disabled="!program"
                >
                  <ion-icon :icon="getActionIcon()" slot="start"></ion-icon>
                  {{ getActionText() }}
                </ion-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Program Details -->
        <div class="program-details">
          <div class="section">
            <div class="section-header">
              <h2>Описание программы</h2>
            </div>
            <div class="section-content">
              <p class="program-description">{{ program?.description }}</p>
            </div>
          </div>

          <!-- Exercises List -->
          <div v-if="exercises.length > 0" class="section">
            <div class="section-header">
              <h2>Упражнения ({{ exercises.length }})</h2>
            </div>
            <div class="exercises-list">
              <div
                v-for="(exercise, index) in exercises"
                :key="exercise.id"
                class="exercise-item"
              >
                <div class="exercise-number">{{ index + 1 }}</div>
                <div class="exercise-content">
                  <h4 class="exercise-name">{{ exercise.name }}</h4>
                  <p class="exercise-description">{{ exercise.description }}</p>
                  <div class="exercise-meta">
                    <div v-if="exercise.duration_seconds" class="meta-item">
                      <ion-icon :icon="timeOutline"></ion-icon>
                      <span>{{ formatDuration(exercise.duration_seconds) }}</span>
                    </div>
                    <div v-if="exercise.sets" class="meta-item">
                      <ion-icon :icon="repeatOutline"></ion-icon>
                      <span>{{ exercise.sets }}×</span>
                    </div>
                    <div v-if="exercise.reps" class="meta-item">
                      <ion-icon :icon="fitnessOutline"></ion-icon>
                      <span>{{ exercise.reps }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Program Stats -->
          <div class="section">
            <div class="section-header">
              <h2>Статистика программы</h2>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <ion-icon :icon="fitnessOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ exercises.length }}</span>
                  <span class="stat-label">Упражнений</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <ion-icon :icon="timeOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ program?.duration_weeks }}</span>
                  <span class="stat-label">Недель</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <ion-icon :icon="flameOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ program?.calories_per_workout }}</span>
                  <span class="stat-label">Ккал за тренировку</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <ion-icon :icon="speedometerOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ getDifficultyLabel(program?.difficulty_level) }}</span>
                  <span class="stat-label">Уровень</span>
                </div>
              </div>
            </div>
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
  IonIcon
} from '@ionic/vue'
import {
  fitnessOutline,
  speedometerOutline,
  giftOutline,
  timeOutline,
  flameOutline,
  repeatOutline,
  playOutline,
  refreshOutline,
  checkmarkCircleOutline
} from 'ionicons/icons'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { WorkoutServiceV2 } from '@/services/workoutServiceV2'
import type { WorkoutProgram, WorkoutExercise } from '@/services/workoutServiceV2'

const route = useRoute()
const router = useRouter()
const workoutService = WorkoutServiceV2.getInstance()

// Reactive data
const program = ref<WorkoutProgram | null>(null)
const exercises = ref<WorkoutExercise[]>([])
const programLoading = ref(false)
const exercisesLoading = ref(false)
const activeWorkouts = ref<any[]>([])

// Computed
const programId = computed(() => route.params.programId as string)

// Methods
const loadProgram = async () => {
  if (!programId.value) return

  programLoading.value = true

  try {
    console.log('🚀 WorkoutProgramDetailsPage: Loading program:', programId.value)
    
    // Загружаем программу из кэша или API
    const programs = await workoutService.getWorkoutPrograms({ per_page: 100 })
    const foundProgram = programs.data?.find(p => p.id === programId.value)
    
    if (foundProgram) {
      program.value = foundProgram
      console.log('✅ WorkoutProgramDetailsPage: Program loaded:', foundProgram.name)
    } else {
      console.error('❌ WorkoutProgramDetailsPage: Program not found:', programId.value)
      router.push('/workouts')
    }
  } catch (error: any) {
    console.error('❌ WorkoutProgramDetailsPage: Error loading program:', error)
    router.push('/workouts')
  } finally {
    programLoading.value = false
  }
}

const loadExercises = async () => {
  if (!programId.value) return

  exercisesLoading.value = true

  try {
    console.log('🚀 WorkoutProgramDetailsPage: Loading exercises for program:', programId.value)
    const result = await workoutService.getWorkoutExercisesByProgram(programId.value)
    
    if (result && result.length > 0) {
      exercises.value = result
      console.log('✅ WorkoutProgramDetailsPage: Exercises loaded:', result.length)
    } else {
      console.warn('⚠️ WorkoutProgramDetailsPage: No exercises found')
      exercises.value = []
    }
  } catch (error: any) {
    console.error('❌ WorkoutProgramDetailsPage: Error loading exercises:', error)
    exercises.value = []
  } finally {
    exercisesLoading.value = false
  }
}

const loadActiveWorkouts = async () => {
  try {
    console.log('🚀 WorkoutProgramDetailsPage: Loading active workouts...')
    const result = await workoutService.getUserWorkoutProgress()
    activeWorkouts.value = result || []
    console.log('✅ WorkoutProgramDetailsPage: Active workouts loaded:', activeWorkouts.value.length)
  } catch (error: any) {
    console.error('❌ WorkoutProgramDetailsPage: Error loading active workouts:', error)
  }
}

const handleProgramAction = async () => {
  if (!program.value) return

  const isStarted = workoutService.isProgramStarted(program.value.id, activeWorkouts.value)
  const isCompleted = workoutService.isProgramCompleted(program.value.id, activeWorkouts.value)
  
  if (isStarted && !isCompleted) {
    // Продолжить активную тренировку
    console.log('🔄 WorkoutProgramDetailsPage: Continuing active workout:', program.value.name)
    router.push(`/workout-session/${program.value.id}`)
  } else if (isCompleted) {
    // Повторить завершенную тренировку
    console.log('🔄 WorkoutProgramDetailsPage: Repeating completed workout:', program.value.name)
    await startProgram()
  } else {
    // Начать новую тренировку
    console.log('🎯 WorkoutProgramDetailsPage: Starting new workout:', program.value.name)
    await startProgram()
  }
}

const startProgram = async () => {
  if (!program.value) return

  try {
    console.log('🚀 WorkoutProgramDetailsPage: Starting program:', program.value.name)
    
    const progressData = {
      program_id: program.value.id,
      exercise_id: 'default-exercise-id',
      sets_completed: 0,
      reps_completed: 0,
      weight_used: 0,
      duration_seconds: 0,
      notes: `Начата тренировка: ${program.value.name}`
    }

    const progressResult = await workoutService.startWorkoutProgress(progressData)
    console.log('✅ WorkoutProgramDetailsPage: Workout progress created:', progressResult)

    // Обновляем список активных тренировок
    await loadActiveWorkouts()

    // Переходим на страницу тренировки
    router.push(`/workout-session/${program.value.id}`)
  } catch (error: any) {
    console.error('❌ WorkoutProgramDetailsPage: Error starting program:', error)
  }
}

const getThumbnailUrl = (program: WorkoutProgram) => {
  return program.thumbnail?.file || program.thumbnail?.url || program.video?.file || program.video?.url || '/assets/images/program-placeholder.jpg'
}

const getDifficultyLabel = (level?: string) => {
  if (!level) return 'Неизвестно'
  const labels = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый'
  }
  return labels[level as keyof typeof labels] || level
}

const getProgramStatus = () => {
  if (!program.value) return 'new'
  const isStarted = workoutService.isProgramStarted(program.value.id, activeWorkouts.value)
  const isCompleted = workoutService.isProgramCompleted(program.value.id, activeWorkouts.value)
  
  if (isCompleted) return 'completed'
  if (isStarted) return 'active'
  return 'new'
}

const getActionColor = () => {
  const status = getProgramStatus()
  switch (status) {
    case 'completed': return 'secondary'
    case 'active': return 'primary'
    default: return 'primary'
  }
}

const getActionIcon = () => {
  const status = getProgramStatus()
  switch (status) {
    case 'completed': return refreshOutline
    case 'active': return playOutline
    default: return playOutline
  }
}

const getActionText = () => {
  const status = getProgramStatus()
  switch (status) {
    case 'completed': return 'Повторить программу'
    case 'active': return 'Продолжить тренировку'
    default: return 'Начать программу'
  }
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins} мин ${secs} сек`
  }
  return `${secs} сек`
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/assets/images/program-placeholder.jpg'
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 WorkoutProgramDetailsPage: Component mounted')
  console.log('🚀 WorkoutProgramDetailsPage: Program ID:', programId.value)
  
  await Promise.all([
    loadProgram(),
    loadActiveWorkouts()
  ])
  
  if (program.value) {
    await loadExercises()
  }
})
</script>

<style scoped>
.workout-program-details-container {
  min-height: 100vh;
  background: var(--background);
}

.program-hero {
  position: relative;
  min-height: 400px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  color: white;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 24px 16px;
  background: linear-gradient(transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.hero-info {
  width: 100%;
  color: white;
}

.program-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.difficulty-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.beginner {
  background: rgba(76, 175, 80, 0.9);
}

.difficulty-badge.intermediate {
  background: rgba(255, 152, 0, 0.9);
}

.difficulty-badge.advanced {
  background: rgba(244, 67, 54, 0.9);
}

.free-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.program-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.program-subtitle {
  margin: 0 0 24px 0;
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.4;
}

.hero-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon ion-icon {
  font-size: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.program-details {
  padding: 24px 16px;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.section-content {
  color: var(--text-secondary);
  line-height: 1.6;
}

.program-description {
  margin: 0;
  font-size: 16px;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exercise-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.exercise-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.exercise-content {
  flex: 1;
}

.exercise-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.exercise-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.exercise-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card .stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card .stat-icon ion-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-card .stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-card .stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* CSS Variables for theming */
:root {
  --background: #f5f7fa;
  --surface: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --primary-color: #8560ff;
}

.ion-palette-dark {
  --background: #1a191b;
  --surface: #2a2a2c;
  --text-color: #ffffff;
  --text-secondary: #cccccc;
  --primary-color: #a38fe4;
}
</style>
