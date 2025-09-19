import api from './api/config';
import type { Progress, Goal, BodyMeasurements, ProgressStats } from '@/types/progress';
import type { NutritionPlan } from '@/types/nutrition';
import type { WorkoutProgram } from '@/types/workout';
import type { ApiResponse } from '@/types/api';

// --- Request Interfaces ---
export interface GetProgressRequest {
  period?: 'week' | 'month' | 'all';
  endDate?: string; // YYYY-MM-DD
}

export interface GetProgressByDateRequest {
  date: string; // YYYY-MM-DD
}

export interface MeasurementsRequestData {
  date: string; // YYYY-MM-DD
  calories?: number | null;
  steps?: number | null;
  workoutTime?: number | null; // minutes
  waterIntake?: number | null; // liters
  weight?: number | null; // kg
  bodyFatPercentage?: number | null;
  measurements?: Record<string, number | null>; // e.g., { chest: 90, waist: 70 }
  photos?: string[] | null;
}

export interface AddGoalRequest {
  name: string;
  type: string; // e.g., 'weight', 'body_fat', 'run_distance'
  targetValue: number;
  currentValue?: number | null;
  startValue?: number | null;
  unit: string; // e.g., 'kg', '%', 'km'
  targetDate?: string | null; // YYYY-MM-DD
  status?: 'active' | 'completed' | 'abandoned';
}

export interface UpdateGoalProgressRequest {
  currentValue: number;
  date?: string; // YYYY-MM-DD
  noteText?: string | null;
}

// --- Response Interfaces ---
interface BaseProgressEntry {
  id: string;
  userId: string;
  date: string;
  calories?: number | null;
  steps?: number | null;
  workoutTime?: number | null;
  waterIntake?: number | null;
  weight?: number | null;
  bodyFatPercentage?: number | null;
  measurements?: Record<string, number | null> | null;
  photos?: string[] | null;
}

export interface GetProgressResponse {
  success: true;
  data: BaseProgressEntry[];
  message?: string; // Сообщение, если данные не найдены
}

export interface GetProgressByDateResponse {
  success: true;
  data: BaseProgressEntry;
}

export interface MeasurementsResponse {
  success: true;
  data: BaseProgressEntry;
  message?: string;
}

interface GoalNote {
  date: string;
  value: number;
  note: string;
}

export interface GoalData {
  id: string;
  user_id: string;
  name: string;
  type: string;
  target_value: number;
  current_value: number | null;
  start_value: number | null;
  unit: string;
  target_date: string | null;
  status: 'active' | 'completed' | 'abandoned';
  notes: GoalNote[] | null;
  created_at: string;
  updated_at: string;
}

export interface AddGoalResponse {
  success: true;
  data: GoalData;
  message?: string;
}

export interface UpdateGoalProgressResponse {
  success: true;
  data: GoalData;
  message?: string;
}

export interface StatisticsResponse {
    success: true;
    message?: string; // "Endpoint статистики находится в разработке."
    data: any[]; // или Record<string, any> в зависимости от будущего ответа
}

export interface AchievementsResponse {
    success: true;
    message?: string; // "Endpoint достижений находится в разработке."
    data: any[];
}

// --- Interface for HealthKit Sync ---
export interface HealthKitSyncRequest {
  steps: number;
  calories: number;
  distance: number; // km
  duration: number; // activity minutes
  timestamp: string; // ISO datetime string
}

export interface HealthKitSyncResponseData {
  daily_progress?: number | null;
  calories?: number | null;
  steps?: number | null;
  workout_time?: number | null; // minutes
  water_intake?: number | null;
  // Могут быть и другие поля, если API их возвращает, например, обновленный вес, bodyFatPercentage и т.д.
  // Эти поля совпадают с ProgressStats, поэтому можно переиспользовать ProgressStats
}

export class ProgressService {
  private static instance: ProgressService;

  private constructor() {}

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  async getProgress(params?: GetProgressRequest): Promise<ApiResponse<BaseProgressEntry[]>> {
    const response = await api.get<ApiResponse<BaseProgressEntry[]>>('/progress', { params });
    return response.data;
  }

  async getProgressByDate(params: GetProgressByDateRequest): Promise<ApiResponse<BaseProgressEntry | null>> {
    try {
      // Ожидаем, что API для /progress/by-date возвращает объект { data: <payload> }
      // где <payload> это BaseProgressEntry или null.
      const axiosResponse = await api.get<{ data: BaseProgressEntry | null }>('/progress/by-date', { params });

      // Если HTTP-запрос успешен (например, статус 200), то axios не выбросит ошибку.
      // Полезная нагрузка (BaseProgressEntry или null) находится в axiosResponse.data.data.
      return {
        success: true, // Считаем успешным, так как HTTP-запрос прошел
        data: axiosResponse.data.data, // Извлекаем вложенные данные
        message: (axiosResponse.data as any).message // Попытка извлечь сообщение, если оно есть на том же уровне, что и data в ответе сервера
      };
    } catch (error: any) {
      console.error(`Error in ProgressService.getProgressByDate for date ${params.date}:`, error);
      let errorMessage = 'Ошибка при запросе прогресса по дате.';
      if (error.response && error.response.data) {
        // Если сервер вернул ошибку в формате { success: false, message: "...", data: null }
        if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          // Иногда тело ответа может быть просто строкой ошибки
          errorMessage = error.response.data;
        } else if (error.response.data.error && typeof error.response.data.error.message === 'string') {
          // Обработка формата { error: { code: ..., message: ... }}
           errorMessage = error.response.data.error.message;
        }
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    }
  }

  // POST /api/progress/measurements
  async addOrUpdateMeasurements(data: MeasurementsRequestData): Promise<ApiResponse<BaseProgressEntry | null>> {
    const response = await api.post<ApiResponse<BaseProgressEntry | null>>('/progress/measurements', data);
    return response.data;
  }

  // PATCH /api/progress/update - также использует addOrUpdateMeasurements, т.к. API их объединяет
  async updateDailyProgress(data: MeasurementsRequestData): Promise<ApiResponse<BaseProgressEntry | null>> {
    const response = await api.patch<ApiResponse<BaseProgressEntry | null>>('/progress/update', data);
    return response.data;
  }
  
  async addGoal(data: AddGoalRequest): Promise<ApiResponse<GoalData>> {
    const response = await api.post<ApiResponse<GoalData>>('/progress/goals', data);
    return response.data;
  }

  async updateGoalProgress(goalId: string, data: UpdateGoalProgressRequest): Promise<ApiResponse<GoalData>> {
    const response = await api.post<ApiResponse<GoalData>>(`/progress/goals/${goalId}/progress`, data);
    return response.data;
  }

  async getStatistics(): Promise<ApiResponse<any[]>> {
    const response = await api.get<ApiResponse<any[]>>('/progress/statistics');
    console.log('ProgressService getStatistics response (в разработке):', response.data);
    return response.data;
  }

  async getAchievements(): Promise<ApiResponse<any[]>> {
    const response = await api.get<ApiResponse<any[]>>('/progress/achievements');
    console.log('ProgressService getAchievements response (в разработке):', response.data);
    return response.data;
  }

  // Метод, который будет использоваться в DashboardPage.vue
  async getDailyProgress(): Promise<ApiResponse<ProgressStats | null>> {
    const today = new Date().toISOString().split('T')[0]; // Формат YYYY-MM-DD
    try {
      const apiResult = await this.getProgressByDate({ date: today });

      if (apiResult.success) {
        if (apiResult.data) {
          // Трансформация данных из BaseProgressEntry в ProgressStats
          const transformedData: ProgressStats = {
            calories: apiResult.data.calories,
            steps: apiResult.data.steps,
            workout_time: apiResult.data.workoutTime,
            water_intake: apiResult.data.waterIntake,
            weight: apiResult.data.weight,
            bodyFatPercentage: apiResult.data.bodyFatPercentage,
            measurements: apiResult.data.measurements,
            photos: apiResult.data.photos,
          };
          return { success: true, data: transformedData };
        } else {
          // API вернул success: true, но data: null (нет данных за день)
          return { success: true, data: null, message: apiResult.message }; 
        }
      } else {
        // API вернул success: false
        return { 
          success: false, 
          data: null,
          message: apiResult.message || "Не удалось получить дневной прогресс." 
        };
      }
    } catch (error: any) {
      console.error('Error in ProgressService.getDailyProgress:', error);
      let errorMessage = 'Ошибка при запросе дневного прогресса.';
      if (error.response && error.response.data && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.response && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
      else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }
      return { success: false, data: null, message: errorMessage };
    }
  }

  async syncHealthKitProgress(data: HealthKitSyncRequest): Promise<ApiResponse<ProgressStats | null>> {
    const response = await api.post<ApiResponse<ProgressStats | null>>('/healthkit/sync', data);
    return response.data;
  }
} 