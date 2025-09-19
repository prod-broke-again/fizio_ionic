import {
  ActivityData,
  CapacitorHealthkit,
  OtherData,
  QueryOutput,
  SampleNames,
  SleepData,
} from '@perfood/capacitor-healthkit';

// Типы данных для HealthKit
interface HealthKitData {
  steps: number;
  calories: number;
  distance: number;
  duration: number;
  heartRate?: number;
}

interface WorkoutData {
  type: string;
  duration: number;
  calories: number;
  distance?: number;
  startDate: Date;
  endDate: Date;
}

// Объявляем глобальный интерфейс для HealthKit
declare global {
  interface Window {
    HealthKit: {
      requestAuthorization: (options: {
        read: string[];
        write: string[];
      }) => Promise<boolean>;
      getSteps: (startDate: Date, endDate: Date) => Promise<number>;
      getCalories: (startDate: Date, endDate: Date) => Promise<number>;
      getDistance: (startDate: Date, endDate: Date) => Promise<number>;
      getWorkouts: (startDate: Date, endDate: Date) => Promise<WorkoutData[]>;
      getHeartRate: (startDate: Date, endDate: Date) => Promise<number[]>;
    };
  }
}

// Функция для проверки поддержки HealthKit
export const isHealthKitAvailable = (): boolean => {
  return typeof window !== 'undefined' && 'HealthKit' in window;
};

// Функция для запроса разрешений
export const requestHealthKitAuthorization = async (): Promise<boolean> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit не поддерживается на этом устройстве');
  }

  try {
    const permissions = await window.HealthKit.requestAuthorization({
      read: [
        'steps',
        'calories',
        'distance',
        'workout',
        'heartRate'
      ],
      write: []
    });

    return permissions;
  } catch (error) {
    console.error('Ошибка при запросе разрешений HealthKit:', error);
    return false;
  }
};

// Функция для синхронизации данных
export const syncHealthKitData = async (): Promise<HealthKitData> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit не поддерживается на этом устройстве');
  }

  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

    const [steps, calories, distance, workouts] = await Promise.all([
      window.HealthKit.getSteps(startDate, endDate),
      window.HealthKit.getCalories(startDate, endDate),
      window.HealthKit.getDistance(startDate, endDate),
      window.HealthKit.getWorkouts(startDate, endDate)
    ]);

    const workoutDuration = workouts.reduce((total, workout) => total + workout.duration, 0);

    return {
      steps,
      calories,
      distance,
      duration: workoutDuration
    };
  } catch (error) {
    console.error('Ошибка при синхронизации данных HealthKit:', error);
    throw error;
  }
};

// Функция для получения истории данных
export const getHealthKitHistory = async (days: number = 7): Promise<HealthKitData[]> => {
  if (!isHealthKitAvailable()) {
    throw new Error('HealthKit не поддерживается на этом устройстве');
  }

  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const data: HealthKitData[] = [];

    // Получаем данные для каждого дня
    for (let i = 0; i < days; i++) {
      const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const [steps, calories, distance, workouts] = await Promise.all([
        window.HealthKit.getSteps(dayStart, dayEnd),
        window.HealthKit.getCalories(dayStart, dayEnd),
        window.HealthKit.getDistance(dayStart, dayEnd),
        window.HealthKit.getWorkouts(dayStart, dayEnd)
      ]);

      const workoutDuration = workouts.reduce((total, workout) => total + workout.duration, 0);

      data.push({
        steps,
        calories,
        distance,
        duration: workoutDuration
      });
    }

    return data;
  } catch (error) {
    console.error('Ошибка при получении истории данных HealthKit:', error);
    throw error;
  }
};

export const getStepsData = async (startDate: Date, endDate: Date = new Date()) => {
  try {
    const queryOptions = {
      sampleName: SampleNames.STEP_COUNT,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    return await CapacitorHealthkit.queryHKitSampleType<ActivityData>(queryOptions);
  } catch (error) {
    console.error('Ошибка получения данных о шагах:', error);
    return undefined;
  }
};

export const getCaloriesData = async (startDate: Date, endDate: Date = new Date()) => {
  try {
    const queryOptions = {
      sampleName: SampleNames.ACTIVE_ENERGY_BURNED,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    return await CapacitorHealthkit.queryHKitSampleType<ActivityData>(queryOptions);
  } catch (error) {
    console.error('Ошибка получения данных о калориях:', error);
    return undefined;
  }
};

export const getDistanceData = async (startDate: Date, endDate: Date = new Date()) => {
  try {
    const queryOptions = {
      sampleName: SampleNames.DISTANCE_WALKING_RUNNING,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      limit: 0,
    };

    return await CapacitorHealthkit.queryHKitSampleType<ActivityData>(queryOptions);
  } catch (error) {
    console.error('Ошибка получения данных о расстоянии:', error);
    return undefined;
  }
};

export const getHealthKitHistoryData = async (startDate: Date, endDate: Date = new Date()) => {
  try {
    const [stepsHistory, caloriesHistory, distanceHistory] = await Promise.all([
      getStepsData(startDate, endDate),
      getCaloriesData(startDate, endDate),
      getDistanceData(startDate, endDate)
    ]);

    return [stepsHistory, caloriesHistory, distanceHistory].filter(Boolean);
  } catch (error) {
    console.error('Ошибка получения истории данных:', error);
    return [];
  }
}; 