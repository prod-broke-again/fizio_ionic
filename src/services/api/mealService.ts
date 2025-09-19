import api from './config';
import type { Meal, MealWithTotals, MealItem, MealTotals, MealType } from '@/types/nutrition';

export const MealApi = {
  // Превью корзины (без записи)
  async preview(payload: { items: Array<any> }): Promise<{ items: any[]; totals: any }> {
    const { data } = await api.post('/meals/preview', payload);
    return data;
  },

  // Пакетное применение в план
  async apply(payload: any): Promise<{ results: any[]; totals_aggregated: any }> {
    const { data } = await api.post('/meals/apply', payload);
    return data;
  },
  async createMeal(payload: { name: string; type: MealType; date: string; time: string; completed?: boolean; }): Promise<{ message: string; meal: Meal; totals: MealTotals; }> {
    const { data } = await api.post('/meals', payload);
    return data;
  },

  async getMeal(mealId: string): Promise<MealWithTotals> {
    const { data } = await api.get(`/meals/${mealId}`);
    return data;
  },

  async updateMeal(mealId: string, payload: Partial<Pick<Meal, 'name' | 'completed' | 'time'>>): Promise<{ message: string; meal: Meal; }> {
    const { data } = await api.put(`/meals/${mealId}`, payload);
    return data;
  },

  async deleteMeal(mealId: string): Promise<{ message: string; }> {
    const { data } = await api.delete(`/meals/${mealId}`);
    return data;
  },

  async addMealItem(mealId: string, payload: Partial<MealItem> & ({ product_id: number } | { free_text: string })): Promise<{ message: string; meal_item: MealItem; meal_totals: MealTotals; }> {
    const { data } = await api.post(`/meals/${mealId}/items`, payload);
    return data;
  },

  async updateMealItem(mealId: string, itemId: number, payload: Partial<Pick<MealItem, 'grams' | 'servings' | 'calories' | 'proteins' | 'fats' | 'carbs'>>): Promise<{ message: string; meal_item: MealItem; meal_totals: MealTotals; }> {
    const { data } = await api.patch(`/meals/${mealId}/items/${itemId}`, payload);
    return data;
  },

  async deleteMealItem(mealId: string, itemId: number): Promise<{ message: string; meal_totals: MealTotals; }> {
    const { data } = await api.delete(`/meals/${mealId}/items/${itemId}`);
    return data;
  }
};


