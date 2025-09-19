import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { TokenUtils } from '@/services/api/config';
import type { Notification } from './api/types';

export interface AuthenticationError {
  message: string;
  code?: number;
}

export function useNotificationSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);
  const authenticated = ref(false);
  const notifications = ref<Notification[]>([]);
  const notificationHandlers: ((notification: Notification) => void)[] = [];
  let pingInterval: NodeJS.Timeout | null = null;

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
      authenticated.value = false;
      stopPing();
    });
    
    socket.value.on('authenticated', () => {
      console.log('Аутентификация успешна');
      authenticated.value = true;
      startPing();
    });
    
    socket.value.on('authentication_error', (error: AuthenticationError) => {
      console.error('Ошибка аутентификации:', error);
      authenticated.value = false;
    });
    
    socket.value.on('notification', (data: Notification) => {
      console.log('Получено уведомление:', data);
      notifications.value.unshift(data);
      notificationHandlers.forEach(handler => handler(data));
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

  const startPing = () => {
    stopPing();
    pingInterval = setInterval(() => {
      ping();
    }, 30000);
  };

  const stopPing = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
  };

  // Подписка на уведомления
  const subscribe = (handler: (notification: Notification) => void) => {
    notificationHandlers.push(handler);
    return () => {
      const index = notificationHandlers.indexOf(handler);
      if (index !== -1) {
        notificationHandlers.splice(index, 1);
      }
    };
  };

  // Автоматическая инициализация при использовании хука
  const setup = () => {
    if (!socket.value) {
      console.log('Инициализация WebSocket уведомлений...');
      initializeSocket();
    }
    
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
    authenticated,
    notifications,
    subscribe,
    ping,
    setup
  };
}

// Создаем экземпляр для использования во всем приложении
export const notificationSocketService = useNotificationSocket(); 