import api from '@/services/api/config';

export interface WorkoutPlanResponse {
  data: WorkoutPlan[]
  message: string
}

export interface WorkoutPlan {
  id: string
  name: string
  type: string
  exercises: string
  duration: number
  difficulty: string
  date: string
  completed: boolean
  caloriesBurned: any
  imageUrl: string
}


export class WorkoutPlanService {
  private static instance: WorkoutPlanService;

  private constructor() {}

  public static getInstance(): WorkoutPlanService {
    if (!WorkoutPlanService.instance) {
      WorkoutPlanService.instance = new WorkoutPlanService();
    }
    return WorkoutPlanService.instance;
  }

  async getWorkoutPlan(): Promise<WorkoutPlanResponse> {
    try {
      const response = await api.get('workouts/plan');
      return {
        data: response.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error getting workout plan:', error);
      return {
        data: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async markWorkoutComplete(date: string, workoutId: string, data: { completed: boolean }) {
    try {
      const response = await api.put(`workouts-plan/${date}/workouts/${workoutId}`, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error marking workout complete:', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 