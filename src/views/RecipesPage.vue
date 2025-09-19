<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Рецепты</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="recipes-page-container">
        <!-- Поиск рецептов -->
        <div class="search-section">
          <ion-searchbar
            v-model="searchQuery"
            @ionInput="handleSearch"
            placeholder="Поиск рецептов..."
            :debounce="500"
          ></ion-searchbar>
          
          <!-- Фильтры -->
          <div class="filters-section">
            <ion-segment v-model="selectedFilter" @ionChange="applyFilters">
              <ion-segment-button value="all">
                <ion-label>Все</ion-label>
              </ion-segment-button>
              <ion-segment-button value="quick">
                <ion-label>Быстрые</ion-label>
              </ion-segment-button>
              <ion-segment-button value="healthy">
                <ion-label>Здоровые</ion-label>
              </ion-segment-button>
              <ion-segment-button value="popular">
                <ion-label>Популярные</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>
        </div>

        <!-- Результаты поиска -->
        <div v-if="recipes.length > 0" class="recipes-grid">
          <ion-card
            v-for="recipe in recipes"
            :key="recipe.id"
            class="recipe-card"
            @click="showRecipeDetails(recipe)"
          >
            <ion-img
              v-if="recipe.image"
              :src="recipe.image"
              :alt="recipe.title"
              class="recipe-image"
            ></ion-img>
            <div v-else class="recipe-placeholder">
              <ion-icon :icon="restaurantOutline"></ion-icon>
            </div>
            
            <ion-card-header>
              <ion-card-title>{{ recipe.title }}</ion-card-title>
              <ion-card-subtitle>
                <div class="recipe-meta">
                  <span class="time">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    {{ recipe.readyInMinutes }} мин
                  </span>
                  <span class="servings">
                    <ion-icon :icon="peopleOutline"></ion-icon>
                    {{ recipe.servings }} порций
                  </span>
                </div>
              </ion-card-subtitle>
            </ion-card-header>
            
            <ion-card-content>
              <div class="recipe-badges">
                <ion-chip
                  v-if="recipe.healthScore && recipe.healthScore > 80"
                  color="success"
                  size="small"
                >
                  Здоровый
                </ion-chip>
                <ion-chip
                  v-if="recipe.aggregateLikes && recipe.aggregateLikes > 100"
                  color="primary"
                  size="small"
                >
                  Популярный
                </ion-chip>
                <ion-chip
                  v-if="recipe.pricePerServing && recipe.pricePerServing < 200"
                  color="warning"
                  size="small"
                >
                  Экономичный
                </ion-chip>
              </div>
              
              <div v-if="recipe.nutrition" class="nutrition-preview">
                <span class="nutrition-item">
                  <ion-icon :icon="flameOutline"></ion-icon>
                  {{ recipe.nutrition.calories }} ккал
                </span>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Пустое состояние -->
        <div v-else-if="!loading" class="empty-state">
          <ion-icon :icon="restaurantOutline" class="empty-icon"></ion-icon>
          <h3>Начните поиск рецептов</h3>
          <p>Введите название блюда или ингредиенты для поиска рецептов</p>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Поиск рецептов...</p>
        </div>

        <!-- Кнопка "Загрузить еще" -->
        <div v-if="hasMoreResults && recipes.length > 0" class="load-more">
          <ion-button
            @click="loadMoreRecipes"
            expand="block"
            fill="outline"
            :disabled="loading"
          >
            Загрузить еще
          </ion-button>
        </div>
      </div>
    </ion-content>

    <!-- Модальное окно с деталями рецепта -->
    <ion-modal
      :is-open="showRecipeModal"
      @didDismiss="showRecipeModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ selectedRecipe?.title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showRecipeModal = false">Закрыть</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content v-if="selectedRecipe">
        <div class="recipe-details">
          <!-- Изображение рецепта -->
          <div v-if="selectedRecipe.image" class="recipe-detail-image">
            <ion-img :src="selectedRecipe.image" :alt="selectedRecipe.title"></ion-img>
          </div>
          
          <!-- Основная информация -->
          <div class="recipe-info">
            <div class="recipe-stats">
              <div class="stat-item">
                <ion-icon :icon="timeOutline"></ion-icon>
                <span>{{ selectedRecipe.readyInMinutes }} минут</span>
              </div>
              <div class="stat-item">
                <ion-icon :icon="peopleOutline"></ion-icon>
                <span>{{ selectedRecipe.servings }} порций</span>
              </div>
              <div v-if="selectedRecipe.aggregateLikes" class="stat-item">
                <ion-icon :icon="heartOutline"></ion-icon>
                <span>{{ selectedRecipe.aggregateLikes }} лайков</span>
              </div>
            </div>
            
            <!-- Бейджи -->
            <div class="recipe-badges-detailed">
              <ion-chip
                v-if="selectedRecipe.healthScore && selectedRecipe.healthScore > 80"
                color="success"
              >
                Здоровый ({{ selectedRecipe.healthScore }})
              </ion-chip>
              <ion-chip
                v-if="selectedRecipe.vegetarian"
                color="primary"
              >
                Вегетарианский
              </ion-chip>
              <ion-chip
                v-if="selectedRecipe.vegan"
                color="secondary"
              >
                Веганский
              </ion-chip>
              <ion-chip
                v-if="selectedRecipe.glutenFree"
                color="warning"
              >
                Без глютена
              </ion-chip>
            </div>
          </div>
          
          <!-- Пищевая ценность -->
          <div v-if="selectedRecipe.nutrition" class="nutrition-section">
            <h3>Пищевая ценность (на порцию)</h3>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="label">Калории:</span>
                <span class="value">{{ selectedRecipe.nutrition.calories }} ккал</span>
              </div>
              <div class="nutrition-item">
                <span class="label">Белки:</span>
                <span class="value">{{ selectedRecipe.nutrition.protein }}</span>
              </div>
              <div class="nutrition-item">
                <span class="label">Жиры:</span>
                <span class="value">{{ selectedRecipe.nutrition.fat }}</span>
              </div>
              <div class="nutrition-item">
                <span class="label">Углеводы:</span>
                <span class="value">{{ selectedRecipe.nutrition.carbs }}</span>
              </div>
            </div>
          </div>
          
          <!-- Ингредиенты -->
          <div v-if="selectedRecipe.extendedIngredients" class="ingredients-section">
            <h3>Ингредиенты</h3>
            <ion-list>
              <ion-item
                v-for="ingredient in selectedRecipe.extendedIngredients"
                :key="ingredient.id"
              >
                <ion-thumbnail slot="start" v-if="ingredient.image">
                  <ion-img :src="ingredient.image" :alt="ingredient.name"></ion-img>
                </ion-thumbnail>
                <ion-label>
                  <h4>{{ ingredient.original }}</h4>
                  <p v-if="ingredient.aisle">{{ ingredient.aisle }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
          
          <!-- Инструкции -->
          <div v-if="selectedRecipe.analyzedInstructions && selectedRecipe.analyzedInstructions.length > 0" class="instructions-section">
            <h3>Инструкции</h3>
            <div
              v-for="instruction in selectedRecipe.analyzedInstructions"
              :key="instruction.name"
              class="instruction-group"
            >
              <h4 v-if="selectedRecipe.analyzedInstructions.length > 1">{{ instruction.name }}</h4>
              <ol class="instruction-steps">
                <li
                  v-for="step in instruction.steps"
                  :key="step.number"
                  class="instruction-step"
                >
                  <div class="step-content">
                    <span class="step-number">{{ step.number }}</span>
                    <span class="step-text">{{ step.step }}</span>
                  </div>
                  
                  <!-- Ингредиенты для шага -->
                  <div v-if="step.ingredients && step.ingredients.length > 0" class="step-ingredients">
                    <ion-chip
                      v-for="ingredient in step.ingredients"
                      :key="ingredient.id"
                      size="small"
                      color="light"
                    >
                      {{ ingredient.name }}
                    </ion-chip>
                  </div>
                </li>
              </ol>
            </div>
          </div>
          
          <!-- Кнопки действий -->
          <div class="recipe-actions">
            <ion-button
              @click="addRecipeToMealPlan"
              expand="block"
              color="primary"
            >
              Добавить в план питания
            </ion-button>
            <ion-button
              @click="shareRecipe"
              expand="block"
              fill="outline"
              color="secondary"
            >
              Поделиться
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonImg,
  IonChip,
  IonModal,
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonSpinner,
  toastController
} from '@ionic/vue';
import {
  restaurantOutline,
  timeOutline,
  peopleOutline,
  heartOutline,
  flameOutline,
  shareOutline
} from 'ionicons/icons';
import { SpoonacularService, type SpoonacularRecipe } from '@/services/api/spoonacularService';

// Сервис
const spoonacularService = new SpoonacularService();

// Состояние
const loading = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('all');
const recipes = ref<SpoonacularRecipe[]>([]);
const currentPage = ref(1);
const hasMoreResults = ref(true);

// Модальное окно рецепта
const showRecipeModal = ref(false);
const selectedRecipe = ref<SpoonacularRecipe | null>(null);

// Методы
const handleSearch = async (event: CustomEvent) => {
  const query = event.detail.value?.trim();
  
  if (!query || query.length < 2) {
    recipes.value = [];
    return;
  }

  try {
    loading.value = true;
    currentPage.value = 1;
    
    const options = getSearchOptions();
    const response = await spoonacularService.searchRecipes(query, options);
    
    recipes.value = response.results;
    hasMoreResults.value = response.totalResults > response.results.length;
  } catch (error) {
    console.error('Ошибка поиска рецептов:', error);
    const toast = await toastController.create({
      message: 'Ошибка поиска рецептов',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  } finally {
    loading.value = false;
  }
};

const getSearchOptions = () => {
  const options: any = {
    number: 20
  };

  // Добавляем булевые параметры только если они нужны
  // По умолчанию API будет использовать свои значения по умолчанию
  // options.addRecipeNutrition = true;
  // options.instructionsRequired = true;

  switch (selectedFilter.value) {
    case 'quick':
      options.maxReadyTime = 30;
      break;
    case 'healthy':
      options.minProtein = 10;
      break;
    case 'popular':
      // Популярные рецепты обычно имеют больше лайков
      break;
  }

  return options;
};

const applyFilters = async () => {
  if (searchQuery.value.trim()) {
    await handleSearch({ detail: { value: searchQuery.value } } as CustomEvent);
  }
};

const loadMoreRecipes = async () => {
  if (!searchQuery.value.trim() || loading.value) return;

  try {
    loading.value = true;
    currentPage.value++;
    
    const options = {
      ...getSearchOptions(),
      offset: (currentPage.value - 1) * 20
    };
    
    const response = await spoonacularService.searchRecipes(searchQuery.value, options);
    
    recipes.value.push(...response.results);
    hasMoreResults.value = response.totalResults > recipes.value.length;
  } catch (error) {
    console.error('Ошибка загрузки дополнительных рецептов:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки рецептов',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  } finally {
    loading.value = false;
  }
};

const showRecipeDetails = async (recipe: SpoonacularRecipe) => {
  try {
    // Получаем полную информацию о рецепте
    const fullRecipe = await spoonacularService.getRecipeInfo(recipe.id);
    selectedRecipe.value = fullRecipe;
    showRecipeModal.value = true;
  } catch (error) {
    console.error('Ошибка получения деталей рецепта:', error);
    const toast = await toastController.create({
      message: 'Ошибка загрузки рецепта',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
};

const addRecipeToMealPlan = async () => {
  if (!selectedRecipe.value) return;

  try {
    // Здесь можно добавить логику для добавления рецепта в план питания
    const toast = await toastController.create({
      message: 'Рецепт добавлен в план питания',
      duration: 2000,
      color: 'success'
    });
    toast.present();
    showRecipeModal.value = false;
  } catch (error) {
    console.error('Ошибка добавления рецепта в план питания:', error);
    const toast = await toastController.create({
      message: 'Ошибка добавления рецепта',
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
};

const shareRecipe = async () => {
  if (!selectedRecipe.value) return;

  try {
    // Здесь можно добавить логику для шаринга рецепта
    const toast = await toastController.create({
      message: 'Функция шаринга в разработке',
      duration: 2000,
      color: 'warning'
    });
    toast.present();
  } catch (error) {
    console.error('Ошибка шаринга рецепта:', error);
  }
};

// Инициализация
onMounted(() => {
  // Можно загрузить популярные рецепты при загрузке страницы
});
</script>

<style scoped>
.recipes-page-container {
  padding: 16px;
}

.search-section {
  margin-bottom: 16px;
}

.filters-section {
  margin-top: 12px;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.recipe-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  height: 200px;
  object-fit: cover;
}

.recipe-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light-tint, #f8f8f8);
  color: var(--ion-color-medium, #666666);
}

.recipe-placeholder ion-icon {
  font-size: 48px;
  opacity: 0.5;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.recipe-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--ion-color-medium, #666666);
}

.recipe-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.nutrition-preview {
  margin-top: 12px;
}

.nutrition-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--ion-color-medium, #666666);
}

.empty-state {
  text-align: center;
  padding: 64px 16px;
  color: var(--ion-color-medium, #666666);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 16px;
}

.load-more {
  margin-top: 16px;
  padding: 0 16px;
}

.recipe-details {
  padding: 16px;
}

.recipe-detail-image {
  margin-bottom: 16px;
}

.recipe-detail-image ion-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.recipe-info {
  margin-bottom: 24px;
}

.recipe-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--ion-color-medium, #666666);
}

.recipe-badges-detailed {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.nutrition-section {
  margin-bottom: 24px;
}

.nutrition-section h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.nutrition-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--ion-color-light-tint, #f8f8f8);
}

.nutrition-item .label {
  font-weight: 500;
}

.nutrition-item .value {
  color: var(--ion-color-primary, #3880ff);
  font-weight: 600;
}

.ingredients-section {
  margin-bottom: 24px;
}

.ingredients-section h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

.instructions-section {
  margin-bottom: 24px;
}

.instructions-section h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

.instruction-group {
  margin-bottom: 16px;
}

.instruction-group h4 {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary, #3880ff);
}

.instruction-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.instruction-step {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--ion-color-light-tint, #f8f8f8);
  border-radius: 8px;
}

.step-content {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.step-number {
  background: var(--ion-color-primary, #3880ff);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  line-height: 1.5;
}

.step-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.recipe-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
</style> 