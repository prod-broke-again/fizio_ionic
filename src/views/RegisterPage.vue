// @ts-nocheck
<template>
  <ion-page>
    <ion-content>
      <div class="register-container">
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
                <p>Создайте аккаунт для начала тренировок и достижения ваших целей.</p>
              </div>
            </div>

            <div class="form-container">
              <form @submit.prevent="handleRegister">
                <ion-item class="input-item">
                  <ion-input
                    v-model="name"
                    type="text"
                    placeholder="Ваше имя"
                    required
                  ></ion-input>
                </ion-item>

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

                <ion-item class="input-item">
                  <ion-input
                    v-model="confirmPassword"
                    type="password"
                    placeholder="Подтверждение пароля"
                    required
                  ></ion-input>
                </ion-item>

                <div v-if="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>

                <ion-button expand="block" type="submit" class="register-button" :disabled="isLoading">
                  <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                  <span v-else>Зарегистрироваться</span>
                </ion-button>
              </form>

              <div class="divider">
                <span>или</span>
              </div>

              <ion-button
                expand="block"
                fill="outline"
                @click="goToLogin"
                class="login-button"
              >
                Уже есть аккаунт? Войти
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
// @ts-nocheck
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  IonToast,
  IonList,
  IonRadioGroup,
  IonRadio,
  IonLabel,
  IonSpinner
} from '@ionic/vue';
import ApiService, { RegisterData } from '../services/api';

const router = useRouter();
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('');
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const isDarkMode = ref(false);

const themeIcon = computed(() => isDarkMode.value ? sunnyOutline : moonOutline);

onMounted(() => {
  // 1. Получаем тему из localStorage
  let dark = false;
  const savedSettings = localStorage.getItem('fizio_settings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      dark = !!settings.darkMode;
    } catch {}
  }
  isDarkMode.value = dark;

  // 2. Синхронизируем класс и мета-тег (на всякий случай)
  if (isDarkMode.value) {
    document.documentElement.classList.add('ion-palette-dark');
  } else {
    document.documentElement.classList.remove('ion-palette-dark');
  }
  const metaColorScheme = document.querySelector('meta[name=\"color-scheme\"]');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', isDarkMode.value ? 'dark' : 'light');
  }
});

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('ion-palette-dark');
  } else {
    document.documentElement.classList.remove('ion-palette-dark');
  }
  const metaColorScheme = document.querySelector('meta[name=\"color-scheme\"]');
  if (metaColorScheme) {
    metaColorScheme.setAttribute('content', isDarkMode.value ? 'dark' : 'light');
  }
  localStorage.setItem('fizio_settings', JSON.stringify({ darkMode: isDarkMode.value }));
};

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Пароли не совпадают. Пожалуйста, проверьте введенные данные.';
    return;
  }

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const registerData: RegisterData = {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
      gender: 'not-specified'
    };

    const response = await ApiService.register(registerData);
    
    if (response.success) {
      toastMessage.value = 'Регистрация успешно завершена!';
  toastColor.value = 'success';
  showToast.value = true;

      // Переход на экран выбора цели
  setTimeout(() => {
    router.push('/goal-selection');
      }, 2000);
    } else {
      errorMessage.value = response.message || 'Ошибка при регистрации';
    }
  } catch (error: any) {
    console.error('Register error:', error);
    
    if (error.response?.data?.errors) {
      const errorsObj = error.response.data.errors;
      const errorMessages = Object.values(errorsObj).flat();
      errorMessage.value = errorMessages.join('. ');
    } else {
      errorMessage.value = error.response?.data?.message || 'Произошла ошибка при регистрации';
    }
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.register-container {
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

.form-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 20px;
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

.register-button {
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

.login-button {
  --background: transparent;
  --background-activated: rgba(142, 129, 255, 0.1);
  --border-color: #8e81ff;
  --border-radius: 8px;
  --color: white;
  height: 48px;
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
</style> 