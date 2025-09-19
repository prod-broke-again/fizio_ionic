<template>
  <ion-page>
    <ion-content>
      <div class="login-container">
        <div class="overlay">
          <div class="content">
            <div class="top-section">
              <button @click="goBack" class="back-button">
                <svg class="back-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Назад
              </button>
              
              <div class="logo">
                <h1>Fizio</h1>
              </div>

              <div class="tagline">
                <p>Добро пожаловать! Войдите в свой аккаунт для продолжения тренировок.</p>
              </div>
            </div>

            <div class="form-container">
              <form @submit.prevent="handleLogin">
                <ion-item class="input-item">
                  <ion-input
                    v-model="email"
                    type="email"
                    placeholder="Ваш e-mail"
                    required
                  ></ion-input>
                </ion-item>

                <ion-item class="input-item">
                  <ion-input
                    v-model="password"
                    type="password"
                    placeholder="Пароль"
                    required
                  ></ion-input>
                </ion-item>

                <div v-if="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <ion-button expand="block" type="submit" class="login-button" :disabled="isLoading">
                  <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                  <span v-else>Войти</span>
                </ion-button>
              </form>

              <div class="divider">
                <span>или</span>
              </div>

              <ion-button
                expand="block"
                fill="outline"
                @click="goToRegister"
                class="register-button"
              >
                Нет аккаунта? Зарегистрироваться
              </ion-button>
            </div>
          </div>
        </div>
      </div>
      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :color="toastColor"
        :duration="3000"
        @didDismiss="showToast = false"
      ></ion-toast>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonInput,
  IonItem,
  IonButton,
  IonContent,
  IonSpinner,
  IonToast
} from '@ionic/vue';
import ApiService, { LoginData } from '../services/api';

const router = useRouter();
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const loginData: LoginData = {
      email: email.value,
      password: password.value
    };

    const response = await ApiService.login(loginData);

    if (response.success) {
      toastMessage.value = 'Вход выполнен успешно!';
      toastColor.value = 'success';
      showToast.value = true;

      // Проверяем наличие цели фитнеса у пользователя
      const profileResponse = await ApiService.getProfile();

      if (profileResponse.success && profileResponse.data.user.fitness_goal) {
        // Если цель уже установлена, направляем на дашборд
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Если цель не установлена, начинаем онбординг
        setTimeout(() => {
          router.push('/goal-selection');
        }, 2000);
      }
    } else {
      errorMessage.value = response.message || 'Ошибка авторизации';
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Произошла ошибка при входе';
  } finally {
    isLoading.value = false;
  }
};


const goToRegister = () => {
  router.push('/register');
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.login-container {
  height: 100%;
  width: 100%;
  background-image: url('../assets/login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 32px 24px;
}

.top-section {
  padding-top: 10%;
}

.logo {
  text-align: center;
}

.logo h1 {
  font-size: 64px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.tagline {
  text-align: center;
  margin: 16px 0;
  color: white;
}

.tagline p {
  font-size: 16px;
  line-height: 1.5;
  margin: 8px 0;
  letter-spacing: 0.3px;
  font-weight: 400;
}

.form-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 20px;
}

.input-item {
  --background: rgba(255, 255, 255, 0.1);
  --border-radius: 8px;
  --border-color: transparent;
  --highlight-color-focused: #8e81ff;
  margin-bottom: 16px;
}

ion-input {
  --color: white;
  --placeholder-color: rgba(255, 255, 255, 0.6);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
}

.login-button {
  --background: #8e81ff;
  --background-activated: #7a6de6;
  --border-radius: 8px;
  --color: white;
  font-weight: 600;
  margin-top: 16px;
  height: 48px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


.error-message {
  color: #ff4961;
  margin: 8px 0;
  text-align: center;
  font-size: 14px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.back-icon {
  width: 18px;
  height: 18px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: rgba(255, 255, 255, 0.6);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.divider span {
  padding: 0 16px;
}

.register-button {
  --background: transparent;
  --background-activated: rgba(142, 129, 255, 0.1);
  --border-color: #8e81ff;
  --border-radius: 8px;
  --color: white;
  height: 48px;
  letter-spacing: 0.5px;
}
</style> 