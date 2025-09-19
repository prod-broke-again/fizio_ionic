<template>
  <ion-page>
    <ion-header class="ion-no-border dark-header">
      <ion-toolbar class="transparent-toolbar">
        <ion-title class="modal-title">Цель тренировки</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal" color="medium">
            <ion-icon :icon="closeOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="modal-content">
      <div class="goal-container">
        <div class="goal-description">
          <p>Выберите цель, которую вы хотите достичь с помощью тренировок</p>
        </div>
        
        <div class="goal-options">
          <div class="goal-option" 
               :class="{ 'selected': selectedGoal === 'weight-loss' }"
               @click="selectedGoal = 'weight-loss'">
            <div class="goal-icon-wrapper weight-loss">
              <ion-icon :icon="trendingDownOutline"></ion-icon>
            </div>
            <div class="goal-content">
              <h3>Похудение</h3>
              <p>Снижение веса и процента жира в организме</p>
            </div>
            <ion-icon v-if="selectedGoal === 'weight-loss'" :icon="checkmarkCircleOutline" class="check-icon"></ion-icon>
          </div>
          
          <div class="goal-option"
               :class="{ 'selected': selectedGoal === 'muscle-gain' }"
               @click="selectedGoal = 'muscle-gain'">
            <div class="goal-icon-wrapper muscle-gain">
              <ion-icon :icon="barbellOutline"></ion-icon>
            </div>
            <div class="goal-content">
              <h3>Набор массы</h3>
              <p>Увеличение мышечной массы и силы</p>
            </div>
            <ion-icon v-if="selectedGoal === 'muscle-gain'" :icon="checkmarkCircleOutline" class="check-icon"></ion-icon>
          </div>
          
          <div class="goal-option"
               :class="{ 'selected': selectedGoal === 'maintenance' }"
               @click="selectedGoal = 'maintenance'">
            <div class="goal-icon-wrapper maintenance">
              <ion-icon :icon="fitnessOutline"></ion-icon>
            </div>
            <div class="goal-content">
              <h3>Удержание веса</h3>
              <p>Поддержание текущей формы и общее оздоровление</p>
            </div>
            <ion-icon v-if="selectedGoal === 'maintenance'" :icon="checkmarkCircleOutline" class="check-icon"></ion-icon>
          </div>
        </div>
        
        <ion-button 
          expand="block" 
          @click="saveGoal" 
          :disabled="!selectedGoal || isSaving"
          color="primary" 
          class="save-button"
          shape="round"
        >
          <ion-spinner v-if="isSaving" name="crescent" class="button-spinner"></ion-spinner>
          <span v-else>Сохранить</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonButtons,
  IonIcon,
  IonSpinner,
  modalController
} from '@ionic/vue';
import { 
  closeOutline,
  trendingDownOutline,
  barbellOutline,
  fitnessOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// Принимаем текущую цель из пропсов
const props = defineProps<{
  currentGoal?: string;
}>();

// Для передачи результата обратно
const selectedGoal = ref(props.currentGoal || '');
const isSaving = ref(false);

// Сохранение цели
const saveGoal = async () => {
  if (!selectedGoal.value) return;
  
  try {
    isSaving.value = true;
    
    const result = await userStore.updateFitnessGoal({ 
      goal: selectedGoal.value as 'weight-loss' | 'muscle-gain' | 'maintenance'
    });
    
    if (result.success) {
      closeModal(true);
    } else {
      // В случае ошибки просто закрываем модальное окно
      // Ошибка уже установлена в хранилище
      closeModal(false);
    }
  } catch (error) {
    console.error('Ошибка при сохранении цели:', error);
    closeModal(false);
  } finally {
    isSaving.value = false;
  }
};

// Закрытие модального окна
const closeModal = (success = false) => {
  modalController.dismiss({
    success,
    goal: selectedGoal.value
  });
};
</script>

<style scoped>
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

.goal-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

/* Светлая тема для описания */
:root .goal-description p {
  color: #666666;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

/* Темная тема для описания */
.ion-palette-dark .goal-description p {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

.goal-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 10px 0 20px;
}

/* Светлая тема для карточки опции */
:root .goal-option {
  background-color: rgba(240, 240, 240, 0.8);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  padding-right: 50px;
}

/* Темная тема для карточки опции */
.ion-palette-dark .goal-option {
  background-color: rgba(40, 40, 40, 0.6);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding-right: 50px;
}

/* Светлая тема для выбранной опции */
:root .goal-option.selected {
  background-color: rgba(133, 96, 255, 0.15);
  border: 1px solid rgba(133, 96, 255, 0.4);
  box-shadow: 0 6px 16px rgba(133, 96, 255, 0.16);
}

/* Темная тема для выбранной опции */
.ion-palette-dark .goal-option.selected {
  background-color: rgba(133, 96, 255, 0.25);
  border: 1px solid rgba(133, 96, 255, 0.5);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.goal-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.goal-icon-wrapper ion-icon {
  font-size: 28px;
  color: white;
}

.goal-icon-wrapper.weight-loss {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
}

.goal-icon-wrapper.muscle-gain {
  background: linear-gradient(135deg, #2e86de 0%, #54a0ff 100%);
}

.goal-icon-wrapper.maintenance {
  background: linear-gradient(135deg, #8560ff 0%, #a474ff 100%);
}

.goal-content {
  flex-grow: 1;
}

/* Светлая тема для заголовка опции */
:root .goal-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #333333;
}

/* Темная тема для заголовка опции */
.ion-palette-dark .goal-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
  color: white;
}

/* Светлая тема для описания опции */
:root .goal-content p {
  font-size: 13px;
  margin: 0;
  color: #666666;
  line-height: 1.3;
  max-width: 230px;
}

/* Темная тема для описания опции */
.ion-palette-dark .goal-content p {
  font-size: 13px;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
  max-width: 230px;
}

/* Иконка выбранной опции */
.check-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: #8560ff;
}

/* Кнопка сохранения */
.save-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
  margin: 8px 0;
  --background: linear-gradient(135deg, #8560ff 0%, #a474ff 100%);
  --color: white;
}

/* Спиннер на кнопке */
.button-spinner {
  width: 18px;
  height: 18px;
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

/* Светлая тема для кнопки закрытия */
:root ion-header ion-button {
  --color: #333333;
}

/* Темная тема для кнопки закрытия */
.ion-palette-dark ion-header ion-button {
  --color: #ffffff;
}
</style> 