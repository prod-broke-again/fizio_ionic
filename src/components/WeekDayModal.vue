<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ formatDate(date) }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">Закрыть</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Прогресс выполнения -->
      <ion-progress-bar :value="progress / 100" :color="getProgressColor(progress)"></ion-progress-bar>
      <ion-text class="ion-text-center ion-padding">
        <p>Прогресс выполнения: {{ progress }}%</p>
      </ion-text>

      <!-- Кнопки добавления -->
      <ion-button expand="block" @click="showAddMealModal = true" class="ion-margin-bottom">
        <ion-icon :icon="restaurantOutline" slot="start"></ion-icon>
        Добавить приём пищи
      </ion-button>
      <ion-button expand="block" @click="showAddWorkoutModal = true" class="ion-margin-bottom">
        <ion-icon :icon="fitnessOutline" slot="start"></ion-icon>
        Добавить тренировку
      </ion-button>

      <!-- Список действий -->
      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Приёмы пищи</ion-label>
          </ion-item-divider>
          <ion-item v-for="meal in meals" :key="meal.id">
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
          <ion-item v-for="workout in workouts" :key="workout.id">
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
    </ion-content>

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
  </ion-modal>
</template>

<script lang="ts">
// @ts-nocheck
import { ref, computed } from 'vue';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonContent, IonList, IonItem, IonLabel, 
  IonCheckbox, IonIcon, IonProgressBar, IonText, 
  IonItemGroup, IonItemDivider, IonInput, IonSelect, 
  IonSelectOption, IonDatetime, IonDatetimeButton
} from '@ionic/vue';
import { 
  restaurantOutline, 
  fitnessOutline, 
  trashOutline 
} from 'ionicons/icons';
import { useWeekPlanStore } from '@/stores/weekPlan';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const props = defineProps<{
  isOpen: boolean;
  date: Date;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
}>();

const weekPlanStore = useWeekPlanStore();

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

const meals = computed(() => weekPlanStore.getMealsForDate(props.date));
const workouts = computed(() => weekPlanStore.getWorkoutsForDate(props.date));
const progress = computed(() => weekPlanStore.getProgressForDate(props.date));

const formatDate = (date: Date) => {
  return format(date, 'd MMMM yyyy', { locale: ru });
};

const getProgressColor = (progress: number) => {
  if (progress < 30) return 'danger';
  if (progress < 70) return 'warning';
  return 'success';
};

const close = () => {
  emit('update:isOpen', false);
};

const addMeal = async () => {
  await weekPlanStore.addMeal(props.date, newMeal.value);
  showAddMealModal.value = false;
  newMeal.value = { name: '', calories: 0, time: '', type: '' };
};

const addWorkout = async () => {
  await weekPlanStore.addWorkout(props.date, newWorkout.value);
  showAddWorkoutModal.value = false;
  newWorkout.value = { name: '', duration: 0, calories: 0, type: '' };
};

const toggleMealCompletion = async (id: number) => {
  await weekPlanStore.markAsCompleted(props.date, 'meal', id);
};

const toggleWorkoutCompletion = async (id: number) => {
  await weekPlanStore.markAsCompleted(props.date, 'workout', id);
};

const deleteMeal = async (id: number) => {
  // TODO: Добавить подтверждение удаления
  await weekPlanStore.deleteMeal(props.date, id);
};

const deleteWorkout = async (id: number) => {
  // TODO: Добавить подтверждение удаления
  await weekPlanStore.deleteWorkout(props.date, id);
};
</script>

<style scoped>
ion-progress-bar {
  margin: 1rem 0;
}

ion-item-divider {
  margin-top: 1rem;
}
</style> 