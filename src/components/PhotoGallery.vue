<template>
  <div class="photo-gallery">
    <!-- Загрузка -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Верхний слой - двигается влево -->
    <div v-if="!isLoading" class="photo-layer top-layer">
      <div
        v-for="(photo, index) in topPhotos"
        :key="`top-${photo.id}-${index}`"
        class="photo-item"
        :style="getPhotoStyle(index, 'top')"
      >
        <img
          :src="photo.urls.small"
          :alt="photo.alt_description || 'Фитнес фотография'"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Нижний слой - двигается вправо -->
    <div v-if="!isLoading" class="photo-layer bottom-layer">
      <div
        v-for="(photo, index) in bottomPhotos"
        :key="`bottom-${photo.id}-${index}`"
        class="photo-item"
        :style="getPhotoStyle(index, 'bottom')"
      >
        <img
          :src="photo.urls.small"
          :alt="photo.alt_description || 'Спорт фотография'"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Центральный слой - статичный -->
    <div v-if="!isLoading" class="photo-layer center-layer">
      <div
        v-for="(photo, index) in centerPhotos"
        :key="`center-${photo.id}-${index}`"
        class="photo-item center-photo"
        :style="getCenterPhotoStyle(index)"
      >
        <img
          :src="photo.urls.regular"
          :alt="photo.alt_description || 'Тренировка фотография'"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UnsplashService, { UnsplashPhoto } from '../services/unsplashService';

// Состояние компонента
const topPhotos = ref<UnsplashPhoto[]>([]);
const bottomPhotos = ref<UnsplashPhoto[]>([]);
const centerPhotos = ref<UnsplashPhoto[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Загрузка фотографий при монтировании компонента
onMounted(async () => {
  await loadPhotos();
});

// Загрузка фотографий из Unsplash API
const loadPhotos = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const photos = await UnsplashService.getFitnessPhotos();

    if (photos && photos.length > 0) {
      // Распределяем фотографии по слоям
      const shuffled = shuffleArray(photos);

      // Верхний слой (двигается влево)
      topPhotos.value = shuffled.slice(0, 7).concat(shuffled.slice(0, 3)); // Дублируем для бесконечной анимации

      // Нижний слой (двигается вправо)
      bottomPhotos.value = shuffled.slice(7, 14).concat(shuffled.slice(7, 10)); // Дублируем для бесконечной анимации

      // Центральный слой (статичный)
      centerPhotos.value = shuffled.slice(14, 18) || shuffled.slice(0, 4);
    }
  } catch (err) {
    console.error('Ошибка загрузки фотографий:', err);
    error.value = 'Не удалось загрузить фотографии';
    // Используем fallback фотографии
    await loadFallbackPhotos();
  } finally {
    isLoading.value = false;
  }
};

// Загрузка fallback фотографий при ошибке
const loadFallbackPhotos = () => {
  const fallbackPhotos = UnsplashService.getFallbackPhotos();

  const shuffled = shuffleArray(fallbackPhotos);
  topPhotos.value = shuffled.slice(0, 7).concat(shuffled.slice(0, 3));
  bottomPhotos.value = shuffled.slice(7, 14).concat(shuffled.slice(7, 10));
  centerPhotos.value = shuffled.slice(14, 18) || shuffled.slice(0, 4);
};

// Обработка ошибок загрузки изображений
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Заменяем на fallback изображение
  img.src = '../assets/workout1.jpg';
};

// Вспомогательная функция для перемешивания массива
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Генерируем случайные позиции для фотографий
const getPhotoStyle = (index: number, layer: 'top' | 'bottom') => {
  const baseOffset = index * 120; // Расстояние между фотографиями
  const randomY = Math.random() * 40 - 20; // Случайное вертикальное смещение
  const randomRotation = Math.random() * 10 - 5; // Случайный поворот

  if (layer === 'top') {
    return {
      transform: `translateX(${baseOffset}px) translateY(${randomY}px) rotate(${randomRotation}deg)`,
      animationDelay: `${index * 0.5}s`
    };
  } else {
    return {
      transform: `translateX(${-baseOffset}px) translateY(${randomY}px) rotate(${randomRotation}deg)`,
      animationDelay: `${index * 0.5}s`
    };
  }
};

// Стили для центральных фотографий
const getCenterPhotoStyle = (index: number) => {
  const positions = [
    { x: -60, y: -80 },
    { x: 80, y: -60 },
    { x: -80, y: 60 },
    { x: 60, y: 80 }
  ];

  const pos = positions[index % positions.length];
  const randomRotation = Math.random() * 8 - 4;

  return {
    transform: `translate(${pos.x}px, ${pos.y}px) rotate(${randomRotation}deg)`,
    animationDelay: `${index * 0.3}s`
  };
};
</script>

<style scoped>
.photo-gallery {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #0088cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.photo-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.top-layer {
  animation: moveLeft 25s linear infinite;
}

.bottom-layer {
  animation: moveRight 30s linear infinite;
}

.photo-item {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.center-layer .photo-item {
  width: 70px;
  height: 70px;
  opacity: 0.8;
  animation: float 6s ease-in-out infinite;
}

.center-layer .photo-item:nth-child(2n) {
  animation: float 8s ease-in-out infinite reverse;
}

.center-layer .photo-item:nth-child(3n) {
  animation: float 10s ease-in-out infinite;
}

/* Анимации */
@keyframes moveLeft {
  0% {
    transform: translateX(100vw);
  }
  100% {
    transform: translateX(-120px);
  }
}

@keyframes moveRight {
  0% {
    transform: translateX(-120px);
  }
  100% {
    transform: translateX(100vw);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .photo-item {
    width: 60px;
    height: 60px;
  }

  .center-layer .photo-item {
    width: 50px;
    height: 50px;
  }

  @keyframes moveLeft {
    0% {
      transform: translateX(100vw);
    }
    100% {
      transform: translateX(-100px);
    }
  }

  @keyframes moveRight {
    0% {
      transform: translateX(-100px);
    }
    100% {
      transform: translateX(100vw);
    }
  }
}
</style>
