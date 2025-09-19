/**
 * Утилита для оптимизации изображений
 * Создает оптимизированные версии изображений для сетки
 */

export interface OptimizedImage {
  webp: string;
  jpeg: string;
  width: number;
  height: number;
  size: number; // в байтах
}

export class ImageOptimizer {
  private static readonly TARGET_WIDTH = 150;
  private static readonly TARGET_HEIGHT = 300;
  private static readonly MAX_SIZE_KB = 100;
  private static readonly WEBP_QUALITY = 0.85;
  private static readonly JPEG_QUALITY = 0.8;

  /**
   * Оптимизирует изображение для сетки
   */
  static async optimizeImage(
    originalImage: HTMLImageElement
  ): Promise<OptimizedImage> {
    // Создаем canvas для ресайза
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Не удалось создать canvas context');
    }

    // Устанавливаем размеры
    canvas.width = this.TARGET_WIDTH;
    canvas.height = this.TARGET_HEIGHT;

    // Рисуем изображение с ресайзом
    ctx.drawImage(originalImage, 0, 0, this.TARGET_WIDTH, this.TARGET_HEIGHT);

    // Создаем WebP версию
    const webpBlob = await this.canvasToBlob(canvas, 'image/webp', this.WEBP_QUALITY);
    const webpUrl = URL.createObjectURL(webpBlob);

    // Создаем JPEG версию
    const jpegBlob = await this.canvasToBlob(canvas, 'image/jpeg', this.JPEG_QUALITY);
    const jpegUrl = URL.createObjectURL(jpegBlob);

    return {
      webp: webpUrl,
      jpeg: jpegUrl,
      width: this.TARGET_WIDTH,
      height: this.TARGET_HEIGHT,
      size: webpBlob.size
    };
  }

  /**
   * Конвертирует canvas в blob
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Не удалось создать blob'));
          }
        },
        type,
        quality
      );
    });
  }

  /**
   * Проверяет поддержку WebP
   */
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Получает оптимальный URL изображения
   */
  static async getOptimalImageUrl(webpUrl: string, jpegUrl: string): Promise<string> {
    const supportsWebP = await this.supportsWebP();
    return supportsWebP ? webpUrl : jpegUrl;
  }

  /**
   * Освобождает память от URL объектов
   */
  static cleanupUrls(urls: string[]): void {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }
}

/**
 * Предустановленные оптимизированные изображения
 * В реальном проекте эти изображения должны быть созданы заранее
 */
export const OPTIMIZED_IMAGES = {
  bg1: {
    webp: '/assets/images/optimized/bg_ (1)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (1)_150x300.jpg',
    width: 150,
    height: 300,
    size: 85000 // ~85KB
  },
  bg2: {
    webp: '/assets/images/optimized/bg_ (2)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (2)_150x300.jpg',
    width: 150,
    height: 300,
    size: 92000 // ~92KB
  },
  bg3: {
    webp: '/assets/images/optimized/bg_ (3)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (3)_150x300.jpg',
    width: 150,
    height: 300,
    size: 78000 // ~78KB
  },
  bg4: {
    webp: '/assets/images/optimized/bg_ (4)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (4)_150x300.jpg',
    width: 150,
    height: 300,
    size: 95000 // ~95KB
  },
  bg5: {
    webp: '/assets/images/optimized/bg_ (5)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (5)_150x300.jpg',
    width: 150,
    height: 300,
    size: 88000 // ~88KB
  },
  bg6: {
    webp: '/assets/images/optimized/bg_ (6)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (6)_150x300.jpg',
    width: 150,
    height: 300,
    size: 91000 // ~91KB
  },
  bg7: {
    webp: '/assets/images/optimized/bg_ (7)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (7)_150x300.jpg',
    width: 150,
    height: 300,
    size: 87000 // ~87KB
  },
  bg8: {
    webp: '/assets/images/optimized/bg_ (8)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (8)_150x300.jpg',
    width: 150,
    height: 300,
    size: 93000 // ~93KB
  },
  bg9: {
    webp: '/assets/images/optimized/bg_ (9)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (9)_150x300.jpg',
    width: 150,
    height: 300,
    size: 75000 // ~75KB
  },
  bg10: {
    webp: '/assets/images/optimized/bg_ (10)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (10)_150x300.jpg',
    width: 150,
    height: 300,
    size: 80000 // ~80KB
  },
  bg11: {
    webp: '/assets/images/optimized/bg_ (11)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (11)_150x300.jpg',
    width: 150,
    height: 300,
    size: 85000 // ~85KB
  },
  bg12: {
    webp: '/assets/images/optimized/bg_ (12)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (12)_150x300.jpg',
    width: 150,
    height: 300,
    size: 90000 // ~90KB
  },
  bg13: {
    webp: '/assets/images/optimized/bg_ (13)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (13)_150x300.jpg',
    width: 150,
    height: 300,
    size: 88000 // ~88KB
  },
  bg14: {
    webp: '/assets/images/optimized/bg_ (14)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (14)_150x300.jpg',
    width: 150,
    height: 300,
    size: 95000 // ~95KB
  },
  bg15: {
    webp: '/assets/images/optimized/bg_ (15)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (15)_150x300.jpg',
    width: 150,
    height: 300,
    size: 82000 // ~82KB
  },
  bg16: {
    webp: '/assets/images/optimized/bg_ (16)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (16)_150x300.jpg',
    width: 150,
    height: 300,
    size: 98000 // ~98KB
  },
  bg17: {
    webp: '/assets/images/optimized/bg_ (17)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (17)_150x300.jpg',
    width: 150,
    height: 300,
    size: 90000 // ~90KB
  },
  bg18: {
    webp: '/assets/images/optimized/bg_ (18)_150x300.webp',
    jpeg: '/assets/images/optimized/bg_ (18)_150x300.jpg',
    width: 150,
    height: 300,
    size: 95000 // ~95KB
  }
};
