export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface MealItem {
  id: number;
  meal_id: string;
  product_id?: number | null;
  free_text?: string | null;
  grams?: number | null;
  servings?: number | null;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  created_at: string;
  updated_at: string;
  product_name?: string;
  weight?: number | null;
  portions?: number | null;
  is_free_text?: boolean;
  is_from_database?: boolean;
}

export interface MealTotals {
  calories: number; proteins: number; fats: number; carbs: number; items_count: number;
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  date: string;
  time: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  items?: MealItem[];
}

export interface MealWithTotals { meal: Meal; totals: MealTotals; }

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  total_calories: number;
  total_proteins: number;
  total_fats: number;
  total_carbs: number;
  goal_calories: number;
  goal_proteins: number;
  goal_fats: number;
  goal_carbs: number;
}

export interface NutritionPlan {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  daily_plans: DailyNutrition[];
  goal_type: 'weight_loss' | 'muscle_gain' | 'maintenance';
  target_weight?: number;
  current_weight: number;
  weekly_progress: {
    date: string;
    weight: number;
    measurements: {
      chest?: number;
      waist?: number;
      hips?: number;
      arms?: number;
      thighs?: number;
    };
  }[];
} 