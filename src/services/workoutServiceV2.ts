import api from './api/config';
import {
  WorkoutDifficulty,
  WorkoutGender,
  type WorkoutDifficultyVO,
  type WorkoutGenderVO,
  type WorkoutCategory,
  type WorkoutProgram,
  type WorkoutExercise,
  type UserWorkoutProgress,
  type CreateWorkoutProgressDTO,
  type UpdateWorkoutProgressDTO,
  type ApiResponse,
  type PaginatedResponse,
  type GetWorkoutCategoriesRequest,
  type GetWorkoutProgramsRequest,
  type GetUserWorkoutProgressRequest,
  type MediaVO
} from '@/types/workout';

/**
 * API V2 Service для работы с тренировками
 * Архитектура: Domain-Driven Design (DDD) с принципами SOLID
 * Реализует паттерны Repository и Service Layer
 */

// Re-export types for convenience
export {
  WorkoutDifficulty,
  WorkoutGender,
  WorkoutDifficultyVO,
  WorkoutGenderVO,
  WorkoutCategory,
  WorkoutProgram,
  WorkoutExercise,
  UserWorkoutProgress,
  CreateWorkoutProgressDTO,
  UpdateWorkoutProgressDTO,
  ApiResponse,
  PaginatedResponse,
  GetWorkoutCategoriesRequest,
  GetWorkoutProgramsRequest,
  GetUserWorkoutProgressRequest,
  MediaVO
};

// === UTILITY FUNCTIONS ===

/**
 * Преобразует простые поля video_url/thumbnail_url в MediaVO
 */
function transformMediaFields<T extends Record<string, any>>(
  item: T
): T & {
  video?: MediaVO;
  thumbnail?: MediaVO;
} {
  const result = { ...item } as T & {
    video?: MediaVO;
    thumbnail?: MediaVO;
  };

  // Video
  if (result.video_file || result.video_url) {
    result.video = {
      url: result.video_url,
      file: result.video_file,
      has_media: !!(result.video_file || result.video_url)
    };
  }

  // Thumbnail
  if (result.thumbnail_file || result.thumbnail_url) {
    result.thumbnail = {
      url: result.thumbnail_url,
      file: result.thumbnail_file,
      has_media: !!(result.thumbnail_file || result.thumbnail_url)
    };
  }

  // Remove old fields
  delete result.video_url;
  delete result.video_file;
  delete result.thumbnail_url;
  delete result.thumbnail_file;

  return result;
}

// === SERVICE CLASS ===

/**
 * WorkoutServiceV2 - сервис для работы с API V2 тренировок
 * Реализует паттерны Service Layer и Repository
 */
export class WorkoutServiceV2 {
  private static instance: WorkoutServiceV2;
  private readonly baseUrl = '/v2';

  private constructor() {}

  public static getInstance(): WorkoutServiceV2 {
    if (!WorkoutServiceV2.instance) {
      WorkoutServiceV2.instance = new WorkoutServiceV2();
    }
    return WorkoutServiceV2.instance;
  }

  // === WORKOUT CATEGORIES ===

  /**
   * Получить список всех активных категорий тренировок
   */
  async getWorkoutCategories(params?: GetWorkoutCategoriesRequest): Promise<WorkoutCategory[]> {
    try {
      console.log('🏋️ WorkoutServiceV2: === STARTING getWorkoutCategories ===');
      console.log('WorkoutServiceV2: Requesting categories with params:', params);

      const response = await api.get<{ data: WorkoutCategory[] }>(
        `${this.baseUrl}/workout-categories`,
        { params }
      );

      console.log('📡 WorkoutServiceV2: Raw API response:', response);

      let categories: WorkoutCategory[] = [];

      if (response.data && Array.isArray(response.data.data)) {
        categories = response.data.data.map(cat => transformMediaFields(cat));
        console.log('✅ WorkoutServiceV2: Successfully parsed categories:', categories.length);
      } else if (Array.isArray(response.data)) {
        categories = response.data.map(cat => transformMediaFields(cat));
        console.log('✅ WorkoutServiceV2: Direct array response for categories:', categories.length);
      } else {
        throw new Error('Неожиданная структура ответа API');
      }

      console.log('📋 WorkoutServiceV2: Categories names:', categories.map(cat => cat.name));
        console.log('🎯 WorkoutServiceV2: === SUCCESS getWorkoutCategories ===');
      return categories;
    } catch (error: any) {
      console.error('❌ WorkoutServiceV2: === ERROR getWorkoutCategories ===');
      console.error('WorkoutServiceV2: Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке категорий тренировок'
      );
    }
  }

  /**
   * Получить конкретную категорию по slug
   */
  async getWorkoutCategory(slug: string): Promise<WorkoutCategory> {
    try {
      const response = await api.get<ApiResponse<WorkoutCategory>>(
        `${this.baseUrl}/workout-categories/${slug}`
      );

      if (response.data.success && response.data.data) {
        return transformMediaFields(response.data.data);
      }

      throw new Error(response.data.message || 'Не удалось загрузить категорию');
    } catch (error: any) {
      console.error('WorkoutServiceV2.getWorkoutCategory error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке категории'
      );
    }
  }

  // === WORKOUT PROGRAMS ===

  /**
   * Получить список всех активных программ тренировок
   */
  async getWorkoutPrograms(params?: GetWorkoutProgramsRequest): Promise<PaginatedResponse<WorkoutProgram>> {
    try {
      const response = await api.get<{
        data: WorkoutProgram[],
        current_page: number,
        last_page: number,
        per_page: number,
        total: number
      }>(
        `${this.baseUrl}/workout-programs`,
        { params }
      );

      if (response.data) {
        const programs = response.data.data.map(program => transformMediaFields(program));
        return {
          success: true,
          data: programs,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        };
      }

      throw new Error('Не удалось загрузить программы тренировок');
    } catch (error: any) {
      console.error('WorkoutServiceV2.getWorkoutPrograms error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке программ тренировок'
      );
    }
  }

  /**
   * Получить конкретную программу по slug
   */
  async getWorkoutProgram(slug: string): Promise<WorkoutProgram> {
    try {
      const response = await api.get<ApiResponse<WorkoutProgram>>(
        `${this.baseUrl}/workout-programs/${slug}`
      );

      if (response.data.success && response.data.data) {
        return transformMediaFields(response.data.data);
      }

      throw new Error(response.data.message || 'Не удалось загрузить программу тренировки');
    } catch (error: any) {
      console.error('WorkoutServiceV2.getWorkoutProgram error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке программы тренировки'
      );
    }
  }

  /**
   * Получить программы по категории
   */
  async getWorkoutProgramsByCategory(categorySlug: string): Promise<WorkoutProgram[]> {
    try {
      const response = await api.get<{ data: WorkoutProgram[] }>(
        `${this.baseUrl}/workout-programs/category/${categorySlug}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data.map(program => transformMediaFields(program));
      }

      return [];
    } catch (error: any) {
      console.error('WorkoutServiceV2.getWorkoutProgramsByCategory error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке программ по категории'
      );
    }
  }

  /**
   * Получить программы из категории (локальный метод для работы с кешированными данными)
   */
  getProgramsFromCategory(categories: WorkoutCategory[], categoryId: string): WorkoutProgram[] {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.workout_programs || [];
  }

  // === WORKOUT EXERCISES ===

  /**
   * Получить конкретное упражнение по ID
   */
  async getWorkoutExercise(id: string): Promise<WorkoutExercise> {
    try {
      const response = await api.get<ApiResponse<WorkoutExercise>>(
        `${this.baseUrl}/workout-exercises/${id}`
      );

      if (response.data.success && response.data.data) {
        return transformMediaFields(response.data.data);
      }

      throw new Error(response.data.message || 'Не удалось загрузить упражнение');
    } catch (error: any) {
      console.error('WorkoutServiceV2.getWorkoutExercise error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке упражнения'
      );
    }
  }

  /**
   * Получить упражнения по программе
   */
  async getWorkoutExercisesByProgram(programId: string): Promise<WorkoutExercise[]> {
    try {
      console.log(`WorkoutServiceV2: Fetching exercises for program ${programId}`);
      const response = await api.get<{ data: WorkoutExercise[] }>(
        `${this.baseUrl}/workout-exercises/program/${programId}`
      );

      console.log('WorkoutServiceV2: Exercises response:', response.data);

      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data.map(exercise => transformMediaFields(exercise));
      }

      return [];
    } catch (error: any) {
      console.error('WorkoutServiceV2.getWorkoutExercisesByProgram error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке упражнений программы'
      );
    }
  }

  // === USER WORKOUT PROGRESS ===

  /**
   * Начать тренировку - создать начальную запись прогресса
   */
  async startWorkoutProgress(data: CreateWorkoutProgressDTO): Promise<UserWorkoutProgress> {
    try {
      console.log('WorkoutServiceV2: Starting workout progress with data:', data);
      const response = await api.post<ApiResponse<UserWorkoutProgress>>(
        `${this.baseUrl}/user/workout-progress`,
        data
      );

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Не удалось начать тренировку');
    } catch (error: any) {
      console.error('WorkoutServiceV2.startWorkoutProgress error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при начале тренировки'
      );
    }
  }

  /**
   * Получить прогресс пользователя по тренировкам
   */
  async getUserWorkoutProgress(params?: GetUserWorkoutProgressRequest): Promise<UserWorkoutProgress[]> {
    try {
      console.log('🏋️ WorkoutServiceV2: === STARTING getUserWorkoutProgress ===');

      const response = await api.get<ApiResponse<UserWorkoutProgress[]>>(
        `${this.baseUrl}/user/workout-progress`,
        { params }
      );

      console.log('📡 WorkoutServiceV2: Raw progress response:', response);

      let progress: UserWorkoutProgress[] = [];

      // API возвращает данные в разных форматах
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        progress = response.data.data;
        console.log('✅ WorkoutServiceV2: User progress loaded from data.data:', progress.length);
      } else if (response.data && Array.isArray(response.data)) {
        progress = response.data;
        console.log('✅ WorkoutServiceV2: Direct array response for progress:', progress.length);
      }

      if (progress.length > 0) {
        console.log('📋 WorkoutServiceV2: First progress item:', progress[0]);
        console.log('📋 WorkoutServiceV2: Progress item keys:', Object.keys(progress[0]));
      }

      console.log('🎯 WorkoutServiceV2: === SUCCESS getUserWorkoutProgress ===');
      return progress;
    } catch (error: any) {
      console.error('❌ WorkoutServiceV2: === ERROR getUserWorkoutProgress ===');
      console.error('WorkoutServiceV2: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке прогресса тренировок'
      );
    }
  }

  /**
   * Создать запись о прогрессе тренировки
   */
  async createWorkoutProgress(data: CreateWorkoutProgressDTO): Promise<UserWorkoutProgress> {
    try {
      const response = await api.post<ApiResponse<UserWorkoutProgress>>(
        `${this.baseUrl}/user/workout-progress`,
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Не удалось создать запись прогресса');
    } catch (error: any) {
      console.error('WorkoutServiceV2.createWorkoutProgress error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при создании записи прогресса'
      );
    }
  }

  /**
   * Обновить запись прогресса
   */
  async updateWorkoutProgress(id: string, data: UpdateWorkoutProgressDTO): Promise<UserWorkoutProgress> {
    try {
      const response = await api.put<ApiResponse<UserWorkoutProgress>>(
        `${this.baseUrl}/user/workout-progress/${id}`,
        data
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Не удалось обновить запись прогресса');
    } catch (error: any) {
      console.error('WorkoutServiceV2.updateWorkoutProgress error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при обновлении записи прогресса'
      );
    }
  }

  /**
   * Получить статистику прогресса пользователя
   */
  async getUserWorkoutProgressStatistics(): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.baseUrl}/user/workout-progress/statistics`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Не удалось загрузить статистику прогресса');
    } catch (error: any) {
      console.error('WorkoutServiceV2.getUserWorkoutProgressStatistics error:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке статистики прогресса'
      );
    }
  }

  // === UTILITY METHODS ===

  /**
   * Получить читаемое название сложности
   */
  getDifficultyDisplayName(difficulty: WorkoutDifficulty): string {
    switch (difficulty) {
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

  /**
   * Получить читаемое название пола
   */
  getGenderDisplayName(gender: WorkoutGender): string {
    return gender === WorkoutGender.MALE ? 'Мужские' : 'Женские';
  }

  /**
   * Проверить, является ли тренировка бесплатной
   */
  isWorkoutFree(program: WorkoutProgram): boolean {
    return program.is_free;
  }

  /**
   * Получить URL для медиа контента (приоритет: file > url)
   */
  getMediaUrl(media?: MediaVO): string | undefined {
    if (!media || !media.has_media) return undefined;
    return media.file || media.url;
  }

  /**
   * Проверить, есть ли видео у программы/упражнения
   */
  hasVideo(item: { video?: MediaVO }): boolean {
    return !!(item.video && item.video.has_media);
  }

  /**
   * Проверить, есть ли превью у программы/упражнения
   */
  hasThumbnail(item: { thumbnail?: MediaVO }): boolean {
    return !!(item.thumbnail && item.thumbnail.has_media);
  }

  /**
   * Получить URL видео с приоритетом
   */
  getVideoUrl(item: { video?: MediaVO }): string | undefined {
    return this.getMediaUrl(item.video);
  }

  /**
   * Получить URL превью с приоритетом
   */
  getThumbnailUrl(item: { thumbnail?: MediaVO }): string | undefined {
    return this.getMediaUrl(item.thumbnail);
  }



  /**
   * Рассчитать общее время тренировки
   */
  calculateTotalWorkoutTime(exercises: WorkoutExercise[]): number {
    return exercises.reduce((total, exercise) => {
      return total + exercise.duration_seconds + (exercise.rest_seconds * (exercise.sets - 1));
    }, 0);
  }

  /**
   * Получить группы мышц для упражнения
   */
  getMuscleGroupsDisplay(exercise: WorkoutExercise): string {
    return exercise.muscle_groups.join(', ');
  }

  /**
   * Получить необходимое оборудование
   */
  getEquipmentDisplay(exercise: WorkoutExercise): string {
    return exercise.equipment_needed.join(', ') || 'Без оборудования';
  }

  /**
   * Получить все тренировки пользователя (активные и завершенные)
   */
  async getActiveUserWorkouts(): Promise<UserWorkoutProgress[]> {
    try {
      console.log('🏋️ WorkoutServiceV2: === STARTING getActiveUserWorkouts ===');

      const response = await api.get<ApiResponse<UserWorkoutProgress[]>>(
        `${this.baseUrl}/user/workout-progress`
      );

      console.log('📡 WorkoutServiceV2: Raw API Response:', response);

      let workouts: UserWorkoutProgress[] = [];

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        workouts = response.data.data;
        console.log('✅ WorkoutServiceV2: Workouts loaded from data.data:', workouts.length);
      } else if (response.data && Array.isArray(response.data)) {
        workouts = response.data;
        console.log('✅ WorkoutServiceV2: Direct array response for workouts:', workouts.length);
      }

      if (workouts.length > 0) {
        console.log('📋 WorkoutServiceV2: First workout sample:', workouts[0]);
      }

      console.log('🎯 WorkoutServiceV2: === SUCCESS getActiveUserWorkouts ===');
      return workouts;
    } catch (error: any) {
      console.error('❌ WorkoutServiceV2: === ERROR getActiveUserWorkouts ===');
      console.error('WorkoutServiceV2: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Не выбрасываем ошибку, просто возвращаем пустой массив
      return [];
    }
  }

  /**
   * Проверить, начата ли программа пользователем (независимо от завершения)
   */
  isProgramStarted(programId: string, activeWorkouts: UserWorkoutProgress[]): boolean {
    return activeWorkouts.some(workout => workout.program_id === programId);
  }

  /**
   * Проверить, активна ли тренировка (не завершена)
   */
  isProgramActive(programId: string, activeWorkouts: UserWorkoutProgress[]): boolean {
    const programWorkouts = activeWorkouts.filter(workout => workout.program_id === programId);

    if (programWorkouts.length === 0) {
      return false;
    }

    // Активная тренировка - это та, у которой completed_at равно null, undefined или пустая строка
    const hasActiveWorkout = programWorkouts.some(workout =>
      workout.completed_at === null ||
      workout.completed_at === undefined ||
      workout.completed_at === '' ||
      workout.completed_at === 'null'
    );

    console.log(`WorkoutServiceV2: Program ${programId} has active workout:`, hasActiveWorkout);
    return hasActiveWorkout;
  }

  /**
   * Проверить, завершена ли программа (все тренировки для этой программы завершены)
   */
  isProgramCompleted(programId: string, activeWorkouts: UserWorkoutProgress[]): boolean {
    const programWorkouts = activeWorkouts.filter(workout => workout.program_id === programId);

    if (programWorkouts.length === 0) {
      return false;
    }

    // Программа завершена, если у нее есть хотя бы одна завершенная тренировка
    // и нет активных тренировок
    const hasCompletedWorkouts = programWorkouts.some(workout =>
      workout.completed_at &&
      workout.completed_at !== null &&
      workout.completed_at !== undefined &&
      workout.completed_at !== '' &&
      workout.completed_at !== 'null'
    );

    const hasActiveWorkouts = programWorkouts.some(workout =>
      !workout.completed_at ||
      workout.completed_at === null ||
      workout.completed_at === undefined ||
      workout.completed_at === '' ||
      workout.completed_at === 'null'
    );

    const isCompleted = hasCompletedWorkouts && !hasActiveWorkouts;

    console.log(`WorkoutServiceV2: Program ${programId} is completed:`, isCompleted, {
      hasCompletedWorkouts,
      hasActiveWorkouts,
      totalWorkouts: programWorkouts.length
    });

    return isCompleted;
  }

  /**
   * Форматировать длительность в читаемый формат (MM:SS)
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Получить статус программы для отображения
   */
  getProgramStatus(programId: string, activeWorkouts: UserWorkoutProgress[]): 'new' | 'active' | 'completed' {
    if (this.isProgramCompleted(programId, activeWorkouts)) {
      return 'completed';
    }
    if (this.isProgramActive(programId, activeWorkouts)) {
      return 'active';
    }
    return 'new';
  }
}
