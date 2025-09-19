<template>
  <ion-page>
    <ion-header class="custom-modal-header ion-no-border">
      <ion-toolbar>
        <ion-title class="modal-title">Настройки чата</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal" class="close-button">
            <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="modal-content ion-padding">
      <div class="settings-container">
        <!-- Секция общих настроек -->
        <div class="settings-card">
          <div class="section-header">
            <ion-icon :icon="chatbubbleOutline" color="primary"></ion-icon>
            <span class="section-title">Общие настройки</span>
          </div>
          <ion-list lines="none" class="settings-list">
            <ion-item class="setting-item">
              <ion-icon slot="start" :icon="cloudDownloadOutline"></ion-icon>
              <ion-label>
                <h3>Автоматически загружать историю</h3>
                <p>Загружать сообщения при входе в чат</p>
              </ion-label>
              <ion-toggle 
                v-model="settings.autoLoadHistory" 
                color="primary"
              ></ion-toggle>
            </ion-item>
            
            <ion-item class="setting-item">
              <ion-icon slot="start" :icon="saveOutline"></ion-icon>
              <ion-label>
                <h3>Сохранять историю локально</h3>
                <p>Хранить сообщения в памяти устройства</p>
              </ion-label>
              <ion-toggle 
                v-model="settings.saveHistoryLocally" 
                color="primary"
              ></ion-toggle>
            </ion-item>
          </ion-list>
        </div>
        
        <!-- Секция управления данными -->
        <div class="settings-card">
          <div class="section-header">
            <ion-icon :icon="alertCircleOutline" color="danger"></ion-icon>
            <span class="section-title">Управление данными</span>
          </div>
          
          <ion-button 
            expand="block" 
            @click="clearChatHistory" 
            color="danger" 
            class="clear-button"
          >
            <ion-icon :icon="trashOutline" slot="start"></ion-icon>
            Очистить историю чата
          </ion-button>
          
          <p class="hint-text">
            Очистка удалит всю историю переписки и не может быть отменена
          </p>
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
  IonButtons,
  IonIcon,
  modalController
} from '@ionic/vue';
import { 
  closeOutline, 
  trashOutline, 
  chatbubbleOutline, 
  saveOutline, 
  cloudDownloadOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();

const settings = ref({
  autoLoadHistory: true,
  saveHistoryLocally: true,
});

// Загрузка настроек из localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem('fizio_settings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      settings.value = { 
        ...settings.value, 
        ...parsedSettings 
      };
    } catch (e) {
      console.error('Ошибка при загрузке настроек:', e);
    }
  }
}

// Сохранение настроек в localStorage
function saveSettings() {
  localStorage.setItem('fizio_settings', JSON.stringify(settings.value));
}

// Очистка истории чата
async function clearChatHistory() {
  try {
    // Очищаем историю через store
    await chatStore.clearChat();
    // Закрываем модальное окно
    modalController.dismiss();
  } catch (error) {
    console.error('Ошибка при очистке истории:', error);
  }
}

// Закрытие модального окна
function closeModal() {
  modalController.dismiss();
}

// Инициализация
onMounted(() => {
  loadSettings();
});

// Отслеживаем изменения настроек
watch(settings, () => {
  saveSettings();
}, { deep: true });
</script>

<style scoped>
/* Адаптация темы из AIPage.vue */
:root {
  --ion-color-primary: #87B1FF;
  --ion-color-primary-rgb: 135, 177, 255;
  --ion-color-primary-contrast: #000000;
  --ion-color-primary-contrast-rgb: 0, 0, 0;
  --ion-color-primary-shade: #779ce0;
  --ion-color-primary-tint: #93b8ff;

  --ion-color-danger: #FF4B55;
  --ion-color-danger-rgb: 255, 75, 85;
  --ion-color-danger-contrast: #ffffff;
  --ion-color-danger-contrast-rgb: 255, 255, 255;
  --ion-color-danger-shade: #e0424b;
  --ion-color-danger-tint: #ff5c66;
}

.ion-palette-dark :root {
  --ion-color-primary: #87B1FF;
  --ion-color-primary-rgb: 135, 177, 255;
  --ion-color-primary-contrast: #000000;
  --ion-color-primary-contrast-rgb: 0, 0, 0;
  --ion-color-primary-shade: #779ce0;
  --ion-color-primary-tint: #93b8ff;

  --ion-color-danger: #FF4B55;
  --ion-color-danger-rgb: 255, 75, 85;
  --ion-color-danger-contrast: #ffffff;
  --ion-color-danger-contrast-rgb: 255, 255, 255;
  --ion-color-danger-shade: #e0424b;
  --ion-color-danger-tint: #ff5c66;

  --ion-background-color: #121212;
  --ion-background-color-rgb: 18, 18, 18;

  --ion-text-color: #ffffff;
  --ion-text-color-rgb: 255, 255, 255;

  --ion-color-step-50: #1e1e1e;
  --ion-color-step-100: #2a2a2a;
  --ion-color-step-150: #363636;
}

/* Стили для заголовка модального окна */
.custom-modal-header {
  --background: var(--ion-background-color);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--ion-text-color);
  padding-left: 8px;
}

.close-button {
  --color: var(--ion-text-color);
}

/* Стили для основного контента */
.modal-content {
  --background: var(--ion-background-color);
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Стили для карточек настроек */
.settings-card {
  background: var(--ion-color-step-100);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.ion-palette-dark .settings-card {
   box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--ion-text-color);
  font-weight: 600;
  font-size: 18px;
  padding: 0 8px;
}

.section-header ion-icon {
  font-size: 20px;
}

.section-title {
    font-weight: 600;
}

/* Стили для элементов списка настроек */
.settings-list {
  background: transparent;
  margin: 0;
  padding: 0;
}

.setting-item {
  --background: transparent;
  --color: var(--ion-text-color);
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
  color: var(--ion-text-color);
}

.setting-item ion-label h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
  color: var(--ion-text-color);
}

.setting-item ion-label p {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0;
}

/* Стили для кнопки очистки истории */
.clear-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
  margin: 8px 0;
}

/* Стили для подсказки */
.hint-text {
  font-size: 12px;
  color: var(--ion-color-medium);
  text-align: center;
  margin: 8px 0 0 0;
  padding: 0 16px;
}

/* Стили для переключателя */
ion-toggle {
  --background: var(--ion-color-step-150);
  --background-checked: var(--ion-color-primary);
  --handle-background: var(--ion-color-light);
  --handle-background-checked: var(--ion-color-light);
  --handle-height: 20px;
  --handle-width: 20px;
  --handle-box-shadow: none;
  --handle-border-radius: 10px;
  padding-right: 6px;
}
</style> 