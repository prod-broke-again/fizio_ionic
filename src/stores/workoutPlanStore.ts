import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { WorkoutService } from '@/services/workoutService';
import type { WorkoutData } from '@/services/workoutService';

interface DayPlan {
  date: string;
  workouts: WorkoutData[];
  progress: number;
  completed: boolean;
}

export const useWorkoutPlanStore = defineStore('workoutPlan', () => {
  const workoutService = WorkoutService.getInstance();
  const weekDays = ref<DayPlan[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Вычисляемое свойство для получения прогресса по дате
  const getProgressByDate = computed(() => {
    return (date: string) => {
      const day = weekDays.value.find(d => d.date === date);
      return day?.progress || 0;
    };
  });

  // Загрузка плана тренировок
  const loadWorkoutPlan = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await workoutService.getWorkoutPlan();
      if (response.success && response.data) {
        // Группируем тренировки по датам
        const workoutsByDate = new Map<string, WorkoutData[]>();
        response.data.forEach(workout => {
          if (!workout.date) return;
          const workouts = workoutsByDate.get(workout.date) || [];
          workouts.push(workout);
          workoutsByDate.set(workout.date, workouts);
        });

        // Обновляем weekDays
        weekDays.value = Array.from(workoutsByDate.entries()).map(([date, workouts]) => ({
          date,
          workouts,
          progress: calculateProgress(workouts),
          completed: workouts.every(w => w.completed)
        }));
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки плана тренировок';
      console.error('Ошибка загрузки плана тренировок:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Добавление тренировки в план
  const addWorkoutToPlan = async (date: string, workoutId: string) => {
    try {
      const response = await workoutService.addWorkoutToDayPlan(date, { workout_id: workoutId });
      if (response.success) {
        await loadWorkoutPlan(); // Перезагружаем весь план
      }
      return response;
    } catch (err: any) {
      error.value = err.message || 'Ошибка добавления тренировки в план';
      throw err;
    }
  };

  // Удаление тренировки из плана
  const removeWorkoutFromPlan = async (date: string, workoutId: string) => {
    try {
      const response = await workoutService.removeWorkoutFromDayPlan(date, workoutId);
      if (response.success) {
        await loadWorkoutPlan(); // Перезагружаем весь план
      }
      return response;
    } catch (err: any) {
      error.value = err.message || 'Ошибка удаления тренировки из плана';
      throw err;
    }
  };

  // Отметка тренировки как выполненной/невыполненной
  const toggleWorkoutCompletion = async (date: string, workoutId: string, completed: boolean) => {
    try {
      const response = await workoutService.markWorkoutInPlanAsComplete(date, workoutId, completed);
      if (response.success) {
        await loadWorkoutPlan(); // Перезагружаем весь план
      }
      return response;
    } catch (err: any) {
      error.value = err.message || 'Ошибка обновления статуса тренировки';
      throw err;
    }
  };

  // Вспомогательная функция для расчета прогресса
  const calculateProgress = (workouts: WorkoutData[]): number => {
    if (!workouts.length) return 0;
    const completedCount = workouts.filter(w => w.completed).length;
    return Math.round((completedCount / workouts.length) * 100);
  };

  return {
    weekDays,
    isLoading,
    error,
    getProgressByDate,
    loadWorkoutPlan,
    addWorkoutToPlan,
    removeWorkoutFromPlan,
    toggleWorkoutCompletion
  };
}); 