<template>
  <ion-page>
    <div class="gender-container">
      <div class="gender-content">
        <div class="top-section">
          <div class="image-container">
            <img src="../assets/gender-icon.svg" alt="Gender Selection" class="gender-image">
          </div>
          <h1 class="title">Выберите пол</h1>
          <p class="subtitle">Это поможет нам персонализировать ваш фитнес-план</p>
          
          <div class="gender-options">
            <div 
              class="gender-button" 
              :class="{ selected: selectedGender === 'male' }"
              @click="selectGender('male')"
            >
              <ion-icon name="male-outline" class="gender-icon"></ion-icon>
              <span>Мужской</span>
            </div>
            
            <div 
              class="gender-button" 
              :class="{ selected: selectedGender === 'female' }"
              @click="selectGender('female')"
            >
              <ion-icon name="female-outline" class="gender-icon"></ion-icon>
              <span>Женский</span>
            </div>
            
            <div 
              class="gender-button" 
              :class="{ selected: selectedGender === 'non-binary' }"
              @click="selectGender('non-binary')"
            >
              <ion-icon name="person-outline" class="gender-icon"></ion-icon>
              <span>Небинарный</span>
            </div>
            
            <div 
              class="gender-button" 
              :class="{ selected: selectedGender === 'not-specified' }"
              @click="selectGender('not-specified')"
            >
              <ion-icon name="ellipsis-horizontal-outline" class="gender-icon"></ion-icon>
              <span>Не указывать</span>
            </div>
          </div>
        </div>
        
        <div class="bottom-section">
          <button 
            class="continue-button" 
            :disabled="!selectedGender" 
            @click="continueToNextStep"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedGender = ref('');

function selectGender(gender: string) {
  selectedGender.value = gender;
}

function continueToNextStep() {
  if (selectedGender.value) {
    // Здесь можно сохранить выбранный пол, например в localStorage или в store
    localStorage.setItem('userGender', selectedGender.value);
    // Перейти на следующую страницу
    router.push('/goal-selection');
  }
}
</script>

<style scoped>
.gender-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #000000;
  background-image: url('https://i.imgur.com/qEHV9wG.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.gender-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 20px;
}

.top-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
}

.image-container {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.gender-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: invert(1);
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
  text-align: center;
}

.subtitle {
  font-size: 16px;
  color: #b0b0b0;
  margin-bottom: 30px;
  text-align: center;
  max-width: 300px;
}

.gender-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.gender-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gender-button.selected {
  background-color: rgba(84, 70, 245, 0.3);
  border: 1px solid #5446f5;
}

.gender-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.bottom-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.continue-button {
  width: 100%;
  max-width: 300px;
  padding: 14px;
  background: linear-gradient(90deg, #5446f5, #9068ff);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  opacity: 1;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.continue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 