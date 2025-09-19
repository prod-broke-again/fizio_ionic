// @ts-nocheck
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>Редактирование профиля</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="edit-profile-container">
        <form @submit.prevent="saveProfile">
          <div class="avatar-container">
            <div class="avatar-circle">
              <div class="avatar">
                <img v-if="avatarPreview" :src="avatarPreview" alt="Аватар пользователя" class="avatar-image"/>
              </div>
              <div class="avatar-edit-icon" @click="triggerFileInput">
                <ion-icon :icon="cameraOutline"></ion-icon>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                style="display: none" 
                accept="image/*" 
                @change="handleFileChange"
              />
            </div>
          </div>
          
          <!-- Секция выбора готовых аватаров -->
          <div class="predefined-avatars-section">
            <h3>Или выберите аватар</h3>
            
            <div class="gender-selector">
              <ion-segment v-model="selectedGender" @ionChange="handleGenderChange($event.detail.value)">
                <ion-segment-button value="female">Женский</ion-segment-button>
                <ion-segment-button value="male">Мужской</ion-segment-button>
              </ion-segment>
            </div>
            
            <div class="avatars-grid">
              <div 
                v-for="avatar in filteredAvatars" 
                :key="avatar.path"
                class="avatar-option"
                :class="{ 'selected': selectedAvatar === avatar.path }"
                @click="selectAvatar(avatar.path)"
              >
                <img :src="avatar.path" :alt="avatar.name" />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <ion-item class="input-item">
              <ion-label position="stacked">Имя</ion-label>
              <ion-input v-model="name" placeholder="Введите имя"></ion-input>
            </ion-item>
            
            <ion-item class="input-item">
              <ion-label position="stacked">Email</ion-label>
              <ion-input v-model="email" type="email" placeholder="Введите email"></ion-input>
            </ion-item>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <ion-button expand="block" type="submit" class="save-button" :disabled="isLoading">
            <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
            <span v-else>Сохранить изменения</span>
          </ion-button>
        </form>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
  IonSegment,
  IonSegmentButton
} from '@ionic/vue';
import { personCircleOutline, cameraOutline } from 'ionicons/icons';
import { ApiService, ProfileUpdateData } from '../services';
import { User } from '../services/api/types';
import { useUserStore } from '../stores/user';

// Импорт предустановленных аватаров
import femaleAvatar1 from '../assets/images/avatars/female/avatar.png';
import femaleAvatar2 from '../assets/images/avatars/female/avatar_2.png';
import maleAvatar1 from '../assets/images/avatars/male/avatar.png';

// Интерфейс для аватара
interface AvatarOption {
  name: string;
  path: string;
}

const router = useRouter();
const userStore = useUserStore();
const name = ref('');
const email = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const selectedAvatar = ref<string | null>(null);
const selectedGender = ref<'male' | 'female'>('female');

// Предустановленные аватары
const femaleAvatars: AvatarOption[] = [
  { name: 'Женский 1', path: femaleAvatar1 },
  { name: 'Женский 2', path: femaleAvatar2 }
];

const maleAvatars: AvatarOption[] = [
  { name: 'Мужской 1', path: maleAvatar1 }
];

// Отфильтрованные аватары по выбранному полу
const filteredAvatars = computed(() => {
  return selectedGender.value === 'female' ? femaleAvatars : maleAvatars;
});

// Выбор предустановленного аватара
const selectAvatar = async (path: string) => {
  selectedAvatar.value = path;
  avatarPreview.value = path;
  avatarFile.value = null; // Сбрасываем загруженный файл
  
  try {
    // Конвертируем URL в Blob, затем в File
    const response = await fetch(path);
    const blob = await response.blob();
    
    // Определяем имя файла из пути (например, avatar.png)
    const filename = path.split('/').pop() || 'avatar.png';
    
    // Создаем File объект
    avatarFile.value = new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Ошибка при конвертации аватара в файл:', error);
  }
};

// Загрузка данных профиля
const loadProfile = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    // Если пользователь уже загружен в хранилище, используем его данные
    if (userStore.user) {
      const userObj = userStore.user;
      
      name.value = userObj.name || '';
      email.value = userObj.email || '';
      
      // Загружаем пол пользователя отдельно
      try {
        const genderResponse = await userStore.getGender();
        if (genderResponse.success && genderResponse.data) {
          selectedGender.value = genderResponse.data.gender;
        } else {
          // Если пол не выбран, показываем предупреждение
          toastMessage.value = 'Пожалуйста, выберите ваш пол';
          toastColor.value = 'warning';
          showToast.value = true;
        }
      } catch (error) {
        console.error('Error loading gender:', error);
      }
      
      if (userObj.avatar_url) {
        avatarPreview.value = userObj.avatar_url;
        
        // Проверяем, является ли текущий аватар одним из предустановленных
        const allAvatars = [...femaleAvatars, ...maleAvatars];
        const matchedAvatar = allAvatars.find(avatar => userObj.avatar_url?.includes(avatar.path));
        if (matchedAvatar) {
          selectedAvatar.value = matchedAvatar.path;
        }
      } else {
        // Если аватар не установлен, устанавливаем дефолтный в зависимости от пола
        const defaultAvatar = selectedGender.value === 'female' ? femaleAvatar1 : maleAvatar1;
        avatarPreview.value = defaultAvatar;
        selectedAvatar.value = defaultAvatar;
      }
    } else {
      // Иначе загружаем данные с сервера
      await userStore.loadProfile();
      if (userStore.user) {
        const userObj = userStore.user;
        
        name.value = userObj.name || '';
        email.value = userObj.email || '';
        
        // Загружаем пол пользователя отдельно
        try {
          const genderResponse = await userStore.getGender();
          if (genderResponse.success && genderResponse.data) {
            selectedGender.value = genderResponse.data.gender;
          } else {
            // Если пол не выбран, показываем предупреждение
            toastMessage.value = 'Пожалуйста, выберите ваш пол';
            toastColor.value = 'warning';
            showToast.value = true;
          }
        } catch (error) {
          console.error('Error loading gender:', error);
        }
        
        if (userObj.avatar_url) {
          avatarPreview.value = userObj.avatar_url;
          
          // Проверяем, является ли текущий аватар одним из предустановленных
          const allAvatars = [...femaleAvatars, ...maleAvatars];
          const matchedAvatar = allAvatars.find(avatar => userObj.avatar_url?.includes(avatar.path));
          if (matchedAvatar) {
            selectedAvatar.value = matchedAvatar.path;
          }
        } else {
          // Если аватар не установлен, устанавливаем дефолтный в зависимости от пола
          const defaultAvatar = selectedGender.value === 'female' ? femaleAvatar1 : maleAvatar1;
          avatarPreview.value = defaultAvatar;
          selectedAvatar.value = defaultAvatar;
        }
      } else {
        errorMessage.value = userStore.error || 'Не удалось загрузить профиль';
      }
    }
  } catch (err: any) {
    console.error('Error loading profile:', err);
    errorMessage.value = err.response?.data?.message || 'Произошла ошибка при загрузке профиля';
  } finally {
    isLoading.value = false;
  }
};

// Обработка выбора файла
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Пожалуйста, выберите изображение';
      return;
    }
    
    // Проверка размера файла (макс. 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = 'Изображение слишком большое. Максимальный размер: 5 МБ';
      return;
    }
    
    // Сохраняем файл и создаем предпросмотр
    avatarFile.value = file;
    avatarPreview.value = URL.createObjectURL(file);
    selectedAvatar.value = null; // Сбрасываем выбранный предустановленный аватар
  }
};

// Открытие диалога выбора файла
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Сохранение изменений профиля
const saveProfile = async () => {
  if (!name.value || !email.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля';
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = '';

    const profileData: ProfileUpdateData = {
      name: name.value,
      email: email.value,
      gender: selectedGender.value
    };

    // Добавляем файл аватара, если он был выбран/загружен
    if (avatarFile.value) {
      profileData.avatar = avatarFile.value;
    }

    // Используем хранилище для обновления профиля
    const result = await userStore.updateProfile(profileData);
    
    if (result.success) {
      toastMessage.value = 'Профиль успешно обновлен';
      toastColor.value = 'success';
      showToast.value = true;
      
      // Небольшая задержка перед возвратом на страницу профиля
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } else {
      errorMessage.value = result.message || 'Ошибка при обновлении профиля';
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    errorMessage.value = 'Произошла ошибка при обновлении профиля';
  } finally {
    isLoading.value = false;
  }
};

// Обработчик изменения пола
const handleGenderChange = async (gender: string) => {
  selectedGender.value = gender as 'male' | 'female';
  try {
    isLoading.value = true;
    const response = await userStore.updateProfile({ gender: selectedGender.value });
    if (response.success) {
      toastMessage.value = 'Пол успешно обновлен';
      toastColor.value = 'success';
      showToast.value = true;
      
      // Обновляем локальное состояние
      if (userStore.user) {
        userStore.user.gender = selectedGender.value;
      }
      
      // Обновляем список аватаров в соответствии с полом
      if (selectedGender.value === 'female') {
        filteredAvatars.value = femaleAvatars;
      } else {
        filteredAvatars.value = maleAvatars;
      }
    } else {
      throw new Error(response.message || 'Ошибка при обновлении пола');
    }
  } catch (error) {
    console.error('Error updating gender:', error);
    toastMessage.value = 'Ошибка при обновлении пола';
    toastColor.value = 'danger';
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
/* Светлая тема (по умолчанию) */
:root .edit-profile-container {
  padding: 20px;
  background-color: #ffffff;
  min-height: 100%;
  color: #333333;
}

/* Темная тема */
.ion-palette-dark .edit-profile-container {
  padding: 20px;
  background-color: #1a191b;
  min-height: 100%;
  color: white;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8560ff 0%, #4CAF50 100%);
  padding: 6px;
  box-shadow: 0 8px 16px rgba(133, 96, 255, 0.3);
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Светлая тема для фона аватара */
:root .avatar {
  background-color: #f5f5f5;
}

/* Темная тема для фона аватара */
.ion-palette-dark .avatar {
  background-color: #1a191b;
}

.avatar ion-icon {
  font-size: 70px;
  color: #8560ff;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background-color: #87B1FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.avatar-edit-icon ion-icon {
  font-size: 20px;
  color: white;
}

.form-section {
  margin-top: 20px;
}

/* Светлая тема для полей ввода */
:root .input-item {
  --background: #f5f5f5;
  --border-color: transparent;
  --border-radius: 10px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  margin-bottom: 16px;
}

/* Темная тема для полей ввода */
.ion-palette-dark .input-item {
  --background: #2a2a2c;
  --border-color: transparent;
  --border-radius: 10px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  margin-bottom: 16px;
}

/* Светлая тема для меток */
:root ion-label {
  color: #333333;
  font-weight: 500;
  font-size: 14px;
}

/* Темная тема для меток */
.ion-palette-dark ion-label {
  color: #ccc;
  font-weight: 500;
  font-size: 14px;
}

/* Светлая тема для инпутов */
:root ion-input {
  --color: #333333;
  --placeholder-color: #999;
  --placeholder-opacity: 0.7;
  font-size: 16px;
  margin-top: 6px;
}

/* Темная тема для инпутов */
.ion-palette-dark ion-input {
  --color: white;
  --placeholder-color: #666;
  --placeholder-opacity: 0.7;
  font-size: 16px;
  margin-top: 6px;
}

.save-button {
  margin-top: 24px;
  --background: #87B1FF;
  --color: black;
  --border-radius: 10px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
}

.error-message {
  color: #ff6b6b;
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}

/* Стили для выбора предустановленных аватаров */
.predefined-avatars-section {
  margin-bottom: 24px;
}

/* Светлая тема для заголовка секции аватаров */
:root .predefined-avatars-section h3 {
  text-align: center;
  margin-bottom: 16px;
  color: #333333;
  font-weight: 500;
}

/* Темная тема для заголовка секции аватаров */
.ion-palette-dark .predefined-avatars-section h3 {
  text-align: center;
  margin-bottom: 16px;
  color: #ccc;
  font-weight: 500;
}

.gender-selector {
  margin-bottom: 20px;
}

/* Светлая тема для фона сегментов */
:root ion-segment {
  --background: #f0f0f0;
}

/* Темная тема для фона сегментов */
.ion-palette-dark ion-segment {
  --background: #2a2a2c;
}

/* Светлая тема для кнопок сегментов */
:root ion-segment-button {
  --color: #666666;
  --color-checked: #333333;
  --background-checked: #e0e0e0;
}

/* Темная тема для кнопок сегментов */
.ion-palette-dark ion-segment-button {
  --color: #999999;
  --color-checked: #ffffff;
  --background-checked: #3a3a3c;
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.avatar-option {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  margin: 0 auto;
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Светлая тема для выбранного аватара */
:root .avatar-option.selected {
  border-color: #87B1FF;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(135, 177, 255, 0.4);
}

/* Темная тема для выбранного аватара */
.ion-palette-dark .avatar-option.selected {
  border-color: #87B1FF;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(135, 177, 255, 0.4);
}

.avatar-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Светлая тема для ion-header */
:root ion-header ion-toolbar {
  --background: #ffffff;
  --color: #333333;
  --border-color: #e0e0e0;
}

/* Темная тема для ion-header */
.ion-palette-dark ion-header ion-toolbar {
  --background: #1a191b;
  --color: #ffffff;
  --border-color: #2a2a2c;
}

/* Светлая тема для кнопки назад */
:root ion-back-button {
  --color: #333333;
}

/* Темная тема для кнопки назад */
.ion-palette-dark ion-back-button {
  --color: #ffffff;
}
</style> 