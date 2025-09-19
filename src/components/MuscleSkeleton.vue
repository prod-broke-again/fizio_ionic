<!-- @ts-nocheck -->
<template>
  <div class="muscle-skeleton-container">
    <div class="skeleton-wrapper">
      <!-- SVG анатомический скелет с мышцами -->
      <svg 
        viewBox="0 0 400 600" 
        class="muscle-skeleton-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Определения градиентов -->
        <defs>
          <!-- Градиент для скелета -->
          <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
          
          <!-- Градиент для мышц -->
          <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:0.9" />
          </linearGradient>
          
          <!-- Тень для мышц -->
          <filter id="muscleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="1" result="offset"/>
            <feFlood flood-color="#000000" flood-opacity="0.3"/>
            <feComposite in2="offset" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Голова -->
        <ellipse 
          cx="200" 
          cy="75" 
          rx="32" 
          ry="28" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Шея -->
        <rect 
          x="188" 
          y="103" 
          width="24" 
          height="18" 
          rx="4"
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Торс (грудная клетка) -->
        <ellipse 
          cx="200" 
          cy="200" 
          rx="45" 
          ry="80" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Таз -->
        <ellipse 
          cx="200" 
          cy="320" 
          rx="35" 
          ry="25" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Руки -->
        <!-- Левое плечо -->
        <ellipse 
          cx="140" 
          cy="180" 
          rx="18" 
          ry="12" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Левое предплечье -->
        <ellipse 
          cx="120" 
          cy="250" 
          rx="12" 
          ry="25" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Левая кисть -->
        <ellipse 
          cx="110" 
          cy="320" 
          rx="8" 
          ry="15" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Правое плечо -->
        <ellipse 
          cx="260" 
          cy="180" 
          rx="18" 
          ry="12" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Правое предплечье -->
        <ellipse 
          cx="280" 
          cy="250" 
          rx="12" 
          ry="25" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Правая кисть -->
        <ellipse 
          cx="290" 
          cy="320" 
          rx="8" 
          ry="15" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Ноги -->
        <!-- Левое бедро -->
        <ellipse 
          cx="180" 
          cy="380" 
          rx="15" 
          ry="35" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Левая голень -->
        <ellipse 
          cx="175" 
          cy="460" 
          rx="12" 
          ry="30" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Левая стопа -->
        <ellipse 
          cx="170" 
          cy="520" 
          rx="15" 
          ry="8" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Правое бедро -->
        <ellipse 
          cx="220" 
          cy="380" 
          rx="15" 
          ry="35" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Правая голень -->
        <ellipse 
          cx="225" 
          cy="460" 
          rx="12" 
          ry="30" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Правая стопа -->
        <ellipse 
          cx="230" 
          cy="520" 
          rx="15" 
          ry="8" 
          fill="url(#skeletonGradient)" 
          stroke="#d1d5db" 
          stroke-width="1.5"
        />
        
        <!-- Детализированные мышцы с анимацией выделения -->
        
        <!-- Грудные мышцы (Pectoralis Major) -->
        <path 
          v-if="highlightedMuscles.includes('chest') || highlightedMuscles.includes('грудные')"
          d="M 165 140 Q 200 130 235 140 L 235 180 Q 200 175 165 180 Z" 
          :fill="getMuscleColor('chest')"
          :opacity="muscleOpacity"
          class="muscle-highlight chest-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Дельтовидные мышцы (Deltoids) -->
        <ellipse 
          v-if="highlightedMuscles.includes('shoulders') || highlightedMuscles.includes('плечи')"
          cx="140" 
          cy="175" 
          rx="22" 
          ry="18" 
          :fill="getMuscleColor('shoulders')"
          :opacity="muscleOpacity"
          class="muscle-highlight shoulders-muscle"
          filter="url(#muscleShadow)"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('shoulders') || highlightedMuscles.includes('плечи')"
          cx="260" 
          cy="175" 
          rx="22" 
          ry="18" 
          :fill="getMuscleColor('shoulders')"
          :opacity="muscleOpacity"
          class="muscle-highlight shoulders-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Бицепсы (Biceps Brachii) -->
        <ellipse 
          v-if="highlightedMuscles.includes('biceps') || highlightedMuscles.includes('бицепс')"
          cx="125" 
          cy="240" 
          rx="18" 
          ry="35" 
          :fill="getMuscleColor('biceps')"
          :opacity="muscleOpacity"
          class="muscle-highlight biceps-muscle"
          filter="url(#muscleShadow)"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('biceps') || highlightedMuscles.includes('бицепс')"
          cx="275" 
          cy="240" 
          rx="18" 
          ry="35" 
          :fill="getMuscleColor('biceps')"
          :opacity="muscleOpacity"
          class="muscle-highlight biceps-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Трицепсы (Triceps Brachii) -->
        <ellipse 
          v-if="highlightedMuscles.includes('triceps') || highlightedMuscles.includes('трицепс')"
          cx="155" 
          cy="270" 
          rx="15" 
          ry="30" 
          :fill="getMuscleColor('triceps')"
          :opacity="muscleOpacity"
          class="muscle-highlight triceps-muscle"
          filter="url(#muscleShadow)"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('triceps') || highlightedMuscles.includes('трицепс')"
          cx="245" 
          cy="270" 
          rx="15" 
          ry="30" 
          :fill="getMuscleColor('triceps')"
          :opacity="muscleOpacity"
          class="muscle-highlight triceps-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Пресс (Rectus Abdominis) -->
        <rect 
          v-if="highlightedMuscles.includes('abs') || highlightedMuscles.includes('пресс') || highlightedMuscles.includes('живот')"
          x="175" 
          y="220" 
          width="50" 
          height="45" 
          rx="8"
          :fill="getMuscleColor('abs')"
          :opacity="muscleOpacity"
          class="muscle-highlight abs-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Косые мышцы живота (Obliques) -->
        <path 
          v-if="highlightedMuscles.includes('abs') || highlightedMuscles.includes('пресс') || highlightedMuscles.includes('живот')"
          d="M 165 225 Q 175 220 185 230 L 180 260 Q 170 255 165 245 Z" 
          :fill="getMuscleColor('abs')"
          :opacity="muscleOpacity * 0.7"
          class="muscle-highlight obliques-muscle"
          filter="url(#muscleShadow)"
        />
        <path 
          v-if="highlightedMuscles.includes('abs') || highlightedMuscles.includes('пресс') || highlightedMuscles.includes('живот')"
          d="M 235 225 Q 225 220 215 230 L 220 260 Q 230 255 235 245 Z" 
          :fill="getMuscleColor('abs')"
          :opacity="muscleOpacity * 0.7"
          class="muscle-highlight obliques-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Квадрицепсы (Quadriceps) -->
        <ellipse 
          v-if="highlightedMuscles.includes('quadriceps') || highlightedMuscles.includes('квадрицепс') || highlightedMuscles.includes('передняя часть бедра')"
          cx="180" 
          cy="390" 
          rx="18" 
          ry="45" 
          :fill="getMuscleColor('quadriceps')"
          :opacity="muscleOpacity"
          class="muscle-highlight quadriceps-muscle"
          filter="url(#muscleShadow)"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('quadriceps') || highlightedMuscles.includes('квадрицепс') || highlightedMuscles.includes('передняя часть бедра')"
          cx="220" 
          cy="390" 
          rx="18" 
          ry="45" 
          :fill="getMuscleColor('quadriceps')"
          :opacity="muscleOpacity"
          class="muscle-highlight quadriceps-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Ягодичные мышцы (Glutes) -->
        <ellipse 
          v-if="highlightedMuscles.includes('glutes') || highlightedMuscles.includes('ягодицы')"
          cx="200" 
          cy="340" 
          rx="32" 
          ry="22" 
          :fill="getMuscleColor('glutes')"
          :opacity="muscleOpacity"
          class="muscle-highlight glutes-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Икроножные мышцы (Gastrocnemius) -->
        <ellipse 
          v-if="highlightedMuscles.includes('calves') || highlightedMuscles.includes('икры')"
          cx="175" 
          cy="480" 
          rx="14" 
          ry="28" 
          :fill="getMuscleColor('calves')"
          :opacity="muscleOpacity"
          class="muscle-highlight calves-muscle"
          filter="url(#muscleShadow)"
        />
        <ellipse 
          v-if="highlightedMuscles.includes('calves') || highlightedMuscles.includes('икры')"
          cx="225" 
          cy="480" 
          rx="14" 
          ry="28" 
          :fill="getMuscleColor('calves')"
          :opacity="muscleOpacity"
          class="muscle-highlight calves-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Спинные мышцы (Latissimus Dorsi) -->
        <path 
          v-if="highlightedMuscles.includes('back') || highlightedMuscles.includes('спина')"
          d="M 165 160 Q 200 155 235 160 L 235 280 Q 200 285 165 280 Z" 
          :fill="getMuscleColor('back')"
          :opacity="muscleOpacity"
          class="muscle-highlight back-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Трапециевидные мышцы (Trapezius) -->
        <path 
          v-if="highlightedMuscles.includes('back') || highlightedMuscles.includes('спина')"
          d="M 180 120 Q 200 115 220 120 L 220 160 Q 200 165 180 160 Z" 
          :fill="getMuscleColor('back')"
          :opacity="muscleOpacity * 0.8"
          class="muscle-highlight trapezius-muscle"
          filter="url(#muscleShadow)"
        />
        
        <!-- Широчайшие мышцы спины (Latissimus Dorsi) -->
        <path 
          v-if="highlightedMuscles.includes('back') || highlightedMuscles.includes('спина')"
          d="M 170 200 Q 200 195 230 200 L 230 320 Q 200 325 170 320 Z" 
          :fill="getMuscleColor('back')"
          :opacity="muscleOpacity * 0.9"
          class="muscle-highlight lats-muscle"
          filter="url(#muscleShadow)"
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
}

const props = withDefaults(defineProps<Props>(), {
  showLegend: true,
  animationSpeed: 2000
})

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
    'chest': '#ef4444',
    'грудные': '#ef4444',
    'shoulders': '#f97316',
    'плечи': '#f97316',
    'biceps': '#eab308',
    'бицепс': '#eab308',
    'triceps': '#22c55e',
    'трицепс': '#22c55e',
    'abs': '#06b6d4',
    'пресс': '#06b6d4',
    'живот': '#06b6d4',
    'quadriceps': '#8b5cf6',
    'квадрицепс': '#8b5cf6',
    'передняя часть бедра': '#8b5cf6',
    'glutes': '#ec4899',
    'ягодицы': '#ec4899',
    'calves': '#f59e0b',
    'икры': '#f59e0b',
    'back': '#10b981',
    'спина': '#10b981'
  }
  
  return muscleMap[muscle.toLowerCase()] || '#6366f1'
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

// Animation
const startAnimation = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  muscleOpacity.value = 0.3
  
  const interval = setInterval(() => {
    muscleOpacity.value = muscleOpacity.value === 0.7 ? 0.3 : 0.7
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
.muscle-skeleton-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.skeleton-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.muscle-skeleton-svg {
  width: 100%;
  height: auto;
  max-height: 300px;
}

.muscle-highlight {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.muscle-highlight:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.muscle-legend {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.muscle-legend h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Анимации */
@keyframes musclePulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.03);
  }
}

@keyframes muscleGlow {
  0%, 100% {
    filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3));
  }
  50% {
    filter: drop-shadow(0 4px 16px rgba(59, 130, 246, 0.6));
  }
}

.muscle-highlight {
  animation: musclePulse 3s ease-in-out infinite, muscleGlow 2s ease-in-out infinite;
}

/* Индивидуальные анимации для разных групп мышц */
.chest-muscle {
  animation-delay: 0s;
}

.shoulders-muscle {
  animation-delay: 0.2s;
}

.biceps-muscle {
  animation-delay: 0.4s;
}

.triceps-muscle {
  animation-delay: 0.6s;
}

.abs-muscle {
  animation-delay: 0.8s;
}

.quadriceps-muscle {
  animation-delay: 1s;
}

.glutes-muscle {
  animation-delay: 1.2s;
}

.calves-muscle {
  animation-delay: 1.4s;
}

.back-muscle {
  animation-delay: 1.6s;
}

/* Адаптивность */
@media (max-width: 480px) {
  .muscle-skeleton-container {
    padding: 16px;
  }
  
  .muscle-legend {
    padding: 12px;
  }
  
  .legend-items {
    gap: 6px;
  }
  
  .legend-item {
    font-size: 12px;
    padding: 3px 6px;
  }
}
</style>
