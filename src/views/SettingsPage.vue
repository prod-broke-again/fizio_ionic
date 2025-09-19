<template>
  <ion-page>
    <ion-header class="ion-no-border dark-header">
      <ion-toolbar class="transparent-toolbar">
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard" color="medium"></ion-back-button>
        </ion-buttons>
        <ion-title class="modal-title">Настройки</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="modal-content">
      <div class="settings-container">
        <!-- Настройки чата -->
        <div class="settings-card">
          <div class="section-header">
            <ion-icon :icon="chatbubbleOutline" color="success"></ion-icon>
            <span>Настройки чата</span>
          </div>
          <ion-list class="transparent-list" lines="none">
            <ion-item color="transparent" class="setting-item setting-with-toggle">
              <ion-icon slot="start" :icon="cloudDownloadOutline" color="medium"></ion-icon>
              <ion-label>
                <h3>Автоматически загружать историю</h3>
                <p>Загружать сообщения при входе в чат</p>
              </ion-label>
              <div class="toggle-wrap">
                <ion-toggle 
                  v-model="settings.autoLoadHistory" 
                  color="success"
                ></ion-toggle>
              </div>
            </ion-item>
            
            <ion-item color="transparent" class="setting-item setting-with-toggle">
              <ion-icon slot="start" :icon="saveOutline" color="medium"></ion-icon>
              <ion-label>
                <h3>Сохранять историю локально</h3>
                <p>Хранить сообщения в памяти устройства</p>
              </ion-label>
              <div class="toggle-wrap">
                <ion-toggle 
                  v-model="settings.saveHistoryLocally" 
                  color="success"
                ></ion-toggle>
              </div>
            </ion-item>
          </ion-list>
          
          <ion-button 
            expand="block" 
            @click="clearChatHistory" 
            color="danger" 
            class="clear-button"
            shape="round"
          >
            <ion-icon :icon="trashOutline" slot="start"></ion-icon>
            Очистить историю чата
          </ion-button>
          
          <p class="hint-text">
            Очистка удалит всю историю переписки и не может быть отменена
          </p>
        </div>
        
        <!-- Голосовой ввод -->
        <div class="settings-card">
          <div class="section-header">
            <ion-icon :icon="micOutline" color="primary"></ion-icon>
            <span>Голосовой ввод</span>
          </div>
          <ion-list class="transparent-list" lines="none">
            <ion-item color="transparent" class="setting-item">
              <ion-icon slot="start" :icon="globeOutline" color="medium"></ion-icon>
              <ion-label>
                <h3>Язык распознавания</h3>
                <p>Выберите язык для голосового ввода</p>
              </ion-label>
              <ion-select 
                v-model="settings.voiceLanguage" 
                interface="action-sheet"
                class="language-select"
              >
                <ion-select-option value="ru-RU">Русский</ion-select-option>
                <ion-select-option value="en-US">Английский (США)</ion-select-option>
                <ion-select-option value="en-GB">Английский (Великобритания)</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
          
          <ion-note v-if="!voiceStore.isSupported" color="danger" class="voice-warning">
            Голосовой ввод не поддерживается в вашем браузере
          </ion-note>
          
          <ion-button 
            expand="block" 
            @click="testVoiceRecognition" 
            :disabled="!voiceStore.isSupported"
            color="primary"
            class="voice-button"
            shape="round"
          >
            <ion-icon :icon="micOutline" slot="start"></ion-icon>
            Проверить распознавание голоса
          </ion-button>
        </div>
        
        <!-- Внешний вид -->
        <div class="settings-card">
          <div class="section-header">
            <ion-icon :icon="brushOutline" color="tertiary"></ion-icon>
            <span>Внешний вид</span>
          </div>
          <ion-list class="transparent-list" lines="none">
            <ion-item color="transparent" class="setting-item setting-with-toggle">
              <ion-icon slot="start" :icon="moonOutline" color="medium"></ion-icon>
              <ion-label>
                <h3>Темная тема</h3>
                <p>Переключение между светлой и темной темой</p>
              </ion-label>
              <div class="toggle-wrap">
                <ion-toggle 
                  v-model="settings.darkMode"
                  @ionChange="toggleDarkMode"
                  color="tertiary"
                ></ion-toggle>
              </div>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonBackButton,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonIcon,
  alertController
} from '@ionic/vue';
import { 
  trashOutline, 
  chatbubbleOutline, 
  saveOutline, 
  cloudDownloadOutline,
  micOutline,
  moonOutline,
  brushOutline, 
  globeOutline
} from 'ionicons/icons';
import { useChatStore } from '@/stores/chat';
import { useVoiceStore } from '@/stores/voice';
import { voiceRecognitionService } from '@/services/voiceRecognition';

const chatStore = useChatStore();
const voiceStore = useVoiceStore();

// Настройки
const settings = ref({
  autoLoadHistory: true,
  saveHistoryLocally: true,
  voiceLanguage: 'ru-RU',
  darkMode: false
});

// Загрузка настроек из localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem('fizio_settings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      settings.value = { ...settings.value, ...parsedSettings };
      
      // Применяем язык для распознавания голоса
      if (settings.value.voiceLanguage) {
        voiceRecognitionService.setLanguage(settings.value.voiceLanguage);
      }
      
      // Применяем тему
      applyDarkMode(settings.value.darkMode);
    } catch (e) {
      console.error('Ошибка при загрузке настроек:', e);
    }
  } else {
    // Если настройки не сохранены, проверяем системные предпочтения для темной темы
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    settings.value.darkMode = prefersDark;
    applyDarkMode(prefersDark);
  }
}

// Сохранение настроек в localStorage
function saveSettings() {
  localStorage.setItem('fizio_settings', JSON.stringify(settings.value));
}

// Очистка истории чата
async function clearChatHistory() {
  const alert = await alertController.create({
    header: 'Подтверждение',
    message: 'Вы уверены, что хотите очистить всю историю чата?',
    buttons: [
      {
        text: 'Отмена',
        role: 'cancel'
      },
      {
        text: 'Очистить',
        role: 'destructive',
        handler: () => {
          // Очищаем историю в хранилище
          chatStore.clearChat();
          
          // Удаляем локальную историю
          localStorage.removeItem('fizio_chat_history');
        }
      }
    ]
  });
  
  await alert.present();
}

// Тестирование распознавания голоса
function testVoiceRecognition() {
  console.log('Тестирование распознавания голоса');
  
  if (voiceStore.isRecording) {
    console.log('Останавливаем текущую запись');
    voiceStore.stopVoiceRecording();
    return;
  }
  
  // Начинаем запись напрямую через сервис
  console.log('Запускаем распознавание голоса');
  const success = voiceRecognitionService.startRecording(
    async (transcript) => {
      console.log('Получен результат распознавания:', transcript);
      
      // Уведомляем хранилище, что запись остановлена
      voiceStore.$patch({ isRecording: false });
      
      // Отображаем результат
      const alert = await alertController.create({
        header: 'Распознанный текст',
        message: transcript || 'Текст не распознан',
        buttons: ['OK']
      });
      
      await alert.present();
    },
    async (error) => {
      console.error('Ошибка распознавания:', error);
      
      // Уведомляем хранилище, что запись остановлена
      voiceStore.$patch({ isRecording: false });
      
      // Отображаем ошибку
      const alert = await alertController.create({
        header: 'Ошибка распознавания',
        message: typeof error === 'string' ? error : 'Произошла ошибка при распознавании голоса',
        buttons: ['OK']
      });
      
      await alert.present();
    }
  );
  
  if (success) {
    console.log('Распознавание успешно запущено');
    // Уведомляем хранилище, что запись началась
    voiceStore.$patch({ isRecording: true });
  } else {
    console.error('Не удалось запустить распознавание');
    alertController.create({
      header: 'Ошибка',
      message: 'Не удалось запустить распознавание голоса',
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}

// Применение темной темы
function applyDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle('ion-palette-dark', isDark);
}

// Переключение темной темы
function toggleDarkMode() {
  // Добавляем класс для анимации
  const toggle = document.querySelector('.theme-toggle ion-toggle');
  if (toggle) {
    toggle.classList.add('theme-toggle-animate');
    setTimeout(() => {
      toggle.classList.remove('theme-toggle-animate');
    }, 500);
  }

  applyDarkMode(settings.value.darkMode);
  saveSettings();
}

// Следим за изменением настроек
watch(settings.value, () => {
  saveSettings();
  
  // При изменении языка обновляем его в сервисе
  voiceRecognitionService.setLanguage(settings.value.voiceLanguage);
}, { deep: true });

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
/* Базовые переменные для темной темы */
.ion-palette-dark {
  --ion-background-color: #121212;
  --ion-color-step-50: #1e1e1e;
  --ion-color-step-100: #2a2a2a;
  --ion-color-step-150: #363636;
  --ion-text-color: #ffffff;
}

/* Светлая тема для основного контента */
:root .modal-content {
  --background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
}

/* Темная тема для основного контента */
.ion-palette-dark .modal-content {
  --background: linear-gradient(180deg, #121212 0%, #1a1a1a 100%);
}

/* Базовые стили для обеих тем */
.dark-header {
  --background: transparent;
}

.transparent-toolbar {
  --background: transparent;
}

/* Светлая тема для заголовка */
:root .modal-title {
  font-size: 22px;
  font-weight: 600;
  color: #333333;
  padding-left: 8px;
}

/* Темная тема для заголовка */
.ion-palette-dark .modal-title {
  font-size: 22px;
  font-weight: 600;
  color: white;
  padding-left: 8px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
}

/* Hero-блок как в профиле, но карточный */
.hero{ 
  margin: 6px 16px 12px; 
  padding: 16px; 
  border-radius: 16px; 
  background: rgba(240,240,245,.8);
  box-shadow: 0 4px 12px rgba(0,0,0,.06);
}
.hero-title{ font-size: 22px; font-weight: 800; color:#333; }
.hero-sub{ margin-top:4px; color:#666; font-size:13px; }
.ion-palette-dark .hero{ background: rgba(35,35,40,.6); box-shadow: 0 4px 12px rgba(0,0,0,.22); }
.ion-palette-dark .hero-title{ color:#fff; }
.ion-palette-dark .hero-sub{ color:#a7a7a7; }

/* Светлая тема для заголовка секции */
:root .section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #333333;
  font-weight: 600;
  font-size: 18px;
  padding: 0 8px;
}

/* Темная тема для заголовка секции */
.ion-palette-dark .section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #ffffff;
  font-weight: 600;
  font-size: 18px;
  padding: 0 8px;
}

.section-header ion-icon {
  font-size: 20px;
}

/* Светлая тема для карточки настроек */
:root .settings-card {
  background: rgba(240, 240, 240, 0.8);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* Темная тема для карточки настроек */
.ion-palette-dark .settings-card {
  background: rgba(40, 40, 40, 0.6);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.transparent-list {
  background: transparent;
  margin: 0;
  padding: 0;
}

/* Светлая тема для элемента настроек */
:root .setting-item {
  --background: transparent;
  --color: #333333;
  --padding-start: 8px;
  --padding-end: 8px;
  --inner-padding-end: 0;
  --padding-top: 8px;
  --padding-bottom: 8px;
  margin-bottom: 8px;
  border-radius: 12px;
}

/* Темная тема для элемента настроек */
.ion-palette-dark .setting-item {
  --background: transparent;
  --color: #ffffff;
  --padding-start: 8px;
  --padding-end: 8px;
  --inner-padding-end: 0;
  --padding-top: 8px;
  --padding-bottom: 8px;
  margin-bottom: 8px;
  border-radius: 12px;
}

.setting-item ion-icon {
  font-size: 24px;
  margin-right: 12px;
}

/* Выравнивание тогглов правее и отступ от текста */
.setting-with-toggle{ align-items: flex-start; }
.setting-with-toggle .toggle-wrap{ margin-left:auto; padding-left:16px; display:flex; align-items:center; height:100%; }
.setting-with-toggle ion-label{ padding-right:8px; }
.setting-with-toggle ion-toggle{ --handle-width: 20px; --handle-height: 20px; --handle-border-radius: 10px; --width: 52px; --height: 28px; }

/* Светлая тема для заголовка элемента настроек */
:root .setting-item ion-label h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #333333;
}

/* Темная тема для заголовка элемента настроек */
.ion-palette-dark .setting-item ion-label h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #ffffff;
}

/* Светлая тема для описания элемента настроек */
:root .setting-item ion-label p {
  font-size: 12px;
  color: #666666;
  margin: 0;
}

/* Темная тема для описания элемента настроек */
.ion-palette-dark .setting-item ion-label p {
  font-size: 12px;
  color: #a7a7a7;
  margin: 0;
}

/* Кнопки одинаковые для обеих тем */
.clear-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
  margin: 8px 0;
  --background: linear-gradient(135deg, #ff4b55 0%, #ff6b6b 100%);
  --color: white;
}

.voice-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
  margin: 8px 0;
  --background: linear-gradient(135deg, #5468ff 0%, #6b8aff 100%);
  --color: white;
}

/* Светлая тема для подсказок */
:root .hint-text {
  font-size: 12px;
  color: #666666;
  text-align: center;
  margin: 8px 0 0 0;
  padding: 0 16px;
  display: block;
}

/* Темная тема для подсказок */
.ion-palette-dark .hint-text {
  font-size: 12px;
  color: #a7a7a7;
  text-align: center;
  margin: 8px 0 0 0;
  padding: 0 16px;
  display: block;
}

/* Одинаково для обеих тем */
.voice-warning {
  color: #fbbf24 !important; /* Желтый цвет вместо красного для лучшей читаемости */
  font-weight: 500;
}

/* Одинаково для обеих тем */
ion-toggle {
  --background: rgba(120, 120, 128, 0.32);
  --background-checked: #34C759;
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
  --handle-height: 20px;
  --handle-width: 20px;
  --handle-box-shadow: none;
  --handle-border-radius: 10px;
  padding-right: 6px;
  transition: all var(--theme-transition-duration) var(--theme-transition-timing);
}

/* Светлая тема для селекта языка */
:root .language-select {
  --color: #333333;
  --placeholder-color: #333333;
  max-width: 200px;
}

/* Темная тема для селекта языка */
.ion-palette-dark .language-select {
  --color: white;
  --placeholder-color: white;
  max-width: 200px;
}

/* Светлая тема для ion-header */
:root ion-header ion-toolbar {
  --background: #ffffff;
  --color: #333333;
}

/* Темная тема для ion-header */
.ion-palette-dark ion-header ion-toolbar {
  --background: transparent;
  --color: #ffffff;
}

/* Светлая тема для кнопки назад */
:root ion-back-button {
  --color: #333333;
}

/* Темная тема для кнопки назад */
.ion-palette-dark ion-back-button {
  --color: #8560ff;
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
</style> 