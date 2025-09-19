<!-- @ts-nocheck -->
<template>
  <ion-modal 
    :is-open="isOpen" 
    @did-dismiss="closeModal"
    :backdrop-dismiss="true"
    class="exercise-video-modal"
  >
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ exercise?.name || 'Видео упражнения' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal" fill="clear">
              <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content class="video-content">
        <div class="video-container" v-if="exercise">
          <!-- Видео плеер -->
          <div class="video-wrapper">
            <video
              ref="videoPlayer"
              :src="getVideoUrl()"
              :poster="getThumbnailUrl()"
              controls
              preload="metadata"
              class="exercise-video"
              @loadedmetadata="onVideoLoaded"
              @error="onVideoError"
            >
              Ваш браузер не поддерживает видео.
            </video>
          </div>
          
          <!-- Информация об упражнении -->
          <div class="exercise-details">
            <h2 class="exercise-title">{{ exercise.name }}</h2>
            <p class="exercise-description" v-if="exercise.description">
              {{ exercise.description }}
            </p>
            
            <!-- Инструкции -->
            <div class="instructions-section" v-if="exercise.instructions">
              <h3>Инструкции:</h3>
              <p class="instructions-text">{{ exercise.instructions }}</p>
            </div>
            
            <!-- Детали упражнения -->
            <div class="exercise-meta" v-if="exercise.duration_seconds || exercise.sets || exercise.reps">
              <div class="meta-grid">
                <div class="meta-item" v-if="exercise.duration_seconds">
                  <ion-icon :icon="timeOutline"></ion-icon>
                  <span>{{ formatDuration(exercise.duration_seconds) }}</span>
                </div>
                <div class="meta-item" v-if="exercise.sets">
                  <ion-icon :icon="repeatOutline"></ion-icon>
                  <span>{{ exercise.sets }}×</span>
                </div>
                <div class="meta-item" v-if="exercise.reps">
                  <ion-icon :icon="fitnessOutline"></ion-icon>
                  <span>{{ exercise.reps }}</span>
                </div>
              </div>
            </div>
            
            <!-- Группы мышц -->
            <div class="muscle-groups-section" v-if="exercise.muscle_groups?.length">
              <h3>Задействованные мышцы:</h3>
              <div class="muscle-chips">
                <span 
                  v-for="muscle in exercise.muscle_groups" 
                  :key="muscle" 
                  class="muscle-chip"
                >
                  {{ muscle }}
                </span>
              </div>
            </div>
            
            <!-- Оборудование -->
            <div class="equipment-section" v-if="exercise.equipment_needed?.length">
              <h3>Необходимое оборудование:</h3>
              <div class="equipment-list">
                <span 
                  v-for="equipment in exercise.equipment_needed" 
                  :key="equipment" 
                  class="equipment-item"
                >
                  {{ equipment }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Состояние загрузки -->
        <div class="loading-state" v-if="isLoading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Загрузка видео...</p>
        </div>
        
        <!-- Состояние ошибки -->
        <div class="error-state" v-if="hasError">
          <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
          <h3>Ошибка загрузки видео</h3>
          <p>Не удалось загрузить видео упражнения.</p>
          <ion-button @click="retryVideo" fill="outline">
            <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
            Попробовать снова
          </ion-button>
        </div>
      </ion-content>
    </ion-page>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  closeOutline,
  timeOutline,
  repeatOutline,
  fitnessOutline,
  pauseOutline,
  alertCircleOutline,
  refreshOutline
} from 'ionicons/icons'
import { ref, watch, nextTick } from 'vue'
import type { WorkoutExercise } from '@/types/workout'

// Props
interface Props {
  isOpen: boolean
  exercise: WorkoutExercise | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Reactive data
const videoPlayer = ref<HTMLVideoElement>()
const isLoading = ref(false)
const hasError = ref(false)

// Methods
const closeModal = () => {
  // Останавливаем видео при закрытии
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
  emit('close')
}

const onVideoLoaded = () => {
  isLoading.value = false
  hasError.value = false
}

const onVideoError = () => {
  isLoading.value = false
  hasError.value = true
}

const retryVideo = () => {
  hasError.value = false
  isLoading.value = true
  
  if (videoPlayer.value) {
    videoPlayer.value.load()
  }
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${remainingSeconds}с`
}

const getVideoUrl = (): string | undefined => {
  if (!props.exercise?.video) return undefined
  return props.exercise.video.file || props.exercise.video.url
}

const getThumbnailUrl = (): string | undefined => {
  if (!props.exercise?.thumbnail) return undefined
  return props.exercise.thumbnail.file || props.exercise.thumbnail.url
}

// Watchers
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && getVideoUrl()) {
    isLoading.value = true
    hasError.value = false
    
    await nextTick()
    
    if (videoPlayer.value) {
      videoPlayer.value.load()
    }
  }
})

watch(() => props.exercise, (newExercise) => {
  if (getVideoUrl() && props.isOpen) {
    isLoading.value = true
    hasError.value = false
  }
})
</script>

<style scoped>
.exercise-video-modal {
  --width: 100%;
  --height: 100%;
  --max-width: 800px;
  --max-height: 90vh;
}

.video-content {
  --background: #f8fafc;
}

.video-container {
  padding: 0;
}

.video-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 0;
  overflow: hidden;
}

.exercise-video {
  width: 100%;
  height: auto;
  min-height: 300px;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.exercise-details {
  padding: 20px;
  background: white;
}

.exercise-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.exercise-description {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.instructions-section {
  margin-bottom: 24px;
}

.instructions-section h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.instructions-text {
  margin: 0;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.exercise-meta {
  margin-bottom: 24px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.meta-item ion-icon {
  font-size: 18px;
  color: #6b7280;
}

.muscle-groups-section,
.equipment-section {
  margin-bottom: 20px;
}

.muscle-groups-section h3,
.equipment-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.muscle-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.muscle-chip {
  padding: 6px 12px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.equipment-item {
  padding: 6px 12px;
  background: #e5e7eb;
  color: #374151;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-state p {
  margin-top: 16px;
  color: #6b7280;
  font-size: 16px;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.error-state p {
  margin: 0 0 20px 0;
  color: #6b7280;
  font-size: 16px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .exercise-details {
    padding: 16px;
  }
  
  .exercise-title {
    font-size: 20px;
  }
  
  .meta-grid {
    grid-template-columns: 1fr;
  }
  
  .muscle-chips,
  .equipment-list {
    gap: 6px;
  }
  
  .muscle-chip,
  .equipment-item {
    font-size: 12px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .exercise-details {
    padding: 12px;
  }
  
  .exercise-title {
    font-size: 18px;
  }
  
  .exercise-description {
    font-size: 14px;
  }
  
  .instructions-text {
    font-size: 14px;
    padding: 10px;
  }
}
</style>
