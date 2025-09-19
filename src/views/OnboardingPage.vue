<template>
  <ion-page>
    <ion-content>
      <div class="onboarding-container">
        <div class="header">
          <h1>Давайте настроим ваш профиль</h1>
          <p>Эта информация поможет нам подобрать для вас подходящие тренировки</p>
        </div>

        <div class="form-container">
          <form @submit.prevent="finishOnboarding">
            <div class="form-section">
              <h2>Ваши данные</h2>
              
              <ion-item class="input-item">
                <ion-label position="stacked">Пол</ion-label>
                <ion-select v-model="gender" interface="popover">
                  <ion-select-option value="male">Мужской</ion-select-option>
                  <ion-select-option value="female">Женский</ion-select-option>
                  <ion-select-option value="other">Другое</ion-select-option>
                </ion-select>
              </ion-item>

              <div class="two-columns">
                <ion-item class="input-item">
                  <ion-label position="stacked">Возраст</ion-label>
                  <ion-input v-model="age" type="number" min="16" max="100"></ion-input>
                </ion-item>

                <ion-item class="input-item">
                  <ion-label position="stacked">Вес (кг)</ion-label>
                  <ion-input v-model="weight" type="number" min="30" max="250"></ion-input>
                </ion-item>
              </div>

              <ion-item class="input-item">
                <ion-label position="stacked">Рост (см)</ion-label>
                <ion-input v-model="height" type="number" min="100" max="250"></ion-input>
              </ion-item>
            </div>

            <div class="form-section">
              <h2>Ваши фитнес-цели</h2>
              
              <ion-radio-group v-model="fitnessGoal">
                <ion-item class="input-item">
                  <ion-label>Похудение</ion-label>
                  <ion-radio slot="start" value="weight-loss"></ion-radio>
                </ion-item>

                <ion-item class="input-item">
                  <ion-label>Набор мышечной массы</ion-label>
                  <ion-radio slot="start" value="muscle-gain"></ion-radio>
                </ion-item>

                <ion-item class="input-item">
                  <ion-label>Поддержание формы</ion-label>
                  <ion-radio slot="start" value="maintenance"></ion-radio>
                </ion-item>

                <ion-item class="input-item">
                  <ion-label>Улучшение общего здоровья</ion-label>
                  <ion-radio slot="start" value="health"></ion-radio>
                </ion-item>
              </ion-radio-group>
            </div>

            <div class="form-section">
              <h2>Уровень активности</h2>
              
              <ion-radio-group v-model="activityLevel">
                <ion-item class="input-item">
                  <ion-label>Начинающий</ion-label>
                  <ion-radio slot="start" value="beginner"></ion-radio>
                </ion-item>

                <ion-item class="input-item">
                  <ion-label>Средний</ion-label>
                  <ion-radio slot="start" value="intermediate"></ion-radio>
                </ion-item>

                <ion-item class="input-item">
                  <ion-label>Продвинутый</ion-label>
                  <ion-radio slot="start" value="advanced"></ion-radio>
                </ion-item>
              </ion-radio-group>
            </div>

            <ion-button expand="block" type="submit" class="submit-button">
              Начать тренировки
            </ion-button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonRadioGroup,
  IonRadio,
  IonButton
} from '@ionic/vue';

const router = useRouter();
const gender = ref('');
const age = ref('');
const weight = ref('');
const height = ref('');
const fitnessGoal = ref('');
const activityLevel = ref('');

const finishOnboarding = () => {
  // Здесь будет логика сохранения данных пользователя
  router.push('/dashboard');
};
</script>

<style scoped>
.onboarding-container {
  background: #1e1e1e;
  color: white;
  padding: 24px;
  min-height: 100%;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.header p {
  font-size: 16px;
  color: #888;
  margin: 0;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #8e81ff;
}

.input-item {
  --background: #2a2a2a;
  --border-radius: 8px;
  --padding-start: 16px;
  --padding-end: 16px;
  --highlight-color-focused: #8e81ff;
  margin-bottom: 16px;
}

ion-label {
  --color: #888;
}

ion-input {
  --color: white;
}

ion-select {
  --color: white;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

ion-radio-group ion-item {
  --inner-padding-end: 16px;
}

ion-radio {
  --color: #888;
  --color-checked: #8e81ff;
}

.submit-button {
  --background: #8e81ff;
  --background-activated: #7a6de6;
  --border-radius: 8px;
  --color: white;
  font-weight: 600;
  margin-top: 16px;
  height: 48px;
}
</style> 