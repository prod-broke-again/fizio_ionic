// Простой тест API прогресса тренировок
import axios from 'axios';

const testWorkoutProgressAPI = async () => {
  console.log('🔧 Testing Workout Progress API...');

  try {
    // Используем тот же токен, что и в приложении
    const token = localStorage.getItem('auth_token') || 'your_token_here';

    const response = await axios.get('http://fizio.online/api/v2/user/workout-progress', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    console.log('📊 API Response:', response.data);

    if (response.data && response.data.success) {
      const workouts = response.data.data || [];
      console.log('✅ Workouts loaded:', workouts.length);

      workouts.forEach(workout => {
        console.log(`🏋️ Program ${workout.program?.id} (${workout.program?.name}):`, {
          completed_at: workout.completed_at,
          isCompleted: !!workout.completed_at,
          exercise: workout.exercise?.name
        });
      });

      // Проверяем логику статусов
      console.log('\n🔍 Testing status logic...');
      if (workouts.length > 0) {
        const programId = workouts[0].program?.id;
        console.log(`Checking status for program ${programId}:`);

        // isStarted - проверяем, есть ли тренировки для этой программы
        const isStarted = workouts.some(w => w.program?.id === programId);
        console.log('- isStarted:', isStarted);

        // isActive - проверяем, есть ли незавершенные тренировки
        const isActive = workouts.some(w =>
          w.program?.id === programId &&
          (w.completed_at === null || w.completed_at === undefined || w.completed_at === '')
        );
        console.log('- isActive:', isActive);

        // isCompleted - проверяем, есть ли завершенные тренировки и нет активных
        const hasCompleted = workouts.some(w =>
          w.program?.id === programId &&
          w.completed_at &&
          w.completed_at !== null &&
          w.completed_at !== undefined &&
          w.completed_at !== ''
        );
        const hasActive = workouts.some(w =>
          w.program?.id === programId &&
          (!w.completed_at || w.completed_at === null || w.completed_at === undefined || w.completed_at === '')
        );
        const isCompleted = hasCompleted && !hasActive;
        console.log('- isCompleted:', isCompleted, { hasCompleted, hasActive });
      }

    } else {
      console.log('❌ No success response');
    }

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
};

// Запуск теста
testWorkoutProgressAPI();
