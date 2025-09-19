import axios from 'axios';

const API_URL = 'https://fizio.online/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Перехватчик для логирования запросов (минимальные данные)
api.interceptors.request.use(
  config => {
    try {
      const method = config.method?.toUpperCase();
      const url = config.url;
      const hasParams = config.params ? Object.keys(config.params).length : 0;
      console.log('🚀 API Request:', { method, url, paramsKeys: hasParams });
    } catch (_) {
      // Игнорируем ошибки логирования
    }
    return config;
  },
  error => {
    try { 
      console.error('❌ API Request Error:', error?.message || error); 
    } catch (_) {
      // Игнорируем ошибки логирования
    }
    return Promise.reject(error);
  }
);

// Перехватчик для логирования ответов (облегчённые логи, без больших payload)
api.interceptors.response.use(
  response => {
    try {
      const url = response.config.url;
      const status = response.status;
      const dataInfo = (() => {
        const d = response.data;
        if (d == null) return 'null';
        if (Array.isArray(d)) return `array(len=${d.length})`;
        if (typeof d === 'object') return `object(keys=${Object.keys(d).length})`;
        return typeof d;
      })();
      console.log('✅ API Response:', { url, status, data: dataInfo });
    } catch (_) {
      // Игнорируем ошибки логирования
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Глобальная обработка 401: очищаем токен и отправляем на главную страницу
      // ВРЕМЕННО: Используем sessionStorage вместо localStorage для сплеш-скрина
      try { 
        sessionStorage.removeItem('access_token'); 
      } catch (_) {
        // Игнорируем ошибки очистки токена
      }
      try {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : undefined;
        const isAuthRoute = currentPath === '/login' || currentPath === '/register' || currentPath === '/';
        if (!isAuthRoute && typeof window !== 'undefined') {
          window.location.replace('/');
        }
      } catch (_) {
      // Игнорируем ошибки логирования
    }
    }

    try {
      console.error('❌ API Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    } catch (_) {
      // Игнорируем ошибки логирования
    }
    return Promise.reject(error);
  }
);

// Перехватчик для добавления токена аутентификации и часового пояса к запросам
api.interceptors.request.use(
  config => {
    // ВРЕМЕННО: Используем sessionStorage вместо localStorage для сплеш-скрина
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Не кэшировать ответы, чтобы старый токен не приводил к устаревшим данным
    config.headers['Cache-Control'] = 'no-cache';
    config.headers.Pragma = 'no-cache';
    config.headers.Expires = '0';
    // Добавляем часовой пояс пользователя
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        config.headers['X-Timezone'] = timezone;
      }
    } catch (e) {
      console.error('Error getting timezone:', e);
    }
    return config;
  }
);

// Вспомогательные утилиты для работы с токеном
export const TokenUtils = {
  isAuthenticated() {
    // ВРЕМЕННО: Используем sessionStorage вместо localStorage для сплеш-скрина
    // TODO: Вернуть localStorage после доработки авторизации
    return sessionStorage.getItem('access_token') !== null;
  },

  getToken() {
    // ВРЕМЕННО: Используем sessionStorage вместо localStorage для сплеш-скрина
    return sessionStorage.getItem('access_token');
  },
  
  setToken(token: string) {
    if (token) {
      // ВРЕМЕННО: Используем sessionStorage вместо localStorage для сплеш-скрина
      sessionStorage.setItem('access_token', token);
      return true;
    }
    return false;
  },

  clearAuth() {
    // ВРЕМЕННО: Используем sessionStorage вместо localStorage для сплеш-скрина
    sessionStorage.removeItem('access_token');
  }
};

export default api; 