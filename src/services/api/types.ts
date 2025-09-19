// Типы данных для API

// Аутентификация
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  gender?: 'male' | 'female';
  device_token?: string;
}

export interface LoginData {
  email: string;
  password: string;
  device_token?: string;
}

// Пользователь
export interface User {
  id: number;
  name: string;
  email: string;
  gender?: 'male' | 'female';
  fitness_goal?: string;
  activity_level?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Цели фитнеса
export interface FitnessGoal {
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance';
}

// Обновление профиля
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  gender?: 'male' | 'female';
  avatar?: File;
}

// Telegram авторизация
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  start_param?: string;
  init_data?: string;
}

// Прогресс и статистика
export interface ProgressStats {
  calories: number;
  steps: number;
  workout_time: number;
  water_intake: number;
  daily_progress: number;
}

// Расписание тренировок
export interface WorkoutSchedule {
  id: number;
  user_id: number | null;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  date: string | null;
  duration: number;
  calories: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  isFavorite: boolean;
  exercises?: Exercise[];
}

// Интерфейс для отдельного упражнения
export interface Exercise {
  id: number;
  workout_id: number;
  name: string;
  description: string;
  duration: number | null;
  sets: number | null;
  repetitions: number | null;
  rest_time: number | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

// Общие типы для ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export type NotificationType = 'workout' | 'water' | 'achievement' | 'system' | 'profile' | 'health' | 'reminder';

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  action?: string;
  action_url?: string;
}

export interface GenderResponse {
  gender: 'male' | 'female';
} 