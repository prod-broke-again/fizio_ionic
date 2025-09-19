import { CapacitorHealthkit } from '@perfood/capacitor-healthkit';
import api from '../services/api/config';
import { TokenUtils } from '../services/api/config';

addEventListener('healthkitSync', async (resolve, reject, args) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [stepsData, caloriesData, distanceData] = await Promise.all([
      CapacitorHealthkit.queryHKitSampleType({
        sampleName: 'stepCount',
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        limit: 0,
      }),
      CapacitorHealthkit.queryHKitSampleType({
        sampleName: 'activeEnergyBurned',
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        limit: 0,
      }),
      CapacitorHealthkit.queryHKitSampleType({
        sampleName: 'distanceWalkingRunning',
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        limit: 0,
      })
    ]);

    const data = {
      steps: stepsData?.resultData[0]?.totalDistance || 0,
      calories: caloriesData?.resultData[0]?.totalEnergyBurned || 0,
      distance: distanceData?.resultData[0]?.totalDistance || 0,
      duration: caloriesData?.resultData[0]?.duration || 0,
      timestamp: now.toISOString()
    };

    // Проверяем наличие токена
    if (!TokenUtils.isAuthenticated()) {
      throw new Error('Токен аутентификации не найден');
    }

    // Отправка данных на сервер
    await api.post('/healthkit/sync', data);

    resolve();
  } catch (error) {
    console.error('Ошибка синхронизации HealthKit:', error);
    reject(error);
  }
}); 