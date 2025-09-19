/**
 * API V2 Типизация тренировок - Domain-Driven Design (DDD)
 * Архитектура: Entities, Value Objects, DTOs
 */

// === DOMAIN TYPES ===

/**
 * Перечисление уровней сложности тренировок
 */
export enum WorkoutDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

/**
 * Перечисление полов для тренировок
 */
export enum WorkoutGender {
  MALE = 'male',
  FEMALE = 'female'
}

// === VALUE OBJECTS ===

/**
 * Value Object для сложности тренировки
 */
export class WorkoutDifficultyVO {
  constructor(private readonly value: WorkoutDifficulty) {}

  getValue(): WorkoutDifficulty {
    return this.value;
  }

  toString(): string {
    switch (this.value) {
      case WorkoutDifficulty.BEGINNER:
        return 'Новичок';
      case WorkoutDifficulty.INTERMEDIATE:
        return 'Средний';
      case WorkoutDifficulty.ADVANCED:
        return 'Продвинутый';
      default:
        return 'Не указан';
    }
  }

  isBeginner(): boolean {
    return this.value === WorkoutDifficulty.BEGINNER;
  }

  isAdvanced(): boolean {
    return this.value === WorkoutDifficulty.ADVANCED;
  }
}

/**
 * Value Object для пола
 */
export class WorkoutGenderVO {
  constructor(private readonly value: WorkoutGender) {}

  getValue(): WorkoutGender {
    return this.value;
  }

  toString(): string {
    return this.value === WorkoutGender.MALE ? 'Мужские' : 'Женские';
  }

  isMale(): boolean {
    return this.value === WorkoutGender.MALE;
  }
}

/**
 * Value Object для медиа контента (видео/изображение)
 */
export interface MediaVO {
  readonly url?: string;        // Внешний URL (YouTube, etc.)
  readonly file?: string;       // Локальный файл на сервере
  readonly has_media: boolean;  // Флаг наличия медиа
}

// === ENTITIES ===

/**
 * Entity: Категория тренировок
 */
export interface WorkoutCategory {
  readonly id: string;
  readonly name: string;
  readonly gender: WorkoutGender;
  readonly slug: string;
  readonly description: string;
  readonly is_active: boolean;
  readonly sort_order: number;
  readonly workout_programs?: WorkoutProgram[];
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Entity: Программа тренировок
 */
export interface WorkoutProgram {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly short_description: string;
  readonly difficulty_level: WorkoutDifficulty;
  readonly duration_weeks: number;
  readonly calories_per_workout: number;
  readonly is_free: boolean;
  readonly is_active: boolean;
  readonly sort_order: number;
  readonly video?: MediaVO;
  readonly thumbnail?: MediaVO;
  readonly category?: WorkoutCategory;
  readonly workout_exercises?: WorkoutExercise[];
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Entity: Упражнение в программе тренировок
 */
export interface WorkoutExercise {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly instructions: string;
  readonly video?: MediaVO;
  readonly thumbnail?: MediaVO;
  readonly duration_seconds: number;
  readonly sets: number;
  readonly reps: number;
  readonly rest_seconds: number;
  readonly weight_kg?: number;
  readonly equipment_needed: string[];
  readonly muscle_groups: string[];
  readonly sort_order: number;
  readonly program?: WorkoutProgram;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Entity: Прогресс пользователя по тренировке
 */
export interface UserWorkoutProgress {
  readonly id: string;
  readonly user_id: string;
  readonly program_id: string;
  readonly exercise_id: string;
  readonly program?: WorkoutProgram;
  readonly exercise?: WorkoutExercise;
  readonly sets_completed: number;
  readonly reps_completed: number;
  readonly weight_used?: number;
  readonly duration_seconds?: number;
  readonly notes?: string;
  readonly completed_at?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

// === DTOs ===

/**
 * DTO для создания/обновления прогресса тренировки
 */
export interface CreateWorkoutProgressDTO {
  readonly program_id: string;
  readonly exercise_id: string;
  readonly sets_completed: number;
  readonly reps_completed: number;
  readonly weight_used?: number;
  readonly duration_seconds?: number;
  readonly notes?: string;
}

/**
 * DTO для обновления прогресса тренировки
 */
export interface UpdateWorkoutProgressDTO {
  readonly sets_completed?: number;
  readonly reps_completed?: number;
  readonly weight_used?: number;
  readonly duration_seconds?: number;
  readonly notes?: string;
}

// === REQUEST/RESPONSE INTERFACES ===

/**
 * Стандартный API ответ
 */
export interface ApiResponse<T = any> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
  readonly errors?: Record<string, string[]>;
}

/**
 * Пагинированный ответ
 */
export interface PaginatedResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data: T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
  readonly from?: number;
  readonly to?: number;
}

/**
 * Запрос для получения категорий
 */
export interface GetWorkoutCategoriesRequest {
  readonly gender?: WorkoutGender;
}

/**
 * Запрос для получения программ
 */
export interface GetWorkoutProgramsRequest {
  readonly category_id?: string;
  readonly difficulty_level?: WorkoutDifficulty;
  readonly is_free?: boolean;
  readonly gender?: WorkoutGender;
  readonly per_page?: number;
}

/**
 * Запрос для получения прогресса пользователя
 */
export interface GetUserWorkoutProgressRequest {
  readonly page?: number;
  readonly per_page?: number;
  readonly program_id?: string;
  readonly date_from?: string;
  readonly date_to?: string;
}

// === LEGACY INTERFACES (для обратной совместимости) ===

/**
 * Устаревший интерфейс Exercise (для миграции)
 * @deprecated Используйте WorkoutExercise из API v2
 */
export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility';
  muscle_groups: string[];
  equipment?: string[];
  instructions?: string;
  video_url?: string;
  image_url?: string;
}

/**
 * Устаревший интерфейс WorkoutSet (для миграции)
 * @deprecated Используйте UserWorkoutProgress из API v2
 */
export interface WorkoutSet {
  id: string;
  exercise_id: string;
  weight?: number;
  reps?: number;
  duration?: number; // в секундах
  distance?: number; // в метрах
  completed: boolean;
  notes?: string;
}

/**
 * Устаревший интерфейс Workout (для миграции)
 * @deprecated Используйте WorkoutProgram из API v2
 */
export interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'flexibility';
  exercises: any[];
  duration: number; // в минутах
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories_burned?: number;
  date: string;
  completed: boolean;
  user_id: string;
  notes?: string;
}

/**
 * Устаревший интерфейс WorkoutData (для миграции)
 * @deprecated Используйте WorkoutProgram из API v2
 */
export interface WorkoutData {
  id: string;
  name: string;
  type: string;
  exercises: string;
  duration: number;
  difficulty: string;
  completed: boolean;
  calories_burned: number;
  image_url: string;
  date: string;
}

/**
 * Устаревший интерфейс WorkoutPlanResponse (для миграции)
 * @deprecated Используйте ApiResponse из API v2
 */
export interface WorkoutPlanResponse {
  success: boolean;
  data: WorkoutData[];
  message?: string;
} 