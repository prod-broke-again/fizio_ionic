<!-- @ts-nocheck -->
<template>
  <div class="anatomical-skeleton-container">
    <div class="skeleton-wrapper">
      <!-- SVG с изображением и интерактивными областями -->
      <svg 
        viewBox="0 0 600 980" 
        class="anatomical-skeleton-svg"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <!-- Определения градиентов и фильтров -->
        <defs>
          <!-- Градиент для выделения мышц -->
          <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#ee5a24;stop-opacity:0.9" />
          </linearGradient>
          
          <!-- Градиент для скелета -->
          <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6c757d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#495057;stop-opacity:1" />
          </linearGradient>
          
          <!-- Тень для мышц -->
          <filter id="muscleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2" result="offset"/>
            <feFlood flood-color="#000000" flood-opacity="0.3"/>
            <feComposite in2="offset" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Фоновое изображение скелета -->
        <image 
          :href="skeletonImage || '/src/assets/images/skeleton-placeholder.svg'" 
          x="0" 
          y="0" 
          width="600" 
          height="980" 
          class="skeleton-image"
        />
        
        <!-- Простой скелет как fallback (всегда скрыт, так как у нас есть изображение) -->
        <g v-if="false" class="simple-skeleton">
          <!-- Голова -->
          <ellipse cx="300" cy="100" rx="40" ry="35" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          
          <!-- Шея -->
          <rect x="280" y="135" width="40" height="25" rx="5" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          
          <!-- Торс -->
          <ellipse cx="300" cy="250" rx="60" ry="100" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          
          <!-- Руки -->
          <ellipse cx="200" cy="200" rx="25" ry="15" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="180" cy="280" rx="15" ry="40" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="170" cy="380" rx="12" ry="25" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          
          <ellipse cx="400" cy="200" rx="25" ry="15" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="420" cy="280" rx="15" ry="40" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="430" cy="380" rx="12" ry="25" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          
          <!-- Ноги -->
          <ellipse cx="250" cy="450" rx="20" ry="50" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="240" cy="580" rx="15" ry="40" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="230" cy="680" rx="20" ry="12" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          
          <ellipse cx="350" cy="450" rx="20" ry="50" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="360" cy="580" rx="15" ry="40" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
          <ellipse cx="370" cy="680" rx="20" ry="12" fill="url(#skeletonGradient)" stroke="#343a40" stroke-width="2"/>
        </g>
        
        <!-- Интерактивные области мышц -->
        <!-- Грудные мышцы -->
        <path 
          v-if="highlightedMuscles.includes('chest') || highlightedMuscles.includes('грудные')"
          id="chest"
          d="M 250 180 Q 300 170 350 180 L 350 220 Q 300 215 250 220 Z" 
          :fill="getMuscleColor('chest')"
          :opacity="muscleOpacity"
          class="muscle-area chest-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('chest')"
        />
        
        <!-- Дельтовидные мышцы -->
        <ellipse 
          v-if="highlightedMuscles.includes('shoulders') || highlightedMuscles.includes('плечи')"
          id="left-shoulder"
          cx="200" 
          cy="200" 
          rx="30" 
          ry="20" 
          :fill="getMuscleColor('shoulders')"
          :opacity="muscleOpacity"
          class="muscle-area shoulders-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('shoulders')"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('shoulders') || highlightedMuscles.includes('плечи')"
          id="right-shoulder"
          cx="400" 
          cy="200" 
          rx="30" 
          ry="20" 
          :fill="getMuscleColor('shoulders')"
          :opacity="muscleOpacity"
          class="muscle-area shoulders-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('shoulders')"
        />
        
        <!-- Бицепсы -->
        <ellipse 
          v-if="highlightedMuscles.includes('biceps') || highlightedMuscles.includes('бицепс')"
          id="left-biceps"
          cx="180" 
          cy="280" 
          rx="20" 
          ry="45" 
          :fill="getMuscleColor('biceps')"
          :opacity="muscleOpacity"
          class="muscle-area biceps-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('biceps')"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('biceps') || highlightedMuscles.includes('бицепс')"
          id="right-biceps"
          cx="420" 
          cy="280" 
          rx="20" 
          ry="45" 
          :fill="getMuscleColor('biceps')"
          :opacity="muscleOpacity"
          class="muscle-area biceps-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('biceps')"
        />
        
        <!-- Трицепсы -->
        <ellipse 
          v-if="highlightedMuscles.includes('triceps') || highlightedMuscles.includes('трицепс')"
          id="left-triceps"
          cx="200" 
          cy="320" 
          rx="18" 
          ry="35" 
          :fill="getMuscleColor('triceps')"
          :opacity="muscleOpacity"
          class="muscle-area triceps-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('triceps')"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('triceps') || highlightedMuscles.includes('трицепс')"
          id="right-triceps"
          cx="400" 
          cy="320" 
          rx="18" 
          ry="35" 
          :fill="getMuscleColor('triceps')"
          :opacity="muscleOpacity"
          class="muscle-area triceps-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('triceps')"
        />
        
        <!-- Пресс -->
        <rect 
          v-if="highlightedMuscles.includes('abs') || highlightedMuscles.includes('пресс') || highlightedMuscles.includes('живот')"
          id="abs"
          x="270" 
          y="280" 
          width="60" 
          height="50" 
          rx="8"
          :fill="getMuscleColor('abs')"
          :opacity="muscleOpacity"
          class="muscle-area abs-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('abs')"
        />
        
        <!-- Квадрицепсы -->
        <ellipse 
          v-if="highlightedMuscles.includes('quadriceps') || highlightedMuscles.includes('квадрицепс') || highlightedMuscles.includes('передняя часть бедра')"
          id="left-quadriceps"
          cx="250" 
          cy="450" 
          rx="25" 
          ry="55" 
          :fill="getMuscleColor('quadriceps')"
          :opacity="muscleOpacity"
          class="muscle-area quadriceps-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('quadriceps')"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('quadriceps') || highlightedMuscles.includes('квадрицепс') || highlightedMuscles.includes('передняя часть бедра')"
          id="right-quadriceps"
          cx="350" 
          cy="450" 
          rx="25" 
          ry="55" 
          :fill="getMuscleColor('quadriceps')"
          :opacity="muscleOpacity"
          class="muscle-area quadriceps-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('quadriceps')"
        />
        
        <!-- Ягодичные мышцы -->
        <ellipse 
          v-if="highlightedMuscles.includes('glutes') || highlightedMuscles.includes('ягодицы')"
          id="glutes"
          cx="300" 
          cy="380" 
          rx="40" 
          ry="25" 
          :fill="getMuscleColor('glutes')"
          :opacity="muscleOpacity"
          class="muscle-area glutes-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('glutes')"
        />
        
        <!-- Икроножные мышцы -->
        <ellipse 
          v-if="highlightedMuscles.includes('calves') || highlightedMuscles.includes('икры')"
          id="left-calves"
          cx="240" 
          cy="580" 
          rx="18" 
          ry="35" 
          :fill="getMuscleColor('calves')"
          :opacity="muscleOpacity"
          class="muscle-area calves-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('calves')"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('calves') || highlightedMuscles.includes('икры')"
          id="right-calves"
          cx="360" 
          cy="580" 
          rx="18" 
          ry="35" 
          :fill="getMuscleColor('calves')"
          :opacity="muscleOpacity"
          class="muscle-area calves-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('calves')"
        />
        
        <!-- Спинные мышцы -->
        <path 
          v-if="highlightedMuscles.includes('back') || highlightedMuscles.includes('спина')"
          id="back"
          d="M 250 200 Q 300 195 350 200 L 350 350 Q 300 355 250 350 Z" 
          :fill="getMuscleColor('back')"
          :opacity="muscleOpacity"
          class="muscle-area back-muscle"
          filter="url(#muscleShadow)"
          @click="onMuscleClick('back')"
        />
      </svg>
      
      <!-- Легенда мышц -->
      <div class="muscle-legend" v-if="showLegend">
        <h4>Задействованные мышцы:</h4>
        <div class="legend-items">
          <div 
            v-for="muscle in highlightedMuscles" 
            :key="muscle"
            class="legend-item"
            @click="onMuscleClick(muscle)"
          >
            <div 
              class="legend-color" 
              :style="{ backgroundColor: getMuscleColor(muscle) }"
            ></div>
            <span>{{ getMuscleDisplayName(muscle) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Props
interface Props {
  muscleGroups: string[]
  showLegend?: boolean
  animationSpeed?: number
  skeletonImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  showLegend: true,
  animationSpeed: 2000,
  skeletonImage: ''
})

// Emits
const emit = defineEmits<{
  muscleClick: [muscle: string]
}>()

// Reactive data
const muscleOpacity = ref(0.7)
const isAnimating = ref(false)

// Computed
const highlightedMuscles = computed(() => {
  return props.muscleGroups || []
})

// Methods
const getMuscleColor = (muscle: string): string => {
  const muscleMap: Record<string, string> = {
    'chest': '#ff6b6b',
    'грудные': '#ff6b6b',
    'shoulders': '#4ecdc4',
    'плечи': '#4ecdc4',
    'biceps': '#45b7d1',
    'бицепс': '#45b7d1',
    'triceps': '#96ceb4',
    'трицепс': '#96ceb4',
    'abs': '#feca57',
    'пресс': '#feca57',
    'живот': '#feca57',
    'quadriceps': '#ff9ff3',
    'квадрицепс': '#ff9ff3',
    'передняя часть бедра': '#ff9ff3',
    'glutes': '#54a0ff',
    'ягодицы': '#54a0ff',
    'calves': '#5f27cd',
    'икры': '#5f27cd',
    'back': '#00d2d3',
    'спина': '#00d2d3'
  }
  
  return muscleMap[muscle.toLowerCase()] || '#ff6b6b'
}

const getMuscleDisplayName = (muscle: string): string => {
  const displayMap: Record<string, string> = {
    'chest': 'Грудные',
    'грудные': 'Грудные',
    'shoulders': 'Плечи',
    'плечи': 'Плечи',
    'biceps': 'Бицепс',
    'бицепс': 'Бицепс',
    'triceps': 'Трицепс',
    'трицепс': 'Трицепс',
    'abs': 'Пресс',
    'пресс': 'Пресс',
    'живот': 'Пресс',
    'quadriceps': 'Квадрицепс',
    'квадрицепс': 'Квадрицепс',
    'передняя часть бедра': 'Квадрицепс',
    'glutes': 'Ягодицы',
    'ягодицы': 'Ягодицы',
    'calves': 'Икры',
    'икры': 'Икры',
    'back': 'Спина',
    'спина': 'Спина'
  }
  
  return displayMap[muscle.toLowerCase()] || muscle
}

const onMuscleClick = (muscle: string) => {
  emit('muscleClick', muscle)
}

// Animation
const startAnimation = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  muscleOpacity.value = 0.4
  
  const interval = setInterval(() => {
    muscleOpacity.value = muscleOpacity.value === 0.7 ? 0.4 : 0.7
  }, props.animationSpeed / 4)
  
  setTimeout(() => {
    clearInterval(interval)
    muscleOpacity.value = 0.7
    isAnimating.value = false
  }, props.animationSpeed)
}

// Watchers
watch(() => props.muscleGroups, () => {
  if (props.muscleGroups && props.muscleGroups.length > 0) {
    startAnimation()
  }
}, { immediate: true })
</script>

<style scoped>
.anatomical-skeleton-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--ion-color-light, linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%));
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--ion-color-light-shade, rgba(255, 255, 255, 0.8));
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
  .anatomical-skeleton-container {
    background: linear-gradient(135deg, #1a1a1a 0%, #1f1f1f 50%, #2a2a2a 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

.skeleton-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.anatomical-skeleton-svg {
  width: 100%;
  height: auto;
  max-height: 500px;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.simple-skeleton {
  opacity: 0.8;
}

.muscle-area {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.muscle-area:hover {
  transform: scale(1.05);
  filter: brightness(1.2) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.muscle-legend {
  margin-top: 24px;
  padding: 20px;
  background: var(--ion-color-light, white);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* Темная тема для легенды */
@media (prefers-color-scheme: dark) {
  .muscle-legend {
    background: #1f1f1f;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.muscle-legend h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ion-color-dark, #2c3e50);
  text-align: center;
}

/* Темная тема для заголовка */
@media (prefers-color-scheme: dark) {
  .muscle-legend h4 {
    color: #ffffff;
  }
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--ion-color-light-shade, #f8f9fa);
    border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark, #495057);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

/* Темная тема для элементов легенды */
@media (prefers-color-scheme: dark) {
  .legend-item {
    background: #2a2a2a;
    color: #ffffff;
  }
}

.legend-item:hover {
  background: var(--ion-color-light, #e9ecef);
  border-color: var(--ion-color-medium, #dee2e6);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Темная тема для hover эффектов */
@media (prefers-color-scheme: dark) {
  .legend-item:hover {
    background: #3a3a3a;
    border-color: #4a4a4a;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Анимации */
@keyframes musclePulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.02);
  }
}

@keyframes muscleGlow {
  0%, 100% {
    filter: drop-shadow(0 2px 8px rgba(255, 107, 107, 0.4));
  }
  50% {
    filter: drop-shadow(0 4px 16px rgba(255, 107, 107, 0.8));
  }
}

.muscle-area {
  animation: musclePulse 3s ease-in-out infinite, muscleGlow 2s ease-in-out infinite;
}

/* Индивидуальные анимации для разных групп мышц */
.chest-muscle {
  animation-delay: 0s;
}

.shoulders-muscle {
  animation-delay: 0.3s;
}

.biceps-muscle {
  animation-delay: 0.6s;
}

.triceps-muscle {
  animation-delay: 0.9s;
}

.abs-muscle {
  animation-delay: 1.2s;
}

.quadriceps-muscle {
  animation-delay: 1.5s;
}

.glutes-muscle {
  animation-delay: 1.8s;
}

.calves-muscle {
  animation-delay: 2.1s;
}

.back-muscle {
  animation-delay: 2.4s;
}

/* Адаптивность */
@media (max-width: 768px) {
  .anatomical-skeleton-container {
    padding: 16px;
  }
  
  .muscle-legend {
    padding: 16px;
  }
  
  .legend-items {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .legend-item {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .anatomical-skeleton-container {
    padding: 12px;
  }
  
  .muscle-legend {
    padding: 12px;
  }
  
  .legend-item {
    font-size: 12px;
    padding: 5px 8px;
  }
  
  .legend-color {
    width: 14px;
    height: 14px;
  }
}
</style>
