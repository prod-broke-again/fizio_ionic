import api from './config';

export interface MealData {
  id: string; // UUID
  name: string;
  mealType: string;
  time?: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  completed: boolean;
}

export interface AddMealPayload {
  name: string;
  mealType: string;
  time?: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export class NutritionService {
  private baseUrl = '';

  /**
   * Добавить прием пищи
   */
  async addMeal(date: string, mealData: AddMealPayload): Promise<MealData> {
    try {
      const response = await api.post(`${this.baseUrl}/week-plan/${date}/meals`, mealData);
      
      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        throw new Error(`Ошибка добавления приема пищи: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка добавления приема пищи:', error);
      throw error;
    }
  }

  /**
   * Удалить прием пищи
   */
  async removeMeal(date: string, mealId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/week-plan/${date}/meal/${mealId}`);
    } catch (error) {
      console.error('Ошибка удаления приема пищи:', error);
      throw error;
    }
  }

  /**
   * Переключить статус выполнения приема пищи
   */
  async toggleMeal(date: string, mealId: string): Promise<void> {
    try {
      await api.patch(`${this.baseUrl}/week-plan/${date}/meal/${mealId}/toggle-complete`);
    } catch (error) {
      console.error('Ошибка переключения статуса приема пищи:', error);
      throw error;
    }
  }

  /**
   * Обновить прием пищи
   */
  async updateMeal(date: string, mealId: string, mealData: Partial<MealData>): Promise<MealData> {
    try {
      const response = await api.put(`${this.baseUrl}/week-plan/${date}/meal/${mealId}`, mealData);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка обновления приема пищи: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка обновления приема пищи:', error);
      throw error;
    }
  }

  /**
   * Получить приемы пищи на день
   */
  async getDayMeals(date: string): Promise<MealData[]> {
    try {
      const response = await api.get(`${this.baseUrl}/week-plan/${date}/meals`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка получения приемов пищи: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения приемов пищи:', error);
      throw error;
    }
  }
} 