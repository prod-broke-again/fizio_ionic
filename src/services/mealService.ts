import api from '@/services/api/config';
import type { ApiResponse } from '@/services/api/types';

export interface Meal {
  id: number;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  completed: boolean;
  date: string;
}

export class MealService {
  private static instance: MealService;

  private constructor() {}

  public static getInstance(): MealService {
    if (!MealService.instance) {
      MealService.instance = new MealService();
    }
    return MealService.instance;
  }

  async toggleMeal(mealId: number): Promise<ApiResponse<Meal>> {
    try {
      const response = await api.post(`/meals/${mealId}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling meal:', error);
      throw error;
    }
  }

  async getMeals(date: string): Promise<ApiResponse<Meal[]>> {
    try {
      const response = await api.get(`/meals?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error getting meals:', error);
      throw error;
    }
  }
} 