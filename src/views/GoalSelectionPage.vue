<template>
  <ion-page>
    <ion-content>
      <div class="goal-container">
        <div class="goal-content">
          <div class="image-container">
            <img src="../assets/logo_goal.png" alt="Выберите цель" class="target-image" />
          </div>
          
          <h1 class="title">Выберите цель</h1>
          
          <div class="goal-options">
            <button 
              @click="selectGoal('weight-loss')" 
              class="goal-button weight-loss"
              :class="{ 'selected': selectedGoal === 'weight-loss' }"
            >
              Похудение
            </button>
            
            <button 
              @click="selectGoal('muscle-gain')" 
              class="goal-button muscle-gain"
              :class="{ 'selected': selectedGoal === 'muscle-gain' }"
            >
              Набор массы
            </button>
            
            <button 
              @click="selectGoal('maintenance')" 
              class="goal-button maintenance"
              :class="{ 'selected': selectedGoal === 'maintenance' }"
            >
              Удержание веса
            </button>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div class="bottom-button">
            <button 
              @click="continueToNextStep" 
              class="continue-button"
              :disabled="!selectedGoal || isLoading"
            >
              <ion-spinner v-if="isLoading" name="crescent" class="spinner"></ion-spinner>
              <span v-else>Продолжить</span>
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonSpinner } from '@ionic/vue';
import ApiService, { FitnessGoal } from '../services/api';

const router = useRouter();
const selectedGoal = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const selectGoal = (goal: string) => {
  selectedGoal.value = goal;
  errorMessage.value = '';
};

const continueToNextStep = async () => {
  if (selectedGoal.value) {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      
      const goalData: FitnessGoal = {
        goal: selectedGoal.value as any
      };
      
      const response = await ApiService.saveFitnessGoal(goalData);
      
      if (response.success) {
        // Переходим сразу на главную страницу приложения вместо следующего шага
        router.push('/dashboard');
      } else {
        errorMessage.value = response.message || 'Не удалось сохранить цель';
      }
    } catch (error: any) {
      console.error('Error saving fitness goal:', error);
      errorMessage.value = error.response?.data?.message || 'Произошла ошибка при сохранении цели';
    } finally {
      isLoading.value = false;
    }
  }
};
</script>

<style scoped>
.goal-container {
  height: 100%;
  width: 100%;
  background-color: black;
  background-image: url('../assets/bg_goal_selection.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
}

.goal-content {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: space-between;
  padding: 40px 0;
}

.image-container {
  margin-bottom: 20px;
  width: 200px;
  height: 200px;
}

.target-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  color: white;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.goal-options {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: auto;
  margin-top: 20px;
}

.bottom-button {
  width: 100%;
  margin-top: 40px;
}

.goal-button {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  border: none;
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
}

.goal-button.selected {
  transform: scale(1.02);
  background-color: #00D68F;
  color: white;
  box-shadow: 0 0 15px rgba(0, 214, 143, 0.6);
}

.weight-loss {
  background-color: white;
  color: #333;
}

.weight-loss.selected {
  background-color: #00D68F;
  color: white;
}

.muscle-gain {
  background-color: white;
  color: #333;
}

.muscle-gain.selected {
  background-color: #00D68F;
  color: white;
}

.maintenance {
  background-color: white;
  color: #333;
}

.maintenance.selected {
  background-color: #00D68F;
  color: white;
}

.continue-button {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: rgba(128, 128, 128, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.continue-button:not(:disabled):hover {
  background-color: rgba(150, 150, 150, 0.8);
}

.error-message {
  color: #ff4961;
  margin: 20px 0 0;
  text-align: center;
  font-size: 14px;
  width: 100%;
}

.spinner {
  color: white;
}
</style> 