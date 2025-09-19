// @ts-nocheck
<template>
  <ion-page>
    <!-- Заменяем стандартный ion-header на кастомный навбар -->
    <div class="custom-navbar">
      <div class="navbar-title">Твой ассистент</div>
      <div class="navbar-actions">
        <ion-button fill="clear" @click="openChatSettings">
          <ion-icon slot="icon-only" :icon="settingsOutline"></ion-icon>
        </ion-button>
      </div>
    </div>
    
    <ion-content :fullscreen="true" class="ion-padding" ref="contentRef">
      <div class="chat-container">
        <!-- Начальное состояние (панда и приветствие) в абсолютно позиционированном слое -->
        <div class="initial-state-layer" :class="{'hidden': chatStarted}" v-if="!chatStarted">
        <!-- Верхняя часть с пандой (только для начального состояния) -->
          <transition name="panda-slide">
        <div class="panda-container" v-if="!chatStarted">
          <video src="../assets/sports-pattern.mp4" class="panda-logo" autoplay loop muted playsinline></video>
          <div class="panda-background">
            <img :src="imageLeft" alt="Фон левый" class="image-left">
            <img :src="imageRight" alt="Фон правый" class="image-right">
          </div>
        </div>
          </transition>
        
          <!-- Приветственное сообщение -->
          <transition name="fade">
            <div v-if="!chatStarted" class="message assistant-message welcome-message">
            <div class="message-icon">
              <ion-icon :icon="sparklesOutline" class="sparkle-icon"></ion-icon>
            </div>
            <div class="message-content">
              Привет! Я твой ассистент помощник по любым вопросам которые у тебя могут возникнуть в процессе тренировок и питания
            </div>
          </div>
          </transition>
          
          <!-- Примеры вопросов (показываются только если нет сообщений) -->
          <transition name="fade-up">
          <div v-if="!chatStarted" class="examples-container">
            <div class="examples-header">
              <div class="message-icon">
                <ion-icon :icon="sparklesOutline" class="sparkle-icon"></ion-icon>
              </div>
              <div class="examples-title">Например ты можешь спросить у меня</div>
            </div>
            
            <div class="examples-questions">
              <div 
                v-for="(question, index) in exampleQuestions" 
                :key="index"
                class="example-question"
                @click="sendExampleQuestion(question)"
              >
                {{ question }}
                </div>
              </div>
            </div>
          </transition>
        </div>
        
        <!-- Сообщения чата в отдельном слое -->
        <div class="messages-wrapper" ref="messagesContainerRef" :class="{'active': chatStarted}">
          <!-- История сообщений чата -->
          <transition-group name="message-slide" tag="div" class="message-list">
            <div 
              v-for="(message, index) in chatMessages" 
              :key="index"
              :class="['message', message.isUser ? 'user-message' : 'assistant-message']"
            >
              <div v-if="!message.isUser" class="message-icon">
                <ion-icon :icon="sparklesOutline" class="sparkle-icon"></ion-icon>
              </div>
              <div :class="['message-bubble', message.isUser ? 'user-bubble' : 'assistant-bubble']">
                <template v-if="message.isTyping">
                  <div class="typing-container">
                    <span v-if="message.text">{{ message.text }}</span>
                    <typing-animation />
                  </div>
                </template>
                <template v-else>
                  {{ message.text }}
                </template>
              </div>
            </div>
          </transition-group>
          
          <!-- Индикатор загрузки ответа -->
          <div v-if="isLoading && !hasTypingMessages" class="message assistant-message">
            <div class="message-icon">
              <ion-icon :icon="sparklesOutline" class="sparkle-icon"></ion-icon>
            </div>
            <div class="message-bubble assistant-bubble loading-bubble">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Пространство для инпута, чтобы контент не перекрывался при скролле -->
      <div class="input-spacer2"></div>
    </ion-content>
    
    <!-- Фиксированный инпут для ввода сообщения (всегда виден) -->
    <div class="input-container">
      <ion-item lines="none" class="input-field">
        <ion-input 
          v-model="messageText" 
          :placeholder="getInputPlaceholder()"
          @keyup.enter="sendMessage"
          :disabled="isLoading || isRecordingVoice"
        ></ion-input>
        <ion-button 
          v-if="!messageText.trim()" 
          slot="end" 
          fill="clear" 
          @click="toggleVoiceRecording"
          :disabled="isLoading"
          :color="isDarkMode ? 'light' : 'dark'"
        >
          <ion-icon slot="icon-only" :icon="micOutline"></ion-icon>
        </ion-button>
        <ion-button 
          v-else
          slot="end" 
          fill="clear" 
          @click="sendMessage" 
          :disabled="isLoading"
          :color="isDarkMode ? 'light' : 'dark'"
        >
          <ion-icon slot="icon-only" :icon="paperPlaneOutline"></ion-icon>
        </ion-button>
      </ion-item>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, reactive, onUnmounted, computed, watch, nextTick } from 'vue';
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  modalController
} from '@ionic/vue';
import { 
  sparklesOutline, 
  paperPlaneOutline,
  micOutline,
  settingsOutline
} from 'ionicons/icons';
import pandaLogoSrc from '../assets/panda_logo.png';
import imageLeftSrc from '../assets/Image Left.png';
import imageRightSrc from '../assets/Image Right.png';
import { useUserStore } from '../stores/user';
import { useChatStore } from '../stores/chat';
import { useVoiceStore } from '../stores/voice';
import TypingAnimation from '@/components/TypingAnimation.vue';
import ChatSettingsModal from '@/components/ChatSettingsModal.vue';
import { chatSocketService } from '../services/chatSocket';

// Импорт изображений
const pandaLogo = ref(pandaLogoSrc);
const imageLeft = ref(imageLeftSrc);
const imageRight = ref(imageRightSrc);

// Инициализация хранилищ
const userStore = useUserStore();
const chatStore = useChatStore();
const voiceStore = useVoiceStore();

// Привязываем реактивные данные из хранилищ
const chatMessages = computed(() => chatStore.chatMessages);
const isLoading = computed(() => chatStore.isLoading);
const chatStarted = computed(() => chatStore.chatStarted);
const isRecordingVoice = computed(() => voiceStore.isRecording);
const exampleQuestions = computed(() => chatStore.exampleQuestions);
const hasTypingMessages = computed(() => chatStore.hasTypingMessages);

// Флаг для определения текущей темы
const isDarkMode = ref(false);

// Тексты сообщения в инпуте
const messageText = ref('');

// Ссылки на DOM-элементы для прокрутки
const contentRef = ref(null);
const messagesContainerRef = ref(null);

// Функция для прокрутки контента вниз
const scrollToBottom = async (smooth = true) => {
  await nextTick();
  if (contentRef.value) {
    const content = contentRef.value as HTMLIonContentElement;
    console.log('scrollToBottom: contentRef.value', contentRef.value);
    
    try {
      // Используем встроенный метод scrollToBottom из Ionic
      await content.scrollToBottom(smooth ? 300 : 0);
      console.log('Scrolled to bottom');
    } catch (error) {
      console.warn('Error scrolling to bottom:', error);
      // Fallback: пытаемся найти элемент прокрутки и прокрутить его вручную
      const scrollElement = content.$el?.shadowRoot?.querySelector('.inner-scroll');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      } else {
        console.warn('Scroll element not found');
      }
    }
  } else {
    console.warn('scrollToBottom: contentRef.value is null or undefined', contentRef.value);
  }
};

// Отслеживаем изменения в сообщениях чата
watch(() => chatMessages.value.length, async (newLength, oldLength) => {
  if (newLength > oldLength) {
    await scrollToBottom();
  }
});

// Отслеживаем изменение текста в сообщениях (для анимации печатания)
watch(() => chatMessages.value, async () => {
  await scrollToBottom();
}, { deep: true });

// Отправка одного из примеров вопросов
function sendExampleQuestion(question: string) {
  // Устанавливаем текст вопроса в поле ввода
  messageText.value = question;
  
  // Небольшая задержка для лучшего визуального эффекта
  setTimeout(() => {
  sendMessage();
  }, 100);
}

// Функция отправки сообщения
async function sendMessage() {
  if (!messageText.value.trim() || isLoading.value) return;
  
  // Отправляем сообщение через хранилище
  await chatStore.sendMessage(messageText.value);
  
  // Прокручиваем чат вниз
  await scrollToBottom();
  
  // Очищаем поле ввода
  messageText.value = '';
}

// Проверка текущей темы
const checkDarkMode = () => {
  // Проверяем, есть ли у documentElement класс ion-palette-dark
  isDarkMode.value = document.documentElement.classList.contains('ion-palette-dark');
  console.log('AIPage: проверка темной темы, isDarkMode:', isDarkMode.value);
};

// Инициализация при загрузке компонента
onMounted(() => {
  console.log('AIPage: компонент загружен');
  
  // Проверяем текущую тему
  checkDarkMode();
  
  // Восстанавливаем историю чата из локального хранилища
  restoreMessagesFromLocalStorage();
  
  // Если есть сообщения, сразу устанавливаем chatStarted в true
  if (chatMessages.value.length > 0) {
    chatStore.$patch({ chatStarted: true });
  }
  
  // Загружаем историю сообщений с сервера, если она есть
  chatStore.loadChatHistory();
  
  // Устанавливаем callback для обновления поля ввода при голосовом вводе
  voiceStore.setUpdateInputCallback((text) => {
    console.log('AIPage: Получен текст из голосового ввода:', text);
    messageText.value = text;
  });
  
  // Добавляем слушатель для обновления темы, если она изменится в другом месте
  window.addEventListener('themechange', checkDarkMode);
});

// Сохраняем историю при закрытии компонента
onUnmounted(() => {
  console.log('AIPage: компонент будет уничтожен');
  saveMessagesToLocalStorage();
    
  // Останавливаем запись голоса, если она идет
  if (isRecordingVoice.value) {
    console.log('Останавливаем запись голоса');
    voiceStore.stopVoiceRecording();
  }
  
  // Удаляем слушатель события
  window.removeEventListener('themechange', checkDarkMode);
});

// Функция переключения режима записи голоса
function toggleVoiceRecording() {
  console.log('Переключение режима записи голоса, текущее состояние:', isRecordingVoice.value);
  
  if (isRecordingVoice.value) {
    console.log('Останавливаем запись голоса');
    voiceStore.stopVoiceRecording();
  } else {
    console.log('Начинаем запись голоса');
    const success = voiceStore.startVoiceRecording();
    console.log('Результат запуска записи:', success);
  }
}

// Сохранение истории чата в локальное хранилище
function saveMessagesToLocalStorage() {
  if (chatMessages.value.length > 0) {
    localStorage.setItem('fizio_chat_history', JSON.stringify(chatMessages.value));
  }
}

// Восстановление истории из локального хранилища
function restoreMessagesFromLocalStorage() {
  const savedMessages = localStorage.getItem('fizio_chat_history');
  if (savedMessages) {
    try {
      const parsedMessages = JSON.parse(savedMessages);
      if (Array.isArray(parsedMessages) && parsedMessages.length > 0 && chatMessages.value.length === 0) {
        // Устанавливаем сообщения напрямую в хранилище
        chatStore.$patch({
          chatMessages: parsedMessages,
          chatStarted: true // Сразу устанавливаем флаг, что чат начат
        });
        
        // Сразу же обновляем статус чата, чтобы избежать мигания панды
        nextTick(() => {
          if (parsedMessages.length > 0) {
            chatStore.$patch({ chatStarted: true });
          }
        });
      }
    } catch (e) {
      console.error('Ошибка при восстановлении истории чата:', e);
    }
  }
}

// Функция для открытия модального окна настроек чата
async function openChatSettings() {
  const modal = await modalController.create({
    component: ChatSettingsModal,
    cssClass: 'chat-settings-modal'
  });
  
  await modal.present();
}

// Функция для получения правильного placeholder для поля ввода
function getInputPlaceholder() {
  if (isLoading.value) {
    return 'Ассистент печатает...';
  }
  
  if (isRecordingVoice.value) {
    return 'Говорите...';
  }
  
  return 'Написать сообщение';
}

</script>

<style scoped>
/* Базовые стили */
/* Стили для светлой темы (по умолчанию) */
:root ion-content {
  --background: #ffffff;
  --color: #333333;
  --padding-bottom: 80px;
  --padding-top: 80px;
}

/* Стили для темной темы */
.ion-palette-dark ion-content {
  --background: #000000;
  --color: #ffffff;
  --padding-bottom: 80px;
  --padding-top: 80px;
}

/* Кастомный навбар */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  height: 60px;
  z-index: 999;
}

/* Светлая тема для навбара */
:root .navbar-title {
  font-size: 24px;
  font-weight: 600;
  color: #333333;
}

/* Темная тема для навбара */
.ion-palette-dark .navbar-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
}

.navbar-actions {
  display: flex;
  align-items: center;
}

/* Светлая тема для кнопок навбара */
:root .navbar-actions ion-button {
  --color: #333333;
  --padding-start: 8px;
  --padding-end: 8px;
}

/* Темная тема для кнопок навбара */
.ion-palette-dark .navbar-actions ion-button {
  --color: #ffffff;
  --padding-start: 8px;
  --padding-end: 8px;
}

/* Стили для модального окна настроек */
.chat-settings-modal {
  --height: auto;
  --width: 90%;
  --max-width: 400px;
  --border-radius: 16px;
}

/* Светлая тема для модального окна */
:root .chat-settings-modal {
  --background: #ffffff;
  --color: #333333;
}

/* Темная тема для модального окна */
.ion-palette-dark .chat-settings-modal {
  --background: #1a1a1a;
  --color: #ffffff;
}

/* Стили для элементов внутри модального окна */
:root .chat-settings-modal ion-item {
  --background: #ffffff;
  --color: #333333;
  --border-color: #e0e0e0;
}

.ion-palette-dark .chat-settings-modal ion-item {
  --background: #1a1a1a;
  --color: #ffffff;
  --border-color: #333333;
}

:root .chat-settings-modal ion-label {
  color: #333333;
}

.ion-palette-dark .chat-settings-modal ion-label {
  color: #ffffff;
}

:root .chat-settings-modal ion-toggle {
  --background: #e0e0e0;
  --background-checked: #87B1FF;
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
}

.ion-palette-dark .chat-settings-modal ion-toggle {
  --background: #333333;
  --background-checked: #87B1FF;
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
}

/* Контейнер чата */
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 16px;
  position: relative;
  min-height: 70vh; /* Минимальная высота для контейнера */
}

/* Слой с начальным состоянием (панда и примеры) */
.initial-state-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  transition: opacity 0.5s ease, visibility 0.5s ease;
  opacity: 1;
  visibility: visible;
}

/* Светлая тема для начального слоя */
:root .initial-state-layer {
  background-color: #ffffff;
}

/* Темная тема для начального слоя */
.ion-palette-dark .initial-state-layer {
  background-color: #000000;
}

.initial-state-layer.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* Панда и фон */
.panda-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  height: 120px;
}

.panda-background {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  z-index: 0;
}

.image-left, .image-right {
  height: 200px;
}

.panda-logo {
  width: 100px;
  height: auto;
  z-index: 3;
  position: relative;
}

/* Обертка для сообщений */
.messages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.8s ease;
  padding-top: 16px;
}

.messages-wrapper.active {
  opacity: 1;
}

/* Стили сообщений */
.message {
  display: flex;
  margin-bottom: 10px;
  max-width: 100%;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message-icon {
  display: flex;
  align-items: flex-start;
  padding-top: 5px;
  margin-right: 8px;
}

/* Цвет иконки не меняется при переключении темы */
.sparkle-icon {
  font-size: 20px;
  color: #87B1FF;
}

.message-bubble {
  padding: 16px;
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.2;
  white-space: pre-line;
  max-width: 70%;
}

/* Светлая тема для сообщений пользователя */
:root .user-bubble {
  background-color: #87B1FF;
  color: #000000;
  border-radius: 16px 16px 0 16px;
}

/* Темная тема для сообщений пользователя */
.ion-palette-dark .user-bubble {
  background-color: #87B1FF;
  color: #000000;
  border-radius: 16px 16px 0 16px;
}

/* Светлая тема для сообщений ассистента */
:root .assistant-bubble {
  background-color: #f5f5f5;
  color: #333333;
  border-radius: 16px 16px 16px 0;
}

/* Темная тема для сообщений ассистента */
.ion-palette-dark .assistant-bubble {
  background-color: #19191B;
  color: #D7D7D7;
  border-radius: 16px 16px 16px 0;
}

/* Примеры вопросов */
.examples-container {
  border-radius: 16px;
  padding: 16px;
  margin-top: 10px;
  margin-bottom: 16px;
  width: 100%;
}

/* Светлая тема для контейнера примеров */
:root .examples-container {
  background: #f5f5f5;
}

/* Темная тема для контейнера примеров */
.ion-palette-dark .examples-container {
  background: #19191B;
}

.examples-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

/* Светлая тема для заголовка примеров */
:root .examples-title {
  color: #333333;
  font-size: 16px;
}

/* Темная тема для заголовка примеров */
.ion-palette-dark .examples-title {
  color: #D7D7D7;
  font-size: 16px;
}

.examples-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.example-question {
  border: 1px solid #87B1FF;
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* Светлая тема для примеров вопросов */
:root .example-question {
  color: #333333;
}

/* Темная тема для примеров вопросов */
.ion-palette-dark .example-question {
  color: #D7D7D7;
}

.example-question:active {
  background-color: rgba(135, 177, 255, 0.2);
}

/* Индикатор загрузки */
.loading-bubble {
  padding: 12px 16px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

/* Светлая тема для точек загрузки */
:root .loading-dots span {
  width: 8px;
  height: 8px;
  background-color: #666666;
  border-radius: 50%;
  animation: loading 1.4s infinite ease-in-out both;
}

/* Темная тема для точек загрузки */
.ion-palette-dark .loading-dots span {
  width: 8px;
  height: 8px;
  background-color: #D7D7D7;
  border-radius: 50%;
  animation: loading 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
}

/* Инпут для сообщений */
.input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  z-index: 999;
}

/* Светлая тема для контейнера инпута */
:root .input-container {
  background-color: #f5f5f5;
}

/* Темная тема для контейнера инпута */
.ion-palette-dark .input-container {
  background-color: #212121;
}

/* Светлая тема для поля ввода */
:root .input-field {
  --background: #f5f5f5;
  --border-color: #666666;
  --border-style: solid;
  --border-width: 1px;
  --border-radius: 100px;
  --padding-start: 16px;
  --padding-end: 0px;
  --highlight-height: 0;
  min-height: 48px;
  margin: 0;
}

/* Темная тема для поля ввода */
.ion-palette-dark .input-field {
  --background: #212121;
  --border-color: #D7D7D7;
  --border-style: solid;
  --border-width: 1px;
  --border-radius: 100px;
  --padding-start: 16px;
  --padding-end: 0px;
  --highlight-height: 0;
  min-height: 48px;
  margin: 0;
}

/* Светлая тема для input */
:root ion-input {
  --color: #333333;
  --placeholder-color: #888888;
  --placeholder-opacity: 1;
}

/* Темная тема для input */
.ion-palette-dark ion-input {
  --color: #ffffff;
  --placeholder-color: #646464;
  --placeholder-opacity: 1;
}

/* Увеличенный размер иконок */
.input-container ion-button ion-icon {
  font-size: 24px;
  --ionicon-stroke-width: 40px;
}

.input-container ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  height: 40px;
  width: 40px;
  --border-radius: 50%;
  margin-right: 4px;
}

/* Улучшенные стили для кнопки записи */
.recording-button {
  --color: #FF4B55;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Отступ для инпута */
.input-spacer {
  height: 60px;
}

/* Стили для анимации печатания */
.typing-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

/* Светлая тема для текста при печатании */
:root .typing-container span {
  color: #333333;
  margin-bottom: 2px;
}

/* Темная тема для текста при печатании */
.ion-palette-dark .typing-container span {
  color: #D7D7D7;
  margin-bottom: 2px;
}

/* Анимации */
.panda-slide-leave-active,
.fade-leave-active,
.fade-up-leave-active {
  transition: all 0.5s ease-out;
}

.message-slide-enter-active {
  transition: all 0.4s ease-out;
}

.message-slide-leave-active {
  transition: all 0.4s ease-in;
  position: absolute;
}

.message-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.message-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.panda-slide-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.fade-up-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}

/* Контейнер для сообщений */
.message-list {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Добавляем специальный стиль для приветственного сообщения */
.welcome-message {
  transform-origin: top center;
  transition: all 0.5s ease;
}

.welcome-message.fade-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

/* Светлая тема для содержимого сообщения */
:root .message-content {
  color: #333333;
  font-size: 16px;
  line-height: 1.5;
}

/* Темная тема для содержимого сообщения */
.ion-palette-dark .message-content {
  color: #D7D7D7;
  font-size: 16px;
  line-height: 1.5;
}
</style> 