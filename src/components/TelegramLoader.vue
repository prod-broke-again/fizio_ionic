<template>
  <div class="telegram-loader">
    <div class="loading-content">
      <ion-spinner name="crescent"></ion-spinner>
      <h2>Подключение к Telegram...</h2>
      <p>Пожалуйста, подождите, мы настраиваем вашу учетную запись</p>
      
      <!-- Кнопка для показа логов -->
      <ion-button fill="clear" @click="toggleLogs">
        {{ showLogs ? 'Скрыть логи' : 'Показать логи' }}
      </ion-button>
      
      <!-- Панель с логами -->
      <div v-if="showLogs" class="logs-panel">
        <div class="logs-header">
          <h3>Логи</h3>
          <ion-button fill="clear" size="small" @click="clearLogs">
            Очистить
          </ion-button>
        </div>
        <div class="logs-content" ref="logsContent">
          <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { IonSpinner, IonButton } from '@ionic/vue';

const showLogs = ref(false);
const logs = ref<Array<{ type: string; message: string }>>([]);
const logsContent = ref<HTMLElement | null>(null);

// Перехватываем console.log, console.error и console.warn
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

// Функция для добавления лога
const addLog = (type: string, message: string) => {
  logs.value.push({ type, message });
  // Ограничиваем количество логов
  if (logs.value.length > 100) {
    logs.value.shift();
  }
  // Прокручиваем к последнему логу
  setTimeout(() => {
    if (logsContent.value) {
      logsContent.value.scrollTop = logsContent.value.scrollHeight;
    }
  }, 0);
};

// Переопределяем методы консоли
console.log = (...args) => {
  originalConsole.log(...args);
  addLog('info', args.join(' '));
};

console.error = (...args) => {
  originalConsole.error(...args);
  addLog('error', args.join(' '));
};

console.warn = (...args) => {
  originalConsole.warn(...args);
  addLog('warning', args.join(' '));
};

// Функции для управления логами
const toggleLogs = () => {
  showLogs.value = !showLogs.value;
};

const clearLogs = () => {
  logs.value = [];
};

// Восстанавливаем оригинальные методы консоли при размонтировании
onMounted(() => {
  // Добавляем начальный лог
  addLog('info', 'Инициализация Telegram WebApp...');
});
</script>

<style scoped>
.telegram-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--tg-theme-bg-color, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  padding: 2rem;
  max-width: 90%;
  width: 400px;
}

.loading-content h2 {
  color: var(--tg-theme-text-color, #000000);
  margin: 1rem 0;
}

.loading-content p {
  color: var(--tg-theme-hint-color, #999999);
  margin: 0 0 1rem 0;
}

ion-spinner {
  width: 48px;
  height: 48px;
  color: var(--tg-theme-button-color, #2481cc);
}

.logs-panel {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.logs-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--tg-theme-text-color, #000000);
}

.logs-content {
  height: 200px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.8rem;
  line-height: 1.4;
}

.log-entry {
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.log-entry.info {
  color: var(--tg-theme-text-color, #000000);
}

.log-entry.error {
  color: #ff3b30;
}

.log-entry.warning {
  color: #ff9500;
}

/* Стилизация скроллбара */
.logs-content::-webkit-scrollbar {
  width: 6px;
}

.logs-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.logs-content::-webkit-scrollbar-thumb {
  background: var(--tg-theme-button-color, #2481cc);
  border-radius: 3px;
}
</style> 