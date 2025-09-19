// @ts-nocheck
import api from './config';
import { ProfileUpdateData, FitnessGoal } from './types';

export const ProfileService = {
  // Получение профиля пользователя
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Обновление профиля пользователя
  async updateProfile(data: ProfileUpdateData) {
    // Создаем FormData для отправки файла
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.email) formData.append('email', data.email);
    
    // Обрабатываем аватар: либо загруженный файл, либо выбранный из предустановленных
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    } else if (data.selected_avatar) {
      formData.append('selected_avatar', data.selected_avatar);
    }
    
    const response = await api.post('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Управление целями фитнеса
  async saveFitnessGoal(data: FitnessGoal) {
    const response = await api.post('/user/fitness-goal', data);
    return response.data;
  },

  async getFitnessGoal() {
    const response = await api.get('/user/fitness-goal');
    return response.data;
  }
}; 