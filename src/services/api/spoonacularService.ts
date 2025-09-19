import api from './config';
import { productService } from './productService';

// Интерфейсы для продуктов
export interface SpoonacularProduct {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  badges?: string[];
  nutrition?: {
    calories?: number;
    protein?: string;
    fat?: string;
    carbs?: string;
  };
}

export interface SpoonacularProductInfo {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  badges?: string[];
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }>;
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    calories: number;
    fat: string;
    protein: string;
    carbs: string;
  };
  servings?: {
    number: number;
    size: number;
    unit: string;
  };
}

export interface SearchProductsResponse {
  products: SpoonacularProduct[];
  total: number;
}

// Интерфейсы для рецептов
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  servings: number;
  readyInMinutes: number;
  sourceName?: string;
  sourceUrl?: string;
  spoonacularSourceUrl?: string;
  aggregateLikes?: number;
  healthScore?: number;
  spoonacularScore?: number;
  pricePerServing?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  analyzedInstructions?: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients: Array<{
        id: number;
        name: string;
        localizedName: string;
        image: string;
      }>;
      equipment: Array<{
        id: number;
        name: string;
        localizedName: string;
        image: string;
      }>;
    }>;
  }>;
  extendedIngredients?: Array<{
    id: number;
    aisle: string;
    amount: number;
    unit: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }>;
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    calories: number;
    fat: string;
    protein: string;
    carbs: string;
  };
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  occasions?: string[];
  winePairing?: {
    pairedWines: string[];
    pairingText: string;
    productMatches: Array<{
      id: number;
      title: string;
      description: string;
      price: string;
      imageUrl: string;
      averageRating: number;
      ratingCount: number;
      score: number;
      link: string;
    }>;
  };
}

export interface SearchRecipesResponse {
  results: SpoonacularRecipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface RecipeByIngredientsResponse {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Array<{
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  usedIngredients: Array<{
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  unusedIngredients: Array<{
    id: number;
    amount: number;
    unit: string;
    unitLong: string;
    unitShort: string;
    aisle: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  likes: number;
}

// Интерфейсы для ингредиентов
export interface SpoonacularIngredient {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface IngredientInfo {
  id: number;
  original: string;
  originalName: string;
  name: string;
  nameClean: string;
  amount: number;
  unit: string;
  unitShort: string;
  unitLong: string;
  possibleUnits: string[];
  estimatedCost: {
    value: number;
    unit: string;
  };
  consistency: string;
  shoppingListUnits: string[];
  aisle: string;
  meta: string[];
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }>;
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    calories: number;
    fat: string;
    protein: string;
    carbs: string;
  };
  categoryPath: string[];
}

// Интерфейсы для планирования питания
export interface MealPlanDay {
  meals: Array<{
    id: number;
    imageType: string;
    title: string;
    readyInMinutes: number;
    servings: number;
    sourceUrl: string;
  }>;
  nutrients: {
    calories: number;
    protein: string;
    fat: string;
    carbohydrates: string;
  };
}

export interface MealPlanWeek {
  week: {
    [key: string]: MealPlanDay;
  };
}

export interface MealPlanGenerateResponse {
  meals: Array<{
    id: number;
    imageType: string;
    title: string;
    readyInMinutes: number;
    servings: number;
    sourceUrl: string;
  }>;
  nutrients: {
    calories: number;
    protein: string;
    fat: string;
    carbohydrates: string;
  };
}

// Интерфейсы для анализа питания
export interface RecipeAnalysisRequest {
  title: string;
  ingredients: string;
  instructions?: string;
}

export interface RecipeAnalysisResponse {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  gaps: string;
  preparationMinutes: number;
  cookingMinutes: number;
  aggregateLikes: number;
  healthScore: number;
  creditsText: string;
  license: string;
  sourceName: string;
  pricePerServing: number;
  extendedIngredients: Array<{
    id: number;
    aisle: string;
    amount: number;
    unit: string;
    name: string;
    original: string;
    originalName: string;
    meta: string[];
    image: string;
  }>;
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
  imageType: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  instructions: string;
  analyzedInstructions: Array<{
    name: string;
    steps: Array<{
      number: number;
      step: string;
      ingredients: Array<{
        id: number;
        name: string;
        localizedName: string;
        image: string;
      }>;
      equipment: Array<{
        id: number;
        name: string;
        localizedName: string;
        image: string;
      }>;
    }>;
  }>;
  originalId: number | null;
  spoonacularSourceUrl: string;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
      percentOfDailyNeeds?: number;
    }>;
    caloricBreakdown: {
      percentProtein: number;
      percentFat: number;
      percentCarbs: number;
    };
    calories: number;
    fat: string;
    protein: string;
    carbs: string;
  };
}

export interface NutritionGuessResponse {
  calories: number;
  carbs: string;
  fat: string;
  protein: string;
}

export interface CuisineClassificationResponse {
  cuisine: string;
  cuisines: string[];
  confidence: number;
}

export class SpoonacularService {
  private baseUrl = '/spoonacular';

  /**
   * Поиск продуктов в локальной базе данных (вспомогательный метод)
   */
  private async searchLocalProducts(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchProductsResponse> {
    try {
      console.log('Поиск в локальной базе данных...');
      const localResult = await productService.searchLocalProductsOnly(query, page, perPage);
      
      const spoonacularProducts = localResult.products.map(localProduct => {
        const imageUrl = localProduct.image_url || localProduct.image_small_url || '/assets/images/product-placeholder.svg';
        
        const nutrition = localProduct.nutriments ? {
          calories: localProduct.nutriments['energy-kcal_100g'] || 0,
          protein: localProduct.nutriments.proteins_100g ? `${localProduct.nutriments.proteins_100g}г` : undefined,
          fat: localProduct.nutriments.fat_100g ? `${localProduct.nutriments.fat_100g}г` : undefined,
          carbs: localProduct.nutriments.carbohydrates_100g ? `${localProduct.nutriments.carbohydrates_100g}г` : undefined
        } : undefined;
        
        return {
          id: localProduct.id,
          title: localProduct.product_name,
          image: imageUrl,
          imageType: 'svg',
          badges: localProduct.nutriscore_grade && localProduct.nutriscore_grade !== 'unknown' ? [localProduct.nutriscore_grade] : [],
          nutrition
        };
      });
      
      return {
        products: spoonacularProducts,
        total: localResult.total
      };
    } catch (localError) {
      console.error('Ошибка поиска в локальной базе данных:', localError);
      return {
        products: [],
        total: 0
      };
    }
  }

  /**
   * Поиск продуктов по текстовому запросу
   */
  async searchProducts(
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<SearchProductsResponse> {
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        page: page.toString(),
        per_page: perPage.toString()
      });

      const response = await api.get(`${this.baseUrl}/products/search?${params}`);
      
      if (response.status === 200) {
        const data = response.data;
        if (data.products.length === 0) {
          console.log('Нет товаров в Spoonacular, ищем в локальной базе данных...');
          return this.searchLocalProducts(query, page, perPage);
        }
        return data;
      } else {
        // При ошибке статуса, сразу ищем в локальной базе
        console.error(`Ошибка статуса от Spoonacular: ${response.status}, ищем в локальной базе.`);
        return this.searchLocalProducts(query, page, perPage);
      }
    } catch (error) {
      // При сетевой ошибке, также ищем в локальной базе
      console.error('Сетевая ошибка при поиске в Spoonacular, ищем в локальной базе:', error);
      return this.searchLocalProducts(query, page, perPage);
    }
  }

  /**
   * Получение информации о продукте по UPC (штрих-коду)
   */
  async getProductByBarcode(upc: string): Promise<SpoonacularProductInfo> {
    try {
      const response = await api.get(`${this.baseUrl}/products/upc/${upc}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Продукт не найден в Spoonacular');
      }
    } catch (error) {
      console.error('Ошибка в Spoonacular (штрих-код), ищем в локальной базе:', error);
      const localProduct = await productService.getLocalProductByBarcodeOnly(upc);
        
      if (localProduct) {
        const nutriments = localProduct.nutriments || {};
        return {
          id: localProduct.id,
          title: localProduct.product_name,
          image: localProduct.image_url || localProduct.image_small_url,
          imageType: 'jpg',
          badges: localProduct.nutriscore_grade ? [localProduct.nutriscore_grade] : [],
          nutrition: {
            nutrients: [],
            caloricBreakdown: {
              percentProtein: 0,
              percentFat: 0,
              percentCarbs: 0
            },
            calories: nutriments['energy-kcal_100g'] || 0,
            fat: `${nutriments.fat_100g || 0}g`,
            protein: `${nutriments.proteins_100g || 0}g`,
            carbs: `${nutriments.carbohydrates_100g || 0}g`
          }
        };
      }
      
      throw new Error('Продукт не найден ни в одной базе данных');
    }
  }

  /**
   * Получение детальной информации о продукте по ID
   */
  async getProductInfo(id: number): Promise<SpoonacularProductInfo> {
    try {
      const response = await api.get(`${this.baseUrl}/products/${id}/information`);
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Продукт не найден в Spoonacular');
      }
    } catch (error) {
      console.error('Ошибка в Spoonacular (инфо о продукте), ищем в локальной базе:', error);
      const localProduct = await productService.getLocalProductDetails(id);
        
      if (localProduct) {
        const nutriments = localProduct.nutriments || {};
        return {
          id: localProduct.id,
          title: localProduct.product_name,
          image: localProduct.image_url || localProduct.image_small_url,
          imageType: 'jpg',
          badges: localProduct.nutriscore_grade ? [localProduct.nutriscore_grade] : [],
          nutrition: {
            nutrients: [],
            caloricBreakdown: {
              percentProtein: 0,
              percentFat: 0,
              percentCarbs: 0
            },
            calories: nutriments['energy-kcal_100g'] || 0,
            fat: `${nutriments.fat_100g || 0}g`,
            protein: `${nutriments.proteins_100g || 0}g`,
            carbs: `${nutriments.carbohydrates_100g || 0}g`
          }
        };
      }
      
      throw new Error('Продукт не найден ни в одной базе данных');
    }
  }

  // ===== РЕЦЕПТЫ =====

  /**
   * Поиск рецептов
   */
  async searchRecipes(
    query: string,
    options: {
      number?: number;
      addRecipeNutrition?: boolean;
      instructionsRequired?: boolean;
      diet?: string;
      cuisine?: string;
      intolerances?: string;
      maxReadyTime?: number;
      minProtein?: number;
      maxProtein?: number;
      minFat?: number;
      maxFat?: number;
      minCarbs?: number;
      maxCarbs?: number;
    } = {}
  ): Promise<SearchRecipesResponse> {
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        number: (options.number || 10).toString()
      });

      if (options.addRecipeNutrition !== undefined) {
        params.append('addRecipeNutrition', options.addRecipeNutrition.toString());
      }
      if (options.instructionsRequired !== undefined) {
        params.append('instructionsRequired', options.instructionsRequired.toString());
      }
      if (options.diet) params.append('diet', options.diet);
      if (options.cuisine) params.append('cuisine', options.cuisine);
      if (options.intolerances) params.append('intolerances', options.intolerances);
      if (options.maxReadyTime) params.append('maxReadyTime', options.maxReadyTime.toString());
      if (options.minProtein) params.append('minProtein', options.minProtein.toString());
      if (options.maxProtein) params.append('maxProtein', options.maxProtein.toString());
      if (options.minFat) params.append('minFat', options.minFat.toString());
      if (options.maxFat) params.append('maxFat', options.maxFat.toString());
      if (options.minCarbs) params.append('minCarbs', options.minCarbs.toString());
      if (options.maxCarbs) params.append('maxCarbs', options.maxCarbs.toString());

      const response = await api.get(`${this.baseUrl}/recipes/search?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка поиска рецептов: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка поиска рецептов:', error);
      throw error;
    }
  }

  /**
   * Поиск рецептов по ингредиентам
   */
  async searchRecipesByIngredients(
    ingredients: string[],
    options: {
      number?: number;
      ranking?: 1 | 2;
      ignorePantry?: boolean;
    } = {}
  ): Promise<RecipeByIngredientsResponse[]> {
    try {
      const params = new URLSearchParams({
        number: (options.number || 10).toString(),
        ranking: (options.ranking || 1).toString()
      });

      if (options.ignorePantry !== undefined) {
        params.append('ignorePantry', options.ignorePantry.toString());
      }

      ingredients.forEach(ingredient => {
        params.append('ingredients[]', ingredient);
      });

      const response = await api.get(`${this.baseUrl}/recipes/by-ingredients?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка поиска рецептов по ингредиентам: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка поиска рецептов по ингредиентам:', error);
      throw error;
    }
  }

  /**
   * Получение информации о рецепте
   */
  async getRecipeInfo(
    recipeId: number,
    includeNutrition: boolean = true
  ): Promise<SpoonacularRecipe> {
    try {
      const params = new URLSearchParams({
        includeNutrition: includeNutrition.toString()
      });

      const response = await api.get(`${this.baseUrl}/recipes/${recipeId}/information?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else if (response.status === 404) {
        throw new Error('Рецепт не найден');
      } else {
        throw new Error(`Ошибка получения информации о рецепте: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения информации о рецепте:', error);
      throw error;
    }
  }

  /**
   * Получение случайных рецептов
   */
  async getRandomRecipes(
    options: {
      number?: number;
      addRecipeNutrition?: boolean;
      tags?: string;
      diet?: string;
      cuisine?: string;
      intolerances?: string;
    } = {}
  ): Promise<{ recipes: SpoonacularRecipe[] }> {
    try {
      const params = new URLSearchParams({
        number: (options.number || 10).toString()
      });

      if (options.addRecipeNutrition !== undefined) {
        params.append('addRecipeNutrition', options.addRecipeNutrition.toString());
      }

      if (options.tags) params.append('tags', options.tags);
      if (options.diet) params.append('diet', options.diet);
      if (options.cuisine) params.append('cuisine', options.cuisine);
      if (options.intolerances) params.append('intolerances', options.intolerances);

      const response = await api.get(`${this.baseUrl}/recipes/random?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка получения случайных рецептов: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения случайных рецептов:', error);
      throw error;
    }
  }

  // ===== ИНГРЕДИЕНТЫ =====

  /**
   * Поиск ингредиентов
   */
  async searchIngredients(
    query: string,
    options: {
      number?: number;
      addChildren?: boolean;
      metaInformation?: boolean;
      sortDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<SpoonacularIngredient[]> {
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        number: (options.number || 10).toString()
      });

      if (options.addChildren !== undefined) {
        params.append('addChildren', options.addChildren.toString());
      }
      if (options.metaInformation !== undefined) {
        params.append('metaInformation', options.metaInformation.toString());
      }

      if (options.sortDirection) params.append('sortDirection', options.sortDirection);

      const response = await api.get(`${this.baseUrl}/ingredients/search?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка поиска ингредиентов: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка поиска ингредиентов:', error);
      throw error;
    }
  }

  /**
   * Получение информации об ингредиенте
   */
  async getIngredientInfo(
    ingredientId: number,
    options: {
      amount?: number;
      unit?: string;
    } = {}
  ): Promise<IngredientInfo> {
    try {
      const params = new URLSearchParams();
      if (options.amount) params.append('amount', options.amount.toString());
      if (options.unit) params.append('unit', options.unit);

      const response = await api.get(`${this.baseUrl}/ingredients/${ingredientId}/information?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else if (response.status === 404) {
        throw new Error('Ингредиент не найден');
      } else {
        throw new Error(`Ошибка получения информации об ингредиенте: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения информации об ингредиенте:', error);
      throw error;
    }
  }

  /**
   * Автодополнение ингредиентов
   */
  async autocompleteIngredients(
    query: string,
    number: number = 10
  ): Promise<SpoonacularIngredient[]> {
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        number: number.toString()
      });

      const response = await api.get(`${this.baseUrl}/ingredients/autocomplete?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка автодополнения ингредиентов: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка автодополнения ингредиентов:', error);
      throw error;
    }
  }

  // ===== ПЛАНИРОВАНИЕ ПИТАНИЯ =====

  /**
   * Генерация плана питания
   */
  async generateMealPlan(
    options: {
      timeFrame?: 'day' | 'week';
      targetCalories?: number;
      diet?: string;
      exclude?: string;
    } = {}
  ): Promise<MealPlanGenerateResponse> {
    try {
      const params = new URLSearchParams({
        timeFrame: options.timeFrame || 'day',
        targetCalories: (options.targetCalories || 2000).toString()
      });

      if (options.diet) params.append('diet', options.diet);
      if (options.exclude) params.append('exclude', options.exclude);

      const response = await api.get(`${this.baseUrl}/meal-planner/generate?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка генерации плана питания: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка генерации плана питания:', error);
      throw error;
    }
  }

  /**
   * Получение плана питания на неделю
   */
  async getMealPlanWeek(
    username: string,
    hash: string
  ): Promise<MealPlanWeek> {
    try {
      const params = new URLSearchParams({
        username,
        hash
      });

      const response = await api.get(`${this.baseUrl}/meal-planner/week?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка получения плана питания: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка получения плана питания:', error);
      throw error;
    }
  }

  // ===== АНАЛИЗ ПИТАНИЯ =====

  /**
   * Анализ рецепта
   */
  async analyzeRecipe(recipeData: RecipeAnalysisRequest): Promise<RecipeAnalysisResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/recipes/analyze`, recipeData);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка анализа рецепта: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка анализа рецепта:', error);
      throw error;
    }
  }

  /**
   * Оценка питательной ценности по названию
   */
  async guessNutrition(title: string): Promise<NutritionGuessResponse> {
    try {
      const params = new URLSearchParams({
        title: title.trim()
      });

      const response = await api.get(`${this.baseUrl}/recipes/guess-nutrition?${params}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка оценки питательной ценности: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка оценки питательной ценности:', error);
      throw error;
    }
  }

  /**
   * Классификация кухни
   */
  async classifyCuisine(
    title: string,
    ingredients: string
  ): Promise<CuisineClassificationResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/recipes/classify-cuisine`, {
        title: title.trim(),
        ingredients: ingredients.trim()
      });
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Ошибка классификации кухни: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка классификации кухни:', error);
      throw error;
    }
  }
}

export const spoonacularService = new SpoonacularService();
