import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  ChatHistoryItem,
  ChatHistoryResponse
} from '@/types/api';
import * as ChatApi from '@/services/chatSocket';
import { chatSocketService } from '@/services/chatSocket';

export interface ChatMessage {
  id?: number;           // ID сообщения
  text: string;          // Текст сообщения
  isUser: boolean;       // Флаг: пользовательское (true) или от ассистента (false)
  isTyping?: boolean;    // Флаг: печатается ли сообщение в данный момент
  pending?: boolean;     // Флаг: ожидается ли ответ на сообщение
}

export const useChatStore = defineStore('chat', () => {
  // Состояние
  const chatMessages = ref<ChatMessage[]>([]);
  const isLoading = ref(false);
  const chatStarted = ref(false);
  const isRecordingVoice = ref(false);
  const pendingMessageId = ref<number | null>(null); // ID сообщения в обработке
  const exampleQuestions = ref([
    'Как часто нужно делать кардио?',
    'Что позавтракать?',
    'Чем полезен присед?'
  ]);
  
  // Вычисляемое свойство: есть ли сообщения в процессе печатания
  const hasTypingMessages = computed(() => {
    return chatMessages.value.some(msg => msg.isTyping === true);
  });

  // Отправка текстового сообщения
  async function sendMessage(userMessage: string) {
    if (!userMessage.trim() || isLoading.value) return;
    
    // Устанавливаем флаг начала чата
    chatStarted.value = true;
    
    // Добавляем сообщение пользователя
    chatMessages.value.push({
      text: userMessage,
      isUser: true
    });
    
    // Показываем индикатор загрузки и добавляем заглушку для ответа ассистента
    isLoading.value = true;
    const typingMessage: ChatMessage = {
      text: '',
      isUser: false,
      isTyping: true
    };
    chatMessages.value.push(typingMessage);
    
    try {
      // Запрос к API для получения ответа от ассистента
      const data = await ChatApi.sendChatMessage(userMessage);
      
      if (data.success) {
        // Если сервер подтвердил получение запроса, но ответ будет асинхронным
        if (data.data.is_processing) {
          // Сохраняем ID сообщения для отслеживания статуса
          pendingMessageId.value = data.data.message_id;
          
          // Заменяем заглушку на сообщение о том, что ответ генерируется
          const typingIndex = chatMessages.value.findIndex(msg => msg.isTyping === true);
          if (typingIndex !== -1) {
            chatMessages.value[typingIndex] = {
              id: data.data.message_id,
              text: "Генерирую ответ...",
              isUser: false,
              isTyping: true,
              pending: true
            };
          }
          
          // Для WebSockets не нужно делать polling, ответ придет через сокет
          // Добавляем слушатель WebSocket, если он еще не добавлен
          setupSocketListener();
        } else {
          // Если ответ пришел сразу, удаляем заглушку и показываем ответ
          removeTypingMessage();
          chatMessages.value.push({
            id: data.data.message_id,
            text: data.data.response || "Не удалось получить ответ",
            isUser: false
          });
        }
      } else {
        throw new Error(data.message || 'Произошла ошибка');
      }
    } catch (error) {
      console.error('Ошибка при получении ответа:', error);
      
      // Удаляем заглушку
      removeTypingMessage();
      
      // Добавляем сообщение об ошибке
      chatMessages.value.push({
        text: "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.",
        isUser: false
      });
    } finally {
      isLoading.value = false;
    }
  }
  
  // Удаление сообщения с анимацией печатания
  function removeTypingMessage() {
    const index = chatMessages.value.findIndex(msg => msg.isTyping === true);
    if (index !== -1) {
      chatMessages.value.splice(index, 1);
    }
  }
  
  // Обновление сообщения с готовым ответом
  function updateMessageWithResponse(messageId: number, response: string) {
    const index = chatMessages.value.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      chatMessages.value[index] = {
        id: messageId,
        text: response,
        isUser: false,
        isTyping: false,
        pending: false
      };
    }
    
    // Сбрасываем ID текущего сообщения в обработке
    pendingMessageId.value = null;
  }

  // Загрузка истории сообщений с сервера через API
  async function loadChatHistory() {
    try {
      const data = await ChatApi.getChatHistory(10);
      
      if (data.success && data.data.length > 0) {
        // Если есть история, устанавливаем флаг начала чата
        chatStarted.value = true;
        
        // Очищаем текущие сообщения
        chatMessages.value = [];
        
        // Добавляем сообщения в правильном порядке (от старых к новым)
        data.data.reverse().forEach((item: ChatHistoryItem) => {
          // Добавляем сообщение пользователя
          if (item.message) {
            chatMessages.value.push({
              id: item.id,
              text: item.message,
              isUser: true
            });
          }
          
          // Добавляем ответ ассистента
          if (item.response) {
            chatMessages.value.push({
              id: item.id,
              text: item.response,
              isUser: false
            });
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке истории чата:', error);
    }
  }

  // Очистка истории чата
  async function clearChat() {
    try {
      // Очищаем историю в UI
      chatMessages.value = [];
      chatStarted.value = false;
      
      // Очищаем историю на сервере
      await ChatApi.clearChatHistory();
      
      // Очищаем историю в localStorage
      localStorage.removeItem('fizio_chat_history');
    } catch (error) {
      console.error('Ошибка при очистке истории чата:', error);
    }
  }

  // Обработка получения нового сообщения от WebSocket
  function handleSocketMessage(data: any) {
    console.log('Получено WebSocket сообщение:', data);
    
    // Если это ответ на ожидаемое сообщение
    if (data.id && pendingMessageId.value && data.id === pendingMessageId.value) {
      updateMessageWithResponse(data.id, data.response || "Не удалось получить ответ");
    }
  }

  // Слушатель WebSocket
  function setupSocketListener() {
    // Проверяем, что chatSocketService доступен
    if (!chatSocketService) {
      console.error('chatSocketService не определен');
      return;
    }
    
    // Если сокет не подключен, инициализируем его
    if (!chatSocketService.socket.value || !chatSocketService.connected.value) {
      console.log('Инициализируем WebSocket соединение');
      chatSocketService.setup();
    }
    
    // Получаем сокет
    const socket = chatSocketService.socket.value;
    if (socket) {
      // Удаляем старые обработчики, чтобы не было дублирования
      socket.off('chat_response');
      
      // Добавляем новый обработчик для сообщений
      socket.on('chat_response', (data: any) => {
        handleSocketMessage(data);
      });
    } else {
      console.log('WebSocket не инициализирован, ожидаем инициализации');
      
      // Если chatSocketService.socket еще не инициализирован, подождем и попробуем снова
      // Используем только одну попытку с таймаутом
      setTimeout(() => {
        if (!chatSocketService.socket.value) {
          console.log('Повторная попытка инициализации WebSocket');
          chatSocketService.setup();
          
          // Проверяем сокет снова после инициализации
          if (chatSocketService.socket.value) {
            setupSocketListener(); // Рекурсивно вызываем функцию, но только один раз
          }
        }
      }, 1000);
    }
  }

  // Функции для управления голосовым вводом
  function startVoiceRecording() {
    isRecordingVoice.value = true;
    console.log('Начата запись голоса...');
    // Здесь должен быть код для начала записи голоса
  }

  function stopVoiceRecording(recognizedText: string) {
    isRecordingVoice.value = false;
    
    if (recognizedText) {
      // Отправляем распознанный текст как обычное сообщение
      sendMessage(recognizedText);
    }
  }

  return {
    chatMessages,
    isLoading,
    chatStarted,
    isRecordingVoice,
    hasTypingMessages,
    exampleQuestions,
    sendMessage,
    loadChatHistory,
    startVoiceRecording,
    stopVoiceRecording,
    clearChat,
    setupSocketListener,
    handleSocketMessage
  };
}); 