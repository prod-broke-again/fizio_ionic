import api from './config';
import { TokenUtils } from './config';
import { RegisterData, LoginData, TelegramAuthData } from './types';

export const AuthService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      TokenUtils.setToken(response.data.data.access_token);
    }
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    if (response.data.success) {
      TokenUtils.setToken(response.data.data.access_token);
    }
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    if (response.data.success) {
      TokenUtils.clearAuth();
    }
    return response.data;
  },
  
  // Авторизация через Telegram
  async telegramAuth(data: TelegramAuthData) {
    console.log('Отправка запроса на авторизацию через Telegram:', JSON.stringify(data, null, 2));
    try {
      // Проверяем, что у нас есть initData или разобранные данные
      if (!data.hash) {
        console.error('Отсутствует hash в данных авторизации');
        return {
          success: false,
          message: 'Некорректные данные Telegram авторизации'
        };
      }
      // Передаём init_data, если есть (для серверной валидации initData/secret)
      const payload = { ...data } as any;
      if (window?.Telegram?.WebApp?.initData) {
        payload.init_data = window.Telegram.WebApp.initData; // snake_case
        payload.initData = window.Telegram.WebApp.initData;  // camelCase (на случай, если бэкенд ждёт другое имя)
      }

      const response = await api.post('/auth/telegram', payload);
      console.log('Получен ответ на запрос авторизации Telegram:', JSON.stringify(response.data, null, 2));
      
      // Проверяем формат ответа и обрабатываем оба варианта
      if (response.data.success) {
        // Стандартный формат {success: true, data: {access_token: "..."}}
        console.log('Авторизация через Telegram успешна, сохраняем токен (формат success)');
        TokenUtils.setToken(response.data.data.access_token);
        return response.data;
      } else if (response.data.token) {
        // Новый формат {user: {...}, token: "..."}
        console.log('Авторизация через Telegram успешна, сохраняем токен (формат token)');
        TokenUtils.setToken(response.data.token);
        // Преобразуем в стандартный формат для совместимости
        return {
          success: true,
          data: {
            user: response.data.user,
            access_token: response.data.token
          }
        };
      } else {
        console.error('Ошибка авторизации через Telegram:', JSON.stringify(response.data, null, 2));
        return {
          success: false,
          message: response.data.message || 'Неизвестный формат ответа от сервера'
        };
      }
    } catch (error: any) {
      console.error('Ошибка при отправке запроса авторизации через Telegram:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });
      return {
        success: false,
        message: error.response?.data?.message || 'Ошибка при отправке запроса на сервер'
      };
    }
  }
}; 