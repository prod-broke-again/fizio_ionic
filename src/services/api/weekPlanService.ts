import api from './config';

export interface WeekPlanDayType {
  date: string;
  dayName: string;
  meals: WeekPlanMealType[];
}

export interface WeekPlanMealType {
  id: string; // UUID в новой системе
  name: string;
  mealType: string;
  time?: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  completed: boolean;
}

export class WeekPlanService {
  private baseUrl = '';

  /**
   * Получить план на неделю
   */
  async getWeekPlan(startDate?: Date): Promise<WeekPlanDayType[]> {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await api.get(`${this.baseUrl}/week-plan`, {
        headers: { 'x-timezone': timezone }
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка получения недельного плана: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения недельного плана:', error);
      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  }

  /**
   * Получить план на конкретный день
   */
  async getDayPlan(date: string): Promise<WeekPlanDayType> {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await api.get(`${this.baseUrl}/week-plan/${date}`, { headers: { 'x-timezone': timezone } });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка получения плана дня: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения плана дня:', error);
      throw error;
    }
  }

  /**
   * Добавить приём пищи
   */
  async addMeal(date: string, meal: Omit<WeekPlanMealType, 'id' | 'completed'>): Promise<WeekPlanMealType> {
    try {
      const response = await api.post(`${this.baseUrl}/week-plan/${date}/meals`, meal);
      
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
   * Обновить приём пищи
   */
  async updateMeal(date: string, meal: WeekPlanMealType): Promise<WeekPlanMealType> {
    try {
      const response = await api.put(`${this.baseUrl}/week-plan/${date}/meals/${meal.id}`, meal);
      
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
   * Удалить приём пищи
   */
  async deleteMeal(date: string, id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/week-plan/${date}/meal/${id}`);
    } catch (error) {
      console.error('Ошибка удаления приема пищи:', error);
      throw error;
    }
  }
} 