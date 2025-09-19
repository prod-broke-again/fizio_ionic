<template>
  <div class="week-plan">
    <!-- Шкала дней недели -->
    <ion-segment v-model="selectedDay" @ionChange="onDayChange">
      <ion-segment-button v-for="day in weekDays" :key="day.date" :value="day.date">
        <ion-label>{{ formatDay(day.date) }}</ion-label>
        <ion-badge :color="getProgressColor(day.progress)">{{ day.progress }}%</ion-badge>
      </ion-segment-button>
    </ion-segment>

    <!-- Прогресс дня -->
    <div class="day-progress">
      <ion-progress-bar :value="selectedDayProgress / 100" :color="getProgressColor(selectedDayProgress)"></ion-progress-bar>
      <ion-text class="ion-text-center">
        <p>Прогресс дня: {{ selectedDayProgress }}%</p>
      </ion-text>
    </div>

    <!-- Кнопки быстрого добавления -->
    <div class="quick-actions">
      <ion-button expand="block" @click="showAddMealModal = true" class="ion-margin-bottom">
        <ion-icon :icon="restaurantOutline" slot="start"></ion-icon>
        Добавить приём пищи
      </ion-button>
      <ion-button expand="block" @click="showAddWorkoutModal = true" class="ion-margin-bottom">
        <ion-icon :icon="fitnessOutline" slot="start"></ion-icon>
        Добавить тренировку
      </ion-button>
    </div>

    <!-- Список действий на день -->
    <ion-list>
      <ion-item-group>
        <ion-item-divider>
          <ion-label>Приёмы пищи</ion-label>
        </ion-item-divider>
        <ion-item v-for="meal in selectedDayMeals" :key="meal.id">
          <ion-checkbox 
            :checked="meal.completed" 
            @ionChange="toggleMealCompletion(meal.id)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h2>{{ meal.name }}</h2>
            <p>{{ meal.time }} - {{ meal.calories }} ккал</p>
          </ion-label>
          <ion-button fill="clear" @click="deleteMeal(meal.id)" slot="end">
            <ion-icon :icon="trashOutline" color="danger"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-item-group>

      <ion-item-group>
        <ion-item-divider>
          <ion-label>Тренировки</ion-label>
        </ion-item-divider>
        <ion-item v-for="workout in selectedDayWorkouts" :key="workout.id">
          <ion-checkbox 
            :checked="workout.completed" 
            @ionChange="toggleWorkoutCompletion(workout.id)"
            slot="start"
          ></ion-checkbox>
          <ion-label>
            <h2>{{ workout.name }}</h2>
            <p>{{ workout.duration }} мин - {{ workout.calories }} ккал</p>
          </ion-label>
          <ion-button fill="clear" @click="deleteWorkout(workout.id)" slot="end">
            <ion-icon :icon="trashOutline" color="danger"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-item-group>
    </ion-list>

    <!-- Модальное окно добавления приёма пищи -->
    <ion-modal :is-open="showAddMealModal" @didDismiss="showAddMealModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Добавить приём пищи</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddMealModal = false">Отмена</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="stacked">Название</ion-label>
          <ion-input v-model="newMeal.name" placeholder="Введите название"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Калории</ion-label>
          <ion-input type="number" v-model="newMeal.calories" placeholder="Введите калории"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Время</ion-label>
          <ion-datetime-button datetime="meal-time"></ion-datetime-button>
          <ion-modal :keep-contents-mounted="true">
            <ion-datetime
              id="meal-time"
              v-model="newMeal.time"
              presentation="time"
              :hour-cycle="'h23'"
            ></ion-datetime>
          </ion-modal>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Тип</ion-label>
          <ion-select v-model="newMeal.type" placeholder="Выберите тип">
            <ion-select-option value="breakfast">Завтрак</ion-select-option>
            <ion-select-option value="lunch">Обед</ion-select-option>
            <ion-select-option value="dinner">Ужин</ion-select-option>
            <ion-select-option value="snack">Перекус</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" @click="addMeal" class="ion-margin-top">
          Добавить
        </ion-button>
      </ion-content>
    </ion-modal>

    <!-- Модальное окно добавления тренировки -->
    <ion-modal :is-open="showAddWorkoutModal" @didDismiss="showAddWorkoutModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Добавить тренировку</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddWorkoutModal = false">Отмена</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="stacked">Название</ion-label>
          <ion-input v-model="newWorkout.name" placeholder="Введите название"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Длительность (минуты)</ion-label>
          <ion-input type="number" v-model="newWorkout.duration" placeholder="Введите длительность"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Калории</ion-label>
          <ion-input type="number" v-model="newWorkout.calories" placeholder="Введите калории"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Тип</ion-label>
          <ion-select v-model="newWorkout.type" placeholder="Выберите тип">
            <ion-select-option value="cardio">Кардио</ion-select-option>
            <ion-select-option value="strength">Силовая</ion-select-option>
            <ion-select-option value="flexibility">Растяжка</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="block" @click="addWorkout" class="ion-margin-top">
          Добавить
        </ion-button>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from 'vue';
import { 
  IonSegment, IonSegmentButton, IonLabel, IonBadge,
  IonProgressBar, IonText, IonButton, IonIcon,
  IonList, IonItem, IonItemGroup, IonItemDivider,
  IonCheckbox, IonModal, IonHeader, IonToolbar,
  IonTitle, IonButtons, IonContent, IonInput,
  IonSelect, IonSelectOption, IonDatetime, IonDatetimeButton
} from '@ionic/vue';
import { 
  restaurantOutline, 
  fitnessOutline, 
  trashOutline 
} from 'ionicons/icons';
import { useWeekPlanStore } from '@/stores/weekPlan';
import { format, startOfWeek, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

const weekPlanStore = useWeekPlanStore();
const selectedDay = ref(format(new Date(), 'yyyy-MM-dd'));

// Генерация дней недели
const weekDays = computed(() => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Начинаем с понедельника
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      progress: weekPlanStore.getProgressForDate(date)
    };
  });
});

const selectedDayProgress = computed(() => {
  return weekPlanStore.getProgressForDate(new Date(selectedDay.value));
});

const selectedDayMeals = computed(() => {
  return weekPlanStore.getMealsForDate(new Date(selectedDay.value));
});

const selectedDayWorkouts = computed(() => {
  return weekPlanStore.getWorkoutsForDate(new Date(selectedDay.value));
});

const showAddMealModal = ref(false);
const showAddWorkoutModal = ref(false);

const newMeal = ref({
  name: '',
  calories: 0,
  time: '',
  type: ''
});

const newWorkout = ref({
  name: '',
  duration: 0,
  calories: 0,
  type: ''
});

const formatDay = (date: string) => {
  return format(new Date(date), 'E', { locale: ru });
};

const getProgressColor = (progress: number) => {
  if (progress < 30) return 'danger';
  if (progress < 70) return 'warning';
  return 'success';
};

const onDayChange = (event: CustomEvent) => {
  selectedDay.value = event.detail.value;
};

const addMeal = async () => {
  await weekPlanStore.addMeal(new Date(selectedDay.value), newMeal.value);
  showAddMealModal.value = false;
  newMeal.value = { name: '', calories: 0, time: '', type: '' };
};

const addWorkout = async () => {
  await weekPlanStore.addWorkout(new Date(selectedDay.value), newWorkout.value);
  showAddWorkoutModal.value = false;
  newWorkout.value = { name: '', duration: 0, calories: 0, type: '' };
};

const toggleMealCompletion = async (id: number) => {
  await weekPlanStore.markAsCompleted(new Date(selectedDay.value), 'meal', id);
};

const toggleWorkoutCompletion = async (id: number) => {
  await weekPlanStore.markAsCompleted(new Date(selectedDay.value), 'workout', id);
};

const deleteMeal = async (id: number) => {
  // TODO: Добавить подтверждение удаления
  await weekPlanStore.deleteMeal(new Date(selectedDay.value), id);
};

const deleteWorkout = async (id: number) => {
  // TODO: Добавить подтверждение удаления
  await weekPlanStore.deleteWorkout(new Date(selectedDay.value), id);
};

onMounted(async () => {
  await weekPlanStore.loadWeekPlan();
});
</script>

<style scoped>
.week-plan {
  padding: 1rem;
}

.day-progress {
  margin: 1rem 0;
}

.quick-actions {
  margin: 1rem 0;
}

ion-segment {
  margin-bottom: 1rem;
}

ion-badge {
  margin-left: 0.5rem;
}

ion-item-divider {
  margin-top: 1rem;
}
</style> 