import api from './config';

export interface FoodSearchResult {
    foods: {
        food: Array<{
            food_id: string;
            food_name: string;
            food_type: string;
            food_url: string;
            servings: {
                serving: Array<{
                    calories: string;
                    carbohydrate: string;
                    protein: string;
                    fat: string;
                    serving_description: string;
                    metric_serving_amount: string;
                    metric_serving_unit: string;
                }>;
            };
        }>;
        max_results: string;
        page_number: string;
        total_results: string;
    };
}

export interface FoodDetails {
    food: {
        food_id: string;
        food_name: string;
        food_type: string;
        food_url: string;
        servings: {
            serving: Array<{
                calories: string;
                carbohydrate: string;
                protein: string;
                fat: string;
                serving_description: string;
                metric_serving_amount: string;
                metric_serving_unit: string;
            }>;
        };
    };
}

class FatSecretService {
    private async getToken() {
        try {
            const response = await api.post('/fatsecret/token');
            return response.data.access_token;
        } catch (error) {
            console.error('Error getting FatSecret token:', error);
            throw error;
        }
    }

    async searchFoods(query: string, page: number = 1, perPage: number = 20): Promise<FoodSearchResult> {
        try {
            const response = await api.get('/fatsecret/foods/search', {
                params: {
                    query,
                    page,
                    per_page: perPage
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching foods:', error);
            throw error;
        }
    }

    async getFoodDetails(foodId: string): Promise<FoodDetails> {
        try {
            const response = await api.get(`/fatsecret/foods/${foodId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting food details:', error);
            throw error;
        }
    }
}

export const fatSecretService = new FatSecretService(); 