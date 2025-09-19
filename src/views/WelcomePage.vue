<template>
  <div class="welcome-container">
    <!-- Анимированная сетка изображений под углом 45 градусов -->
    <div v-if="imagesLoaded" class="image-grid" :class="{ 'fade-in': imagesLoaded }" :style="gridStyle">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="grid-item"
        :style="getGridItemStyle(index)"
      >
        <img
          :src="image.urls.small"
          :alt="image.alt_description || 'Фитнес фотография'"
          @error="handleImageError"
          loading="lazy"
        />
      </div>
    </div>

     <!-- Затемнение для лучшей читаемости -->
     <div v-if="imagesLoaded" class="overlay-dark"></div>

     <!-- Контент поверх сетки -->
     <div v-if="contentReady" class="welcome-content">
      <div class="welcome-text fade-in-content">
        <h1 class="welcome-title">ДОБРО ПОЖАЛОВАТЬ</h1>
        <p class="welcome-subtitle">в мир фитнеса и здорового образа жизни</p>
      </div>

      <div class="login-options fade-in-content" style="animation-delay: 0.3s;">
         <!-- Временно нерабочая кнопка входа через Email -->
         <button
           disabled
           class="login-option-btn email-btn disabled-btn"
           title="Временно недоступно"
         >
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <span>Войти через Email</span>
        </button>

         <!-- Активная кнопка входа через Telegram -->
         <button
           @click="goToTelegramLogin"
           class="login-option-btn telegram-btn"
         >
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </div>
          <span>Войти через Telegram</span>
        </button>

         <!-- Временно нерабочая кнопка регистрации -->
         <button
           disabled
           class="login-option-btn register-btn disabled-btn"
           title="Временно недоступно"
         >
          <div class="btn-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
          </div>
          <span>Регистрация</span>
        </button>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UnsplashPhoto } from '../services/unsplashService';
import telegramService from '../services/telegramService';
import ApiService from '../services/api';
import { ImageOptimizer, OPTIMIZED_IMAGES } from '../utils/imageOptimizer';

const router = useRouter();
const images = ref<UnsplashPhoto[]>([]);

// Простые стили для image grid (анимация теперь в CSS)
const gridStyle = computed(() => ({
  transform: 'rotate(-45deg)',
  transformOrigin: '0 0'
}));

// Состояние загрузки изображений
const imagesLoaded = ref(false);
const contentReady = ref(false);

// Удалена неиспользуемая функция preloadImages

// Функция предзагрузки изображений (упрощенная)
const preloadImages = (imageUrls: string[]): Promise<void> => {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalImages = imageUrls.length;

    if (totalImages === 0) {
      resolve();
      return;
    }

    const onImageLoad = () => {
      loadedCount++;

      if (loadedCount === totalImages) {
        resolve();
      }
    };

    const onImageError = () => {
      loadedCount++;

      if (loadedCount === totalImages) {
        resolve();
      }
    };

    // Загружаем все изображения одновременно
    for (let i = 0; i < totalImages; i++) {
      const img = new Image();
      img.onload = onImageLoad;
      img.onerror = onImageError;
      img.src = imageUrls[i];
    }
  });
};

// Импорты изображений больше не нужны - используем оптимизированные версии

// Локальные fallback изображения с оптимизированными путями
const getLocalFallbackPhotos = async (): Promise<UnsplashPhoto[]> => {
  const optimizedImages = [
    OPTIMIZED_IMAGES.bg1,
    OPTIMIZED_IMAGES.bg2,
    OPTIMIZED_IMAGES.bg3,
    OPTIMIZED_IMAGES.bg4,
    OPTIMIZED_IMAGES.bg5,
    OPTIMIZED_IMAGES.bg6,
    OPTIMIZED_IMAGES.bg7,
    OPTIMIZED_IMAGES.bg8,
    OPTIMIZED_IMAGES.bg9,
    OPTIMIZED_IMAGES.bg10,
    OPTIMIZED_IMAGES.bg11,
    OPTIMIZED_IMAGES.bg12,
    OPTIMIZED_IMAGES.bg13,
    OPTIMIZED_IMAGES.bg14,
    OPTIMIZED_IMAGES.bg15,
    OPTIMIZED_IMAGES.bg16,
    OPTIMIZED_IMAGES.bg17,
    OPTIMIZED_IMAGES.bg18
  ];

  const photos: UnsplashPhoto[] = [];

  for (let i = 0; i < optimizedImages.length; i++) {
    const optimized = optimizedImages[i];
    const optimalUrl = await ImageOptimizer.getOptimalImageUrl(optimized.webp, optimized.jpeg);
    
    photos.push({
      id: `fallback-${i + 1}`,
      urls: {
        raw: optimalUrl,
        full: optimalUrl,
        regular: optimalUrl,
        small: optimalUrl,
        thumb: optimalUrl
      },
      alt_description: `Фитнес фон ${i + 1}`,
      description: 'Оптимизированное изображение для сетки',
      user: { name: 'Local', username: 'local' },
      width: optimized.width,
      height: optimized.height
    });
  }

  return photos;
};

// Загрузка локальных изображений
const loadLocalImages = async () => {
  console.log('Загружаем локальные изображения...');

  const fallbackPhotos = await getLocalFallbackPhotos();

  // Фиксированное количество изображений для стабильной анимации
  const UNIQUE_IMAGES_COUNT = 40; // 40 уникальных изображений
  const CLONE_COUNT = 3; // Клонировать 3 раза снизу

  // Создаем последовательность из 40 изображений
  const baseImages = [];
  const totalUniqueImages = fallbackPhotos.length; // 18 уникальных изображений

  // Создаем 40 изображений: повторяем первые 18 изображений + дополнительные вариации
  for (let i = 0; i < UNIQUE_IMAGES_COUNT; i++) {
    if (i < totalUniqueImages) {
      // Первые 18 - оригинальные
      baseImages.push(fallbackPhotos[i]);
    } else {
      // Остальные 22 - повторяем с вариациями
      const repeatedIndex = i % totalUniqueImages;
      baseImages.push(fallbackPhotos[repeatedIndex]);
    }
  }

  // Создаем финальный массив: 40 оригинальных + 3 клона по 40 изображений каждый
  let allImages = [...baseImages]; // Начинаем с 40 оригинальных

  // Добавляем 3 клона снизу
  for (let clone = 0; clone < CLONE_COUNT; clone++) {
    allImages = [...allImages, ...baseImages];
  }

  // Итого: 40 + 40*3 = 160 изображений

  // Получаем URL всех изображений для предзагрузки
  const imageUrls = allImages.map(img => img.urls.small);

  console.log('Начинаем предзагрузку изображений...');

  // Предзагрузка изображений
  try {
    await preloadImages(imageUrls);
    console.log('Все изображения предзагружены');

    // Устанавливаем изображения после предзагрузки
    images.value = allImages;

    // Небольшая задержка для завершения анимации
    setTimeout(() => {
      imagesLoaded.value = true;
      console.log(`Загружено ${images.value.length} локальных изображений (${UNIQUE_IMAGES_COUNT} уникальных)`);

      // Дополнительная задержка для появления контента
      setTimeout(() => {
        contentReady.value = true;
        console.log('Контент готов к отображению');
      }, 200); // Задержка после появления изображений (уменьшена с 400мс)
    }, 75); // Небольшая задержка для завершения анимации (уменьшена с 150мс)
  } catch (error) {
    console.error('Ошибка предзагрузки изображений:', error);
    // В случае ошибки все равно устанавливаем изображения
    images.value = allImages;

    setTimeout(() => {
      imagesLoaded.value = true;
    }, 75); // Уменьшена задержка с 150мс
  }
};

// Инициализация приложения
const initializeApp = async () => {
  console.log('Инициализация приложения...');
  
  // Загружаем изображения (они уже импортированы в JS, поэтому предзагрузка не нужна)
  await loadImages();
};

// Загрузка изображений при монтировании
onMounted(async () => {
  await initializeApp();
});

// Загрузка изображений (ВРЕМЕННО отключен Unsplash)
const loadImages = async () => {
  try {
    console.log('Начинаем загрузку изображений...');
    
    // ВРЕМЕННО: Отключен Unsplash, используем только локальные изображения
    // TODO: Включить Unsplash после улучшения качества или настройки API
    console.log('Unsplash временно отключен, используем локальные изображения');
    await loadLocalImages();
    
  } catch (error) {
    console.error('Ошибка загрузки изображений:', error);
    console.log('Используем локальные fallback изображения');
    await loadLocalImages();
   }
 };

// Обработка ошибок загрузки изображений
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.log('Ошибка загрузки изображения, используем fallback:', img.src);
  
  // Проверяем, не пытаемся ли мы уже загрузить fallback изображение
  if (img.src.includes('bg_') || img.src.includes('fallback')) {
    console.log('Fallback изображение тоже не загружается, скрываем элемент');
    img.style.display = 'none';
    return;
  }
  
  // Используем первое оптимизированное изображение как fallback
  img.src = OPTIMIZED_IMAGES.bg1.jpeg;
};

// Стили для элементов сетки - абсолютное позиционирование с учетом поворота
const getGridItemStyle = (index: number) => {
  const itemWidth = 150;
  const itemHeight = 300;
  const gap = 5;
  
  // Вычисляем количество колонок и строк для покрытия экрана
  // Учитываем поворот на 45 градусов - нужно больше элементов
  // Добавляем дополнительную полосу для надежности
  const cols = Math.ceil(window.innerWidth / (itemWidth + gap)) * 6;
  const rows = Math.ceil(window.innerHeight / (itemHeight + gap)) * 6;
  
  // Для второй копии сетки смещаем вниз
  const isSecondCopy = index >= cols * rows;
  const adjustedIndex = isSecondCopy ? index - (cols * rows) : index;
  
  const col = adjustedIndex % cols;
  const row = Math.floor(adjustedIndex / cols);
  
  // Смещаем сетку так, чтобы при повороте на 45° элементы были по центру
  const offsetX = (cols * (itemWidth + gap)) / 2;
  const offsetY = (rows * (itemHeight + gap)) / 2.5; // Уменьшаем смещение вниз
  
  // Для второй копии добавляем смещение вниз
  const verticalOffset = isSecondCopy ? rows * (itemHeight + gap) : 0;
  
  return {
    left: `${col * (itemWidth + gap) - offsetX}px`,
    top: `${row * (itemHeight + gap) - offsetY + verticalOffset}px`,
  };
};

// Навигация
const goToTelegramLogin = async () => {
  try {
    console.log('Начинаем авторизацию через Telegram...');
    
    // Выполняем автологин через Telegram
    const isLoginSuccessful = await telegramService.autoLogin();
    console.log('Результат автологина:', isLoginSuccessful);
    
    if (isLoginSuccessful) {
      // Если пользователь авторизован через Telegram
      try {
        console.log('Авторизация успешна, получаем профиль пользователя...');
        // Получаем данные профиля для проверки наличия цели фитнеса
        const profileResponse = await ApiService.getProfile();
        console.log('Получен ответ профиля:', profileResponse);
        
        if (profileResponse.success && profileResponse.data.user.fitness_goal) {
          console.log('У пользователя есть цель фитнеса, редирект на дашборд');
          // Если цель уже установлена, направляем на дашборд
          router.replace('/dashboard');
        } else {
          console.log('У пользователя нет цели фитнеса, редирект на выбор цели');
          // Если цель не установлена, начинаем онбординг
          router.replace('/goal-selection');
        }
      } catch (error) {
        console.error('Ошибка при получении профиля:', error);
        console.log('Ошибка получения профиля, редирект на выбор цели');
        // В случае ошибки направляем на goal-selection
        router.replace('/goal-selection');
      }
    } else {
      console.log('Авторизация через Telegram не удалась');
      // Можно показать уведомление об ошибке
    }
  } catch (error) {
    console.error('Ошибка авторизации через Telegram:', error);
    // Можно показать уведомление об ошибке
  }
};
</script>

<style scoped>
.welcome-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* Стили загрузки удалены - сплеш экран больше не используется */

/* Сетка изображений */
.image-grid {
  position: absolute;
  top: 70%; /* Смещаем ниже чтобы не было пустого места снизу */
  left: 40%; /* Начальная позиция в пределах лимитов */
  width: auto;
  height: auto;
  display: block;
  padding: 5px;
  box-sizing: border-box;
  overflow: visible;
  will-change: transform; /* Оптимизация для GPU */
  opacity: 0;
  animation:
    moveGridDiagonal 45s linear infinite;
}

/* Плавное появление сетки */
.image-grid.fade-in {
  opacity: 1;
  transition: opacity 0.8s ease-in-out;
}

/* Плавное появление контента */
.fade-in-content {
  animation: fadeInContent 1s ease-out forwards;
  opacity: 0;
}

@keyframes fadeInContent {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid-item {
  position: absolute;
  border-radius: 12px;
  overflow: hidden;
  opacity: 0.9;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  width: 150px;
  height: 300px;
  will-change: transform; /* Оптимизация для GPU */
  backface-visibility: hidden; /* Убираем мерцание */
}



.grid-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9) contrast(1.1);
}

.grid-item:hover {
  opacity: 1;
  z-index: 10;
}

.grid-item:hover img {
  filter: brightness(1) contrast(1.2);
}

/* Затемнение */
.overlay-dark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 5;
}

/* Контент */
.welcome-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  width: 90%;
  max-width: 400px;
}

.welcome-text {
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 72px;
  font-weight: 900;
  color: white;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #8e81ff 0%, #ff6b6b 50%, #4ecdc4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
  line-height: 1.6;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Кнопки входа */
.login-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.login-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 56px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}


.email-btn {
  background: linear-gradient(135deg, #8e81ff 0%, #667eea 100%);
  color: white;
}

.email-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(142, 129, 255, 0.4);
}

.telegram-btn {
  background: linear-gradient(135deg, #0088cc 0%, #006699 100%);
  color: white;
}

.telegram-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 136, 204, 0.4);
}

.register-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.register-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.register-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}



/* CSS анимации для плавного движения с использованием transform */
/* Диагональная анимация вверх-влево с учетом поворота на 45 градусов */
@keyframes moveGridDiagonal {
  0% {
    transform: translateX(0) translateY(0) rotate(-45deg);
  }
  5% {
    transform: translateX(4vw) translateY(2vh) rotate(-45deg);
  }
  15% {
    transform: translateX(12vw) translateY(6vh) rotate(-45deg);
  }
  25% {
    transform: translateX(20vw) translateY(10vh) rotate(-45deg);
  }
  35% {
    transform: translateX(28vw) translateY(14vh) rotate(-45deg);
  }
  45% {
    transform: translateX(36vw) translateY(18vh) rotate(-45deg);
  }
  55% {
    transform: translateX(44vw) translateY(22vh) rotate(-45deg);
  }
  65% {
    transform: translateX(52vw) translateY(26vh) rotate(-45deg);
  }
  75% {
    transform: translateX(60vw) translateY(30vh) rotate(-45deg);
  }
  85% {
    transform: translateX(68vw) translateY(34vh) rotate(-45deg);
  }
  95% {
    transform: translateX(76vw) translateY(38vh) rotate(-45deg);
  }
  100% {
    transform: translateX(80vw) translateY(40vh) rotate(-45deg);
  }
}

/* Адаптивные анимации для мобильных устройств */
@media (max-width: 768px) {
  .image-grid {
    animation:
      moveGridDiagonalMobile 35s linear infinite;
  }
}

@keyframes moveGridDiagonalMobile {
  0% {
    transform: translateX(0) translateY(0) rotate(-45deg);
  }
  10% {
    transform: translateX(6vw) translateY(3vh) rotate(-45deg);
  }
  25% {
    transform: translateX(15vw) translateY(8vh) rotate(-45deg);
  }
  40% {
    transform: translateX(24vw) translateY(12vh) rotate(-45deg);
  }
  55% {
    transform: translateX(33vw) translateY(17vh) rotate(-45deg);
  }
  70% {
    transform: translateX(42vw) translateY(21vh) rotate(-45deg);
  }
  85% {
    transform: translateX(51vw) translateY(26vh) rotate(-45deg);
  }
  100% {
    transform: translateX(60vw) translateY(30vh) rotate(-45deg);
  }
}

@media (max-width: 480px) {
  .image-grid {
    animation:
      moveGridDiagonalSmall 25s linear infinite;
  }
}

@keyframes moveGridDiagonalSmall {
  0% {
    transform: translateX(0) translateY(0) rotate(-45deg);
  }
  10% {
    transform: translateX(4vw) translateY(2vh) rotate(-45deg);
  }
  25% {
    transform: translateX(10vw) translateY(5vh) rotate(-45deg);
  }
  40% {
    transform: translateX(16vw) translateY(8vh) rotate(-45deg);
  }
  55% {
    transform: translateX(22vw) translateY(11vh) rotate(-45deg);
  }
  70% {
    transform: translateX(28vw) translateY(14vh) rotate(-45deg);
  }
  85% {
    transform: translateX(34vw) translateY(17vh) rotate(-45deg);
  }
  100% {
    transform: translateX(40vw) translateY(20vh) rotate(-45deg);
  }
}


/* Адаптивность */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 24px;
    letter-spacing: 1px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .login-option-btn {
    padding: 14px 20px;
    font-size: 15px;
    min-height: 50px;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .welcome-content {
    width: 95%;
  }

  .welcome-title {
    font-size: 20px;
  }

  .login-option-btn {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 48px;
  }
}

/* Стили для временно нерабочих кнопок */
.disabled-btn {
  cursor: not-allowed !important;
  filter: grayscale(50%) !important;
  opacity: 0.7 !important;
}
</style>
