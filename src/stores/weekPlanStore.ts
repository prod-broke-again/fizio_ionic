// @ts-nocheck
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { format, startOfWeek, addDays } from 'date-fns';
import { weekPlanApi } from '@/services/api';
import type { WeekPlan, Meal, Workout } from '@/types/weekPlan';

export const useWeekPlanStore = defineStore('weekPlan', () => {
  const weekPlan = ref<WeekPlan[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedDate = ref<string>(format(new Date(), 'yyyy-MM-dd'));

  // Геттеры
  const getMealsForDate = computed(() => (date: string) => {
    const dayPlan = weekPlan.value.find(day => day.date === date);
    return dayPlan?.meals || [];
  });

  const getWorkoutsForDate = computed(() => (date: string) => {
    const dayPlan = weekPlan.value.find(day => day.date === date);
    return dayPlan?.workouts || [];
  });

  const getProgressForDate = computed(() => (date: string) => {
    const dayPlan = weekPlan.value.find(day => day.date === date);
    if (!dayPlan) {
      return 0;
    }

    const totalItems = (dayPlan.meals?.length || 0) + (dayPlan.workouts?.length || 0);
    const completedItems =
      (dayPlan.meals?.filter(meal => meal.completed).length || 0) +
      (dayPlan.workouts?.filter(workout => workout.completed).length || 0);

    if (totalItems === 0) return 0;

    return Math.round((completedItems / totalItems) * 100);
  });

  // Действия
  const loadWeekPlan = async () => {
    loading.value = true;
    error.value = null;
    try {
      const apiData = await weekPlanApi.getWeekPlan() as WeekPlan[];
      weekPlan.value = apiData.map(day => ({
        ...day,
        date: day.date.split('T')[0],
        meals: day.meals || [],
        workouts: day.workouts || []
      }));
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Произошла ошибка при загрузке плана';
    } finally {
      loading.value = false;
    }
  };

  const setSelectedDate = (date: string) => {
    selectedDate.value = date;
  };

  const markAsCompleted = async (date: string, type: 'meal' | 'workout', id: number) => {
    try {
      const dayPlan = weekPlan.value.find(day => day.date === date);
      if (!dayPlan) {
        console.warn(`markAsCompleted: Day plan not found for date ${date}`);
        return;
      }

      if (type === 'meal') {
        const meal = dayPlan.meals.find(m => m.id === id);
        if (meal) {
          console.log(`markAsCompleted: Attempting to toggle meal ${id} for date ${date}. Current status: ${meal.completed}.`);
          await weekPlanApi.toggleCompleted(date, type, meal.id);
        } else {
           console.warn(`markAsCompleted: Meal with ID ${id} not found for date ${date}`);
        }
      } else { // type === 'workout'
        const workout = dayPlan.workouts.find(w => w.id === id);
        if (workout) {
          console.log(`markAsCompleted: Attempting to toggle workout plan entry ${id} for date ${date}. Using workout_id: ${workout.workout_id}. Current status: ${workout.completed}.`);
          await weekPlanApi.toggleCompleted(date, type, workout.workout_id);
        } else {
           console.warn(`markAsCompleted: Workout plan entry with ID ${id} not found for date ${date}`);
        }
      }
      // Перезагружаем данные плана после успешного обновления
      await loadWeekPlan();
    } catch (e) {
      console.error('markAsCompleted: Error updating status:', e);
      error.value = e instanceof Error ? e.message : 'Произошла ошибка при обновлении статуса';
    }
  };

  return {
    weekPlan,
    loading,
    error,
    selectedDate,
    getMealsForDate,
    getWorkoutsForDate,
    getProgressForDate,
    loadWeekPlan,
    setSelectedDate,
    markAsCompleted
  };
}); 