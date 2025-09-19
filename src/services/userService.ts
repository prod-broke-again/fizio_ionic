import api from './api/config';
import type { User } from '../types/user';

// --- Request Interfaces ---
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export interface FitnessGoalRequest {
  goal_type: 'weight_loss' | 'muscle_gain' | 'maintenance';
  target_weight?: number | null; // float
  target_date?: string | null; // YYYY-MM-DD
  weekly_workouts: number; // integer
  daily_steps: number; // integer
}

// --- Response Interfaces ---
export interface ProfileResponse {
  success: true;
  data: User; // Используем расширенный тип User из API
}

export interface FitnessGoalResponse {
  success: true;
  data: {
    goal_type: 'weight_loss' | 'muscle_gain' | 'maintenance';
    target_weight?: number | null;
    target_date?: string | null;
    weekly_workouts: number;
    daily_steps: number;
  };
}

// GenderResponse - пока простой, можно расширить при необходимости
export interface GenderResponse {
    success: true;
    data: any; // Зависит от того, что реально возвращает API для /api/user/gender
}

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get<ProfileResponse>('/user/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    // API использует POST для обновления профиля
    const response = await api.post<ProfileResponse>('/user/profile', data);
    return response.data;
  }

  async getFitnessGoal(): Promise<FitnessGoalResponse> {
    const response = await api.get<FitnessGoalResponse>('/user/fitness-goal');
    return response.data;
  }

  async updateFitnessGoal(data: FitnessGoalRequest): Promise<FitnessGoalResponse> {
    const response = await api.post<FitnessGoalResponse>('/user/fitness-goal', data);
    return response.data;
  }

  async getGender(): Promise<GenderResponse> {
    const response = await api.get<GenderResponse>('/user/gender');
    // Этот эндпоинт не детализирован в документации по ответу, 
    // поэтому используем any и выводим в консоль для анализа
    console.log('UserService getGender response:', response.data);
    return response.data;
  }
} 