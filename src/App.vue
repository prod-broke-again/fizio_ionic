<template>
  <ion-app>
    <TelegramLoader v-if="isTelegramLoading" />
    <router-view v-else v-slot="{ Component }">
      <component 
        :is="Component" 
        v-if="isAuthPage"
      />
      <ion-tabs v-else>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="dashboard" href="/dashboard">
            <img src="@/assets/icons/home.svg" class="tab-icon" />
            <ion-label>Главная</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="workouts" href="/workouts">
            <img src="@/assets/icons/sports.svg" class="tab-icon" />
            <ion-label>Тренировки</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="nutrition" href="/nutrition">
            <img src="@/assets/icons/dining.svg" class="tab-icon" />
            <ion-label>Питание</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="ai" href="/ai">
            <img src="@/assets/icons/ai.svg" class="tab-icon" />
            <ion-label>AI</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </router-view>
  </ion-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonApp,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel
} from '@ionic/vue';
import telegramService from './services/telegramService';
import { TelegramLoader } from './components';

const route = useRoute();
const authPages = ['/', '/login', '/register', '/goal-selection', '/activity-level', '/workout-preferences', '/onboarding'];
const isTelegramLoading = ref(false);

// Проверяем, находимся ли мы на странице авторизации или онбординга
const isAuthPage = computed(() => {
  return authPages.includes(route.path);
});

// Функция для инициализации темы приложения
const initAppTheme = () => {
  console.log('Инициализация темы приложения');
  const savedSettings = localStorage.getItem('fizio_settings');
  
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      if (settings.darkMode === true) {
        console.log('Применяем темную тему из сохраненных настроек');
        document.documentElement.classList.add('ion-palette-dark');
        const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaColorScheme) {
          metaColorScheme.setAttribute('content', 'dark');
        }
      } else {
        console.log('Применяем светлую тему из сохраненных настроек');
        document.documentElement.classList.remove('ion-palette-dark');
        const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
        if (metaColorScheme) {
          metaColorScheme.setAttribute('content', 'light dark');
        }
      }
    } catch (e) {
      console.error('Ошибка при загрузке настроек темы:', e);
    }
  } else {
    // Если настроек нет, проверяем системные предпочтения
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Системные предпочтения (предпочтение темной темы):', prefersDark);
    
    if (prefersDark) {
      console.log('Применяем темную тему на основе системных предпочтений');
      document.documentElement.classList.add('ion-palette-dark');
      const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
      if (metaColorScheme) {
        metaColorScheme.setAttribute('content', 'dark');
      }
      
      // Сохраняем предпочтение в localStorage
      localStorage.setItem('fizio_settings', JSON.stringify({ darkMode: true }));
    }
  }
};

// Функция для инициализации Telegram WebApp с доступом к роутеру
const initTelegramWebApp = async () => {
  console.log('Начинаем инициализацию Telegram WebApp');
  
  // Проверяем наличие параметров Telegram в URL
  const hashPart = window.location.hash;
  const hashHasTelegramData = hashPart && hashPart.includes('tgWebAppData=');
  
  // Проверяем наличие параметров Telegram в sessionStorage
  let sessionHasTelegramData = false;
  try {
    sessionHasTelegramData = sessionStorage.getItem('tgWebAppData') !== null;
  } catch (e) {
    console.warn('Ошибка при проверке sessionStorage:', e);
  }
  
  // Если есть параметры в хеше URL, сохраняем их в sessionStorage для будущего использования
  if (hashHasTelegramData) {
    try {
      console.log('Обнаружены параметры Telegram в URL хеше, сохраняем в sessionStorage');
      const hashParams = new URLSearchParams(hashPart.substring(1));
      
      // Сохраняем все параметры Telegram из URL хеша в sessionStorage
      const tgParams = ['tgWebAppData', 'tgWebAppVersion', 'tgWebAppPlatform', 'tgWebAppThemeParams'];
      tgParams.forEach(param => {
        const value = hashParams.get(param);
        if (value) {
          sessionStorage.setItem(param, value);
        }
      });
      
      sessionHasTelegramData = true;
    } catch (e) {
      console.error('Ошибка при сохранении параметров Telegram в sessionStorage:', e);
    }
  }
  
  console.log('Проверка параметров Telegram:', {
    hashHasTelegramData,
    sessionHasTelegramData
  });
  
  // Если в URL или sessionStorage есть данные Telegram, принудительно считаем что это Telegram
  if (hashHasTelegramData || sessionHasTelegramData) {
    window.localStorage.setItem('tg_events', 'true');
  }
  
  // Сначала инициализируем Telegram WebApp и установим isInTelegram
  telegramService.init();
  
  // Проверяем, открыто ли приложение в Telegram
  if (telegramService.isInTelegramWebApp()) {
    console.log('Мы в Telegram WebApp, но автологин отключен - показываем WelcomePage');
    // Убираем экран загрузки и показываем WelcomePage
    isTelegramLoading.value = false;
  } else if (route.path === '/') {
    // ВРЕМЕННО: Всегда показываем WelcomePage как сплеш-скрин
    console.log('Показываем WelcomePage как сплеш-скрин');
    // TODO: Убрать это после доработки авторизации
  } else if (route.path === '/login' || route.path === '/register') {
    // ВРЕМЕННО: Разрешаем доступ к страницам авторизации
    console.log('Разрешаем доступ к странице авторизации:', route.path);
    // TODO: Добавить проверку авторизации после доработки
  } else {
    console.log('Текущий путь:', route.path, 'Не трогаем маршрутизацию');
  }
};

// Инициализация при загрузке приложения
onMounted(() => {
  // Сначала инициализируем тему
  initAppTheme();
  
  // Затем инициализируем Telegram WebApp
  initTelegramWebApp();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.2px;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
}

.title {
  font-weight: 700;
  letter-spacing: 0.5px;
}

ion-button {
  font-weight: 600;
  text-transform: none;
}

/* Стили для иконок в нижнем меню */
.tab-icon {
  width: 24px;
  height: 24px;
  filter: invert(51%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(94%) contrast(93%);
}

ion-tab-button.tab-selected .tab-icon {
  filter: invert(64%) sepia(74%) saturate(2909%) hue-rotate(213deg) brightness(100%) contrast(98%);
}

/* Кастомизация скроллбара */
::-webkit-scrollbar {
  width: 6px;
  background-color: #1a191b;
}

::-webkit-scrollbar-track {
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: linear-gradient(180deg, #8560ff 0%, #4adee0 50%, #2ee775 100%);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #9570ff 0%, #5aeef0 50%, #3ef785 100%);
}

/* Кастомизация скроллбара для контента Ionic */
ion-content {
  --scrollbar-color: linear-gradient(180deg, #8560ff 0%, #4adee0 50%, #2ee775 100%);
  --scrollbar-width: 6px;
}

/* Глобальные стили для анимации переключения темы */
:root {
  --theme-transition-duration: 0.5s;
  --theme-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Плавные переходы для всех элементов при смене темы */
* {
  transition: background-color var(--theme-transition-duration) var(--theme-transition-timing),
              color var(--theme-transition-duration) var(--theme-transition-timing),
              border-color var(--theme-transition-duration) var(--theme-transition-timing),
              box-shadow var(--theme-transition-duration) var(--theme-transition-timing);
}

/* Анимация для иконок при смене темы */
.theme-icon {
  transition: transform var(--theme-transition-duration) var(--theme-transition-timing);
}

.theme-icon-rotate {
  animation: rotate 0.5s ease-in-out;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Анимация для переключателя темы */
.theme-toggle-animate {
  animation: toggle-slide 0.5s ease-in-out;
}

@keyframes toggle-slide {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

/* Плавный переход для фона */
ion-content {
  transition: --background var(--theme-transition-duration) var(--theme-transition-timing);
}

/* Плавный переход для текста */
ion-label, ion-text, p, h1, h2, h3, h4, h5, h6 {
  transition: color var(--theme-transition-duration) var(--theme-transition-timing);
}

/* Плавный переход для кнопок */
ion-button {
  transition: --background var(--theme-transition-duration) var(--theme-transition-timing),
              --color var(--theme-transition-duration) var(--theme-transition-timing);
}

/* Плавный переход для карточек */
ion-card {
  transition: --background var(--theme-transition-duration) var(--theme-transition-timing),
              box-shadow var(--theme-transition-duration) var(--theme-transition-timing);
}
</style>
