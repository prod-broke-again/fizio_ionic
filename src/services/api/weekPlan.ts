// @ts-nocheck
import api from './config';
import type { WeekPlan, DayPlan, Meal, Workout } from '@/types/weekPlan';

export const weekPlanApi = {
  // Получить план на неделю
  async getWeekPlan(): Promise<WeekPlan[]> {
    const response = await api.get('/week-plan');
    return response.data;
  },

  // Получить план на конкретный день
  async getDayPlan(date: string): Promise<DayPlan> {
    const response = await api.get(`/week-plan/${date}`);
    return response.data;
  },

  // Добавить приём пищи
  async addMeal(date: string, meal: Omit<Meal, 'id' | 'completed'>): Promise<Meal> {
    const response = await api.post(`/week-plan/${date}/meals`, meal);
    return response.data;
  },

  // Добавить тренировку
  async addWorkout(date: string, workout: Omit<Workout, 'id' | 'completed'>): Promise<Workout> {
    const response = await api.post(`/week-plan/${date}/workouts`, workout);
    return response.data;
  },

  // Обновить приём пищи
  async updateMeal(date: string, meal: Meal): Promise<Meal> {
    const response = await api.put(`/week-plan/${date}/meals/${meal.id}`, meal);
    return response.data;
  },

  // Обновить тренировку
  async updateWorkout(date: string, workout: Workout): Promise<Workout> {
    const response = await api.put(`/week-plan/${date}/workouts/${workout.id}`, workout);
    return response.data;
  },

  // Новый метод для переключения статуса выполнения
  async toggleCompleted(date: string, type: 'meal' | 'workout', itemId: number | string): Promise<void> {
    await api.patch(`/week-plan/${date}/${type}/${itemId}/toggle-complete`);
  },

  // Удалить приём пищи
  async deleteMeal(date: string, id: number): Promise<void> {
    await api.delete(`/week-plan/${date}/meals/${id}`);
  },

  // Удалить тренировку
  async deleteWorkout(date: string, id: number): Promise<void> {
    await api.delete(`/week-plan/${date}/workouts/${id}`);
  }
}; 