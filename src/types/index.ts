export interface Meal {
  id: number;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  completed: boolean;
  time?: string;
}

export interface Workout {
  id: number;
  name: string;
  duration: number;
  calories: number;
  completed: boolean;
  type?: string;
}

export interface DaySchedule {
  date: string;
  meals: Meal[];
  workouts: Workout[];
  progress: number;
}

export interface HealthData {
  steps: number;
  calories: number;
  distance: number;
  workout_time: number;
  water_intake: number;
  daily_progress: number;
}

export interface ProgressStats {
  daily_progress: number;
  calories: number;
  steps: number;
  workout_time: number;
  water_intake: number;
}

export interface WorkoutSchedule {
  id: number;
  title: string;
  description: string;
  date: string;
  duration: number;
  calories: number;
  image_url: string;
} 