import api from './config';
import type { Notification } from './types';

// Интерфейс для метаданных пагинации
interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

// Интерфейс для ссылок пагинации
interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

// Интерфейс для полного ответа API с пагинацией
interface GetNotificationsResponseData {
  data: Notification[]; // Список уведомлений находится здесь
  links: PaginationLinks;
  meta: PaginationMeta;
}

// Функция для получения уведомлений с пагинацией
export const getNotifications = async (filter?: 'all' | 'unread', page: number = 1): Promise<GetNotificationsResponseData> => {
  try {
    const response = await api.get<GetNotificationsResponseData>('/notifications', {
      params: { filter, page }
    });
    // Возвращаем весь объект данных, который включает data, links и meta
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении уведомлений:', error);
    // Пробрасываем ошибку дальше для обработки в компоненте
    throw error;
  }
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await api.post(`/notifications/${id}/read`);
  } catch (error) {
    console.error(`Ошибка при отметке уведомления #${id} как прочитанного:`, error);
    throw error; // Пробрасываем ошибку
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.post('/notifications/read-all');
  } catch (error) {
    console.error('Ошибка при отметке всех уведомлений как прочитанных:', error);
    throw error; // Пробрасываем ошибку
  }
}; 