declare module '@/stores/auth' {
  export interface AuthState {
    user: any;
    token: string | null;
    isAuthenticated: boolean;
  }

  export function useAuthStore(): {
    user: any;
    token: string | null;
    isAuthenticated: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    loadProfile: () => Promise<void>;
  };
}

declare module '@/stores/workout' {
  export interface WorkoutState {
    workouts: any[];
    currentWorkout: any;
    loading: boolean;
    error: string | null;
  }

  export function useWorkoutStore(): {
    workouts: any[];
    currentWorkout: any;
    loading: boolean;
    error: string | null;
    loadWorkouts: () => Promise<void>;
    loadWorkout: (id: string) => Promise<void>;
  };
}

declare module '@/stores/nutrition' {
  export interface NutritionState {
    meals: any[];
    currentMeal: any;
    loading: boolean;
    error: string | null;
  }

  export function useNutritionStore(): {
    meals: any[];
    currentMeal: any;
    loading: boolean;
    error: string | null;
    loadMeals: () => Promise<void>;
    loadMeal: (id: string) => Promise<void>;
  };
}

declare module '@/stores/health' {
  export interface HealthState {
    steps: number;
    calories: number;
    distance: number;
    loading: boolean;
    error: string | null;
  }

  export function useHealthStore(): {
    steps: number;
    calories: number;
    distance: number;
    loading: boolean;
    error: string | null;
    loadHealthData: () => Promise<void>;
  };
}

declare module '@/stores/user' {
  import { User, ApiResponse } from '@/services/api/types';

  export interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }

  export function useUserStore(): {
    user: User | null;
    loading: boolean;
    error: string | null;
    loadProfile: () => Promise<ApiResponse<User>>;
    updateProfile: (data: Partial<User>) => Promise<ApiResponse<User>>;
  };
}

declare module '@/stores/workoutPlan' {
  export interface WorkoutPlanState {
    workoutPlan: any;
    loading: boolean;
    error: string | null;
  }

  export function useWorkoutPlanStore(): {
    workoutPlan: any;
    loading: boolean;
    error: string | null;
    loadWorkoutPlan: () => Promise<void>;
  };
}

declare module '@/stores/weekPlan' {
  import type { WeekPlan } from '@/types/weekPlan';

  export interface WeekPlanState {
    weekPlan: WeekPlan | null;
    loading: boolean;
    error: string | null;
  }

  export function useWeekPlanStore(): {
    weekPlan: WeekPlan | null;
    loading: boolean;
    error: string | null;
    loadWeekPlan: () => Promise<void>;
    markAsCompleted: (date: Date, type: 'meal' | 'workout', id: number) => Promise<boolean>;
  };
}

declare module 'vue-toastification' {
  export function useToast(): {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
} 