export interface BodyMeasurements {
  date: string;
  weight: number;
  body_fat_percentage?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    calves?: number;
    shoulders?: number;
  };
  photos?: string[]; // URLs фотографий
}

export interface Goal {
  id: string;
  user_id: string;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility';
  target_value: number;
  current_value: number;
  start_date: string;
  target_date: string;
  completed: boolean;
  progress: {
    date: string;
    value: number;
    notes?: string;
  }[];
}

export interface Progress {
  id: string;
  user_id: string;
  start_date: string;
  current_date: string;
  goals: Goal[];
  measurements: BodyMeasurements[];
  nutrition_plan_id: string;
  workout_plan_id: string;
  achievements: {
    id: string;
    name: string;
    description: string;
    date_achieved: string;
    type: 'nutrition' | 'workout' | 'measurement' | 'goal';
  }[];
  statistics: {
    total_workouts: number;
    total_calories_burned: number;
    total_distance: number;
    total_weight_lifted: number;
    average_workout_duration: number;
    nutrition_compliance: number; // процент соблюдения плана питания
    workout_compliance: number; // процент соблюдения плана тренировок
  };
}

// Интерфейс для ProgressService.getDailyProgress, ожидаемый DashboardPage.vue
export interface ProgressStats {
  calories?: number | null;
  steps?: number | null;
  workout_time?: number | null; 
  water_intake?: number | null; 
  weight?: number | null;
  bodyFatPercentage?: number | null;
  measurements?: Record<string, number | null> | null;
  photos?: string[] | null;
  daily_progress?: number | null; // Это поле может вычисляться на клиенте или отсутствовать
} 