
export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
}

export interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

class UnsplashService {
  private readonly ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';
  private readonly BASE_URL = 'https://api.unsplash.com';

  /**
   * Получить случайные фотографии по ключевым словам
   */
  async getRandomPhotos(query: string = 'fitness workout', count: number = 10): Promise<UnsplashPhoto[]> {
    // Если API ключ не настроен, используем fallback
    if (!this.ACCESS_KEY) {
      console.warn('Unsplash API ключ не настроен. Используются локальные фотографии.');
      return this.getFallbackPhotos();
    }

    try {
      const url = `${this.BASE_URL}/photos/random?query=${encodeURIComponent(query)}&count=${count}&orientation=landscape`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const photos = await response.json();
      return Array.isArray(photos) ? photos : [photos];
    } catch (error) {
      console.error('Ошибка при получении фотографий с Unsplash:', error);
      return this.getFallbackPhotos();
    }
  }

  /**
   * Поиск фотографий
   */
  async searchPhotos(query: string, page: number = 1, perPage: number = 10): Promise<UnsplashSearchResponse> {
    try {
      const url = `${this.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при поиске фотографий:', error);
      return { results: this.getFallbackPhotos(), total: 0, total_pages: 0 };
    }
  }

  /**
   * Получить фотографии для фитнеса и спорта
   */
  async getFitnessPhotos(): Promise<UnsplashPhoto[]> {
    const queries = [
      'fitness workout',
      'gym training',
      'sports exercise',
      'healthy lifestyle',
      'cardio training',
      'strength training',
      'yoga wellness'
    ];

    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    return this.getRandomPhotos(randomQuery, 15);
  }

  /**
   * Фallback фотографии на случай ошибки API
   */
  getFallbackPhotos(): UnsplashPhoto[] {
    return [
      {
        id: 'fallback-1',
        urls: {
          raw: '../assets/workout-bodyweight.jpg',
          full: '../assets/workout-bodyweight.jpg',
          regular: '../assets/workout-bodyweight.jpg',
          small: '../assets/workout-bodyweight.jpg',
          thumb: '../assets/workout-bodyweight.jpg'
        },
        alt_description: 'Тренировка с собственным весом',
        description: 'Фитнес тренировка',
        user: { name: 'Local', username: 'local' },
        width: 800,
        height: 600
      },
      {
        id: 'fallback-2',
        urls: {
          raw: '../assets/workout-cardio.jpg',
          full: '../assets/workout-cardio.jpg',
          regular: '../assets/workout-cardio.jpg',
          small: '../assets/workout-cardio.jpg',
          thumb: '../assets/workout-cardio.jpg'
        },
        alt_description: 'Кардио тренировка',
        description: 'Беговая дорожка',
        user: { name: 'Local', username: 'local' },
        width: 800,
        height: 600
      },
      {
        id: 'fallback-3',
        urls: {
          raw: '../assets/workout1.jpg',
          full: '../assets/workout1.jpg',
          regular: '../assets/workout1.jpg',
          small: '../assets/workout1.jpg',
          thumb: '../assets/workout1.jpg'
        },
        alt_description: 'Силовая тренировка',
        description: 'Тренировка в зале',
        user: { name: 'Local', username: 'local' },
        width: 800,
        height: 600
      },
      {
        id: 'fallback-4',
        urls: {
          raw: '../assets/workout2.png',
          full: '../assets/workout2.png',
          regular: '../assets/workout2.png',
          small: '../assets/workout2.png',
          thumb: '../assets/workout2.png'
        },
        alt_description: 'Функциональная тренировка',
        description: 'Кроссфит',
        user: { name: 'Local', username: 'local' },
        width: 800,
        height: 600
      },
      {
        id: 'fallback-5',
        urls: {
          raw: '../assets/images/cardio_card_bg.jpg',
          full: '../assets/images/cardio_card_bg.jpg',
          regular: '../assets/images/cardio_card_bg.jpg',
          small: '../assets/images/cardio_card_bg.jpg',
          thumb: '../assets/images/cardio_card_bg.jpg'
        },
        alt_description: 'Кардио упражнения',
        description: 'Кардио тренировка',
        user: { name: 'Local', username: 'local' },
        width: 800,
        height: 600
      },
      {
        id: 'fallback-6',
        urls: {
          raw: '../assets/images/bodyweight_card_bg.jpg',
          full: '../assets/images/bodyweight_card_bg.jpg',
          regular: '../assets/images/bodyweight_card_bg.jpg',
          small: '../assets/images/bodyweight_card_bg.jpg',
          thumb: '../assets/images/bodyweight_card_bg.jpg'
        },
        alt_description: 'Тренировка без оборудования',
        description: 'Калистеника',
        user: { name: 'Local', username: 'local' },
        width: 800,
        height: 600
      }
    ];
  }

  /**
   * Проверить доступность API
   */
  async isApiAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/photos/random?count=1`, {
        headers: {
          'Authorization': `Client-ID ${this.ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default new UnsplashService();
