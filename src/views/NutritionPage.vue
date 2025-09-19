<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>План Питания</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="nutrition-page-container">
        
        <!-- Переключатель дней недели -->
        <div class="week-switcher-container">
          <div class="week-switcher">
            <div 
              v-for="(dayLabel, idx) in weekLabels" 
              :key="idx" 
              class="week-day" 
              :class="{ active: idx === selectedDayIndex }" 
              @click="handleDaySelect(idx)"
            >
              <span class="day-label">{{ dayLabel }}</span>
              <span class="date-label">{{ getDayDate(idx) }}</span>
            </div>
          </div>
            </div>
        
        <!-- Кнопки добавления в верхней части страницы -->
        <div v-if="selectedDay" class="top-add-buttons">
          <ion-button
            @click="showAddMealModal = true"
            class="add-meal-fab"
            color="primary"
            shape="round"
            size="large"
            style="margin: 8px; display: flex; align-items: center; justify-content: center;"
            title="Добавить прием пищи"
          >
            <ion-icon :icon="addCircleOutline" slot="icon-only" style="font-size: 32px;"></ion-icon>
          </ion-button>
          <ion-button
            @click="showAddProductModal = true"
            class="add-product-fab"
            color="secondary"
            shape="round"
            size="large"
            style="margin: 8px; display: flex; align-items: center; justify-content: center;"
            title="Добавить продукт"
          >
            <ion-icon :icon="restaurantOutline" slot="icon-only" style="font-size: 32px;"></ion-icon>
          </ion-button>
        </div>

        <div v-if="weekDays.length > 0" class="selected-day-content">
          <!-- Прогресс по питанию на выбранный день -->
          <div v-if="selectedDay" class="daily-meal-progress">
            <div class="progress-bar-info">
              <span class="progress-title">Прогресс дня: {{ formatDateForDisplay(selectedDay.date) }}</span>
              <span class="progress-percentage">{{ mealProgress }}%</span>
              </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" :style="{ width: mealProgress + '%' }"></div>
            </div>
            </div>
            
          <!-- Список блюд -->
          <div v-if="selectedDay" class="meals-list-section">
            <h2 class="section-title">Приемы пищи</h2>
            
            <div v-if="!selectedDay.meals || selectedDay.meals.length === 0" class="empty-state">
              <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
              <p>Нет запланированных приемов пищи на этот день.</p>
              </div>
            <div class="meals-cards-nutrition" v-else>
              <div
                v-for="meal_item in selectedDay.meals" :key="meal_item.id"
                :class="['meal-item-dashboard-new', { completed: meal_item.completed }]"
              >
                 <div class="meal-icon-container-new">
                     <ion-icon :icon="getMealTypeIcon(meal_item.type)" class="meal-item-icon-new"></ion-icon>
                  </div>
                 <div class="meal-info-new">
                    <div class="meal-name-new">{{ meal_item.name }}</div>
                    <div class="meal-nutrition-details-new">
                      <div class="nutrition-item-new">
                         <ion-icon :icon="flameOutline" class="nutrition-icon-new"></ion-icon>
                         <span>{{ meal_item.calories }} ккал</span>
                      </div>
                       <div class="nutrition-item-new">
                         <span class="nutrition-label-new">Б</span>
                         <span>{{ meal_item.proteins }}г</span>
                      </div>
                       <div class="nutrition-item-new">
                         <span class="nutrition-label-new">Ж</span>
                         <span>{{ meal_item.fats }}г</span>
                      </div>
                       <div class="nutrition-item-new">
                         <span class="nutrition-label-new">У</span>
                         <span>{{ meal_item.carbs }}г</span>
                      </div>
                    </div>
                  </div>
                  <div class="meal-actions">
                    <ion-button fill="clear" @click.stop="toggleMeal(meal_item.id)" class="toggle-button">
                      <ion-icon :icon="meal_item.completed ? checkmarkCircleOutline : checkmarkOutline" :class="{ 'completed': meal_item.completed }"></ion-icon>
                    </ion-button>
                    <ion-button fill="clear" @click.stop="removeMeal(meal_item.id)" class="remove-button">
                      <ion-icon :icon="trashOutline"></ion-icon>
                    </ion-button>
                  </div>
              </div>
            </div>
          </div>
            <ion-button
              @click="showAddMealModal = true"
              class="add-meal-fab"
              color="primary"
              shape="round"
              size="large"
              style="margin: 16px 8px 0 0; display: flex; align-items: center; justify-content: center;"
              title="Добавить прием пищи"
            >
              <ion-icon :icon="addCircleOutline" slot="icon-only" style="font-size: 32px;"></ion-icon>
            </ion-button>
            <ion-button
              @click="showAddProductModal = true"
              class="add-product-fab"
              color="secondary"
              shape="round"
              size="large"
              style="margin: 16px 0 0 8px; display: flex; align-items: center; justify-content: center;"
              title="Добавить продукт"
            >
              <ion-icon :icon="restaurantOutline" slot="icon-only" style="font-size: 32px;"></ion-icon>
            </ion-button>
          </div>

          <!-- Добавляем поиск перед формой -->
          <div class="search-container" v-if="true">
              <ion-searchbar
                v-model="searchQuery"
                placeholder="Поиск продуктов..."
                @ionInput="handleSearch"
                :debounce="500"
              ></ion-searchbar>
              
              <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
                <ion-list>
                  <ion-item 
                  v-for="product in searchResults" 
                  :key="product.id || product._id || product.code"
                  @click="handleFoodSelect(product)"
                    button
                  >
                    <ion-label>
                    <h3>{{ getProductName(product) }}</h3>
                    <p v-if="getProductBrand(product)">{{ getProductBrand(product) }}</p>
                    <p class="nutrition-info">
                      <span v-if="product.source === 'local'">Локальная база</span>
                      <span v-else>OpenFoodFacts</span>
                      <span v-if="getProductNutriscore(product)"> | Nutri-Score: {{ getProductNutriscore(product).toUpperCase() }}</span>
                      <span v-if="product.nova_group"> | NOVA: {{ product.nova_group }}</span>
                      <span v-if="product.categories"> | {{ product.categories }}</span>
                    </p>
                    </ion-label>
                  </ion-item>
                </ion-list>
              </div>
            </div>
            
          <!-- Форма добавления нового блюда -->
          <div class="add-meal-form-section" v-if="false">
            <!-- Скрыта -->
          </div>
        </div>
      </ion-content>

      <!-- Модальное окно для добавления приёма пищи -->
      <ion-modal :is-open="showAddMealModal" @didDismiss="showAddMealModal = false">
        <div class="custom-add-meal-modal">
          <div class="modal-header">
            <h2>Добавить прием пищи</h2>
            <ion-button fill="clear" @click="showAddMealModal = false" class="close-btn">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
            <form @submit.prevent="addMealHandler">
              <ion-item class="form-input-item">
                <ion-input 
                  label="Название"
                  label-placement="floating"
                  v-model="newMeal.name"
                  placeholder="Введите название блюда"
                  required
                ></ion-input>
              </ion-item>
              <ion-item class="form-input-item">
                <ion-select 
                  label="Тип приема пищи"
                  label-placement="floating"
                v-model="newMealTypeString"
                  interface="popover"
                  placeholder="Выберите тип"
                >
                  <ion-select-option value="Завтрак">Завтрак</ion-select-option>
                  <ion-select-option value="Обед">Обед</ion-select-option>
                  <ion-select-option value="Ужин">Ужин</ion-select-option>
                  <ion-select-option value="Перекус">Перекус</ion-select-option>
                </ion-select>
              </ion-item>
                <ion-item class="form-input-item">
                <ion-input 
                    label="Калории"
                    label-placement="floating"
                  type="number" 
                  inputmode="numeric"
                    v-model.number="newMeal.calories"
                  placeholder="0"
                    required
                ></ion-input>
                </ion-item>
                <ion-item class="form-input-item">
                <ion-input 
                    label="Белки (г)"
                    label-placement="floating"
                  type="number" 
                  inputmode="numeric"
                    v-model.number="newMeal.proteins"
                  placeholder="0"
                ></ion-input>
                </ion-item>
                <ion-item class="form-input-item">
                <ion-input 
                    label="Жиры (г)"
                    label-placement="floating"
                  type="number" 
                  inputmode="numeric"
                    v-model.number="newMeal.fats"
                  placeholder="0"
                ></ion-input>
                </ion-item>
                <ion-item class="form-input-item">
                <ion-input 
                    label="Углеводы (г)"
                    label-placement="floating"
                  type="number" 
                  inputmode="numeric"
                    v-model.number="newMeal.carbs"
                  placeholder="0"
                ></ion-input>
                </ion-item>
            <ion-item class="form-input-item">
              <ion-input
                label="Время"
                label-placement="floating"
                type="time"
                v-model="newMeal.time"
                required
              ></ion-input>
            </ion-item>
              <div class="add-mode-switcher-nutrition">
                <ion-segment v-model="mealAddMode" value="singleDay">
                  <ion-segment-button value="singleDay">
                    <ion-label>На день</ion-label>
                  </ion-segment-button>
                  <ion-segment-button value="allWeek">
                    <ion-label>На неделю</ion-label>
                  </ion-segment-button>
                </ion-segment>
              </div>
              <ion-button expand="block" type="submit" class="add-meal-button">
            <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                Добавить в план
          </ion-button>
            </form>
                  </div>
      </ion-modal>

      <!-- Модальное окно для добавления продуктов -->
      <ion-modal :is-open="showAddProductModal" @didDismiss="showAddProductModal = false">
        <div class="custom-add-product-modal">
          <div class="modal-header">
            <h2>Добавить продукт</h2>
            <ion-button fill="clear" @click="showAddProductModal = false" class="close-btn">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
          
          <div class="product-search-section">
            <ion-searchbar
              v-model="productSearchQuery"
              placeholder="Поиск продуктов..."
              @ionInput="handleProductSearch"
              :debounce="500"
            ></ion-searchbar>
            
            <div v-if="showProductSearchResults && productSearchResults.length > 0" class="product-search-results">
              <ion-list>
                <ion-item 
                  v-for="product in productSearchResults" 
                  :key="product.id || product._id || product.code"
                  @click="handleProductSelect(product)"
                  button
                >
                  <ion-label>
                    <h3>{{ getProductName(product) }}</h3>
                    <p v-if="getProductBrand(product)">{{ getProductBrand(product) }}</p>
                    <p class="nutrition-info">
                      <span v-if="product.source === 'local'">Локальная база</span>
                      <span v-else>OpenFoodFacts</span>
                      <span v-if="getProductNutriscore(product)"> | Nutri-Score: {{ getProductNutriscore(product).toUpperCase() }}</span>
                      <span v-if="product.nova_group"> | NOVA: {{ product.nova_group }}</span>
                      <span v-if="product.categories"> | {{ product.categories }}</span>
                    </p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </div>
          </div>

          <div v-if="selectedProductForMeal" class="selected-product-section">
            <h3>Выбранный продукт</h3>
            <div class="selected-product-card">
              <h4>{{ getProductName(selectedProductForMeal) }}</h4>
              <p v-if="getProductBrand(selectedProductForMeal)">{{ getProductBrand(selectedProductForMeal) }}</p>
              
              <div class="nutrition-inputs">
                <ion-item class="form-input-item">
                  <ion-input 
                    label="Калории"
                    label-placement="floating"
                    type="number" 
                    inputmode="numeric"
                    v-model.number="productMeal.calories"
                    placeholder="0"
                  ></ion-input>
                </ion-item>
                <ion-item class="form-input-item">
                  <ion-input 
                    label="Белки (г)"
                    label-placement="floating"
                    type="number" 
                    inputmode="numeric"
                    v-model.number="productMeal.proteins"
                    placeholder="0"
                  ></ion-input>
                </ion-item>
                <ion-item class="form-input-item">
                  <ion-input 
                    label="Жиры (г)"
                    label-placement="floating"
                    type="number" 
                    inputmode="numeric"
                    v-model.number="productMeal.fats"
                    placeholder="0"
                  ></ion-input>
                </ion-item>
                <ion-item class="form-input-item">
                  <ion-input 
                    label="Углеводы (г)"
                    label-placement="floating"
                    type="number" 
                    inputmode="numeric"
                    v-model.number="productMeal.carbs"
                    placeholder="0"
                  ></ion-input>
                </ion-item>
              </div>

              <ion-item class="form-input-item">
                <ion-select 
                  label="Тип приема пищи"
                  label-placement="floating"
                  v-model="productMealTypeString"
                  interface="popover"
                  placeholder="Выберите тип"
                >
                  <ion-select-option value="Завтрак">Завтрак</ion-select-option>
                  <ion-select-option value="Обед">Обед</ion-select-option>
                  <ion-select-option value="Ужин">Ужин</ion-select-option>
                  <ion-select-option value="Перекус">Перекус</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-button expand="block" @click="addProductToMeal" class="add-product-button">
                <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                Добавить продукт в план
              </ion-button>
            </div>
          </div>
        </div>
      </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted, Ref } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonInput,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  toastController,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
  IonModal,
  IonAvatar
} from '@ionic/vue';
import { 
  addCircleOutline,
  trashOutline, 
  documentTextOutline,
  calendarClearOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  closeOutline,
  sunnyOutline,
  restaurantOutline,
  moonOutline,
  cafeOutline,
  flameOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { productService, type Product, type LocalProduct } from '@/services/api/productService';
import { WeekPlanService } from '@/services/weekPlanService';
import { NutritionService } from '@/services/nutritionService';
import type { Meal as WeekPlanMealType, Workout as WeekPlanWorkoutType, WeekPlan as WeekPlanDayType } from '@/types/weekPlan';
import type { AddMealPayload } from '@/services/nutritionService';

// Функция для нормализации даты к формату YYYY-MM-DD
const normalizeDate = (dateStr: string) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0]; // Берем только часть до T
};

const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const showSearchResults = ref(false);
const selectedProduct = ref<any | null>(null);

// Переменные для модального окна продуктов
const productSearchQuery = ref('');
const productSearchResults = ref<any[]>([]);
const showProductSearchResults = ref(false);
const selectedProductForMeal = ref<any | null>(null);
const productMeal = ref({
  name: '',
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
  type: 'Завтрак' as 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус'
});
const productMealTypeString = ref('Завтрак');

const weekPlanService = WeekPlanService.getInstance();
const nutritionService = NutritionService.getInstance();

interface NewMealForm {
  name: string;
  type: 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус'; // Use display types for form
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  time: string; // Assuming time is a string like HH:MM
  foodId?: string | null; // Optional food ID from search
}

const newMeal = ref<NewMealForm>({
  name: '',
  type: 'Завтрак',
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
  time: '',
});

const newMealTypeString = ref<string>(newMeal.value.type as string);
watch(newMealTypeString, (val: string) => {
  if (["Завтрак", "Обед", "Ужин", "Перекус"].includes(val)) {
    newMeal.value.type = val as NewMealForm['type']; // Use NewMealForm here
  } else {
    newMeal.value.type = 'Завтрак';
  }
});

const mealAddMode = ref('singleDay');
const showAddMealModal = ref(false);
const showAddProductModal = ref(false);

// --- Локальное состояние для дней недели ---
const weekLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const weekDays = ref<WeekPlanDayType[]>([]); // Используем тип WeekPlan из weekPlan.ts
const selectedDayIndex = ref(0);
const selectedDay = computed<WeekPlanDayType | undefined>(() => weekDays.value[selectedDayIndex.value]); // Используем тип WeekPlan

const initializeWeekDays = () => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 (Вс) - 6 (Сб)
  const days: WeekPlanDayType[] = [];
  
  // Находим понедельник текущей недели
  let monday = new Date(today);
  monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));

  for (let i = 0; i < 7; i++) { // Только текущая неделя
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({
      id: i + 1,
      user_id: 0,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      meals: [],
      workouts: [],
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  // Устанавливаем selectedDayIndex на сегодняшний день или первый день СРАЗУ после инициализации
  const todayString = normalizeDate(new Date().toISOString());
  const todayIndex = weekDays.value.findIndex(d => d.date === todayString);
  selectedDayIndex.value = todayIndex !== -1 ? todayIndex : 0;
  weekDays.value = days; // Присваиваем инициализированные дни
  console.log('initializeWeekDays: weekDays initialized with dates:', weekDays.value.map(day => day.date));
};

function mapDisplayToApiMealType(type: string): WeekPlanMealType['type'] {
  switch (type) {
    case 'Завтрак': return 'breakfast';
    case 'Обед': return 'lunch';
    case 'Ужин': return 'dinner';
    case 'Перекус': return 'snack';
    default: return 'snack';
  }
}

function mapApiToDisplayMealType(type: WeekPlanMealType['type'] | string): string {
  switch (type) {
    case 'breakfast': return 'Завтрак';
    case 'lunch': return 'Обед';
    case 'dinner': return 'Ужин';
    case 'snack': return 'Перекус';
    default: return 'Перекус';
  }
}

const loadWeekPlan = async () => {
  console.log('loadWeekPlan: starting. Current weekDays dates:', weekDays.value.map(day => day.date));
  try {
    const response = await weekPlanService.getWeekPlan();
    const daysFromApi = Array.isArray(response.data) ? response.data : [];

    if (daysFromApi.length > 0) {
      console.log('API вернуло данные плана питания, обновляю структуру дней.');
      // Обновляем существующие дни данными из API
      weekDays.value = weekDays.value.map(localDay => {
        const apiDay = daysFromApi.find(d => normalizeDate(d.date) === localDay.date);
        if (apiDay) {
          // Если нашли соответствующий день в данных API, обновляем его
          return {
            ...localDay, // Сохраняем локальный ID и другие базовые свойства
            ...apiDay, // Перезаписываем свойства из API (meals, workouts, progress и т.д.)
            date: localDay.date, // Убедимся, что формат даты остался нормализованным
            meals: (apiDay.meals || []).map((apiMeal: WeekPlanMealType) => ({
              ...apiMeal,
              type: mapApiToDisplayMealType(apiMeal.type) as any, // Приведение типа
            })) as WeekPlanMealType[], // Приведение типа
          };
        }
        // Если для этого дня нет данных в API, оставляем его как есть (с пустыми meals/workouts)
        return localDay;
      });
      console.log('loadWeekPlan: weekDays updated with API data. New dates:', weekDays.value.map(day => day.date));
    } else {
      console.warn('API вернуло пустой план питания или данные отсутствуют.');
      console.log('loadWeekPlan: API data empty, using initialized weekDays. Dates:', weekDays.value.map(day => day.date));
      weekDays.value = weekDays.value.map(day => ({ ...day, meals: [] }));
    }

    // Устанавливаем selectedDayIndex ЗДЕСЬ тоже, после возможного обновления weekDays
    const todayStringAfterLoad = normalizeDate(new Date().toISOString());
    const todayIndexAfterLoad = weekDays.value.findIndex(d => d.date === todayStringAfterLoad);
    selectedDayIndex.value = todayIndexAfterLoad !== -1 ? todayIndexAfterLoad : 0;

  } catch (e) {
    console.error('Ошибка загрузки плана питания:', e);
    showErrorToast('Ошибка загрузки плана питания');
    // В случае ошибки загрузки, оставляем структуру дней, созданную initializeWeekDays.
    // Ничего не делаем, т.к. meals уже пусты по умолчанию.
    // Устанавливаем selectedDayIndex ЗДЕСЬ тоже, после возможной ошибки
    console.log('loadWeekPlan: Error loading API data. Using initialized weekDays. Dates:', weekDays.value.map(day => day.date));
    const todayStringOnError = normalizeDate(new Date().toISOString());
    const todayIndexOnError = weekDays.value.findIndex(d => d.date === todayStringOnError);
    selectedDayIndex.value = todayIndexOnError !== -1 ? todayIndexOnError : 0;
    weekDays.value = weekDays.value.map(day => ({ ...day, meals: [] }));
  }
};

onMounted(async () => {
  // Сначала создаем базовую структуру дней недели с пустыми списками питания
  initializeWeekDays(); // Эта функция теперь устанавливает selectedDayIndex
  // Затем пытаемся загрузить и применить данные из API.
  await loadWeekPlan();
});

watch(selectedDayIndex, (newIndex, oldIndex) => {
  // Не подгружаем данные на один день, просто меняем selectedDay
});

const handleDaySelect = (idx: number) => {
  selectedDayIndex.value = idx;
};

const addMealHandler = async () => {
  if (!selectedDay.value) {
    showErrorToast('Пожалуйста, сначала выберите день.');
    return;
  }
  if (!newMeal.value.name.trim()) {
    showErrorToast('Пожалуйста, введите название приема пищи.');
    return;
  }
  if (!newMeal.value.time) {
    showErrorToast('Пожалуйста, выберите время приема пищи.');
    return;
  }

  const mealDataToSend: AddMealPayload = {
    name: newMeal.value.name,
    type: mapDisplayToApiMealType(newMeal.value.type),
    calories: newMeal.value.calories,
    proteins: newMeal.value.proteins,
    fats: newMeal.value.fats,
    carbs: newMeal.value.carbs,
    foodId: selectedProduct.value?._id || null
  };

  try {
    if (mealAddMode.value === 'allWeek') {
      showErrorToast('Добавление на всю неделю пока не реализовано.');
      return;
    } else {
      await nutritionService.addMeal(selectedDay.value.date, mealDataToSend);
    }
    await loadWeekPlan(); // Обновляем всю неделю
    showSuccessToast('Прием пищи добавлен!');
    newMeal.value.name = '';
    newMeal.value.type = 'Завтрак';
    newMealTypeString.value = 'Завтрак';
    newMeal.value.calories = 0;
    newMeal.value.proteins = 0;
    newMeal.value.fats = 0;
    newMeal.value.carbs = 0;
    newMeal.value.time = '';
    showAddMealModal.value = false;
  } catch (e) {
    console.error('Ошибка при добавлении приема пищи:', e);
    showErrorToast('Ошибка при добавлении приема пищи!');
  }
};

const removeMeal = async (mealId: string) => {
  // Находим день и прием пищи
  const day = weekDays.value.find(day => day.meals.some(meal => meal.id === mealId));
  const meal = day?.meals.find(m => m.id === mealId);

  if (!day || !meal) {
    console.warn(`Meal with ID ${mealId} not found for removal.`);
    showErrorToast('Не удалось найти прием пищи для удаления.');
    return;
  }

  try {
    await nutritionService.removeMeal(day.date, mealId);
    await loadWeekPlan(); // Обновляем всю неделю после успешного удаления
    showSuccessToast('Прием пищи удален');
  } catch (e) {
    console.error('Ошибка при удалении приема пищи:', e);
    showErrorToast('Ошибка при удалении приема пищи!');
  }
};

const toggleMeal = async (mealId: string) => {
  if (!selectedDay.value) return;
  const meal = selectedDay.value.meals.find(m => m.id === mealId);
  if (!meal) {
     showErrorToast('Прием пищи не найден для обновления статуса!');
     return;
  }

  try {
    // Используем WeekPlanService.markMealComplete
    // ПРИМЕЧАНИЕ: WeekPlanService.markMealComplete ожидает mealId: number
    // Наш meal.id из WeekPlanMealType (который теперь string) нужно преобразовать в number
    const mealIdAsNumber = parseInt(meal.id, 10);
    if (isNaN(mealIdAsNumber)) {
        console.error(`Invalid meal ID for markMealComplete: ${meal.id}`);
        showErrorToast('Некорректный ID приема пищи для обновления статуса.');
        return;
    }

    await weekPlanService.markMealComplete(selectedDay.value.date, mealIdAsNumber, { completed: !meal.completed });

    await loadWeekPlan(); // Обновляем всю неделю после успешного обновления
    showSuccessToast(meal.completed ? 'Отмечено как невыполненное' : 'Отмечено как выполненное');
  } catch (e) {
    console.error('Ошибка обновления статуса приема пищи:', e);
    showErrorToast('Ошибка обновления статуса!');
  }
};

const getDayDate = (index: number): string => {
  const day = weekDays.value[index];
  if (!day || !day.date) return '';
  try {
    // Парсим дату в формат ГГГГ-ММ-ДД
    const dateParts = day.date.split('-');
    if (dateParts.length === 3) {
      // Возвращаем только день (третий элемент массива)
      // parseInt с основанием 10 для надежности
      return parseInt(dateParts[2], 10).toString();
    }
  } catch (e) {
    console.error('Ошибка парсинга даты в getDayDate:', e);
  }
  return ''; // Возвращаем пустую строку в случае ошибки
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

const showErrorToast = async (message: string) => {
    const toast = await toastController.create({
    message: message,
    duration: 3000,
    color: 'danger',
    position: 'top',
    icon: alertCircleOutline
  });
  toast.present();
};

const showSuccessToast = async (message: string) => {
  const toast = await toastController.create({
    message: message,
    duration: 2500,
    color: 'success',
    position: 'top',
    icon: checkmarkCircleOutline
  });
  toast.present();
};

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }

  try {
    console.log('🔍 Поиск продуктов:', searchQuery.value);
    const results = await productService.searchProducts(searchQuery.value, 1, 10);
    
    if (results.products && results.products.length > 0) {
      searchResults.value = results.products;
      showSearchResults.value = true;
      console.log('✅ Найдено продуктов:', results.products.length);
    } else {
      searchResults.value = [];
      showSearchResults.value = false;
      console.log('ℹ️ Продукты не найдены');
    }
  } catch (error) {
    console.error('❌ Ошибка поиска продуктов:', error);
    searchResults.value = [];
    showSearchResults.value = false;
  }
};

const handleFoodSelect = async (product: any) => {
  try {
    const productId = product.id || product._id || product.code;
    if (!productId) {
        showErrorToast('Для этого продукта нет детальной информации.');
        showSearchResults.value = false;
        searchQuery.value = '';
        searchResults.value = [];
        return;
    }

    // Если это локальный продукт, используем его данные напрямую
    if (product.source === 'local') {
      selectedProduct.value = product;
      newMeal.value.name = product.product_name || '';
      // Для локальных продуктов используем базовые значения, так как у них нет nutriments
      newMeal.value.calories = 0;
      newMeal.value.proteins = 0;
      newMeal.value.fats = 0;
      newMeal.value.carbs = 0;
      newMeal.value.time = '';
      showSearchResults.value = false;
      searchQuery.value = '';
      searchResults.value = [];
      showSuccessToast('Продукт добавлен из локальной базы');
      return;
    }

    // Для внешних продуктов получаем детальную информацию
    const details = await productService.getProductDetails(productId);
    selectedProduct.value = details;
    newMeal.value.name = details.name || '';
    newMeal.value.calories = Math.round(Number(details.calories) || 0);
    newMeal.value.proteins = Math.round(Number(details.protein) || 0);
    newMeal.value.fats = Math.round(Number(details.fat) || 0);
    newMeal.value.carbs = Math.round(Number(details.carbs) || 0);
    newMeal.value.time = '';
    showSearchResults.value = false;
    searchQuery.value = '';
    searchResults.value = [];
    showSuccessToast('Продукт добавлен из OpenFoodFacts');
  } catch (error) {
    console.error('Ошибка при получении информации о продукте:', error);
    showErrorToast('Ошибка при получении информации о продукте');
  }
};

// Функция для иконки типа приёма пищи
function getMealTypeIcon(type: WeekPlanMealType['type'] | string) {
  switch (type) {
    case ' Завтрак':
    case 'breakfast': return sunnyOutline;
    case 'Обед':
    case 'lunch': return restaurantOutline;
    case 'Ужин':
    case 'dinner': return moonOutline;
    case 'Перекус':
    case 'snack': return cafeOutline;
    default: return cafeOutline;
  }
}

const mealProgress = computed(() => {
  if (!selectedDay.value || !selectedDay.value.meals) return 0;
  const total = selectedDay.value.meals.length;
  if (!total) return 0;
  const completed = selectedDay.value.meals.filter(m => m.completed).length;
  return Math.round((completed / total) * 100);
});

// Функции для работы с продуктами
const getProductName = (product: any): string => {
  return product.product_name || product.name || product.generic_name || 'Без названия';
};

const getProductBrand = (product: any): string => {
  return product.brands || product.brand || '';
};

const getProductNutriscore = (product: any): string => {
  return product.nutriscore_grade || product.nutriscore || '';
};

// Функции для работы с продуктами в модальном окне
const handleProductSearch = async () => {
  if (productSearchQuery.value.length < 2) {
    productSearchResults.value = [];
    showProductSearchResults.value = false;
    return;
  }

  try {
    console.log('🔍 Поиск продуктов в модальном окне:', productSearchQuery.value);
    const results = await productService.searchProducts(productSearchQuery.value, 1, 10);
    
    if (results.products && results.products.length > 0) {
      productSearchResults.value = results.products;
      showProductSearchResults.value = true;
      console.log('✅ Найдено продуктов:', results.products.length);
    } else {
      productSearchResults.value = [];
      showProductSearchResults.value = false;
      console.log('ℹ️ Продукты не найдены');
    }
  } catch (error) {
    console.error('❌ Ошибка поиска продуктов:', error);
    productSearchResults.value = [];
    showProductSearchResults.value = false;
  }
};

const handleProductSelect = async (product: any) => {
  try {
    selectedProductForMeal.value = product;
    
    // Если это локальный продукт, используем его данные напрямую
    if (product.source === 'local') {
      productMeal.value.name = product.product_name || '';
      // Для локальных продуктов используем базовые значения
      productMeal.value.calories = 0;
      productMeal.value.proteins = 0;
      productMeal.value.fats = 0;
      productMeal.value.carbs = 0;
      showProductSearchResults.value = false;
      productSearchQuery.value = '';
      productSearchResults.value = [];
      showSuccessToast('Продукт выбран из локальной базы');
      return;
    }

    // Для внешних продуктов получаем детальную информацию
    const productId = product.id || product._id || product.code;
    if (productId) {
      const details = await productService.getProductDetails(productId);
      productMeal.value.calories = Math.round(Number(details.calories) || 0);
      productMeal.value.proteins = Math.round(Number(details.protein) || 0);
      productMeal.value.fats = Math.round(Number(details.fat) || 0);
      productMeal.value.carbs = Math.round(Number(details.carbs) || 0);
    }
    
    showProductSearchResults.value = false;
    productSearchQuery.value = '';
    productSearchResults.value = [];
    showSuccessToast('Продукт выбран из OpenFoodFacts');
  } catch (error) {
    console.error('Ошибка при выборе продукта:', error);
    showErrorToast('Ошибка при выборе продукта');
  }
};

const addProductToMeal = async () => {
  if (!selectedDay.value) {
    showErrorToast('Пожалуйста, сначала выберите день.');
    return;
  }
  if (!selectedProductForMeal.value) {
    showErrorToast('Пожалуйста, сначала выберите продукт.');
    return;
  }

  const mealDataToSend: AddMealPayload = {
    name: getProductName(selectedProductForMeal.value),
    type: mapDisplayToApiMealType(productMealTypeString.value),
    calories: productMeal.value.calories,
    proteins: productMeal.value.proteins,
    fats: productMeal.value.fats,
    carbs: productMeal.value.carbs,
    foodId: selectedProductForMeal.value.id || selectedProductForMeal.value._id || null
  };

  try {
    await nutritionService.addMeal(selectedDay.value.date, mealDataToSend);
    await loadWeekPlan(); // Обновляем всю неделю
    showSuccessToast('Продукт добавлен в план питания!');
    
    // Сбрасываем форму
    selectedProductForMeal.value = null;
    productMeal.value = {
      name: '',
      calories: 0,
      proteins: 0,
      fats: 0,
      carbs: 0,
      type: 'Завтрак'
    };
    productMealTypeString.value = 'Завтрак';
    showAddProductModal.value = false;
  } catch (e) {
    console.error('Ошибка при добавлении продукта:', e);
    showErrorToast('Ошибка при добавлении продукта!');
  }
};

</script>

<style scoped>
/* Копируем стили meal-item-dashboard-new и связанные с ними из DashboardPage.vue */
/* НОВЫЕ СТИЛИ ДЛЯ meal-item-dashboard-new */
:root .meal-item-dashboard-new {
    background: var(--ion-color-step-50, #f2f2f2);
    color: var(--ion-text-color, #333);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
    position: relative; /* Добавляем для позиционирования кнопок */
}

.ion-palette-dark .meal-item-dashboard-new {
    background: var(--ion-color-step-150, #262626);
    color: var(--ion-text-color-rgb-contrast, #fff);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

:root .meal-item-dashboard-new:hover {
    background: var(--ion-color-step-100, #e6e6e6);
}
.ion-palette-dark .meal-item-dashboard-new:hover {
    background: var(--ion-color-step-200, #333333);
}

/* Стили для выполненного состояния самой карточки */
:root .meal-item-dashboard-new.completed {
   background: var(--ion-color-success-tint, #38e09c); /* Светлый зеленый фон */
   border-color: var(--ion-color-success, #2fdd92);
   color: var(--ion-color-success-contrast, #000);
}
.ion-palette-dark .meal-item-dashboard-new.completed {
   background: var(--ion-color-success-shade, #29c786); /* Темный зеленый фон */
   border-color: var(--ion-color-success-tint, #38e09c);
   color: var(--ion-color-success-contrast, #fff);
}


/* Контейнер иконки приема пищи */
:root .meal-icon-container-new {
  background: var(--ion-color-primary-tint, #e0e0ff); /* Цвет фона иконки */
  border-radius: 10px; /* Скругляем углы, но не полностью */
  width: 48px; /* Увеличиваем размер */
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ion-palette-dark .meal-icon-container-new {
  background: var(--ion-color-primary-shade, #6f50d1);
}

/* Иконка самого приема пищи */
:root .meal-item-icon-new {
  font-size: 28px; /* Увеличиваем размер иконки */
  color: var(--ion-color-primary, #8560ff);
}
.ion-palette-dark .meal-item-icon-new {
   color: var(--ion-color-primary-contrast, #fff);
}

/* Блок с названием и деталями */
.meal-info-new {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-grow: 1;
    min-width: 0; /* Позволяет тексту сжиматься */
    overflow: hidden; /* Скрываем переполнение */
}

/* Название приема пищи */
:root .meal-name-new {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color, #333);
  white-space: nowrap; /* Текст в одну строку */
  overflow: hidden; /* Скрываем переполнение */
  text-overflow: ellipsis; /* Добавляем многоточие */
}
.ion-palette-dark .meal-name-new {
   color: var(--ion-text-color-rgb-contrast, #fff);
}

/* Детали питания (БЖУК) */
.meal-nutrition-details-new {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--ion-color-medium-shade, #999);
    flex-wrap: wrap; /* Позволяем переносить элементы */
}
.ion-palette-dark .meal-nutrition-details-new {
   color: var(--ion-color-medium-tint, #bbb);
}

.nutrition-item-new {
    display: flex;
    align-items: center;
    gap: 3px; /* Расстояние между иконкой/лейблом и значением */
}

.nutrition-icon-new {
  font-size: 16px;
  color: var(--ion-color-warning, #ffc409); /* Цвет для иконки калорий */
}

.nutrition-label-new {
  font-size: 11px;
  font-weight: 600;
  width: 18px; /* Немного увеличиваем размер квадрата */
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.nutrition-item-new:nth-child(2) .nutrition-label-new { background-color: #4CAF50; /* Зеленый для Б */ }
.nutrition-item-new:nth-child(3) .nutrition-label-new { background-color: #FF9800; /* Оранжевый для Ж */ }
.nutrition-item-new:nth-child(4) .nutrition-label-new { background-color: #2196F3; /* Синий для У */ }

/* Стили для кнопки переключения статуса выполнения - убрана из шаблона, но стили оставлены */
.meal-toggle-button-new {
    background: none; /* Убираем фон по умолчанию */
    border: 2px solid var(--ion-color-medium-shade); /* Рамка */
    border-radius: 8px; /* Скругляем углы */
    width: 30px; /* Фиксированный размер кнопки */
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer; /* Указываем, что элемент кликабельный */
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;
}

.ion-palette-dark .meal-toggle-button-new {
    border-color: var(--ion-color-medium-tint); /* Цвет рамки в темной теме */
    background: var(--ion-color-step-200, #333333); /* Темный фон для кнопки в темной теме */
}

.meal-toggle-button-new ion-icon {
    font-size: 18px;
    color: transparent; /* По умолчанию иконка невидима */
    transition: color 0.2s ease;
}

/* Стили для выполненного состояния кнопки */
.meal-toggle-button-new.completed {
    background: var(--ion-color-success, #2fdd92); /* Зеленый фон при выполнении */
    border-color: var(--ion-color-success, #2fdd92); /* Зеленая рамка при выполнении */
}

.ion-palette-dark .meal-toggle-button-new.completed {
    background: var(--ion-color-success-shade, #29c786); /* Темный зеленый фон */
    border-color: var(--ion-color-success-tint, #38e09c); /* Рамка */
}

.meal-toggle-button-new.completed ion-icon {
    color: var(--ion-color-success-contrast, #fff); /* Белая галочка при выполнении */
}

/* Ховер эффект кнопки */
:root .meal-toggle-button-new:hover {
   background: var(--ion-color-step-100, #e6e6e6);
}
.ion-palette-dark .meal-toggle-button-new:hover {
   background: var(--ion-color-step-250, #3b3b3b);
}

/* Эффект при нажатии кнопки */
.meal-toggle-button-new:active {
    transform: scale(0.95);
}


/* Стили текста и иконок при выполненном состоянии */
.meal-item-dashboard-new.completed .meal-name-new,
.meal-item-dashboard-new.completed .meal-nutrition-details-new,
.meal-item-dashboard-new.completed .meal-nutrition-details-new span {
  text-decoration: line-through;
  color: var(--ion-color-success-contrast, #fff); /* Белый или светлый цвет текста */
}

.ion-palette-dark .meal-item-dashboard-new.completed .meal-name-new,
.ion-palette-dark .meal-item-dashboard-new.completed .meal-nutrition-details-new,
.ion-palette-dark .meal-item-dashboard-new.completed .meal-nutrition-details-new span {
  text-decoration: line-through;
  color: var(--ion-color-success-contrast, #fff); /* Белый или светлый цвет текста */
}

/* Иконки в выполненном состоянии */
.meal-item-dashboard-new.completed .meal-icon-container-new ion-icon,
.meal-item-dashboard-new.completed .nutrition-icon-new {
   color: var(--ion-color-success-contrast, #fff) !important; /* Белый или светлый цвет иконок */
}

.ion-palette-dark .meal-item-dashboard-new.completed .meal-icon-container-new ion-icon,
.ion-palette-dark .meal-item-dashboard-new.completed .nutrition-icon-new {
   color: var(--ion-color-success-contrast, #fff) !important; /* Белый или светлый цвет иконок */
}

.meal-item-dashboard-new.completed .nutrition-label-new {
   background-color: var(--ion-color-success-contrast, #fff) !important; /* Белый или светлый фон меток */
   color: var(--ion-color-success, #2fdd92) !important; /* Зеленый цвет текста на метках */
}
.ion-palette-dark .meal-item-dashboard-new.completed .nutrition-label-new {
   background-color: var(--ion-color-success-contrast, #fff) !important; /* Белый или светлый фон меток */
   color: var(--ion-color-success-shade, #29c786) !important; /* Зеленый цвет текста на метках */
}

/* Пустой список */
.empty-list {
  text-align: center;
  color: var(--ion-color-medium);
  padding: 16px 0;
}
.ion-palette-dark .empty-list {
  color: var(--ion-color-medium-tint);
}

/* Стили для контейнера карточек питания в NutritionPage */
.meals-cards-nutrition {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Расстояние между карточками */
}

/* Стили, которые были специфичны для NutritionPage и могут конфликтовать, удаляем или адаптируем */
/* Например, старые стили для .meal-item, .meal-type-avatar, .meal-header, .meal-name, .meal-nutrition-details, .nutr-icon */
/* Удаляем старые стили meal-item-sliding и meal-item */
/* .meal-item-sliding { display: none; } */
/* .meal-item { display: none; } */


/* Общие стили, не зависящие от темы */
.nutrition-page-container {
  padding: 16px;
  padding-bottom: 80px;
}

ion-toolbar {
  --background: var(--ion-color-background, var(--ion-color-light, #ffffff));
  --color: var(--ion-color-text, #000000);
}
.ion-palette-dark ion-toolbar {
  --background: var(--ion-color-step-50, #0d0d0d) !important;
  --color: var(--ion-color-light-contrast, #ffffff) !important;
  border-bottom: 1px solid var(--ion-color-step-150, #262626);
}
ion-title {
  font-weight: 600;
}

.week-switcher-container {
  margin-bottom: 20px;
  padding: 8px;
  background-color: var(--ion-color-light-tint, #f5f5f5);
  border-radius: 12px;
}
.ion-palette-dark .week-switcher-container {
  background-color: var(--ion-color-step-100, #1e1e1e) !important;
}

.week-switcher {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  flex: 1;
  min-width: 40px;
}

.week-day .day-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-medium-shade);
}
.ion-palette-dark .week-day .day-label {
  color: var(--ion-color-medium-tint);
}

.week-day .date-label {
  font-size: 12px;
  color: var(--ion-color-dark-contrast);
  margin-top: 2px;
  font-weight: 600;
}
.ion-palette-dark .week-day .date-label {
  color: var(--ion-color-light-contrast);
}

.week-day.active {
  background-color: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(var(--ion-color-primary-rgb), 0.3);
}

.week-day.active .day-label,
.week-day.active .date-label {
  color: var(--ion-color-primary-contrast);
}

.selected-day-content > div {
  margin-bottom: 24px;
  background-color: var(--ion-item-background, var(--ion-color-light));
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.ion-palette-dark .selected-day-content > div {
   background-color: var(--ion-item-background, var(--ion-color-dark-tint));
   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color);
  margin-top: 0;
  margin-bottom: 12px;
}
.ion-palette-dark .section-title {
  color: var(--ion-color-light-contrast);
}

.daily-meal-progress {
  padding-bottom: 16px;
}
.progress-bar-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.progress-title {
  font-size: 14px;
  color: var(--ion-color-medium-shade);
}
.ion-palette-dark .progress-title {
  color: var(--ion-color-medium-tint);
}
.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-primary);
}
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--ion-color-light-shade);
  border-radius: 4px;
  overflow: hidden;
}
.ion-palette-dark .progress-bar {
  background-color: var(--ion-color-dark-shade);
}
.progress-bar-fill {
  height: 100%;
  background-color: var(--ion-color-primary);
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

.meals-list-section { }

/* Удаляем старые стили для списков и элементов списков, которые теперь не используются */
/*
.meals-list {
  background: transparent;
  padding: 0;
}
.meal-item-sliding {
  margin-bottom: 8px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.ion-palette-dark .meal-item-sliding {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.meal-item {
  --background: var(--ion-color-light-tint, #23232b);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(80,80,120,0.08);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  transition: box-shadow 0.2s;
}
.meal-item:hover {
  box-shadow: 0 4px 16px rgba(80,80,120,0.16);
}
.meal-type-avatar {
  margin-right: 12px;
  background: var(--ion-color-primary-tint, #e0e0ff);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.meal-name {
  font-size: 17px;
  font-weight: 600;
}
.meal-time {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin-left: 8px;
}
.meal-nutrition-details {
  margin-top: 4px;
  font-size: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.nutr-icon {
  font-size: 15px;
  margin-right: 2px;
}
*/


.add-meal-form-section {}

.form-input-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --background: transparent;
  margin-bottom: 16px;
  --border-width: 0;
  --highlight-height: 0;
}

.form-input-item ion-input,
.form-input-item ion-select {
  --background: var(--ion-color-light-tint, #f8f8f8);
  --padding-start: 16px;
  --padding-end: 16px;
  font-size: 16px;
  box-shadow: none;
}

.ion-palette-dark .form-input-item ion-input,
.ion-palette-dark .form-input-item ion-select {
   --background: var(--ion-color-step-150, #2b2b2b) !important;
   --color: var(--ion-color-light-contrast, #ffffff) !important;
   --placeholder-color: var(--ion-color-medium-tint, #a0a0a0) !important;
}

ion-item.form-input-item {
  --background: transparent !important;
}

.form-input-item ion-input .native-input::placeholder,
.form-input-item ion-select .select-text.select-placeholder {
  color: var(--ion-color-medium-shade) !important;
}

.ion-palette-dark .form-input-item ion-input .native-input::placeholder,
.ion-palette-dark .form-input-item ion-select .select-text.select-placeholder {
  color: var(--ion-color-medium-tint) !important;
}

.ion-palette-dark .form-input-item ion-input::part(label) {
  color: var(--ion-color-step-600, #999999) !important;
}
.ion-palette-dark .form-input-item.item-has-focus ion-input::part(label),
.ion-palette-dark .form-input-item.item-has-value ion-input::part(label) {
  color: var(--ion-color-primary-tint, #73a1ff) !important;
}

.form-input-item ion-select::part(label) {
}
.ion-palette-dark .form-input-item ion-select::part(label) {
  color: var(--ion-color-step-600, #999999) !important;
}
.ion-palette-dark .form-input-item.item-has-focus ion-select::part(label),
.ion-palette-dark .form-input-item.item-has-value ion-select::part(label) {
  color: var(--ion-color-primary-tint, #73a1ff) !important;
}

.nutrition-inputs-grid {
    display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
  margin-top: 8px;
}

.add-meal-button {
  margin-top: 10px;
  --border-radius: 10px;
  height: 48px;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px 20px;
  color: var(--ion-color-medium);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.7;
}
.empty-state.full-page {
  min-height: 50vh;
}
.empty-state.full-page .empty-icon.large {
  font-size: 64px;
}

.ion-palette-dark .empty-state {
  color: var(--ion-color-medium-tint);
}

.ion-palette-dark .empty-state .empty-icon {
  color: inherit;
}

.add-mode-switcher-nutrition {
  margin-top: 12px;
  margin-bottom: 16px;
}

.add-mode-switcher-nutrition ion-segment {
  --background: var(--ion-color-light-shade, #f0f0f0);
  border-radius: 10px;
}

.ion-palette-dark .add-mode-switcher-nutrition ion-segment {
  --background: var(--ion-color-step-150, #262626) !important;
}

.ion-palette-dark .add-mode-switcher-nutrition ion-segment-button {
  --color: var(--ion-color-medium-tint) !important;
  --color-checked: var(--ion-color-primary-contrast) !important;
  --indicator-color: transparent !important;
  background: transparent !important;
  border-radius: 7px;
}

.ion-palette-dark .add-mode-switcher-nutrition ion-segment-button.segment-button-checked {
  background: var(--ion-color-primary-tint) !important;
  color: var(--ion-color-primary-contrast) !important;
}

.search-container {
  position: relative;
  margin-bottom: 16px;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--ion-color-light);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.ion-palette-dark .search-results {
  background: var(--ion-color-step-150, #2b2b2b);
}

.search-results ion-list {
  padding: 0;
}

.search-results ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 60px;
  border-radius: 8px;
  margin-bottom: 4px;
}

.search-results ion-item:hover {
  --background: var(--ion-color-light-shade);
}

.ion-palette-dark .search-results ion-item:hover {
  --background: var(--ion-color-step-200);
}

.nutrition-info {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
  line-height: 1.4;
}

.ion-palette-dark .nutrition-info {
  color: var(--ion-color-medium-tint);
}

.custom-add-meal-modal {
  background: var(--ion-color-light, #fff);
  border-radius: 18px;
  padding: 24px 18px 18px 18px;
  max-width: 400px;
  margin: 40px auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  position: relative;
}
.ion-palette-dark .custom-add-meal-modal {
  background: var(--ion-color-step-150, #232323);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.close-btn {
  --padding-start: 0;
  --padding-end: 0;
  min-width: 32px;
  min-height: 32px;
  font-size: 24px;
}

.meal-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: auto; /* Прижимаем кнопки к правому краю */
  flex-shrink: 0; /* Запрещаем сжатие */
}

.toggle-button,
.remove-button {
  --padding-start: 4px;
  --padding-end: 4px;
  min-width: 32px;
  min-height: 32px;
  margin: 0;
  height: 32px; /* Фиксированная высота */
}

.toggle-button ion-icon {
  font-size: 24px;
  color: var(--ion-color-medium);
}

.toggle-button ion-icon.completed {
  color: var(--ion-color-success);
}

.remove-button ion-icon {
  font-size: 20px;
  color: var(--ion-color-danger);
}

.ion-palette-dark .toggle-button ion-icon {
  color: var(--ion-color-medium-tint);
}

.ion-palette-dark .toggle-button ion-icon.completed {
  color: var(--ion-color-success-tint);
}

.ion-palette-dark .remove-button ion-icon {
  color: var(--ion-color-danger-tint);
}

/* Стили для модального окна продуктов */
.custom-add-product-modal {
  background: var(--ion-color-light, #fff);
  border-radius: 18px;
  padding: 24px 18px 18px 18px;
  max-width: 500px;
  margin: 40px auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
}

.ion-palette-dark .custom-add-product-modal {
  background: var(--ion-color-step-150, #232323);
}

.product-search-section {
  margin-bottom: 20px;
}

.product-search-results {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 8px;
  background: var(--ion-color-light-tint, #f8f8f8);
}

.ion-palette-dark .product-search-results {
  background: var(--ion-color-step-100, #2b2b2b);
}

.selected-product-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--ion-color-medium-shade, #ddd);
}

.ion-palette-dark .selected-product-section {
  border-top-color: var(--ion-color-step-200, #444);
}

.selected-product-card {
  background: var(--ion-color-light-tint, #f8f8f8);
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}

.ion-palette-dark .selected-product-card {
  background: var(--ion-color-step-100, #2b2b2b);
}

.selected-product-card h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.ion-palette-dark .selected-product-card h4 {
  color: var(--ion-color-light-contrast);
}

.selected-product-card p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
}

.ion-palette-dark .selected-product-card p {
  color: var(--ion-color-medium-tint);
}

.nutrition-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.add-product-button {
  margin-top: 16px;
  --border-radius: 10px;
  height: 48px;
  font-weight: 500;
}

.add-meal-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.top-add-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  padding: 8px;
  background: var(--ion-color-light-tint, #f8f8f8);
  border-radius: 12px;
}

.ion-palette-dark .top-add-buttons {
  background: var(--ion-color-step-100, #2b2b2b);
}
</style> 