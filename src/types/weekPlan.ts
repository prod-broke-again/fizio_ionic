import type { WorkoutData } from './workout';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WorkoutType = 'cardio' | 'strength' | 'flexibility';

export interface WeekPlan {
  id: number;
  user_id: number;
  date: string;
  meals: Meal[];
  workouts: Workout[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: number;
  workout_id: string;
  completed: boolean;
  name: string;
  type: WorkoutType;
  exercises: string;
  duration: number;
  difficulty: string;
  image_url: string;
  calories_burned: number;
  category?: string;
  isFavorite?: boolean;
}

export interface Meal {
  id: string;
  fats: number;
  name: string;
  type: MealType;
  carbs: number;
  calories: number;
  proteins: number;
  completed: boolean;
}




