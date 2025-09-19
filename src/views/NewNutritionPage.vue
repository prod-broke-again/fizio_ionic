<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Питание</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="nutrition-page-container">
        <!-- Переключатель недели -->
        <div class="week-switcher-container">
          <ion-button fill="clear" @click="previousWeek">
            <ion-icon :icon="chevronBackOutline"></ion-icon>
          </ion-button>
          <div class="week-display">
            <h3>{{ currentWeekText }}</h3>
          </div>
          <ion-button fill="clear" @click="nextWeek">
            <ion-icon :icon="chevronForwardOutline"></ion-icon>
          </ion-button>
        </div>

        <!-- Кнопки добавления -->
        <div class="top-add-buttons">
          <ion-button fill="clear" @click="showAddMealModal = true" class="add-button meal" title="Добавить прием пищи">
            <ion-icon :icon="addCircleOutline"></ion-icon>
            <span>Прием пищи</span>
          </ion-button>
          <ion-button fill="clear" @click="showAddProductModal = true" class="add-button product" title="Добавить продукт">
            <ion-icon :icon="restaurantOutline"></ion-icon>
            <span>Продукт</span>
          </ion-button>
          <ion-button fill="clear" @click="showBarcodeScanner = true" class="add-button scan" title="Сканировать штрих-код">
            <ion-icon :icon="scanOutline"></ion-icon>
            <span>Сканер</span>
          </ion-button>
        </div>

        <!-- Поиск продуктов -->
        <div class="search-container">
          <ion-searchbar
            v-model="productSearchQuery"
            placeholder="Поиск продуктов..."
            @ion-input="debouncedProductSearch"
            :debounce="500"
          ></ion-searchbar>
          
          <div v-if="showProductSearchResults && productSearchResults.length > 0" class="search-results">
            <ion-list>
              <ion-item 
                v-for="product in productSearchResults" 
                :key="product.id"
                @click="handleProductSelect(product)"
                button
              >
                <ion-thumbnail slot="start">
                  <ion-img 
                    :src="getProductImage(product.image, product.title)" 
                    :alt="product.title"
                    @ion-error="handleImageError($event, product.title)"
                  ></ion-img>
                </ion-thumbnail>
                <ion-label>
                  <h3>{{ product.title }}</h3>
                  <div v-if="product.nutrition && product.nutrition.calories" class="product-nutrition-info">
                    <ion-chip size="small">🔥{{ product.nutrition.calories }}</ion-chip>
                    <ion-chip size="small" v-if="product.nutrition.protein">💪{{ product.nutrition.protein }}</ion-chip>
                    <ion-chip size="small" v-if="product.nutrition.fat">💧{{ product.nutrition.fat }}</ion-chip>
                    <ion-chip size="small" v-if="product.nutrition.carbs">🌿{{ product.nutrition.carbs }}</ion-chip>
                  </div>
                  <p v-else class="product-subtitle">Информации о БЖУ нет</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </div>

        <!-- Заготовленные приемы пищи -->
        <div class="ready-meals-section">
          <div class="section-header">
            <ion-icon :icon="sunnyOutline" class="section-icon"></ion-icon>
            <h2>Готовые завтраки</h2>
          </div>
          <div class="carousel-list">
            <div v-for="meal in breakfasts" :key="meal.id" class="carousel-card">
              <div class="carousel-icon">
                <ion-icon :icon="sunnyOutline"></ion-icon>
              </div>
              <div class="carousel-title">{{ meal.name }}</div>
              <div class="carousel-desc">{{ meal.description }}</div>
              <ion-button expand="block" class="carousel-add-btn" @click="addReadyMeal(meal, 'breakfast')">
                <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                <span>Добавить</span>
              </ion-button>
            </div>
          </div>
        </div>

        <div class="ready-meals-section">
          <div class="section-header">
            <ion-icon :icon="restaurantOutline" class="section-icon"></ion-icon>
            <h2>Готовые блюда</h2>
          </div>
          <div class="carousel-list">
            <div v-for="meal in mainMeals" :key="meal.id" class="carousel-card">
              <div class="carousel-icon">
                <ion-icon :icon="restaurantOutline"></ion-icon>
              </div>
              <div class="carousel-title">{{ meal.name }}</div>
              <div class="carousel-desc">{{ meal.description }}</div>
              <ion-button expand="block" class="carousel-add-btn" @click="addReadyMeal(meal, 'lunch')">
                <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
                <span>Добавить</span>
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Выбор дня недели -->
        <div v-if="weekDays.length > 0" class="selected-day-content">
          <div class="day-selector">
            <ion-button
              v-for="(day, index) in weekDays"
              :key="day.date"
              :class="{'active': index === selectedDayIndex}"
              fill="clear"
              @click="selectedDayIndex = index"
            >
              {{ day.dayName.substring(0, 2) }}
              <span>{{ new Date(day.date).getDate() }}</span>
            </ion-button>
          </div>

          <!-- Контент выбранного дня -->
          <div v-if="selectedDay" class="day-content">
            <div v-if="loading" class="loading-container">
              <ion-spinner></ion-spinner>
              <p>Загрузка приемов пищи...</p>
            </div>
            <div v-else>
              <div v-if="selectedDay.meals && selectedDay.meals.length > 0" class="meals-cards-nutrition">
                <ion-card v-for="meal in selectedDay.meals" :key="meal.id" class="meal-card">
                  <ion-card-header>
                    <div class="meal-header">
                      <div class="meal-info">
                        <ion-card-title>{{ getMealTypeDisplayName(meal.mealType) }}</ion-card-title>
                        <ion-card-subtitle>{{ meal.time || 'Время не указано' }}</ion-card-subtitle>
                      </div>
                      <div class="meal-actions">
                        <ion-button fill="clear" @click="toggleMeal(String(meal.id))" :class="['action-button', { 'completed': meal.completed }]" title="Отметить">
                          <ion-icon :icon="meal.completed ? checkmarkCircle : checkmarkCircleOutline"></ion-icon>
                        </ion-button>
                        <ion-button fill="clear" @click="removeMeal(String(meal.id))" class="action-button delete" title="Удалить">
                          <ion-icon :icon="trashOutline"></ion-icon>
                        </ion-button>
                      </div>
                    </div>
                  </ion-card-header>
                  <ion-card-content>
                    <div class="meal-name">{{ meal.name }}</div>
                    <div class="nutrition-info">
                      <ion-chip>🔥 {{ meal.calories }} ккал</ion-chip>
                      <ion-chip>💪 {{ meal.proteins }}г</ion-chip>
                      <ion-chip>💧 {{ meal.fats }}г</ion-chip>
                      <ion-chip>🌿 {{ meal.carbs }}г</ion-chip>
                    </div>
                  </ion-card-content>
                </ion-card>
              </div>
              <div v-else class="no-meals">
                <div class="no-meals-icon">🍽️</div>
                <p>Нет приемов пищи на этот день.</p>
                <p>Добавьте что-нибудь вкусненькое!</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>Загрузка плана на неделю...</p>
        </div>
      </div>
    </ion-content>

    <!-- Модальное окно добавления приема пищи -->
    <div v-if="showAddMealModal" class="modal-overlay" @click="showAddMealModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Добавить прием пищи</h2>
          <button class="close-button" @click="showAddMealModal = false">×</button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="addMeal" class="add-meal-form">
            <div class="form-group">
              <label>Название</label>
              <input v-model="newMeal.name" placeholder="Овсянка с фруктами" required class="form-input">
            </div>
            <div class="form-group">
              <label>Тип</label>
              <select v-model="newMeal.mealType" required class="form-select">
                <option value="breakfast">Завтрак</option>
                <option value="lunch">Обед</option>
                <option value="dinner">Ужин</option>
                <option value="snack">Перекус</option>
              </select>
            </div>
            <div class="form-group">
              <label>Время</label>
              <input v-model="newMeal.time" type="time" class="form-input">
            </div>
            <div class="nutrition-grid">
              <div class="form-group">
                <label>Калории</label>
                <input v-model="newMeal.calories" type="number" placeholder="0" min="0" class="form-input">
              </div>
              <div class="form-group">
                <label>Белки (г)</label>
                <input v-model="newMeal.proteins" type="number" placeholder="0" min="0" class="form-input">
              </div>
              <div class="form-group">
                <label>Жиры (г)</label>
                <input v-model="newMeal.fats" type="number" placeholder="0" min="0" class="form-input">
              </div>
              <div class="form-group">
                <label>Углеводы (г)</label>
                <input v-model="newMeal.carbs" type="number" placeholder="0" min="0" class="form-input">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-button">Добавить</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления продукта -->
    <div v-if="showAddProductModal" class="modal-overlay" @click="showAddProductModal = false">
      <div class="modal product-modal" @click.stop>
        <div class="modal-header">
          <h2>Добавить продукт</h2>
          <button class="close-button" @click="showAddProductModal = false">×</button>
        </div>
        <div class="modal-content">
          <div class="product-search-section">
            <input v-model="productSearchQuery" @input="debouncedProductSearch" placeholder="Найти гречку, молоко..." class="search-input">
          </div>

          <div v-if="productSearchLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Поиск продуктов...</p>
          </div>

          <div v-else-if="showProductSearchResults && productSearchResults.length > 0" class="product-search-results">
            <div class="product-list">
              <div v-for="product in productSearchResults" :key="product.id" @click="handleProductSelect(product)" class="product-item">
                <div class="product-thumb">
                  <img 
                    :src="getProductImage(product.image, product.title)" 
                    :alt="product.title" 
                    class="product-image" 
                    @error="handleImageError($event, product.title)"
                  >
                </div>
                <div class="product-info">
                  <h3 class="product-title">{{ product.title }}</h3>
                  <div v-if="product.nutrition && product.nutrition.calories" class="product-nutrition-info">
                    <span class="nutrition-chip">🔥{{ product.nutrition.calories }}</span>
                    <span class="nutrition-chip" v-if="product.nutrition.protein">💪{{ product.nutrition.protein }}</span>
                    <span class="nutrition-chip" v-if="product.nutrition.fat">💧{{ product.nutrition.fat }}</span>
                    <span class="nutrition-chip" v-if="product.nutrition.carbs">🌿{{ product.nutrition.carbs }}</span>
                  </div>
                  <p v-else class="product-subtitle">Информации о БЖУ нет</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedProductForMeal" class="selected-product-section">
            <div class="product-card">
              <img 
                :src="getProductImage(selectedProductForMeal.image, selectedProductForMeal.title)" 
                :alt="selectedProductForMeal.title" 
                class="selected-product-image"
                @error="handleImageError($event, selectedProductForMeal.title)"
              >
              <div class="product-card-content">
                <h3 class="product-card-title">{{ selectedProductForMeal.title }}</h3>
                <div v-if="selectedProductForMeal.nutrition" class="nutrition-details">
                  <span class="nutrition-chip">🔥{{ selectedProductForMeal.nutrition.calories }} ккал</span>
                  <span class="nutrition-chip">💪{{ selectedProductForMeal.nutrition.protein }}</span>
                  <span class="nutrition-chip">💧{{ selectedProductForMeal.nutrition.fat }}</span>
                  <span class="nutrition-chip">🌿{{ selectedProductForMeal.nutrition.carbs }}</span>
                </div>
              </div>
            </div>

            <form @submit.prevent="addProductToMeal" class="nutrition-inputs">
              <div class="form-group">
                <label>Тип приема пищи</label>
                <select v-model="productMealTypeString" class="form-select">
                  <option value="breakfast">Завтрак</option>
                  <option value="lunch">Обед</option>
                  <option value="dinner">Ужин</option>
                  <option value="snack">Перекус</option>
                </select>
              </div>
              <div class="form-group">
                <label>Количество (порций)</label>
                <input v-model.number="productServings" type="number" placeholder="1" min="0.1" step="0.1" class="form-input">
              </div>
              <button type="submit" class="submit-button">Добавить в план</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно сканера -->
    <div v-if="showBarcodeScanner" class="modal-overlay" @click="showBarcodeScanner = false">
      <div class="modal scanner-modal" @click.stop>
        <div class="modal-header">
          <h2>Сканер штрих-кода</h2>
          <button class="close-button" @click="showBarcodeScanner = false">×</button>
        </div>
        <div class="modal-content">
          <div class="scanner-placeholder">
            <ion-icon :icon="scanOutline" class="scanner-icon"></ion-icon>
            <h3>Наведите камеру на штрих-код</h3>
            <p>(Функция в разработке)</p>
            <button @click="simulateBarcodeScan" class="submit-button">Симулировать сканирование</button>
          </div>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonButton, IonIcon, IonSpinner, IonSearchbar, IonList, IonItem, IonThumbnail, IonImg, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonLabel, toastController } from '@ionic/vue';
import {
  addCircleOutline, restaurantOutline, scanOutline, chevronBackOutline,
  chevronForwardOutline, checkmarkCircle, checkmarkCircleOutline, trashOutline,
  sunnyOutline, imageOutline
} from 'ionicons/icons';
import { WeekPlanService } from '@/services/api/weekPlanService';
import { NutritionService } from '@/services/api/nutritionService';
import { spoonacularService, SpoonacularProduct, SpoonacularProductInfo } from '@/services/api/spoonacularService';
import type { WeekPlanDayType as WeekPlanDay, WeekPlanMealType as WeekPlanMeal } from '@/services/api/weekPlanService';
import { debounce } from 'lodash';
import api from '@/services/api/config';

// Создание экземпляров сервисов
const weekPlanService = new WeekPlanService();
const nutritionService = new NutritionService();

// Типы
interface NewMealForm {
  name: string;
  mealType: string;
  time: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

// Состояние
const loading = ref(false);
const productSearchLoading = ref(false);
const weekDays = ref<WeekPlanDay[]>([]);
const selectedDayIndex = ref(new Date().getDay() || 6); // Сегодняшний день
const currentWeekStart = ref(getStartOfWeek(new Date()));

// Модальные окна
const showAddMealModal = ref(false);
const showAddProductModal = ref(false);
const showBarcodeScanner = ref(false);

// Формы
const newMeal = ref<NewMealForm>({
  name: '', mealType: 'breakfast', time: '',
  calories: 0, proteins: 0, fats: 0, carbs: 0
});

// Поиск продуктов
const productSearchQuery = ref('');
const productSearchResults = ref<SpoonacularProduct[]>([]);
const showProductSearchResults = ref(false);
const selectedProductForMeal = ref<SpoonacularProductInfo | null>(null);
const productMealTypeString = ref('breakfast');
const productServings = ref(1);

// Заготовленные приемы пищи
const breakfasts = ref([]);
const mainMeals = ref([]);

// Вычисляемые свойства
const selectedDay = computed(() => weekDays.value[selectedDayIndex.value]);
const currentWeekText = computed(() => {
  const start = currentWeekStart.value;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const format = { day: 'numeric', month: 'short' } as const;
  return `${start.toLocaleDateString('ru-RU', format)} - ${end.toLocaleDateString('ru-RU', format)}`;
});

// Функции
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник - первый день
  return new Date(d.setDate(diff));
}

// Функция для получения fallback изображения
const getProductImage = (imageUrl: string | null | undefined, productName: string) => {
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '' || imageUrl === 'null') {
    return '/assets/images/product-placeholder.svg';
  }
  // Проверяем, что URL не содержит только пробелы
  if (typeof imageUrl === 'string' && imageUrl.trim() === '') {
    return '/assets/images/product-placeholder.svg';
  }
  return imageUrl;
};

// Функция для обработки ошибок загрузки изображений
const handleImageError = (event: Event, productName: string) => {
  // Обработка для обычных img элементов
  if (event.target instanceof HTMLImageElement) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/product-placeholder.svg';
    img.alt = `Изображение ${productName} недоступно`;
  }
  // Обработка для ion-img элементов (CustomEvent)
  else if (event instanceof CustomEvent && event.detail) {
    const ionImg = event.target as any;
    if (ionImg && ionImg.src !== undefined) {
      ionImg.src = '/assets/images/product-placeholder.svg';
    }
  }
};

const loadWeekPlan = async () => {
  loading.value = true;
  try {
    const plan = await weekPlanService.getWeekPlan(currentWeekStart.value);
    weekDays.value = plan;
    // Устанавливаем сегодняшний день, если он в текущей неделе
    const today = new Date();
    if (today >= currentWeekStart.value && today <= new Date(currentWeekStart.value.getTime() + 6 * 24 * 60 * 60 * 1000)) {
        selectedDayIndex.value = today.getDay() === 0 ? 6 : today.getDay() - 1;
    }
  } catch (error) {
    console.error('Ошибка загрузки недельного плана:', error);
    showToast('Не удалось загрузить план питания.', 'danger');
  } finally {
    loading.value = false;
  }
};

const previousWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() - 7);
  loadWeekPlan();
};

const nextWeek = () => {
  currentWeekStart.value.setDate(currentWeekStart.value.getDate() + 7);
  loadWeekPlan();
};

const getMealTypeDisplayName = (mealType: string) => ({
  breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус'
}[mealType] || mealType);

const addMeal = async () => {
  if (!selectedDay.value || !newMeal.value.name) return showToast('Заполните название приема пищи.', 'warning');
  try {
    await nutritionService.addMeal(selectedDay.value.date, newMeal.value);
    showAddMealModal.value = false;
    newMeal.value = { name: '', mealType: 'breakfast', time: '', calories: 0, proteins: 0, fats: 0, carbs: 0 };
    await loadWeekPlan();
    showToast('Прием пищи добавлен.', 'success');
  } catch (error) {
    showToast('Ошибка добавления приема пищи.', 'danger');
  }
};

const toggleMeal = async (mealId: string) => {
  try {
    await nutritionService.toggleMeal(selectedDay.value.date, mealId);
    const meal = selectedDay.value.meals.find(m => String(m.id) === mealId);
    if(meal) meal.completed = !meal.completed;
  } catch (error) {
    showToast('Ошибка обновления статуса.', 'danger');
  }
};

const removeMeal = async (mealId: string) => {
  try {
    await nutritionService.removeMeal(selectedDay.value.date, mealId);
    selectedDay.value.meals = selectedDay.value.meals.filter(m => String(m.id) !== mealId);
    showToast('Прием пищи удален.', 'success');
  } catch (error) {
    showToast('Ошибка удаления приема пищи.', 'danger');
  }
};

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
    showToast('Ошибка поиска продуктов.', 'danger');
  } finally {
    productSearchLoading.value = false;
  }
}, 500);

const handleProductSelect = async (product: SpoonacularProduct) => {
  productSearchLoading.value = true;
  try {
    const productInfo = await spoonacularService.getProductInfo(product.id);
    selectedProductForMeal.value = productInfo;
    showProductSearchResults.value = false;
    productSearchQuery.value = '';
  } catch (error) {
    showToast('Не удалось получить детали продукта.', 'danger');
  } finally {
    productSearchLoading.value = false;
  }
};

const addProductToMeal = async () => {
  if (!selectedProductForMeal.value || !selectedDay.value) return;
  try {
    const servings = productServings.value || 1;
    const { nutrition, title } = selectedProductForMeal.value;
    const mealData = {
      name: title,
      mealType: productMealTypeString.value,
      time: '',
      calories: Math.round((nutrition.calories || 0) * servings),
      proteins: Math.round(parseFloat(nutrition.protein || '0') * servings),
      fats: Math.round(parseFloat(nutrition.fat || '0') * servings),
      carbs: Math.round(parseFloat(nutrition.carbs || '0') * servings),
    };
    await nutritionService.addMeal(selectedDay.value.date, mealData);
    resetProductForm();
    await loadWeekPlan();
    showToast('Продукт добавлен в план.', 'success');
  } catch (error) {
    showToast('Ошибка добавления продукта.', 'danger');
  }
};

const simulateBarcodeScan = async () => {
  showBarcodeScanner.value = false;
  showAddProductModal.value = true;
  productSearchLoading.value = true;
  try {
    const productInfo = await spoonacularService.getProductByBarcode('049000050103'); // Sprite
    selectedProductForMeal.value = productInfo;
    showToast('Продукт найден по штрих-коду.', 'success');
  } catch (error) {
    showToast('Продукт не найден.', 'danger');
  } finally {
    productSearchLoading.value = false;
  }
};

const resetProductForm = () => {
  selectedProductForMeal.value = null;
  productMealTypeString.value = 'breakfast';
  productServings.value = 1;
  showAddProductModal.value = false;
};

const showToast = async (message: string, color: 'success' | 'danger' | 'warning') => {
  const toast = await toastController.create({ message, duration: 2000, color, position: 'top' });
  toast.present();
};

// Функция добавления заготовленного приема пищи
const addReadyMeal = async (meal: any, mealType: string) => {
  if (!selectedDay.value) return showToast('Выберите день недели.', 'warning');
  
  try {
    const mealData = {
      name: meal.name,
      mealType: mealType,
      time: '',
      calories: meal.calories || 0,
      proteins: meal.proteins || 0,
      fats: meal.fats || 0,
      carbs: meal.carbs || 0,
    };
    
    await nutritionService.addMeal(selectedDay.value.date, mealData);
    await loadWeekPlan();
    showToast('Прием пищи добавлен.', 'success');
  } catch (error) {
    showToast('Ошибка добавления приема пищи.', 'danger');
  }
};

// Загрузка заготовленных приемов пищи
const loadReadyMeals = async () => {
  try {
    const response = await api.get('/ready-meals');
    const data = response.data;
    breakfasts.value = data.data.breakfasts || [];
    mainMeals.value = data.data.mainMeals || [];
  } catch (error) {
    console.error('Ошибка загрузки заготовленных приемов пищи:', error);
  }
};

onMounted(() => {
  loadWeekPlan();
  loadReadyMeals();
});
</script>

<style scoped>
/* Общие стили страницы */
.nutrition-page-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

/* Переключатель недели */
.week-switcher-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  background: var(--ion-background-color);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.week-display h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--ion-text-color);
}

/* Кнопки добавления */
.top-add-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.add-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--ion-background-color);
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ion-text-color);
  min-height: 80px;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.add-button.meal {
  color: var(--ion-color-success);
}

.add-button.product {
  color: var(--ion-color-primary);
}

.add-button.scan {
  color: var(--ion-color-warning);
}

/* Поиск продуктов */
.search-container {
  margin-bottom: 20px;
}

/* Выбор дня */
.day-selector {
  display: flex;
  justify-content: space-between;
  background: var(--ion-background-color);
  border-radius: 25px;
  padding: 5px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.day-selector ion-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  background: transparent;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ion-color-medium);
  cursor: pointer;
  transition: all 0.3s;
  min-width: 50px;
  flex-shrink: 0;
}

.day-selector ion-button span {
  font-size: 16px;
  font-weight: 700;
  margin-top: 2px;
}

.day-selector ion-button.active {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Карточки приемов пищи */
.meal-card {
  background: var(--ion-background-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.meal-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.meal-info .meal-time {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 4px 0 0 0;
}

.meal-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: var(--ion-color-medium);
  padding: 4px;
}

.action-button.completed {
  color: var(--ion-color-success);
}

.action-button.delete {
  color: var(--ion-color-danger);
}

.meal-name {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--ion-text-color);
}

.nutrition-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--ion-color-medium);
}

.nutrition-chip {
  background: var(--ion-color-light-shade);
  color: var(--ion-text-color);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.no-meals {
  text-align: center;
  padding: 40px 20px;
  color: var(--ion-color-medium);
}

.no-meals-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Загрузчик */
.loading-container {
  text-align: center;
  padding: 40px;
}

/* Заготовленные приемы пищи */
.ready-meals-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 24px;
  margin-right: 8px;
  color: var(--ion-color-primary);
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.carousel-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-list::-webkit-scrollbar {
  display: none;
}

.carousel-card {
  background: var(--ion-background-color);
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.carousel-icon {
  text-align: center;
  margin-bottom: 12px;
  font-size: 32px;
  color: var(--ion-color-primary);
}

.carousel-title {
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
  color: var(--ion-text-color);
}

.carousel-desc {
  font-size: 13px;
  color: var(--ion-color-medium);
  text-align: center;
  margin-bottom: 16px;
}

.carousel-add-btn {
  width: 100%;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
}

.modal, .product-modal, .scanner-modal {
  background: var(--ion-background-color);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--ion-border-color);
  background: var(--ion-color-light);
  border-radius: 15px 15px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--ion-color-medium);
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: var(--ion-color-light-shade);
}

.modal-content {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

.add-meal-form, .nutrition-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 5px;
  font-weight: 500;
}

.form-input, .form-select {
  padding: 12px 15px;
  border: 1px solid var(--ion-border-color);
  border-radius: 10px;
  font-size: 16px;
  color: var(--ion-text-color);
  background: var(--ion-background-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 2px rgba(var(--ion-color-primary-rgb), 0.2);
}

.nutrition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-actions {
  margin-top: 20px;
}

.submit-button {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-end;
  width: 100%;
  max-width: 200px;
}

.submit-button:hover {
  background-color: var(--ion-color-primary-shade);
}

.submit-button:disabled {
  background-color: var(--ion-color-medium);
  cursor: not-allowed;
}

/* Поиск продуктов */
.product-search-section {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--ion-border-color);
  border-radius: 10px;
  font-size: 16px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 2px rgba(var(--ion-color-primary-rgb), 0.2);
}

.product-search-results .product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-search-results .product-item {
  display: flex;
  align-items: center;
  background: var(--ion-color-light-shade);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid var(--ion-border-color);
}

.product-search-results .product-item:hover {
  background-color: var(--ion-color-light);
}

.product-search-results .product-item .product-thumb {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-search-results .product-item .product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-search-results .product-item .product-info {
  margin-left: 15px;
  flex-grow: 1;
}

.product-search-results .product-item .product-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--ion-text-color);
}

.product-search-results .product-item .product-subtitle {
  font-size: 12px;
  color: var(--ion-color-medium);
}

.product-search-results .product-item .product-nutrition-info {
  display: flex;
  gap: 8px;
  margin-top: 5px;
  flex-wrap: wrap;
}

.product-search-results .product-item .nutrition-chip {
  background: var(--ion-color-light);
  color: var(--ion-text-color);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.selected-product-section {
  margin-top: 20px;
  text-align: center;
}

.selected-product-image {
  max-width: 150px;
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
}

.nutrition-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: end;
  margin-bottom: 16px;
}

.product-card {
  background: var(--ion-color-light-shade);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-card .product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
}

.product-card .product-card-content {
  flex-grow: 1;
}

.product-card .product-card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ion-text-color);
}

.product-card .nutrition-details {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.product-card .nutrition-chip {
  background: var(--ion-color-light);
  color: var(--ion-text-color);
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

/* Сканер */
.scanner-placeholder {
  text-align: center;
  padding: 30px;
}

.scanner-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

/* Стили для fallback изображений */
.product-image, .selected-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: var(--ion-color-light-shade);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image[src*="product-placeholder"], 
.selected-product-image[src*="product-placeholder"] {
  background: var(--ion-color-light-shade);
  border: 1px solid var(--ion-border-color);
}

.product-image[src*="product-placeholder"]::before,
.selected-product-image[src*="product-placeholder"]::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: var(--ion-color-light-shade);
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
}

.product-thumb {
  position: relative;
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--ion-color-light-shade);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-thumb::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--ion-color-light-shade);
  border-radius: 8px;
  z-index: 1;
}

.product-thumb img {
  position: relative;
  z-index: 2;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .nutrition-page-container {
    padding: 12px;
  }
  
  .top-add-buttons {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  
  .add-button {
    padding: 8px 4px;
    font-size: 11px;
    min-height: 70px;
  }
  
  .day-selector {
    padding: 3px;
  }
  
  .day-selector ion-button {
    padding: 6px 8px;
    font-size: 11px;
    min-width: 40px;
  }
  
  .day-selector ion-button span {
    font-size: 14px;
  }
  
  .carousel-card {
    min-width: 160px;
    padding: 12px;
  }
  
  .carousel-title {
    font-size: 14px;
  }
  
  .carousel-desc {
    font-size: 12px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .nutrition-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .product-search-results .product-item .product-thumb {
    width: 40px;
    height: 40px;
  }
  
  .product-search-results .product-item .product-title {
    font-size: 14px;
  }
  
  .product-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .product-card .product-image {
    width: 60px;
    height: 60px;
  }
  
  .product-card .nutrition-details {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .nutrition-page-container {
    padding: 8px;
  }
  
  .week-switcher-container {
    padding: 6px;
  }
  
  .week-display h3 {
    font-size: 14px;
  }
  
  .top-add-buttons {
    gap: 4px;
  }
  
  .add-button {
    padding: 6px 2px;
    font-size: 10px;
    min-height: 60px;
  }
  
  .day-selector ion-button {
    padding: 4px 6px;
    font-size: 10px;
    min-width: 35px;
  }
  
  .day-selector ion-button span {
    font-size: 12px;
  }
  
  .carousel-card {
    min-width: 140px;
    padding: 10px;
  }
  
  .carousel-title {
    font-size: 13px;
  }
  
  .carousel-desc {
    font-size: 11px;
  }
  
  .modal-content {
    padding: 12px;
  }
  
  .form-input, .form-select {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .submit-button {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
