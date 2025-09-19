// @ts-nocheck
<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>План питания</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="nutrition-container">
                 <!-- Статистика калорий -->
         <div class="stats-card">
           <div class="stats-header">
             <h3>Сегодня</h3>
             <span class="stats-date">{{ getCurrentDate() }}</span>
           </div>
           <div class="stats-grid">
             <div class="stat-item">
               <div class="stat-value">{{ getTotalCalories() }}</div>
               <div class="stat-label">Калории</div>
             </div>
             <div class="stat-item">
               <div class="stat-value">{{ getCompletedMeals() }}/{{ getTotalMeals() }}</div>
               <div class="stat-label">Приёмы пищи</div>
             </div>
             <div class="stat-item">
               <div class="stat-value">{{ getProgressPercentage() }}%</div>
               <div class="stat-label">Выполнено</div>
             </div>
           </div>
         </div>

         <!-- Поиск продуктов -->
         <div class="search-container">
           <div class="search-input-wrapper">
             <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
             <input 
               v-model="productSearchQuery" 
               @input="debouncedProductSearch" 
               placeholder="Найти гречку, молоко..." 
               class="search-input"
               type="text"
             >
             <ion-icon 
               v-if="productSearchQuery" 
               :icon="closeOutline" 
               class="clear-icon"
               @click="productSearchQuery = ''; productSearchResults = []; showProductSearchResults = false"
             ></ion-icon>
           </div>
           
           <div v-if="productSearchLoading" class="search-loading">
             <ion-spinner name="crescent"></ion-spinner>
             <span>Поиск продуктов...</span>
           </div>
           
           <div v-else-if="showProductSearchResults && productSearchResults.length > 0" class="product-search-results">
             <div class="search-results-header">
               <h4>Найденные продукты</h4>
               <span class="results-count">{{ productSearchResults.length }} результатов</span>
             </div>
             <div class="product-list">
               <div 
                 v-for="product in productSearchResults" 
                 :key="product.id" 
                 @click="handleProductSelect(product)" 
                 class="product-item"
               >
                 <div class="product-image">
                   <img 
                     :src="getProductImage(product.image, product.title)" 
                     :alt="product.title"
                     @error="handleImageError($event, product.title)"
                   >
                 </div>
                 <div class="product-info">
                   <h5 class="product-title">{{ product.title }}</h5>
                                           <div v-if="product.nutrition && product.nutrition.calories" class="product-nutrition">
                          <span class="nutrition-chip">
                            <ion-icon :icon="flameOutline"></ion-icon>
                            {{ Math.round(Number(product.nutrition.calories) || 0) }}
                          </span>
                          <span v-if="product.nutrition.protein" class="nutrition-chip">
                            <ion-icon :icon="barbellOutline"></ion-icon>
                            {{ Math.round(Number(product.nutrition.protein) || 0) }}
                          </span>
                          <span v-if="product.nutrition.fat" class="nutrition-chip">
                            <ion-icon :icon="waterOutline"></ion-icon>
                            {{ Math.round(Number(product.nutrition.fat) || 0) }}
                          </span>
                          <span v-if="product.nutrition.carbs" class="nutrition-chip">
                            <ion-icon :icon="leafOutline"></ion-icon>
                            {{ Math.round(Number(product.nutrition.carbs) || 0) }}
                          </span>
                        </div>
                   <p v-else class="product-subtitle">Информации о БЖУ нет</p>
                 </div>
                 <div class="product-action">
                   <ion-icon :icon="addOutline"></ion-icon>
                 </div>
               </div>
             </div>
           </div>
         </div>

        <!-- Переключатель дней недели -->
        <div class="week-selector">
          <div class="week-header">
            <h2>Неделя</h2>
            <div class="week-nav">
              <button type="button" class="nav-btn" @click="previousWeek">
                <ion-icon :icon="chevronBackOutline"></ion-icon>
              </button>
              <span class="week-range">{{ getWeekRange() }}</span>
              <button type="button" class="nav-btn" @click="nextWeek">
                <ion-icon :icon="chevronForwardOutline"></ion-icon>
              </button>
            </div>
          </div>
          <div class="days-grid">
            <div 
              v-for="(day, idx) in weekDays" 
              :key="idx" 
              class="day-card"
              :class="{ active: idx === selectedDayIndex, today: isToday(idx) }"
              @click="selectedDayIndex = idx"
            >
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.date }}</div>
              <div class="day-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: getDayProgress(idx) + '%' }"></div>
                </div>
                <span class="progress-text">{{ getDayMealsCount(idx) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- План питания на день -->
        <div class="daily-plan">
          <div class="plan-header">
            <h2>План на {{ getSelectedDayName() }}</h2>
            <button type="button" class="add-meal-btn" @click="showMealSelector = true">
              <ion-icon :icon="addOutline"></ion-icon>
              Добавить
            </button>
          </div>

          <!-- Пустое состояние -->
          <div v-if="currentMenu.length === 0" class="empty-state">
            <div class="empty-icon">
              <ion-icon :icon="restaurantOutline"></ion-icon>
            </div>
            <h3>План питания пуст</h3>
            <p>Добавьте блюда в свой план питания на этот день</p>
            <button type="button" class="primary-btn" @click="showMealSelector = true">
              <ion-icon :icon="addOutline"></ion-icon>
              Добавить блюдо
            </button>
          </div>

                     <!-- Список приёмов пищи -->
           <div v-else class="meals-list">
             <div 
               v-for="(meal, idx) in currentMenu" 
               :key="'meal-' + idx"
               class="meal-card"
               :class="{ completed: meal.completed }"
             >
               <!-- Верхняя часть карточки -->
               <div class="meal-header">
                 <div class="meal-type-badge">
                   <ion-icon :icon="getMealIcon(meal.type)"></ion-icon>
                   <span>{{ meal.type }}</span>
                 </div>
                 <div class="meal-time-badge">
                   <ion-icon :icon="timeOutline"></ion-icon>
                   <span>{{ getMealTime(meal.type) }}</span>
                 </div>
               </div>
               
               <!-- Основное содержимое -->
               <div class="meal-body">
                 <div class="meal-info">
                   <h3 class="meal-title">{{ meal.name }}</h3>
                   <p class="meal-subtitle">{{ meal.description }}</p>
                 </div>
                 
                 <!-- Элементы приёма пищи -->
                 <div v-if="meal.items && meal.items.length > 0" class="meal-items">
                   <div class="items-header">
                     <h4>Продукты:</h4>
                   </div>
                   <div class="items-list">
                     <div 
                       v-for="item in meal.items" 
                       :key="item.id"
                       class="meal-item"
                     >
                       <div class="item-info">
                         <span class="item-name">
                           {{ item.product_name || item.free_text }}
                         </span>
                         <span v-if="item.grams" class="item-grams">
                           {{ item.grams }}г
                         </span>
                         <span v-else-if="item.servings" class="item-servings">
                           {{ item.servings }} порц.
                         </span>
                       </div>
                       <div class="item-nutrition">
                         <span class="nutrition-value">{{ item.calories }} ккал</span>
                         <span class="nutrition-value">{{ item.proteins }}г Б</span>
                         <span class="nutrition-value">{{ item.fats }}г Ж</span>
                         <span class="nutrition-value">{{ item.carbs }}г У</span>
                       </div>
                       <button 
                         type="button"
                         class="delete-item-btn"
                         @click="deleteMealItem(meal.id, item.id)"
                         title="Удалить продукт"
                       >
                         <ion-icon :icon="trashOutline"></ion-icon>
                       </button>
                     </div>
                   </div>
                 </div>
                 
                 <!-- Итоги приёма пищи -->
                 <div v-if="meal.totals" class="meal-totals">
                   <div class="totals-header">
                     <h4>Итого:</h4>
                   </div>
                   <div class="totals-grid">
                     <div class="total-item">
                       <span class="total-value">{{ meal.totals.calories }}</span>
                       <span class="total-label">ккал</span>
                     </div>
                     <div class="total-item">
                       <span class="total-value">{{ meal.totals.proteins }}</span>
                       <span class="total-label">Б</span>
                     </div>
                     <div class="total-item">
                       <span class="total-value">{{ meal.totals.fats }}</span>
                       <span class="total-label">Ж</span>
                     </div>
                     <div class="total-item">
                       <span class="total-value">{{ meal.totals.carbs }}</span>
                       <span class="total-label">У</span>
                     </div>
                     <div class="total-item">
                       <span class="total-value">{{ meal.totals.items_count }}</span>
                       <span class="total-label">продуктов</span>
                     </div>
                   </div>
                 </div>
                 
                 <div class="meal-stats">
                   <div class="calories-badge">
                     <ion-icon :icon="statsChartOutline"></ion-icon>
                     <span>{{ getMealCalories(meal) }} ккал</span>
                   </div>
                 </div>
               </div>
               
               <!-- Нижняя часть с действиями -->
               <div class="meal-footer">
                 <div class="meal-status">
                   <span v-if="meal.completed" class="status-completed">
                     <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                     Выполнено
                   </span>
                   <span v-else class="status-pending">
                     <ion-icon :icon="timeOutline"></ion-icon>
                     Ожидает
                   </span>
                 </div>
                 
                 <div class="meal-actions">
                   <button 
                     type="button"
                     class="action-btn complete-btn"
                     :class="{ completed: meal.completed }"
                     @click="toggleMeal(meal)"
                     :title="meal.completed ? 'Отменить выполнение' : 'Отметить как выполненное'"
                   >
                     <ion-icon :icon="meal.completed ? checkmarkCircleOutline : checkmarkOutline"></ion-icon>
                   </button>
                   <button 
                     type="button" 
                     class="action-btn delete-btn" 
                     @click="removeFromMenu(idx)"
                     title="Удалить блюдо"
                   >
                     <ion-icon :icon="trashOutline"></ion-icon>
                   </button>
                 </div>
               </div>
             </div>
           </div>
        </div>

        <!-- Селектор блюд -->
        <div v-if="showMealSelector" class="meal-selector-overlay" @click="showMealSelector = false">
          <div class="meal-selector" @click.stop>
            <div class="selector-header">
              <h3>Выберите блюдо</h3>
              <button type="button" class="close-btn" @click="showMealSelector = false">
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>
            
            <div class="selector-tabs">
              <button 
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === 'breakfast' }"
                @click="activeTab = 'breakfast'"
              >
                <ion-icon :icon="sunnyOutline"></ion-icon>
                Завтраки
              </button>
              <button 
                type="button"
                class="tab-btn"
                :class="{ active: activeTab === 'main' }"
                @click="activeTab = 'main'"
              >
                <ion-icon :icon="restaurantOutline"></ion-icon>
                Основные блюда
              </button>
            </div>

            <div class="meals-grid">
              <div 
                v-for="meal in getActiveMeals()" 
                :key="meal.id"
                class="meal-option"
                :class="{ added: isAdded(meal) }"
                @click="addToMenu(meal)"
              >
                <div class="meal-option-icon">
                  <ion-icon :icon="getMealIcon(meal.type)"></ion-icon>
                </div>
                <div class="meal-option-content">
                  <div class="meal-option-name">{{ meal.name }}</div>
                  <div class="meal-option-desc">{{ meal.description }}</div>
                  <div class="meal-option-calories">{{ getMealCalories(meal) }} ккал</div>
                </div>
                <div class="meal-option-status">
                  <ion-icon :icon="isAdded(meal) ? checkmarkCircleOutline : addOutline"></ion-icon>
                </div>
              </div>
            </div>
          </div>
                 </div>

         <!-- Модальное окно для выбора продукта -->
         <div v-if="selectedProductForMeal" class="product-modal-overlay" @click="resetProductForm">
           <div class="product-modal" @click.stop>
             <div class="modal-header">
               <h3>Добавить продукт</h3>
               <button type="button" class="close-btn" @click="resetProductForm">
                 <ion-icon :icon="closeOutline"></ion-icon>
               </button>
             </div>
             
             <div class="product-details">
               <div class="product-image-large">
                 <img 
                   :src="getProductImage(selectedProductForMeal.image, selectedProductForMeal.title)" 
                   :alt="selectedProductForMeal.title"
                   @error="handleImageError($event, selectedProductForMeal.title)"
                 >
               </div>
               <h4 class="product-title-large">{{ selectedProductForMeal.title }}</h4>
               
               <!-- Выбор типа приёма пищи -->
               <div class="meal-type-selector">
                 <h5>Выберите приём пищи:</h5>
                 <div class="meal-type-buttons">
                   <button 
                     type="button"
                     class="meal-type-btn"
                     :class="{ active: productMealTypeString === 'breakfast' }"
                     @click="productMealTypeString = 'breakfast'"
                   >
                     <ion-icon :icon="sunnyOutline"></ion-icon>
                     Завтрак
                   </button>
                   <button 
                     type="button"
                     class="meal-type-btn"
                     :class="{ active: productMealTypeString === 'lunch' }"
                     @click="productMealTypeString = 'lunch'"
                   >
                     <ion-icon :icon="restaurantOutline"></ion-icon>
                     Обед
                   </button>
                   <button 
                     type="button"
                     class="meal-type-btn"
                     :class="{ active: productMealTypeString === 'dinner' }"
                     @click="productMealTypeString = 'dinner'"
                   >
                     <ion-icon :icon="moonOutline"></ion-icon>
                     Ужин
                   </button>
                 </div>
               </div>
               
               <!-- Настройка количества -->
               <div class="quantity-selector">
                 <h5>Количество:</h5>
                 <div class="quantity-controls">
                   <button 
                     type="button"
                     class="quantity-btn"
                     @click="productServings = Math.max(1, productServings - 1)"
                   >
                     <ion-icon :icon="removeOutline"></ion-icon>
                   </button>
                   <span class="quantity-value">{{ productServings }}</span>
                   <button 
                     type="button"
                     class="quantity-btn"
                     @click="productServings++"
                   >
                     <ion-icon :icon="addOutline"></ion-icon>
                   </button>
                 </div>
                 <p class="quantity-info">
                   {{ Math.round((selectedProductForMeal.nutrition?.calories || 0) * productServings) }} ккал
                 </p>
               </div>
               
               <div v-if="selectedProductForMeal.nutrition" class="nutrition-details">
                 <div class="nutrition-item">
                   <span class="nutrition-label">Калории</span>
                   <span class="nutrition-value">
                     <ion-icon :icon="flameOutline"></ion-icon>
                     {{ Math.round((selectedProductForMeal.nutrition.calories || 0) * productServings) }}
                   </span>
                 </div>
                 <div class="nutrition-item">
                   <span class="nutrition-label">Белки</span>
                   <span class="nutrition-value">
                     <ion-icon :icon="barbellOutline"></ion-icon>
                     {{ Math.round(Number(selectedProductForMeal.nutrition.protein || 0) * productServings) }}г
                   </span>
                 </div>
                 <div class="nutrition-item">
                   <span class="nutrition-label">Жиры</span>
                   <span class="nutrition-value">
                     <ion-icon :icon="waterOutline"></ion-icon>
                     {{ Math.round(Number(selectedProductForMeal.nutrition.fat || 0) * productServings) }}г
                   </span>
                 </div>
                 <div class="nutrition-item">
                   <span class="nutrition-label">Углеводы</span>
                   <span class="nutrition-value">
                     <ion-icon :icon="leafOutline"></ion-icon>
                     {{ Math.round(Number(selectedProductForMeal.nutrition.carbs || 0) * productServings) }}г
                   </span>
                 </div>
               </div>
               
               <div class="modal-actions">
                 <button type="button" class="cancel-btn" @click="resetProductForm">
                   Отмена
                 </button>
                 <button type="button" class="add-product-btn" @click="addProductToMeal">
                   <ion-icon :icon="addOutline"></ion-icon>
                   Добавить в план
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     </ion-content>
   </ion-page>
 </template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { 
  sunnyOutline, 
  restaurantOutline, 
  addOutline, 
  closeOutline, 
  checkmarkCircleOutline, 
  checkmarkOutline, 
  statsChartOutline,
  chevronBackOutline,
  chevronForwardOutline,
  trashOutline,
  timeOutline,
  moonOutline,
  searchOutline,
  flameOutline,
  barbellOutline,
  waterOutline,
  leafOutline,
  removeOutline
} from 'ionicons/icons';
import { useUserStore } from '@/stores/user';
import api from '@/services/api/config';
import { NutritionService } from '@/services/api/nutritionService';
import { useWeekPlanStore } from '@/stores/weekPlanStore';
import { addIcons } from 'ionicons';
import { spoonacularService, SpoonacularProduct, SpoonacularProductInfo } from '@/services/api/spoonacularService';
import { debounce } from 'lodash';
import { MealApi } from '@/services/api/mealService';
import type { MealType, MealWithTotals, MealTotals } from '@/types/nutrition';

addIcons({
  'checkmark-circle-outline': checkmarkCircleOutline,
  'checkmark-outline': checkmarkOutline,
  'stats-chart-outline': statsChartOutline,
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'trash-outline': trashOutline,
  'time-outline': timeOutline,
  'moon-outline': moonOutline,
  'search-outline': searchOutline,
  'flame-outline': flameOutline,
  'barbell-outline': barbellOutline,
  'water-outline': waterOutline,
  'leaf-outline': leafOutline,
  'remove-outline': removeOutline
});

const selectedDayIndex = ref(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
const showMealSelector = ref(false);
const activeTab = ref('breakfast');
const currentWeekOffset = ref(0); // Добавляем смещение для навигации по неделям

// Поиск продуктов
const productSearchQuery = ref('');
const productSearchResults = ref<SpoonacularProduct[]>([]);
const showProductSearchResults = ref(false);
const productSearchLoading = ref(false);
const selectedProductForMeal = ref<SpoonacularProductInfo | null>(null);
const productMealTypeString = ref('breakfast');
const productServings = ref(1);

// Текущий приём и итоги
const currentMealId = ref<string | null>(null);
const currentMealTotals = ref<MealTotals | null>(null);
const currentMealType = ref<MealType>('breakfast');

const weekMenus = ref([[], [], [], [], [], [], []]);
const weekPlanStore = useWeekPlanStore();
const breakfasts = ref([]);
const mainMeals = ref([]);
const nutritionServiceInstance = new NutritionService();

// Получение дней недели с учетом смещения
const weekDays = computed(() => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayOfWeek);
  
  // Добавляем смещение недели
  monday.setDate(monday.getDate() + (currentWeekOffset.value * 7));
  
  return days.map((name, idx) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + idx);
    return {
      name,
      date: date.getDate(),
      fullDate: date.toISOString().split('T')[0]
    };
  });
});

// Получение текущего меню
const currentMenu = computed(() => {
  const date = getCurrentDateISO();
  const meals = weekPlanStore.getMealsForDate(date);
  if (meals && meals.length > 0) {
    return meals;
  }
  return weekMenus.value[selectedDayIndex.value];
});

// Получение даты в ISO формате
function getCurrentDateISO() {
  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayOfWeek);
  monday.setDate(monday.getDate() + (currentWeekOffset.value * 7));
  const date = new Date(monday);
  date.setDate(monday.getDate() + selectedDayIndex.value);
  return date.toISOString().split('T')[0];
}

// Получение текущей даты
function getCurrentDate() {
  return new Date().toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long' 
  });
}

// Получение диапазона недели
function getWeekRange() {
  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDayOfWeek);
  monday.setDate(monday.getDate() + (currentWeekOffset.value * 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return `${monday.getDate()} - ${sunday.getDate()} ${sunday.toLocaleDateString('ru-RU', { month: 'short' })}`;
}

// Проверка является ли день сегодняшним
function isToday(idx) {
  const today = new Date();
  const currentDayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  return idx === currentDayOfWeek && currentWeekOffset.value === 0;
}

// Получение прогресса дня
function getDayProgress(idx) {
  const date = weekDays.value[idx].fullDate;
  const meals = weekPlanStore.getMealsForDate(date);
  if (!meals || meals.length === 0) return 0;
  const completed = meals.filter(meal => meal.completed).length;
  return Math.round((completed / meals.length) * 100);
}

// Получение количества блюд на день
function getDayMealsCount(idx) {
  const date = weekDays.value[idx].fullDate;
  const meals = weekPlanStore.getMealsForDate(date);
  return meals ? meals.length : 0;
}

// Получение названия выбранного дня
function getSelectedDayName() {
  const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  return dayNames[selectedDayIndex.value];
}

// Получение иконки для типа приёма пищи
function getMealIcon(type) {
  switch(type) {
    case 'Завтрак': return sunnyOutline;
    case 'Обед': return restaurantOutline;
    case 'Ужин': return moonOutline;
    default: return timeOutline;
  }
}

// Получение времени приёма пищи
function getMealTime(type) {
  switch(type) {
    case 'Завтрак': return '8:00';
    case 'Обед': return '13:00';
    case 'Ужин': return '19:00';
    default: return '12:00';
  }
}

// Получение калорий блюда
function getMealCalories(meal) {
  return meal.calories || Math.floor(Math.random() * 300) + 200;
}

// Получение активных блюд для селектора
function getActiveMeals() {
  return activeTab.value === 'breakfast' ? breakfasts.value : mainMeals.value;
}

// Статистика
function getTotalCalories() {
  const completed = currentMenu.value.filter(meal => meal.completed);
  return completed.reduce((sum, meal) => sum + getMealCalories(meal), 0);
}

function getCompletedMeals() {
  return currentMenu.value.filter(meal => meal.completed).length;
}

function getTotalMeals() {
  return currentMenu.value.length;
}

function getProgressPercentage() {
  if (getTotalMeals() === 0) return 0;
  return Math.round((getCompletedMeals() / getTotalMeals()) * 100);
}

// Навигация по неделям
function previousWeek() {
  currentWeekOffset.value--;
}

function nextWeek() {
  currentWeekOffset.value++;
}

// Загрузка данных
onMounted(async () => {
  try {
    const response = await api.get('/ready-meals');
    breakfasts.value = response.data.data.breakfasts;
    mainMeals.value = response.data.data.mainMeals;
  } catch (error) {
    console.error('Ошибка при загрузке готовых блюд:', error);
  }
  weekPlanStore.loadWeekPlan();
});

function mapMealType(type: string): MealType {
  if (type === 'lunch') return 'lunch';
  if (type === 'dinner') return 'dinner';
  return 'breakfast';
}

async function ensureMealExists(dateIso: string, typeStr: string) {
  const apiType = mapMealType(typeStr);
  if (!currentMealId.value || currentMealType.value !== apiType) {
    currentMealType.value = apiType;
    const time = apiType === 'breakfast' ? '08:00' : apiType === 'lunch' ? '13:00' : '19:00';
    const created = await MealApi.createMeal({ name: apiType, type: apiType, date: dateIso, time, completed: false });
    currentMealId.value = created.meal.id;
    currentMealTotals.value = created.totals;
  } else {
    try {
      const data: MealWithTotals = await MealApi.getMeal(currentMealId.value);
      currentMealTotals.value = data.totals;
    } catch (_) {}
  }
}

// Добавление блюда в меню
async function addToMenu(meal) {
  // Используем новое API: добавляем как free_text позицию
  try {
    const date = getCurrentDateISO();
    // Маппинг типа приёма (русский -> API)
    const ruToApiType = (t: string): MealType => {
      if (t === 'Обед') return 'lunch';
      if (t === 'Ужин') return 'dinner';
      return 'breakfast';
    };
    const apiType = ruToApiType(meal.type);
    await ensureMealExists(date, apiType);
    if (!currentMealId.value) throw new Error('Не удалось получить приём пищи');

    const calories = typeof meal.calories === 'number' ? meal.calories : 0;
    const proteins = typeof meal.proteins === 'number' ? meal.proteins : 0;
    const fats = typeof meal.fats === 'number' ? meal.fats : 0;
    const carbs = typeof meal.carbs === 'number' ? meal.carbs : 0;

    const res = await MealApi.addMealItem(currentMealId.value, {
      free_text: meal.name,
      calories,
      proteins,
      fats,
      carbs
    });
    currentMealTotals.value = res.meal_totals;

    // Обновляем локальное состояние (минимально)
    weekMenus.value[selectedDayIndex.value].push({
      id: currentMealId.value,
      name: meal.name,
      mealType: apiType,
      time: getMealTime(meal.type),
      calories,
      proteins,
      fats,
      carbs,
      type: meal.type,
      description: meal.description || '',
      completed: false
    } as any);

    showMealSelector.value = false;
  } catch (error) {
    console.error('Ошибка при добавлении блюда:', error);
  }
}

// Удаление блюда из меню
function removeFromMenu(idx) {
  weekMenus.value[selectedDayIndex.value].splice(idx, 1);
}

// Проверка добавлено ли блюдо
function isAdded(meal) {
  const date = getCurrentDateISO();
  const meals = weekPlanStore.getMealsForDate(date);
  if (meals && meals.some(item => item.id === meal.id)) return true;
  return weekMenus.value[selectedDayIndex.value].some(item => item.id === meal.id);
}

// Переключение статуса блюда
async function toggleMeal(meal) {
  const date = getCurrentDateISO();
  try {
    await weekPlanStore.markAsCompleted(date, 'meal', meal.id);
    await weekPlanStore.loadWeekPlan();
  } catch (e) {
    console.error('Ошибка при изменении статуса приёма пищи:', e);
  }
}

// Удаление продукта из приёма пищи
async function deleteMealItem(mealId: string, itemId: number) {
  try {
    await MealApi.deleteMealItem(mealId, itemId);
    // Обновляем состояние через перезагрузку плана недели
    await weekPlanStore.loadWeekPlan();
  } catch (error) {
    console.error('Ошибка при удалении продукта из приёма пищи:', error);
  }
}

const userStore = useUserStore();

// Функции поиска продуктов
const debouncedProductSearch = debounce(async () => {
  const query = productSearchQuery.value.trim();
  if (query.length < 2) {
    productSearchResults.value = [];
    showProductSearchResults.value = false;
    return;
  }
  productSearchLoading.value = true;
  try {
    const results = await spoonacularService.searchProducts(query);
    productSearchResults.value = results.products;
    showProductSearchResults.value = true;
  } catch (error) {
    console.error('Ошибка поиска продуктов:', error);
  } finally {
    productSearchLoading.value = false;
  }
}, 500);

const handleProductSelect = async (product: SpoonacularProduct) => {
  productSearchLoading.value = true;
  try {
    const productInfo = await spoonacularService.getProductInfo(product.id);
    
    // Извлекаем правильные значения из nutrients массива
    if (productInfo.nutrition && productInfo.nutrition.nutrients) {
      const nutrients = productInfo.nutrition.nutrients;
      
      // Находим нужные нутриенты
      const caloriesNutrient = nutrients.find(n => n.name === 'Calories');
      const proteinNutrient = nutrients.find(n => n.name === 'Protein');
      const fatNutrient = nutrients.find(n => n.name === 'Fat');
      const carbsNutrient = nutrients.find(n => n.name === 'Carbohydrates');
      
      // Обновляем nutrition объект с правильными числовыми значениями
      productInfo.nutrition = {
        ...productInfo.nutrition,
        calories: caloriesNutrient ? caloriesNutrient.amount : 0,
        protein: proteinNutrient ? proteinNutrient.amount.toString() : '0',
        fat: fatNutrient ? fatNutrient.amount.toString() : '0',
        carbs: carbsNutrient ? carbsNutrient.amount.toString() : '0'
      };
    }
    
    selectedProductForMeal.value = productInfo;
    showProductSearchResults.value = false;
    productSearchQuery.value = '';
    showMealSelector.value = false; // Закрываем селектор блюд
  } catch (error) {
    console.error('Не удалось получить детали продукта:', error);
  } finally {
    productSearchLoading.value = false;
  }
};

const addProductToMeal = async () => {
  if (!selectedProductForMeal.value) return;
  
  try {
    const servings = productServings.value || 1;
    const { nutrition, title } = selectedProductForMeal.value;
    
    // Убеждаемся, что у нас есть правильные числовые значения
    const calories = typeof nutrition.calories === 'number' ? nutrition.calories : 0;
    const protein = typeof nutrition.protein === 'string' ? parseFloat(nutrition.protein) : (typeof nutrition.protein === 'number' ? nutrition.protein : 0);
    const fat = typeof nutrition.fat === 'string' ? parseFloat(nutrition.fat) : (typeof nutrition.fat === 'number' ? nutrition.fat : 0);
    const carbs = typeof nutrition.carbs === 'string' ? parseFloat(nutrition.carbs) : (typeof nutrition.carbs === 'number' ? nutrition.carbs : 0);
    
    const date = getCurrentDateISO();
    await ensureMealExists(date, productMealTypeString.value);
    if (!currentMealId.value) throw new Error('Не удалось создать приём пищи');

    const payload = {
      free_text: title,
      calories: Math.round(calories * servings),
      proteins: Math.round(protein * servings),
      fats: Math.round(fat * servings),
      carbs: Math.round(carbs * servings)
    } as const;

    const res = await MealApi.addMealItem(currentMealId.value, payload);
    currentMealTotals.value = res.meal_totals;
    
    // Обновляем локальное состояние
    weekMenus.value[selectedDayIndex.value].push({
      id: currentMealId.value,
      name: title,
      mealType: productMealTypeString.value,
      time: '',
      calories: payload.calories,
      proteins: payload.proteins,
      fats: payload.fats,
      carbs: payload.carbs,
      type: productMealTypeString.value === 'breakfast' ? 'Завтрак' : 
            productMealTypeString.value === 'lunch' ? 'Обед' : 'Ужин',
      description: `Порция: ${servings} шт.`,
      completed: false
    } as any);
    
    resetProductForm();
    showMealSelector.value = false;
  } catch (error) {
    console.error('Ошибка добавления продукта:', error);
  }
};

const resetProductForm = () => {
  selectedProductForMeal.value = null;
  productMealTypeString.value = 'breakfast';
  productServings.value = 1;
  productSearchQuery.value = '';
  productSearchResults.value = [];
  showProductSearchResults.value = false;
  currentMealId.value = null;
};

// Загрузка приёма пищи при смене дня
async function loadMealForDay(dateIso: string, typeStr: string) {
  try {
    const apiType = mapMealType(typeStr);
    // Здесь можно добавить логику поиска существующего приёма пищи
    // или создания нового, если нужно
  } catch (error) {
    console.error('Ошибка загрузки приёма пищи:', error);
  }
}

// Обновление при смене дня
watch(selectedDayIndex, async () => {
  const date = getCurrentDateISO();
  await loadMealForDay(date, 'breakfast'); // По умолчанию загружаем завтрак
});

// Обновление при смене недели
watch(currentWeekOffset, async () => {
  const date = getCurrentDateISO();
  await loadMealForDay(date, 'breakfast');
});

// Функция для получения fallback изображения
const getProductImage = (imageUrl: string | null | undefined, productName: string) => {
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '' || imageUrl === 'null') {
    return '/assets/images/product-placeholder.svg';
  }
  if (typeof imageUrl === 'string' && imageUrl.trim() === '') {
    return '/assets/images/product-placeholder.svg';
  }
  return imageUrl;
};

// Функция для обработки ошибок загрузки изображений
const handleImageError = (event: Event, productName: string) => {
  if (event.target instanceof HTMLImageElement) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/product-placeholder.svg';
    img.alt = `Изображение ${productName} недоступно`;
  } else if (event instanceof CustomEvent && event.detail) {
    const ionImg = event.target as any;
    if (ionImg && ionImg.src !== undefined) {
      ionImg.src = '/assets/images/product-placeholder.svg';
    }
  }
};
</script>

<style scoped>
.nutrition-container {
  padding: 16px;
  background: #1a191b;
  min-height: 100vh;
}

/* Статистика */
.stats-card {
  background: linear-gradient(135deg, #8560ff 0%, #813333 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
}

/* Поиск продуктов */
.search-container {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #2a2a2a;
  border-radius: 16px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  border-color: #8560ff;
  box-shadow: 0 0 0 4px rgba(133, 96, 255, 0.1);
}

.search-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.product-search-results {
  margin-top: 16px;
  background: #2a2a2a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-results-header h4 {
  margin: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.results-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.product-list {
  max-height: 300px;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.product-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-title {
  margin: 0 0 8px 0;
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-nutrition {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.nutrition-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(133, 96, 255, 0.2);
  color: #8560ff;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

.nutrition-chip ion-icon {
  font-size: 12px;
  color: #8560ff;
}

.product-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.product-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(133, 96, 255, 0.2);
  border-radius: 8px;
  color: #8560ff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.product-item:hover .product-action {
  background: #8560ff;
  color: white;
  transform: scale(1.1);
}

/* Модальное окно продукта */
.product-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end; /* bottom sheet */
  justify-content: center;
  z-index: 2000;
  padding: 0; /* убираем внешние отступы */
}

.product-modal {
  background: #2a2a2a;
  border-radius: 16px 16px 0 0; /* верхние углы */
  width: 100%;
  max-width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  padding-bottom: env(safe-area-inset-bottom, 12px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.product-details {
  padding: 12px 16px;
  text-align: center;
}

.product-title-large {
  margin: 8px 0 12px 0;
  color: white;
  font-size: 16px; /* компактнее */
  font-weight: 600;
  line-height: 1.3;
}

.meal-type-selector {
  margin-bottom: 12px;
}

.meal-type-buttons {
  display: grid; /* 3 равные колонки */
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.meal-type-btn {
  padding: 10px 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
}

.quantity-selector { margin-bottom: 12px; }
.quantity-controls { gap: 12px; }
.quantity-btn { width: 36px; height: 36px; border-radius: 10px; }
.quantity-value { font-size: 16px; min-width: 36px; }

.nutrition-details { gap: 8px; }
.nutrition-item { padding: 6px 10px; }
.nutrition-value { font-size: 11px; }

.modal-actions { padding: 12px 16px; }
.add-product-btn { width: 100%; }
.cancel-btn { width: 40%; }

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.stats-date {
  font-size: 14px;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* Селектор недели */
.week-selector {
  background: #2a2a2a;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.week-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  background: #1a191b;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.nav-btn:hover {
  background: #261c3a;
}

.week-range {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-card {
  background: #1a191b;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  color: white;
}

.day-card:hover {
  background: #261c3a;
}

.day-card.active {
  background: #8560ff;
  color: white;
  border-color: #8560ff;
}

.day-card.today {
  border-color: #34a853;
}

.day-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.day-date {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.day-progress {
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #34a853;
  transition: width 0.3s;
}

.day-card.active .progress-fill {
  background: white;
}

.progress-text {
  font-size: 10px;
  font-weight: 600;
}

/* План питания */
.daily-plan {
  background: #2a2a2a;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.plan-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.add-meal-btn {
  background: #8560ff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-meal-btn:hover {
  background: #6b4aff;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.empty-state p {
  margin: 0 0 24px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.primary-btn {
  background: #8560ff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: #6b4aff;
}

/* Список блюд */
.meals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meal-card {
  background: #2a2a2a;
  border-radius: 20px;
  padding: 0;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
}

.meal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.meal-card.completed {
  background: linear-gradient(135deg, #1a3a1a 0%, #1f4a1f 100%);
  border-color: #2fdd92;
}

.meal-card.completed::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2fdd92, #38e09c);
}

/* Верхняя часть карточки */
.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.meal-type-badge,
.meal-time-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #8560ff;
  background: rgba(133, 96, 255, 0.1);
}

.meal-type-badge ion-icon,
.meal-time-badge ion-icon {
  font-size: 14px;
}

.meal-card.completed .meal-type-badge,
.meal-card.completed .meal-time-badge {
  color: #2fdd92;
  background: rgba(47, 221, 146, 0.1);
}

/* Основное содержимое */
.meal-body {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.meal-info {
  flex: 1;
  min-width: 0;
}

.meal-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
  line-height: 1.3;
}

.meal-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.meal-items {
  flex: 1;
  min-width: 0;
}

.items-header {
  margin-bottom: 12px;
}

.items-header h4 {
  margin: 0;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-grams,
.item-servings {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.item-nutrition {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8560ff;
  font-weight: 600;
}

.delete-item-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.6);
}

.delete-item-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.delete-item-btn ion-icon {
  font-size: 18px;
}

.meal-totals {
  margin-top: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.totals-header {
  margin-bottom: 12px;
}

.totals-header h4 {
  margin: 0;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #8560ff;
}

.total-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}

.meal-stats {
  flex-shrink: 0;
}

.calories-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #8560ff, #a38fe4);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.calories-badge ion-icon {
  font-size: 14px;
}

.meal-card.completed .calories-badge {
  background: linear-gradient(135deg, #2fdd92, #38e09c);
}

/* Нижняя часть с действиями */
.meal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.meal-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-completed {
  color: #2fdd92;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-completed ion-icon {
  font-size: 14px;
}

.status-pending {
  color: #ff9800;
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-pending ion-icon {
  font-size: 14px;
}

.meal-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.action-btn:hover::before {
  opacity: 1;
}

.complete-btn {
  background: #f1f3f4;
  color: #5f6368;
}

.complete-btn:hover {
  background: #e8eaed;
  transform: scale(1.05);
}

.complete-btn.completed {
  background: #2fdd92;
  color: white;
}

.complete-btn.completed:hover {
  background: #29c786;
}

.delete-btn {
  background: #fce8e6;
  color: #d93025;
}

.delete-btn:hover {
  background: #fad2cf;
  transform: scale(1.05);
}

.delete-btn ion-icon {
  font-size: 16px;
}

/* Селектор блюд */
.meal-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.meal-selector {
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.selector-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #202124;
}

.close-btn {
  background: #f1f3f4;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.selector-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #202124;
}

.tab-btn.active {
  background: #8560ff;
  color: white;
}

.meals-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meal-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.meal-option:hover {
  background: #f1f3f4;
}

.meal-option.added {
  background: #e6f4ea;
  border-color: #34a853;
}

.meal-option-icon {
  font-size: 24px;
  color: #667eea;
}

.meal-option.added .meal-option-icon {
  color: #34a853;
}

.meal-option-content {
  flex: 1;
}

.meal-option-name {
  font-weight: 600;
  font-size: 16px;
  color: #202124;
  margin-bottom: 4px;
}

.meal-option-desc {
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 8px;
}

.meal-option-calories {
  font-size: 12px;
  color: #8560ff;
  font-weight: 600;
}

.meal-option-status {
  font-size: 20px;
  color: #5f6368;
}

.meal-option.added .meal-option-status {
  color: #2fdd92;
}

/* Темная тема - дополнительные стили */
.ion-palette-dark .meal-card {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ion-palette-dark .meal-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.ion-palette-dark .meal-card.completed {
  background: linear-gradient(135deg, #1a3a1a 0%, #1f4a1f 100%);
}

.ion-palette-dark .meal-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.ion-palette-dark .complete-btn {
  background: #1a191b;
  color: rgba(255, 255, 255, 0.6);
}

.ion-palette-dark .complete-btn:hover {
  background: #261c3a;
}

.ion-palette-dark .complete-btn.completed {
  background: #2fdd92;
  color: white;
}

.ion-palette-dark .complete-btn.completed:hover {
  background: #29c786;
}

.ion-palette-dark .delete-btn {
  background: #3d1a1a;
  color: #ff6b6b;
}

.ion-palette-dark .delete-btn:hover {
  background: #4d2222;
}

.ion-palette-dark .delete-btn ion-icon {
  color: #ff6b6b;
}

.ion-palette-dark .meal-selector {
  background: #261c3a;
}

.ion-palette-dark .selector-header h3 {
  color: white;
}

.ion-palette-dark .close-btn {
  background: #1a191b;
}

.ion-palette-dark .tab-btn {
  background: #1a191b;
  color: white;
}

.ion-palette-dark .meal-option {
  background: #1a191b;
}

.ion-palette-dark .meal-option:hover {
  background: #261c3a;
}

.ion-palette-dark .meal-option-name {
  color: white;
}

.ion-palette-dark .meal-option-desc {
  color: rgba(255, 255, 255, 0.6);
}

.ion-palette-dark .meal-option-status {
  color: rgba(255, 255, 255, 0.6);
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-value {
  color: white;
  font-size: 18px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
}

.quantity-info {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-align: center;
}

.meal-type-selector {
  margin-bottom: 20px;
}

.meal-type-selector h5 {
  margin: 0 0 12px 0;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.meal-type-buttons {
  display: flex;
  gap: 8px;
}

.meal-type-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.meal-type-btn:hover {
  border-color: rgba(133, 96, 255, 0.5);
  background: rgba(133, 96, 255, 0.1);
}

.meal-type-btn.active {
  border-color: #8560ff;
  background: rgba(133, 96, 255, 0.2);
  color: white;
}

.meal-type-btn ion-icon {
  font-size: 18px;
}
</style> 