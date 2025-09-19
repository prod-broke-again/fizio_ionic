<template>
  <ion-page>
    <ion-content :fullscreen="true" class="workout-session-container">
            <!-- Стандартный Ionic header -->
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="goBack" fill="clear">
              <ion-icon :icon="arrowBackOutline" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>{{ programName }}</ion-title>
        </ion-toolbar>
      </ion-header>
      

      <!-- Центральный таймер -->
      <div class="timer-section" v-if="currentExercise">
        <div class="timer-container">
          <div class="timer-circle" :class="{ 'timer-active': timerRunning }">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                stroke-width="8"
                fill="none"
                class="timer-bg"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="url(#timerGradient)"
                stroke-width="8"
                fill="none"
                class="timer-progress"
                :stroke-dasharray="`${timerProgress} ${timerCircumference}`"
                transform="rotate(-90 100 100)"
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#6366f1" />
                  <stop offset="100%" stop-color="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div class="timer-content">
              <div class="timer-time">{{ formatTime(remainingTime) }}</div>
              <div class="timer-status">{{ timerLabel }}</div>
            </div>
          </div>

          <!-- Кнопки управления таймером -->
          <div class="timer-controls">
            <button @click="toggleTimer" class="timer-btn primary">
              <ion-icon :icon="timerRunning ? pauseOutline : playOutline"></ion-icon>
              {{ timerRunning ? 'Пауза' : 'Старт' }}
            </button>
            <button @click="skipExercise" class="timer-btn secondary">
              <ion-icon :icon="playSkipForwardOutline"></ion-icon>
              Пропустить
            </button>
          </div>
        </div>
      </div>

      <!-- Информация об упражнении -->
      <div class="exercise-info" v-if="currentExercise">
        <div class="exercise-header">
          <h2 class="exercise-title">{{ currentExercise.name }}</h2>
          
          <!-- Прогресс упражнений -->
          <div class="exercise-progress">
            <span class="current-ex">{{ currentExerciseIndex + 1 }}</span>
            <span class="separator">/</span>
            <span class="total-ex">{{ exercises.length }}</span>
          </div>
        </div>
      </div>

      <!-- Видео/Изображение упражнения -->
      <div class="media-section" v-if="currentExercise && (currentExercise.video?.has_media || currentExercise.thumbnail?.has_media)">
        <div class="media-container">
          <!-- Превью видео с кнопкой воспроизведения -->
          <div class="video-preview" v-if="currentExercise.video?.has_media" @click="openVideoModal">
            <video
              ref="exerciseVideo"
              :src="getVideoUrl()"
              :poster="getThumbnailUrl()"
              preload="metadata"
              class="exercise-media"
              @ended="onVideoEnded"
              muted
            ></video>
            <div class="play-overlay">
              <ion-icon :icon="playCircleOutline" class="play-icon"></ion-icon>
              <span class="play-text">Смотреть видео</span>
            </div>
          </div>
          <img
            v-else
            :src="getThumbnailUrl()"
            alt="Упражнение"
            class="exercise-media"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Анатомический скелет с мышцами -->
      <div class="muscle-skeleton-section" v-if="currentExercise && currentExercise.muscle_groups?.length">
        <AnatomicalSkeleton 
          :muscle-groups="currentExercise.muscle_groups"
          :show-legend="true"
          :animation-speed="3000"
          @muscle-click="onMuscleClick"
        />
      </div>

      <!-- Кнопки действий -->
      <div class="action-section" v-if="currentExercise">
        <button
          @click="completeExercise"
          class="complete-btn"
          :class="{ 'completed': completedExercises.has(currentExercise.id) }"
          :disabled="!canCompleteExercise"
        >
          <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          {{ completedExercises.has(currentExercise.id) ? 'Завершено' : 'Завершить' }}
        </button>

        <button
          @click="nextExercise"
          class="next-btn"
          v-if="hasNextExercise"
        >
          <ion-icon :icon="arrowForwardOutline"></ion-icon>
          Следующее
        </button>
      </div>

      <!-- Завершение тренировки -->
      <div class="completion-section" v-if="isWorkoutComplete">
        <div class="completion-content">
          <div class="completion-icon">
            <ion-icon :icon="trophyOutline"></ion-icon>
          </div>
          <h2>Тренировка завершена!</h2>
          <p>Отличная работа! Вы выполнили все упражнения.</p>

          <div class="completion-summary">
            <div class="summary-item">
              <ion-icon :icon="timeOutline"></ion-icon>
              <span>{{ formatDuration(totalWorkoutTime) }}</span>
            </div>
            <div class="summary-item">
              <ion-icon :icon="fitnessOutline"></ion-icon>
              <span>{{ completedExercises.size }} упр.</span>
            </div>
            <div class="summary-item">
              <ion-icon :icon="flameOutline"></ion-icon>
              <span>{{ estimatedCalories }} ккал</span>
            </div>
          </div>

          <div class="completion-buttons">
            <button @click="finishWorkout" class="finish-btn">
              <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
              Завершить
            </button>
            <button @click="repeatWorkout" class="repeat-btn">
              <ion-icon :icon="repeatOutline"></ion-icon>
              Повторить
            </button>
          </div>
        </div>
      </div>
    </ion-content>
    
    <!-- Модальное окно для видео упражнения -->
    <ExerciseVideoModal
      :is-open="isVideoModalOpen"
      :exercise="selectedExercise"
      @close="closeVideoModal"
    />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  toastController,
  alertController
} from '@ionic/vue'
import {
  arrowBackOutline,
  playOutline,
  pauseOutline,
  playCircleOutline,
  timeOutline,
  fitnessOutline,
  repeatOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  playSkipForwardOutline,
  trophyOutline,
  flameOutline
} from 'ionicons/icons'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { WorkoutExercise } from '@/types/workout'
import { WorkoutServiceV2 } from '@/services/workoutServiceV2'
import AnatomicalSkeleton from '@/components/AnatomicalSkeleton.vue'
import ExerciseVideoModal from '@/components/ExerciseVideoModal.vue'

// Props
const route = useRoute()
const router = useRouter()

// Service instance
const workoutService = WorkoutServiceV2.getInstance()

// Reactive data
const exercises = ref<WorkoutExercise[]>([])
const currentExerciseIndex = ref(0)
const timerRunning = ref(false)
const remainingTime = ref(0)
const workoutStartTime = ref(Date.now())
const completedExercises = ref(new Set<string>())
const workoutFinished = ref(false)
const programName = ref('')
const isVideoModalOpen = ref(false)
const selectedExercise = ref<WorkoutExercise | null>(null)

// Timer constants
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 54

// Computed properties
const currentExercise = computed(() => exercises.value[currentExerciseIndex.value])
const hasNextExercise = computed(() => currentExerciseIndex.value < exercises.value.length - 1)
const isWorkoutComplete = computed(() => currentExerciseIndex.value >= exercises.value.length || workoutFinished.value)

const timerProgress = computed(() => {
  if (currentExercise.value?.duration_seconds) {
    return (remainingTime.value / currentExercise.value.duration_seconds) * TIMER_CIRCUMFERENCE
  }
  return 0
})

const timerCircumference = computed(() => TIMER_CIRCUMFERENCE)

const timerLabel = computed(() => {
  if (currentExercise.value?.duration_seconds && remainingTime.value > 0) {
    return `${Math.ceil(remainingTime.value)} сек`
  }
  return 'Готово'
})

const canCompleteExercise = computed(() => {
  return timerRunning.value || remainingTime.value <= 0 || completedExercises.value.has(currentExercise.value?.id)
})

const totalWorkoutTime = computed(() => {
  return Math.floor((Date.now() - workoutStartTime.value) / 1000)
})

const estimatedCalories = computed(() => {
  // Простая оценка калорий на основе длительности и интенсивности
  return Math.floor(totalWorkoutTime.value * 0.1)
})

// Methods
const goBack = async () => {
  // Если тренировка не запущена, переходим сразу
  if (!timerRunning.value && completedExercises.value.size === 0) {
    stopTimer()
    router.push('/workouts')
    return
  }

  const alert = await alertController.create({
    header: 'Прервать тренировку?',
    message: 'Вы действительно хотите прервать тренировку?',
    buttons: [
      {
        text: 'Продолжить',
        role: 'cancel'
      },
      {
        text: 'Прервать',
        role: 'destructive',
        handler: () => {
          // Останавливаем таймер перед выходом
          stopTimer()
          // Переходим к списку программ тренировок
          router.push('/workouts')
        }
      }
    ]
  })
  await alert.present()
}

const loadExercises = async () => {
  try {
    const programId = route.params.programId as string
    console.log('🔍 WorkoutSessionPage: Loading exercises for programId:', programId)
    console.log('🔍 WorkoutSessionPage: Route params:', route.params)
    console.log('🔍 WorkoutSessionPage: Route path:', route.path)

    if (!programId) {
      console.error('❌ WorkoutSessionPage: No programId provided!')
      const toast = await toastController.create({
        message: 'Ошибка: не указан ID программы',
        duration: 2000,
        color: 'danger'
      })
      await toast.present()
      router.push('/workouts')
      return
    }

    // Получить упражнения программы напрямую по ID
    const exercisesData = await workoutService.getWorkoutExercisesByProgram(programId)

    if (exercisesData && exercisesData.length > 0) {
      exercises.value = exercisesData
      programName.value = 'Программа тренировки' // В будущем можно получить название программы отдельно

      if (exercises.value.length > 0) {
        remainingTime.value = exercises.value[0].duration_seconds
      }
    } else {
      console.warn('No exercises found for program:', programId)
    }
  } catch (error) {
    console.error('Error loading exercises:', error)
    const toast = await toastController.create({
      message: 'Ошибка при загрузке упражнений',
      duration: 2000,
      color: 'danger'
    })
    await toast.present()
  }
}

const toggleTimer = () => {
  timerRunning.value = !timerRunning.value
}


const openVideoModal = () => {
  if (currentExercise.value) {
    selectedExercise.value = currentExercise.value
    isVideoModalOpen.value = true
  }
}

const closeVideoModal = () => {
  isVideoModalOpen.value = false
  selectedExercise.value = null
}

const onMuscleClick = (muscle: string) => {
  console.log('Clicked muscle:', muscle)
  // Можно добавить дополнительную логику, например, показать информацию о мышце
}

const onVideoEnded = () => {
  // Автоматически завершить упражнение когда видео закончится
  if (!completedExercises.value.has(currentExercise.value.id)) {
    completeExercise()
  }
}

const completeExercise = async () => {
  if (!currentExercise.value) return

  completedExercises.value.add(currentExercise.value.id)
  timerRunning.value = false

      // Создать запись о прогрессе
  try {
    // Для простоты создаем новую запись прогресса вместо обновления существующей
    await workoutService.startWorkoutProgress({
      program_id: route.params.programId as string,
      exercise_id: currentExercise.value.id,
      sets_completed: currentExercise.value.sets || 1,
      reps_completed: currentExercise.value.reps || 1,
      weight_used: 0,
      duration_seconds: currentExercise.value.duration_seconds,
      notes: `Завершено упражнение: ${currentExercise.value.name}`
    })

    const toast = await toastController.create({
      message: 'Упражнение завершено!',
      duration: 1500,
      color: 'success'
    })
    await toast.present()

    // Автоматически перейти к следующему упражнению через 1 секунду
    setTimeout(() => {
      if (hasNextExercise.value) {
        nextExercise()
      } else {
        // Если это последнее упражнение, завершить тренировку
        finishWorkout()
      }
    }, 1000)

  } catch (error) {
    console.error('Error updating progress:', error)
  }
}

const nextExercise = () => {
  if (hasNextExercise.value) {
    currentExerciseIndex.value++
    remainingTime.value = currentExercise.value?.duration_seconds || 0
    timerRunning.value = false
  }
}

const skipExercise = () => {
  if (hasNextExercise.value) {
    nextExercise()
  } else {
    finishWorkout()
  }
}

const finishWorkout = async () => {
  workoutFinished.value = true

  try {
    // Создать финальную запись о завершении тренировки
    await workoutService.startWorkoutProgress({
      program_id: route.params.programId as string,
      exercise_id: currentExercise.value?.id || 'default-exercise-id',
      sets_completed: currentExercise.value?.sets || 1,
      reps_completed: currentExercise.value?.reps || 1,
      weight_used: 0,
      duration_seconds: totalWorkoutTime.value,
      notes: `Тренировка завершена: ${programName.value}`
    })

    const toast = await toastController.create({
      message: 'Тренировка успешно завершена!',
      duration: 2000,
      color: 'success'
    })
    await toast.present()

    router.go(-1)
  } catch (error) {
    console.error('Error finishing workout:', error)
  }
}

const repeatWorkout = () => {
  currentExerciseIndex.value = 0
  completedExercises.value.clear()
  workoutStartTime.value = Date.now()
  remainingTime.value = currentExercise.value?.duration_seconds || 0
  timerRunning.value = false
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins > 0) {
    return `${mins} мин ${secs} сек`
  }
  return `${secs} сек`
}

const getVideoUrl = (): string | undefined => {
  if (!currentExercise.value?.video) return undefined
  return currentExercise.value.video.file || currentExercise.value.video.url
}

const getThumbnailUrl = (): string | undefined => {
  if (!currentExercise.value?.thumbnail) return undefined
  return currentExercise.value.thumbnail.file || currentExercise.value.thumbnail.url
}

// Обработка ошибок загрузки изображений
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log('Ошибка загрузки изображения упражнения:', img.src)

  // Устанавливаем fallback - градиентный фон вместо черного
  img.style.background = 'linear-gradient(135deg, #8e81ff 0%, #667eea 100%)'
  img.style.display = 'flex'
  img.style.alignItems = 'center'
  img.style.justifyContent = 'center'
  img.style.color = 'white'
  img.style.fontSize = '14px'
  img.style.fontWeight = '600'
  img.alt = 'Изображение недоступно'

  // Можно добавить иконку или текст
  if (!img.nextElementSibling?.classList.contains('fallback-text')) {
    const fallbackText = document.createElement('div')
    fallbackText.className = 'fallback-text'
    fallbackText.textContent = 'Изображение недоступно'
    fallbackText.style.position = 'absolute'
    fallbackText.style.color = 'white'
    fallbackText.style.fontSize = '12px'
    fallbackText.style.fontWeight = '500'
    fallbackText.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)'
    img.parentElement?.appendChild(fallbackText)
  }
}

// Timer logic
let timerInterval: number | null = null

const startTimer = () => {
  if (timerInterval) return

  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      timerRunning.value = false
      clearInterval(timerInterval!)
      timerInterval = null

      // Автоматически завершить упражнение
      if (!completedExercises.value.has(currentExercise.value?.id)) {
        completeExercise()
      }
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// Watchers
watch(timerRunning, (running) => {
  if (running) {
    startTimer()
  } else {
    stopTimer()
  }
})

watch(currentExercise, (newExercise) => {
  if (newExercise) {
    remainingTime.value = newExercise.duration_seconds
    timerRunning.value = false
  }
})

// Lifecycle
onMounted(() => {
  console.log('🚀 WorkoutSessionPage: Component mounted')
  console.log('🚀 WorkoutSessionPage: Route:', route)
  console.log('🚀 WorkoutSessionPage: Route params:', route.params)
  console.log('🚀 WorkoutSessionPage: Route path:', route.path)
  console.log('🚀 WorkoutSessionPage: Route name:', route.name)
  
  loadExercises()
  
  // Обработка кнопки "Назад" браузера
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (timerRunning.value) {
      event.preventDefault()
      event.returnValue = 'Тренировка в процессе. Вы уверены, что хотите покинуть страницу?'
      return event.returnValue
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // Очистка при размонтировании
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
})

onUnmounted(() => {
  stopTimer()
})

// Template refs
const exerciseVideo = ref<HTMLVideoElement>()
</script>

<style>
/* ===== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ===== */
/* Светлая тема */
:root {
  --background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  --surface: #ffffff;
  --surface-secondary: #f8fafc;
  --surface-hover: #f1f5f9;
  --border-color: #e2e8f0;
  --text-color: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --primary-color: #6366f1;
  --primary-hover: #4f46e5;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --radius: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}

/* Темная тема */
.ion-palette-dark {
  --background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  --surface: #1e293b;
  --surface-secondary: #334155;
  --surface-hover: #475569;
  --border-color: #475569;
  --text-color: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --primary-color: #818cf8;
  --primary-hover: #6366f1;
  --success-color: #34d399;
  --warning-color: #fbbf24;
  --danger-color: #f87171;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.5);
}

/* ===== ОСНОВНЫЕ СТИЛИ ===== */
.workout-session-container {
  min-height: 100vh;
  background: var(--background);
  color: var(--text-color);
}

/* Header стили */
ion-header ion-toolbar {
  --background: var(--surface);
  --color: var(--text-color);
  --border-color: var(--border-color);
}

ion-back-button {
  --color: var(--text-color);
}




/* ===== TIMER SECTION ===== */
.workout-session-container .timer-section {
  padding: 24px 16px;
  text-align: center;
  background: var(--surface);
  margin: 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.workout-session-container .timer-container {
  max-width: 320px;
  margin: 0 auto;
}

.workout-session-container .timer-circle {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.workout-session-container .timer-circle svg {
  width: 220px;
  height: 220px;
  transform: rotate(-90deg);
  filter: drop-shadow(var(--shadow-lg));
}

.workout-session-container .timer-bg {
  fill: none;
  stroke: var(--border-color);
  stroke-width: 8;
  opacity: 0.2;
}

.workout-session-container .timer-progress {
  fill: none;
  stroke: url(#timerGradient);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.workout-session-container .timer-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.workout-session-container .timer-time {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 4px;
  line-height: 1;
}

.workout-session-container .timer-status {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  background: var(--surface-secondary);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.workout-session-container .timer-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.workout-session-container .timer-btn {
  padding: 12px 20px;
  border-radius: 24px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  min-width: 100px;
  justify-content: center;
}

.workout-session-container .timer-btn.primary {
  background: var(--primary-color);
  color: white;
}

.workout-session-container .timer-btn.primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.workout-session-container .timer-btn.secondary {
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.workout-session-container .timer-btn.secondary:hover {
  background: var(--surface-hover);
  transform: translateY(-1px);
}

/* ===== EXERCISE INFO ===== */
.workout-session-container .exercise-info {
  padding: 20px;
  background: var(--surface);
  margin: 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.workout-session-container .exercise-header {
  margin-bottom: 16px;
}

.workout-session-container .exercise-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-color);
  line-height: 1.4;
}

.workout-session-container .exercise-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

.workout-session-container .exercise-progress {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--surface-secondary);
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  width: fit-content;
  margin-top: 12px;
}

.workout-session-container .current-ex {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 16px;
}

.workout-session-container .separator {
  opacity: 0.5;
  font-weight: 500;
}

.workout-session-container .total-ex {
  opacity: 0.8;
  font-weight: 500;
}


/* ===== EXERCISE META ===== */
.workout-session-container .exercise-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.workout-session-container .meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--surface-secondary);
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.workout-session-container .meta-item:hover {
  background: var(--surface-hover);
  transform: translateY(-1px);
}

.workout-session-container .meta-item ion-icon {
  font-size: 14px;
  color: var(--primary-color);
}

/* ===== MUSCLE GROUPS ===== */
.workout-session-container .muscle-groups {
  margin-top: 16px;
}

.workout-session-container .muscle-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.workout-session-container .muscle-chip {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: var(--success-color);
  color: white;
  border: 1px solid var(--success-color);
  transition: all 0.2s ease;
}

.workout-session-container .muscle-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.workout-session-container .more-chip {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: var(--surface-secondary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

/* ===== MEDIA SECTION ===== */
.workout-session-container .media-section {
  padding: 0 16px 16px;
}

.workout-session-container .media-container {
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.workout-session-container .exercise-media {
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.workout-session-container .exercise-media:hover {
  transform: scale(1.02);
}

/* ===== ACTION SECTION ===== */
.workout-session-container .action-section {
  padding: 20px 16px;
  background: var(--surface);
  margin: 16px;
  margin-bottom: 100px; /* Отступ снизу для табов */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.workout-session-container .complete-btn, 
.workout-session-container .next-btn {
  width: 100%;
  padding: 14px 20px;
  border-radius: var(--radius);
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  margin-bottom: 12px;
}

.workout-session-container .complete-btn:last-child, 
.workout-session-container .next-btn:last-child {
  margin-bottom: 0;
}

.workout-session-container .complete-btn {
  background: var(--success-color);
  color: white;
}

.workout-session-container .complete-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.workout-session-container .complete-btn.completed {
  background: var(--primary-color);
}

.workout-session-container .complete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: var(--shadow-sm);
}

.workout-session-container .next-btn {
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.workout-session-container .next-btn:hover {
  background: var(--surface-hover);
  transform: translateY(-1px);
}

/* ===== COMPLETION SECTION ===== */
.workout-session-container .completion-section {
  padding: 32px 16px;
  text-align: center;
  background: var(--surface);
  margin: 16px;
  margin-bottom: 100px; /* Отступ снизу для табов */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.workout-session-container .completion-content {
  max-width: 320px;
  margin: 0 auto;
}

.workout-session-container .completion-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: var(--shadow-lg);
}

.workout-session-container .completion-icon ion-icon {
  font-size: 32px;
  color: white;
}

.workout-session-container .completion-section h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.workout-session-container .completion-section p {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.workout-session-container .completion-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  gap: 16px;
}

.workout-session-container .summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: var(--surface-secondary);
  padding: 12px 8px;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  min-width: 70px;
  transition: all 0.2s ease;
}

.workout-session-container .summary-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.workout-session-container .summary-item ion-icon {
  font-size: 20px;
  color: var(--primary-color);
}

.workout-session-container .summary-item span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  text-align: center;
}

.workout-session-container .completion-buttons {
  display: flex;
  gap: 12px;
}

.workout-session-container .finish-btn, 
.workout-session-container .repeat-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius);
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

.workout-session-container .finish-btn {
  background: var(--primary-color);
  color: white;
}

.workout-session-container .finish-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.workout-session-container .repeat-btn {
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.workout-session-container .repeat-btn:hover {
  background: var(--surface-hover);
  transform: translateY(-1px);
}

/* ===== VIDEO PREVIEW STYLES ===== */
.video-preview {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.video-preview:hover {
  transform: scale(1.02);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.2s ease;
}

.video-preview:hover .play-overlay {
  background: rgba(0, 0, 0, 0.6);
}

.play-icon {
  font-size: 48px;
  margin-bottom: 8px;
  color: #8e81ff !important; /* Фиолетовый цвет для контраста */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.play-text {
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* ===== MUSCLE SKELETON STYLES ===== */
.muscle-skeleton-section {
  margin: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .workout-session-container .timer-section {
    margin: 12px;
    padding: 20px 12px;
  }

  .workout-session-container .exercise-info {
    margin: 12px;
    padding: 16px;
  }
  
  .muscle-skeleton-section {
    margin: 12px;
  }
  
  .play-icon {
    font-size: 36px;
  }
  
  .play-text {
    font-size: 14px;
  }

  .workout-session-container .action-section {
    margin: 12px;
    margin-bottom: 80px; /* Меньший отступ на мобильных */
    padding: 16px 12px;
  }
  
  .workout-session-container .completion-section {
    margin: 12px;
    margin-bottom: 80px; /* Меньший отступ на мобильных */
    padding: 24px 12px;
  }

  .workout-session-container .timer-circle svg {
    width: 200px;
    height: 200px;
  }

  .workout-session-container .timer-time {
    font-size: 28px;
  }

  .workout-session-container .exercise-title {
    font-size: 18px;
  }

  .workout-session-container .timer-controls {
    flex-direction: column;
    gap: 12px;
  }

  .workout-session-container .timer-btn {
    min-width: auto;
    padding: 14px 20px;
  }

  .workout-session-container .completion-summary {
    flex-direction: column;
    gap: 12px;
  }

  .workout-session-container .completion-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .workout-session-container .summary-item {
    padding: 14px 12px;
    min-width: auto;
  }
}

/* ===== ТЕМНАЯ ТЕМА ===== */
@media (prefers-color-scheme: dark) {
  .workout-session-container {
    background: #1a1a1a;
    color: #ffffff;
  }
  
  /* Тулбар в темной теме */
  ion-header ion-toolbar {
    --background: #1f1f1f;
    --color: #ffffff;
    --border-color: #2a2a2a;
  }
  
  ion-back-button {
    --color: #ffffff;
  }
  
  ion-title {
    color: #ffffff;
  }
  
  ion-button {
    --color: #ffffff;
  }
  
  ion-icon {
    color: #ffffff;
  }
  
  .workout-session-container .timer-section {
    background: #1f1f1f;
    border: 1px solid #2a2a2a;
  }
  
  .workout-session-container .exercise-info {
    background: #1f1f1f;
    border: 1px solid #2a2a2a;
  }
  
  .workout-session-container .action-section {
    background: #1f1f1f;
    border: 1px solid #2a2a2a;
  }
  
  .workout-session-container .completion-section {
    background: #1f1f1f;
    border: 1px solid #2a2a2a;
  }
  
  .muscle-skeleton-section {
    background: #1f1f1f;
    border: 1px solid #2a2a2a;
  }
  
  .workout-session-container .exercise-title {
    color: #ffffff;
  }
  
  .workout-session-container .timer-time {
    color: #ffffff;
  }
  
  .workout-session-container .timer-status {
    color: #cccccc;
  }
  
  .workout-session-container .exercise-progress {
    color: #cccccc;
  }
  
  .workout-session-container .complete-btn {
    background: #2a2a2a;
    color: #ffffff;
    border: 1px solid #3a3a3a;
  }
  
  .workout-session-container .complete-btn:hover {
    background: #3a3a3a;
  }
  
  .workout-session-container .next-btn {
    background: #1f1f1f;
    color: #ffffff;
    border: 1px solid #3a3a3a;
  }
  
  .workout-session-container .next-btn:hover {
    background: #2a2a2a;
  }
  
  .workout-session-container .finish-btn {
    background: #2a2a2a;
    color: #ffffff;
  }
  
  .workout-session-container .finish-btn:hover {
    background: #3a3a3a;
  }
  
  .workout-session-container .repeat-btn {
    background: #1f1f1f;
    color: #ffffff;
    border: 1px solid #3a3a3a;
  }
  
  .workout-session-container .repeat-btn:hover {
    background: #2a2a2a;
  }
}

/* Стили для fallback текста при ошибке загрузки изображения */
.fallback-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white !important;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 1;
}
</style>
