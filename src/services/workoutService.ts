import api from './api/config';

// --- Request/Response Data Structures (можно вынести в src/types/workout.ts, если не созданы ранее) ---

export interface WorkoutSetData {
  weight?: number | null;
  reps?: number | null;
  duration?: number | null; // в секундах для кардио/HIIT сетов, или для времени под нагрузкой
  distance?: number | null; // в метрах/км для кардио
  // Можно добавить другие поля, если API их поддерживает, например, RPE, notes по сету и т.д.
}

export interface WorkoutExerciseData {
  exerciseId: string; // ID упражнения из справочника
  sets: WorkoutSetData[];
  order: number;        // Порядковый номер в тренировке
  restTime: number;     // Время отдыха после этого упражнения в секундах
}

export interface WorkoutData {
  id?: string; // Присутствует в ответах, отсутствует или опционально в запросах на создание
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'flexibility';
  exercises: WorkoutExerciseData[];
  duration: number; // Общая длительность в минутах
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  date: string; // YYYY-MM-DD
  completed?: boolean;
  calories_burned?: number | null;
  userId?: string; // Присутствует в ответах
  image_url?: string;
  category?: string;
}

export interface GetWorkoutsRequest {
  page?: number;
  perPage?: number;
  type?: 'strength' | 'cardio' | 'hiit' | 'flexibility';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
}

// --- Response Interfaces ---
export interface WorkoutPlanResponse {
  success: boolean;
  data: WorkoutData[];
  message?: string;
}

export interface PaginatedWorkoutsResponse {
  success: boolean;
  message?: string;
  current_page: number;
  data: WorkoutData[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface SingleWorkoutResponse {
  success: boolean;
  data: WorkoutData | null;
  message?: string;
}

export interface WorkoutOperationResponse {
  success: boolean;
  message: string;
  data?: WorkoutData; // Может возвращаться при создании/обновлении/отметке о выполнении
}

export interface MarkWorkoutCompleteRequest {
  completed: boolean;
  caloriesBurned?: number | null;
}

// Новый интерфейс для запроса на добавление тренировки в план дня
export interface AddWorkoutToDayPlanRequest {
  workout_id: string; // ID тренировки из каталога
}

// --- Raw API Response Interfaces (для адаптации строкового поля exercises) ---
interface RawWorkoutExerciseData extends Omit<WorkoutExerciseData, 'sets'> {
  sets: WorkoutSetData[]; // На самом деле, это уже часть WorkoutExerciseData, но в строке оно будет именно таким
}

interface RawWorkoutData extends Omit<WorkoutData, 'exercises'> {
  exercises: string; // Вот здесь отличие от WorkoutData
}

interface RawPaginatedWorkoutsResponse extends Omit<PaginatedWorkoutsResponse, 'data'> {
  data: RawWorkoutData[];
}

interface RawSingleWorkoutResponse extends Omit<SingleWorkoutResponse, 'data'> {
  data: RawWorkoutData;
}

interface RawWorkoutPlanResponse extends Omit<WorkoutPlanResponse, 'data'> {
    data: RawWorkoutData[];
}

// Вспомогательная функция для парсинга
function parseExercises(rawExercises: string): WorkoutExerciseData[] {
  try {
    const parsed = JSON.parse(rawExercises);
    // Дополнительная валидация структуры parsed, если необходимо
    if (Array.isArray(parsed)) {
        return parsed.map(ex => ({
            ...ex,
            sets: Array.isArray(ex.sets) ? ex.sets : [] // Убедимся, что sets это массив
        }));
    }
    return [];
  } catch (e) {
    console.error('Failed to parse exercises string:', rawExercises, e);
    return []; // Возвращаем пустой массив в случае ошибки парсинга
  }
}

function mapRawWorkoutToWorkout(raw: RawWorkoutData): WorkoutData {
  return {
    ...raw,
    exercises: parseExercises(raw.exercises),
  };
}

export class WorkoutService {
  private static instance: WorkoutService;

  private constructor() {}

  public static getInstance(): WorkoutService {
    if (!WorkoutService.instance) {
      WorkoutService.instance = new WorkoutService();
    }
    return WorkoutService.instance;
  }

  async getWorkoutPlan(): Promise<WorkoutPlanResponse> {
    try {
      const response = await api.get<RawWorkoutPlanResponse>('/workouts/plan');
      
      // Проверяем, что response.data существует и response.data.data является массивом
      if (response.data && Array.isArray(response.data.data)) {
        return {
          success: true, // Явно устанавливаем success
          message: response.data.message, // Берем сообщение из ответа API
          data: response.data.data.map(mapRawWorkoutToWorkout),
        };
      } else {
        // Если структура ответа неожиданная
        console.warn('Workout plan API response received with unexpected structure:', response.data);
        return {
          success: false,
          message: response.data?.message || "Не удалось получить план тренировок: непредвиденный формат ответа.",
          data: [],
        };
      }
    } catch (error: any) {
      console.error('Error in WorkoutService.getWorkoutPlan:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Ошибка при загрузке плана тренировок.",
        data: [],
      };
    }
  }

  async getAllWorkouts(params?: GetWorkoutsRequest): Promise<PaginatedWorkoutsResponse> {
    try {
      const axiosResponse = await api.get<any>('/workouts', { params });

      if (axiosResponse.data && typeof axiosResponse.data.current_page === 'number' && Array.isArray(axiosResponse.data.data)) {
        // Успешный ответ с ожидаемой структурой
        return {
          success: true,
          current_page: axiosResponse.data.current_page,
          data: axiosResponse.data.data.map(mapRawWorkoutToWorkout),
          first_page_url: axiosResponse.data.first_page_url,
          from: axiosResponse.data.from,
          last_page: axiosResponse.data.last_page,
          last_page_url: axiosResponse.data.last_page_url,
          links: axiosResponse.data.links,
          next_page_url: axiosResponse.data.next_page_url,
          path: axiosResponse.data.path,
          per_page: axiosResponse.data.per_page,
          prev_page_url: axiosResponse.data.prev_page_url,
          to: axiosResponse.data.to,
          total: axiosResponse.data.total,
        };
      } else {
        // Успешный HTTP-ответ, но неожиданная структура тела
        console.warn('Workouts API response received with unexpected structure:', axiosResponse.data);
        return {
          success: false,
          message: axiosResponse.data?.message || "Не удалось загрузить тренировки: непредвиденный формат ответа от сервера.",
          current_page: 0,
          data: [],
          first_page_url: null,
          from: null,
          last_page: 0,
          last_page_url: null,
          links: [],
          next_page_url: null,
          path: '',
          per_page: 0,
          prev_page_url: null,
          to: null,
          total: 0,
        };
      }
    } catch (error: any) {
      console.error('Error in WorkoutService.getAllWorkouts:', error);
      // Ошибка при запросе (например, сетевая ошибка или статус 4xx/5xx)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Ошибка при загрузке списка тренировок.",
        current_page: 0,
        data: [],
        first_page_url: null,
        from: null,
        last_page: 0,
        last_page_url: null,
        links: [],
        next_page_url: null,
        path: '',
        per_page: 0,
        prev_page_url: null,
        to: null,
        total: 0,
      };
    }
  }

  // Для addWorkout, тело запроса ожидает WorkoutExerciseData[] для exercises, как в документации POST
  async addWorkout(workoutData: Omit<WorkoutData, 'id' | 'completed' | 'caloriesBurned' | 'userId'>): Promise<SingleWorkoutResponse> {
    // Здесь workoutData.exercises уже должен быть WorkoutExerciseData[]
    const response = await api.post<RawSingleWorkoutResponse>('/workouts', workoutData);
    return {
        ...response.data, // success, message
        data: mapRawWorkoutToWorkout(response.data.data)
    };
  }

  async getWorkoutById(workoutId: string): Promise<SingleWorkoutResponse> {
    try {
      const response = await api.get<{ data: RawWorkoutData, message?: string }>(`/workouts/${workoutId}`);
      
      if (response.data && response.data.data) {
        return {
            success: true,
            message: response.data.message,
            data: mapRawWorkoutToWorkout(response.data.data)
        };
      } else {
        console.warn(`Workout details API response for ${workoutId} has unexpected structure:`, response.data);
        return {
            success: false,
            message: response.data?.message || `Failed to parse workout details for ${workoutId}.`,
            data: null 
        };
      }
    } catch (error: any) {
      console.error(`Error fetching workout ${workoutId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || `Error fetching workout ${workoutId}.`,
        data: null
      };
    }
  }

  // Для updateWorkout, тело запроса ожидает WorkoutExerciseData[] для exercises, как в документации PUT/POST
  async updateWorkout(workoutId: string, workoutData: Partial<Omit<WorkoutData, 'id' | 'userId' | 'completed' | 'caloriesBurned'>>): Promise<SingleWorkoutResponse> {
    // Если workoutData.exercises передается, он должен быть WorkoutExerciseData[]
    const response = await api.put<RawSingleWorkoutResponse>(`/workouts/${workoutId}`, workoutData);
    return {
        ...response.data, // success, message
        data: mapRawWorkoutToWorkout(response.data.data)
    };
  }

  async deleteWorkout(workoutId: string): Promise<WorkoutOperationResponse> {
    const response = await api.delete<WorkoutOperationResponse>(`/workouts/${workoutId}`);
    return response.data; // Обычно не содержит тело WorkoutData или оно минимально
  }

  async markWorkoutComplete(workoutId: string, data: MarkWorkoutCompleteRequest): Promise<SingleWorkoutResponse> {
    const response = await api.patch<RawSingleWorkoutResponse>(`/workouts/${workoutId}/complete`, data);
    if (response.data.success && response.data.data) {
      return {
        ...response.data,
        data: mapRawWorkoutToWorkout(response.data.data),
      };
    } else {
      // Если data нет или success false, возвращаем как есть, но data должно быть null или определено как WorkoutData | null
      return {
        ...response.data,
        data: null // или response.data.data, если оно уже соответствует WorkoutData | null без маппинга
      } as SingleWorkoutResponse; // Приведение типа, если необходимо
    }
  }

  // Новый метод для добавления тренировки в план на конкретный день
  async addWorkoutToDayPlan(date: string, data: AddWorkoutToDayPlanRequest): Promise<WorkoutOperationResponse> {
    // Используем новый эндпоинт: POST /api/week-plan/{date}/workout
    const response = await api.post<WorkoutOperationResponse>(`/week-plan/${date}/workout`, data);
    return response.data;
  }

  // Новый метод для удаления тренировки из плана на конкретный день
  async removeWorkoutFromDayPlan(date: string, workoutPlanEntryId: string): Promise<WorkoutOperationResponse> {
    // ТРЕБУЕТ УТОЧНЕНИЯ API! Текущий эндпоинт может быть неверным или отсутствовать.
    // Пока что оставляем как заглушку или предполагаемый эндпоинт.
    // Если API подтвердится, например, DELETE /week-plan/{date}/workout/{workoutPlanEntryId}
    // const response = await api.delete<WorkoutOperationResponse>(`/week-plan/${date}/workout/${workoutPlanEntryId}`);
    // return response.data;
    console.warn(`removeWorkoutFromDayPlan: API endpoint for deleting workout from day plan for date ${date} and entry ${workoutPlanEntryId} is not confirmed. Returning dummy success.`);
    return Promise.resolve({ success: true, message: "Удаление из плана (заглушка) - требует уточнения API" });
  }

  // Новый метод для отметки выполнения/невыполнения тренировки в плане
  async markWorkoutInPlanAsComplete(date: string, workoutPlanEntryId: string, completed: boolean): Promise<WorkoutOperationResponse> {
    // Используем новый эндпоинт: PATCH /week-plan/{date}/workout/{workoutPlanEntryId}/toggle-complete
    // Предполагаем, что API принимает тело { completed: boolean } для явной установки, либо инвертирует состояние.
    const response = await api.patch<WorkoutOperationResponse>(`/week-plan/${date}/workout/${workoutPlanEntryId}/toggle-complete`, { completed });
    return response.data;
  }
} 