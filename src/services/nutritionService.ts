import api from './api/config';
import type { User } from '@/types/user'; // Может понадобиться для userId в других методах

// --- Request/Response Data Structures (можно вынести в src/types/nutrition.ts) ---

export interface MealItemData {
  foodId: string; // ID из FatSecret, OpenFoodFacts или внутренний ID
  name: string;
  quantity: number; // float
  unit: string; // г, мл, порция, шт
  calories: number;
  proteins?: number | null;
  fats?: number | null;
  carbs?: number | null;
  serving_id?: string; // Если применимо, ID конкретной порции из API еды
}

export type MealTypeApi = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealData {
  id: string; // uuid, присутствует в ответах
  userId?: string; // Присутствует в ответах
  name: string; // "Завтрак", "Омлет с овощами"
  type: MealTypeApi;
  date: string; // YYYY-MM-DD
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  foodId?: string | null; // Опциональный ID продукта
  items?: MealItemData[]; // Массив составляющих блюда, опционален при создании, если есть foodId или общие КБЖУ
  completed: boolean;
}

export interface GetDailyNutritionRequest {
  date: string; // YYYY-MM-DD
}

// --- Response Interfaces ---
export interface NutritionPlanResponse {
  success: true;
  data: WeekDayApi[];
  message?: string;
}

export interface DailyNutritionData {
  date: string;
  meals: MealData[];
  summary: {
    totalCalories: number;
    totalProteins: number;
    totalFats: number;
    totalCarbs: number;
  };
}

export interface DailyNutritionResponse {
  success: true;
  data: DailyNutritionData;
  message?: string;
}

export interface SingleMealResponse {
  success: true;
  data: MealData;
  message?: string;
}

export interface MealOperationResponse {
  success: true;
  message: string;
  data?: MealData; // Может возвращаться при обновлении/отметке о выполнении
}

export interface MarkMealCompleteRequest {
  completed: boolean;
}

export interface MealItem {
  id?: string; // Optional local ID if needed for frontend list management
  food_id: string; // ID продукта из базы данных (FatSecret, OpenFoodFacts и т.д.)
  name: string; // Название продукта/ингредиента
  quantity: number; // Количество
  unit: string; // Единица измерения (например, "g", "ml", "piece")
  calories: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  serving_id?: string; // Если применимо, ID конкретной порции из API еды
}

export interface Meal {
  id: string; // uuid
  name:string;
  type: MealTypeApi;
  date: string; // YYYY-MM-DD
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  completed: boolean;
  foodId?: string | null; // Опциональный ID продукта, как указано в API доке
  items?: MealItem[]; // Массив составляющих блюда, опционален при создании, если есть foodId или общие КБЖУ
}

// Новый интерфейс для добавления приема пищи, соответствующий примеру пользователя
export interface AddMealPayload {
  name: string;
  type: MealTypeApi;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  foodId?: string | null;
}

// Интерфейс для markMealComplete, date и type будут передаваться в URL
export interface MarkMealCompletePayload {
  completed: boolean;
}

export interface WeekDayApi {
  id: number | string;
  user_id: number | string;
  date: string;
  meals: MealData[];
  workouts: any[]; // Assuming workouts are part of the week plan API response
  progress: number; // Assuming progress is part of the week plan API response
  created_at: string;
  updated_at: string;
}

export class NutritionService {
  private static instance: NutritionService;

  private constructor() {}

  public static getInstance(): NutritionService {
    if (!NutritionService.instance) {
      NutritionService.instance = new NutritionService();
    }
    return NutritionService.instance;
  }

  // Новый эндпоинт: GET /week-plan
  async getNutritionPlan(): Promise<NutritionPlanResponse> {
    const response = await api.get<NutritionPlanResponse>('/week-plan');
    return response.data;
  }

  // Новый эндпоинт: GET /week-plan/{date}
  async getDailyNutrition(params: GetDailyNutritionRequest): Promise<DailyNutritionResponse> {
    const response = await api.get<DailyNutritionResponse>(`/week-plan/${params.date}`);
    return response.data;
  }

  /**
   * Добавляет новый прием пищи.
   * Новый эндпоинт: POST /week-plan/{date}/meal
   * @param date - Дата приема пищи (YYYY-MM-DD), будет частью URL.
   * @param mealData - Данные нового приема пищи (без date).
   */
  async addMeal(date: string, mealData: AddMealPayload): Promise<SingleMealResponse> {
    const response = await api.post<SingleMealResponse>(`/week-plan/${date}/meal`, mealData);
    return response.data;
  }

  /**
   * Удаляет прием пищи.
   * Новый эндпоинт: DELETE /week-plan/{date}/meal/{mealId}
   * @param date - Дата приема пищи.
   * @param mealId - ID приема пищи.
   */
  async removeMeal(date: string, mealId: string): Promise<MealOperationResponse> {
    const response = await api.delete<MealOperationResponse>(`/week-plan/${date}/meal/${mealId}`);
    return response.data;
  }

  /**
   * Отмечает прием пищи как выполненный/невыполненный.
   * Новый эндпоинт: PATCH /week-plan/{date}/{type}/{id}/toggle-complete
   * @param date - Дата приема пищи.
   * @param mealId - ID приема пищи.
   * @param payload - Содержит поле 'completed'.
   */
  async markMealComplete(date: string, mealId: string, payload: MarkMealCompletePayload): Promise<SingleMealResponse> {
    const response = await api.patch<SingleMealResponse>(`/week-plan/${date}/meal/${mealId}/toggle-complete`, { completed: payload.completed });
    return response.data;
  }
} 