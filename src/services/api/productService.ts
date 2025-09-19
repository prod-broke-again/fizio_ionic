import api from './config';

export interface Product {
    id: string;
    name: string;
    brand?: string;
    calories: string;
    protein: string;
    fat: string;
    carbs: string;
    servingSize: string;
    source: 'openfoodfacts' | 'local';
    image?: string;
    ingredients?: string;
    allergens?: string[];
    nutriscore?: string;
}

export interface Nutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  salt_100g?: number;
  sugars_100g?: number;
  'saturated-fat_100g'?: number;
}

export interface LocalProduct {
  id: number;
  code: string;
  product_name: string;
  brands?: string;
  generic_name?: string;
  categories?: string;
  countries?: string;
  ingredients_text?: string;
  allergens?: string;
  nutriscore_grade?: string;
  nova_group?: string;
  unique_scans_n?: number;
  image_url?: string;
  image_small_url?: string;
  nutriments?: Nutriments;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
    products: Product[];
    total: number;
    current_page?: number;
    per_page?: number;
    last_page?: number;
}

export interface LocalSearchResult {
    products: LocalProduct[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

class ProductService {
    // Методы для работы с локальными продуктами
    private async searchLocalProducts(query: string, page: number = 1, perPage: number = 20): Promise<LocalSearchResult> {
        try {
            const response = await api.get('/local-products/search', {
                params: {
                    query,
                    page,
                    per_page: perPage
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching local products:', error);
            throw error;
        }
    }

    private async getLocalProductByBarcode(barcode: string): Promise<LocalProduct | null> {
        try {
            const response = await api.get(`/local-products/barcode/${barcode}`);
            return response.data;
        } catch (error) {
            console.error('Error getting local product by barcode:', error);
            return null;
        }
    }

    private async getLocalProductById(id: number): Promise<LocalProduct | null> {
        try {
            const response = await api.get(`/local-products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error getting local product by ID:', error);
            return null;
        }
    }

    // Преобразование локального продукта в общий формат
    private mapLocalProductToProduct(localProduct: LocalProduct): Product {
        const nutriments = localProduct.nutriments || {};
        const calories = nutriments['energy-kcal_100g']?.toString() || '0';
        const protein = nutriments.proteins_100g?.toString() || '0';
        const fat = nutriments.fat_100g?.toString() || '0';
        const carbs = nutriments.carbohydrates_100g?.toString() || '0';
        
        let imageUrl = localProduct.image_url || localProduct.image_small_url || '';
        
        return {
            id: localProduct.id.toString(),
            name: localProduct.product_name || '',
            brand: localProduct.brands || '',
            calories,
            protein,
            fat,
            carbs,
            servingSize: '100g',
            source: 'local',
            ingredients: localProduct.ingredients_text || '',
            allergens: localProduct.allergens ? [localProduct.allergens] : [],
            nutriscore: localProduct.nutriscore_grade || '',
            image: imageUrl
        };
    }

    // Обновленный метод поиска продуктов (сначала локальные, затем внешние)
    async searchProducts(query: string, page: number = 1, perPage: number = 20): Promise<SearchResult> {
        if (query.length < 2) {
            console.log('ℹ️ Поиск: Слишком короткий запрос', { query });
            return { products: [], total: 0 };
        }

        console.log('🚀 Начало поиска', { query, page, perPage });
        const startTime = performance.now();

        try {
            // Сначала ищем в локальной базе
            console.log('🔍 Поиск в локальной базе продуктов');
            const localResults = await this.searchLocalProducts(query, page, perPage);
            
            // Преобразуем локальные продукты в общий формат
            const mappedProducts = localResults.products.map(product => this.mapLocalProductToProduct(product));
            
            const endTime = performance.now();
            console.log('📊 Итоги поиска в локальной базе:', {
                query,
                totalFound: mappedProducts.length,
                searchTime: `${(endTime - startTime).toFixed(2)}ms`,
                firstProduct: mappedProducts[0]
            });

            return {
                products: mappedProducts,
                total: localResults.total,
                current_page: localResults.current_page,
                per_page: localResults.per_page,
                last_page: localResults.last_page
            };
        } catch (error: any) {
            console.error('❌ Ошибка поиска в локальной базе:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Если локальный поиск не удался, возвращаем пустой результат
            return { products: [], total: 0 };
        }
    }

    // Обновленный метод получения деталей продукта
    async getProductDetails(id: string): Promise<Product> {
        console.log('🔎 Получение деталей продукта', { id });
        
        // Сначала пробуем получить из локальной базы
        try {
            const localProduct = await this.getLocalProductById(parseInt(id));
            if (localProduct) {
                console.log('✅ Продукт найден в локальной базе');
                return this.mapLocalProductToProduct(localProduct);
            }
        } catch (error) {
            console.log('ℹ️ Продукт не найден в локальной базе, пробуем внешний API');
        }

        // Если не найден в локальной базе, пробуем внешний API
        try {
            console.log('📡 OpenFoodFacts API: Запрос деталей продукта');
            const response = await api.get(`/openfoodfacts/products/barcode/${id}`);
            console.log('✅ OpenFoodFacts API: Успешный ответ');
            
            const product = response.data;
            return {
                id: product._id,
                name: product.product_name || product.product_name_ru || '',
                brand: product.brands || '',
                calories: product.nutriments?.['energy-kcal_100g']?.toString() || '0',
                protein: product.nutriments?.proteins_100g?.toString() || '0',
                fat: product.nutriments?.fat_100g?.toString() || '0',
                carbs: product.nutriments?.carbohydrates_100g?.toString() || '0',
                servingSize: '100g',
                source: 'openfoodfacts',
                ingredients: product.ingredients_text || product.ingredients_text_ru || '',
                allergens: product.allergens_tags || [],
                nutriscore: product.nutriscore_grade || '',
                image: product.selected_images?.front?.display?.ru || 
                       product.image_front_url || 
                       product.image_url || 
                       product.images?.front_ru?.sizes?.['400']?.url || 
                       ''
            };
        } catch (error: any) {
            console.error('❌ Ошибка получения деталей продукта:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }

    // Обновленный метод поиска по штрих-коду
    async searchByBarcode(barcode: string): Promise<Product | null> {
        console.log('🔍 Поиск по штрих-коду', { barcode });
        
        // Сначала пробуем локальную базу
        try {
            const localProduct = await this.getLocalProductByBarcode(barcode);
            if (localProduct) {
                console.log('✅ Продукт найден в локальной базе');
                return this.mapLocalProductToProduct(localProduct);
            }
        } catch (error) {
            console.log('ℹ️ Продукт не найден в локальной базе, пробуем внешний API');
        }

        // Если не найден в локальной базе, пробуем внешний API
        try {
            console.log('📡 OpenFoodFacts API: Поиск по штрих-коду');
            const response = await api.get(`/openfoodfacts/products/barcode/${barcode}`);
            
            if (response.data) {
                console.log('✅ OpenFoodFacts API: Продукт найден');
                const product = response.data;
                return {
                    id: product._id,
                    name: product.product_name || product.product_name_ru || '',
                    brand: product.brands || '',
                    calories: product.nutriments?.['energy-kcal_100g']?.toString() || '0',
                    protein: product.nutriments?.proteins_100g?.toString() || '0',
                    fat: product.nutriments?.fat_100g?.toString() || '0',
                    carbs: product.nutriments?.carbohydrates_100g?.toString() || '0',
                    servingSize: '100g',
                    source: 'openfoodfacts',
                    ingredients: product.ingredients_text || product.ingredients_text_ru || '',
                    allergens: product.allergens_tags || [],
                    nutriscore: product.nutriscore_grade || '',
                    image: product.selected_images?.front?.display?.ru || 
                           product.image_front_url || 
                           product.image_url || 
                           product.images?.front_ru?.sizes?.['400']?.url || 
                           ''
                };
            }
            
            console.log('ℹ️ OpenFoodFacts API: Продукт не найден');
            return null;
        } catch (error: any) {
            console.error('❌ Ошибка поиска по штрих-коду:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            return null;
        }
    }

    // Методы для работы только с локальными продуктами
    async searchLocalProductsOnly(query: string, page: number = 1, perPage: number = 20): Promise<LocalSearchResult> {
        return this.searchLocalProducts(query, page, perPage);
    }

    async getLocalProductDetails(id: number): Promise<LocalProduct | null> {
        return this.getLocalProductById(id);
    }

    async getLocalProductByBarcodeOnly(barcode: string): Promise<LocalProduct | null> {
        return this.getLocalProductByBarcode(barcode);
    }
}

export const productService = new ProductService(); 