import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { TokenUtils } from '@/services/api/config';
import api from '@/services/api/config';
import { ChatHistoryResponse, ChatSendApiResponse, ChatMessageStatusResponse } from '@/types/api';

export interface ChatMessage {
  id: number;
  user_id: number;
  message: string;
  response?: string;
  is_processing: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthenticationError {
  message: string;
  code?: number;
}

export interface ChatResponseData extends ChatMessage {
  // Расширяем интерфейс ChatMessage для данных ответа
}

// Экспортируемые функции API для совместимости с существующим кодом
/**
 * Отправка сообщения в чат через API
 * @param message Текст сообщения
 * @returns Ответ от API с ID сообщения и статусом обработки
 */
export async function sendChatMessage(message: string): Promise<ChatSendApiResponse> {
  try {
    const response = await api.post<ChatSendApiResponse>('/chat/send', { message });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
}

/**
 * Получение статуса обработки сообщения
 * @param messageId ID сообщения
 * @returns Статус обработки и ответ, если он готов
 */
export async function getChatMessageStatus(messageId: number): Promise<ChatMessageStatusResponse> {
  try {
    const response = await api.get<ChatMessageStatusResponse>(`/chat/status/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении статуса сообщения:', error);
    throw error;
  }
}

/**
 * Получение истории сообщений чата
 * @param limit Ограничение количества сообщений (опционально)
 * @returns История сообщений чата
 */
export async function getChatHistory(limit?: number): Promise<ChatHistoryResponse> {
  try {
    const params = limit ? { limit } : {};
    const response = await api.get<ChatHistoryResponse>('/chat/history', { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении истории чата:', error);
    throw error;
  }
}

/**
 * Очистка истории чата
 * @returns Результат операции
 */
export async function clearChatHistory(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete('/chat/clear');
    return response.data;
  } catch (error) {
    console.error('Ошибка при очистке истории чата:', error);
    throw error;
  }
}

export function useChatSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const messages = ref<ChatMessage[]>([]);
  const historyLoaded = ref(false);
  
  const initializeSocket = () => {
    // Используем URL из переменных окружения или по умолчанию
    const wsUrl = import.meta.env.VITE_WS_URL || 'https://fizio.online';
    
    socket.value = io(wsUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    }); 
    
    socket.value.on('connect', () => {
      console.log('Соединение установлено');
      authenticate();
    });
    
    socket.value.on('disconnect', () => {
      console.log('Соединение потеряно');
      connected.value = false;
    });
    
    socket.value.on('authenticated', () => {
      console.log('Аутентификация успешна');
      connected.value = true;
    });
    
    socket.value.on('authentication_error', (error: AuthenticationError) => {
      console.error('Ошибка аутентификации:', error);
      connected.value = false;
    });
    
    socket.value.on('chat_response', (data: ChatResponseData) => {
      console.log('Получено сообщение:', data);
      
      // Если сообщение уже есть, обновляем его
      const index = messages.value.findIndex(m => m.id === data.id);
      if (index !== -1) {
        messages.value[index] = data;
      } else {
        messages.value.unshift(data);
      }
    });
  };

  const authenticate = () => {
    const token = TokenUtils.getToken();
    if (socket.value && token) {
      socket.value.emit('authenticate', token);
    }
  };

  // Проверка активности соединения
  const ping = (): Promise<any> => {
    return new Promise((resolve) => {
      if (socket.value) {
        socket.value.emit('ping', (response: { time: string; status: string }) => {
          resolve(response);
        });
      } else {
        resolve({ error: 'Нет подключения' });
      }
    });
  };

  // Загрузка истории сообщений с сервера
  const loadHistory = async () => {
    if (historyLoaded.value) {
      console.log('История уже загружена, пропускаем повторную загрузку');
      return;
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://fizio.online';
      const token = TokenUtils.getToken();
      
      if (!token) {
        console.error('Токен не найден');
        return;
      }
      
      console.log('Загружаем историю чата...');
      const response = await fetch(`${apiUrl}/api/chat/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        messages.value = data.data;
        historyLoaded.value = true;
        console.log('История чата загружена успешно');
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };
  
  // Отправка сообщения
  const sendMessage = async (message: string): Promise<boolean> => {
    if (!message.trim()) return false;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://fizio.online';
      const token = TokenUtils.getToken();
      
      if (!token) {
        console.error('Токен не найден');
        return false;
      }

      const response = await fetch(`${apiUrl}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      return false;
    }
  };

  // Автоматическая инициализация при использовании хука
  const setup = () => {
    if (!socket.value) {
      console.log('Инициализация WebSocket...');
      initializeSocket();
    }
    
    loadHistory();
    
    // Автоматическая очистка при размонтировании компонента
    return () => {
      if (socket.value) {
        socket.value.disconnect();
      }
    };
  };

  return {
    socket,
    connected,
    messages,
    ping,
    loadHistory,
    sendMessage,
    setup,
    historyLoaded
  };
}

// Создаем экземпляр для использования во всем приложении
export const chatSocketService = useChatSocket(); 