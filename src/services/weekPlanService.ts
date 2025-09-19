import api from '@/services/api/config';
import type { Meal, Workout, WeekPlan } from '@/types/weekPlan';

// Интерфейс для ответа API
interface ApiResponse<T> {
  data: WeekPlan[];
}

export class WeekPlanService {
  private static instance: WeekPlanService;

  private constructor() {}

  public static getInstance(): WeekPlanService {
    if (!WeekPlanService.instance) {
      WeekPlanService.instance = new WeekPlanService();
    }
    return WeekPlanService.instance;
  }

  async getWeekPlan(): Promise<ApiResponse<{
    data: WeekPlan[];
  }>> {
    try {
      const response = await api.get('week-plan');
      return {
        data: response.data
      };
    } catch (error) {
      console.error('Error getting week plan:', error);
      return {
        data: []
      };
    }
  }

  async markMealComplete(date: string, mealId: number, data: { completed: boolean }): Promise<ApiResponse<Meal>> {
    try {
      const response = await api.patch(`week-plan/${date}/meal/${mealId}/toggle-complete`, data);
      return {
        data: response.data
      };
    } catch (error) {
      console.error('Error marking meal complete:', error);
      return {
        data: []
      };
    }
  }
} 