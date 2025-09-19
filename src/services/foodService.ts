import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import api from './api/config'; // Импортируем наш экземпляр axios

export interface Food {
  food_id: string;
  food_name: string;
  food_type?: string;
  food_url?: string;
  servings?: any[];
  nutrients?: {
    calories?: number;
    proteins?: number;
    fats?: number;
    carbs?: number;
  };
}

export interface SearchResponse {
  products: Food[];
  total: number;
}

export interface ImageData {
  base64Data: string;
  format: string;
}

export class FoodService {
  private static instance: FoodService;
  private readonly API_BASE_PATH = '/fatsecret'; // Относительный путь для FatSecret

  private constructor() {}

  public static getInstance(): FoodService {
    if (!FoodService.instance) {
      FoodService.instance = new FoodService();
    }
    return FoodService.instance;
  }

  public async searchFoods(query: string, page: number = 1, maxResults: number = 20): Promise<SearchResponse> {
    try {
      const response = await api.get<SearchResponse>(
        `${this.API_BASE_PATH}/foods/search?query=${encodeURIComponent(query)}&page=${page}&max_results=${maxResults}`
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске продуктов:', error);
      throw error;
    }
  }

  public async getFoodDetails(foodId: string): Promise<Food> {
    try {
      const response = await api.get<Food>(`${this.API_BASE_PATH}/foods/${foodId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о продукте:', error);
      throw error;
    }
  }

  public async autocompleteFoods(query: string): Promise<Food[]> {
    try {
      const response = await api.get<Food[]>(
        `${this.API_BASE_PATH}/foods/autocomplete?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при автозаполнении:', error);
      throw error;
    }
  }

  public async takePicture(): Promise<ImageData> {
    const image: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
    });

    if (!image.base64String) {
      console.error('takePicture: base64String is missing from camera response');
      throw new Error('Не удалось получить изображение в формате Base64.');
    }
    console.log('Image format from camera:', image.format);
    return { base64Data: image.base64String, format: image.format };
  }

  public async recognizeFood(imageData: ImageData): Promise<Food[]> {
    try {
      if (!imageData.base64Data) {
        throw new Error("Данные изображения (base64) отсутствуют для распознавания.");
      }
      
      const byteCharacters = atob(imageData.base64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const mimeType = `image/${imageData.format.toLowerCase()}`;
      const blob = new Blob(byteArrays, { type: mimeType });
      
      console.log('Blob created for recognizeFood:', { size: blob.size, type: blob.type });

      if (blob.size === 0) {
        throw new Error('Создан пустой Blob для изображения. Проверьте данные Base64 от камеры.');
      }

      const formData = new FormData();
      formData.append('image', blob, `food.${imageData.format.toLowerCase()}`);

      // Определяем тип для ответа, который может содержать foods или ошибку
      type RecognizeApiResponse = {
        foods?: Food[];
        error?: { code: string; message: string };
        message?: string; // Для других возможных сообщений об ошибках
      };

      const response = await api.post<RecognizeApiResponse>(`${this.API_BASE_PATH}/foods/recognize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Проверяем наличие ошибки в данных ответа, даже если статус 200
      if (response.data && response.data.error) {
        console.error('FatSecret API error (from response.data.error):', response.data.error.message);
        throw new Error(response.data.error.message);
      }
      // Проверяем наличие общего сообщения об ошибке, если нет поля error, но и нет поля foods
      if (response.data && response.data.message && !response.data.foods) {
        console.error('API error message (from response.data.message):', response.data.message);
        throw new Error(response.data.message);
      }
      // Если есть поле foods, возвращаем его
      if (response.data && response.data.foods) {
        return response.data.foods;
      }
      
      // Если структура ответа неожиданная
      console.error('Unexpected response structure from recognizeFood API:', response.data);
      throw new Error('Не удалось распознать продукт из-за неожиданного ответа сервера.');

    } catch (error: any) {
      // Логируем и перебрасываем ошибку (может быть из axios или явно брошенная выше)
      console.error('Ошибка в foodService.recognizeFood:', error.message);
      throw error; // Перебрасываем оригинальную или измененную ошибку
    }
  }

  public async getCategories(): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.API_BASE_PATH}/foods/categories`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
      throw error;
    }
  }
} 