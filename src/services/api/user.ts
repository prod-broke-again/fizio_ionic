import api from './config';
import type { User, ProfileUpdateData, GenderResponse } from './types';

export const getUserProfile = async (): Promise<User> => {
  const response = await api.get('/user/profile');
  return response.data;
};

export const getGender = async (): Promise<GenderResponse> => {
  const response = await api.get('/user/gender');
  return response.data;
};

export const updateProfile = async (data: ProfileUpdateData): Promise<{ success: boolean; data?: User; message?: string }> => {
  try {
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
      return { success: true, data: response.data.data };
    } else {
      return { 
        success: false, 
        message: response.data.message || 'Ошибка при обновлении профиля' 
      };
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Ошибка при обновлении профиля' 
    };
  }
}; 