import api from './config';

export interface ProductSearchItem {
  id: number | string;
  provider: 'local';
  title: string;
  image?: string | null;
  per100: { calories: number; proteins: number; fats: number; carbs: number };
  perServing?: { grams?: number; calories?: number } | null;
}

export interface ProductSearchResponse {
  items: ProductSearchItem[];
  pagination?: { page: number; pages: number };
}

export const ProductSearchApi = {
  async search(q: string, page = 1): Promise<ProductSearchResponse> {
    // Бэкенд ожидает параметр 'query', не 'q'
    const { data } = await api.get('/products/search', { params: { query: q, page } });
    return data;
  },

  async getById(id: number | string): Promise<ProductSearchItem> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  }
};


