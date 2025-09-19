import { defineStore } from 'pinia';
import { ref } from 'vue';
import { User, FitnessGoal } from '../services/api/types';
import { ApiService } from '../services';
import api from '@/services/api/config';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Загрузка профиля пользователя
  const loadProfile = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const response = await ApiService.getProfile();
      if (response.success) {
        user.value = response.data.user;
        return { success: true, data: response.data.user };
      } else {
        error.value = response.message || 'Не удалось загрузить профиль';
        return { success: false, message: error.value };
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      error.value = err.response?.data?.message || 'Произошла ошибка при загрузке профиля';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // Получение пола пользователя
  const getGender = async () => {
    try {
      const response = await api.get('/user/gender');
      if (response.data.success) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Ошибка при получении пола';
      return { success: false, message };
    }
  };

  // Обновление профиля
  const updateProfile = async (data: any) => {
    try {
      isLoading.value = true;
      error.value = null;

      const formData = new FormData();
      
      // Добавляем текстовые поля
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.gender) formData.append('gender', data.gender);
      
      // Добавляем файл аватара, если он есть
      if (data.avatar instanceof File) {
        formData.append('avatar', data.avatar);
      }
      
      const response = await api.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Обновляем локальные данные пользователя
        if (user.value) {
          user.value = {
            ...user.value,
            ...response.data.data
          };
        }
        return { success: true, data: response.data.data };
      } else {
        error.value = response.data.message || 'Ошибка при обновлении профиля';
        return { success: false, message: error.value };
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
        error.value = err.response?.data?.message || 'Произошла ошибка при обновлении профиля';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // Обновление цели тренировки
  const updateFitnessGoal = async (goalData: FitnessGoal) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await ApiService.saveFitnessGoal(goalData);
      
      if (response.success) {
        // Обновляем локальные данные пользователя
        if (user.value) {
          user.value.fitness_goal = goalData.goal;
        }
        return { success: true };
      } else {
        error.value = response.message || 'Ошибка при обновлении цели тренировки';
        return { success: false, message: error.value };
      }
    } catch (err: any) {
      console.error('Update fitness goal error:', err);
      error.value = err.response?.data?.message || 'Произошла ошибка при обновлении цели тренировки';
      return { success: false, message: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // Выход из системы
  const logout = async () => {
    try {
      await ApiService.logout();
      user.value = null;
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      ApiService.clearAuth();
      user.value = null;
      return { success: false };
    }
  };

  // Очистка данных пользователя (при выходе)
  const clearUser = () => {
    user.value = null;
    error.value = null;
  };

  return {
    user,
    isLoading,
    error,
    loadProfile,
    getGender,
    updateProfile,
    updateFitnessGoal,
    logout,
    clearUser
  };
}); 