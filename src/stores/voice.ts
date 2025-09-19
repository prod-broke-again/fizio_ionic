import { defineStore } from 'pinia';
import { ref } from 'vue';
import { voiceRecognitionService } from '@/services/voiceRecognition';
import { useChatStore } from './chat';

export const useVoiceStore = defineStore('voice', () => {
  const isRecording = ref(false);
  const isSupported = ref(voiceRecognitionService.isRecognitionSupported());
  const errorMessage = ref<string | null>(null);
  
  // Ссылка на хранилище чата
  const chatStore = useChatStore();
  
  // Функция обратного вызова для обновления текста в поле ввода
  let updateInputCallback: ((text: string) => void) | null = null;
  
  // Установка функции обратного вызова для обновления поля ввода
  function setUpdateInputCallback(callback: (text: string) => void) {
    console.log('Callback для обновления поля ввода установлен');
    updateInputCallback = callback;
  }
  
  // Очистка сообщения об ошибке
  function clearError() {
    errorMessage.value = null;
  }
  
  // Начать запись голоса
  function startVoiceRecording() {
    console.log('Начинаем запись голоса, поддержка:', isSupported.value);
    
    if (!isSupported.value) {
      errorMessage.value = 'Голосовой ввод не поддерживается вашим браузером';
      return false;
    }
    
    if (isRecording.value) {
      console.log('Запись уже идет, останавливаем');
      stopVoiceRecording();
      return true;
    }
    
    const success = voiceRecognitionService.startRecording(
      // Обработчик успешного результата
      (transcript) => {
        console.log('Получен результат распознавания:', transcript);
        isRecording.value = false;
        
        if (transcript.trim()) {
          // Вместо отправки сообщения добавляем текст в поле ввода
          if (updateInputCallback) {
            console.log('Вызываем callback для обновления поля ввода');
            updateInputCallback(transcript);
          } else {
            console.warn('Не установлен обработчик для обновления поля ввода');
          }
        } else {
          console.warn('Распознанный текст пустой');
        }
      },
      // Обработчик ошибки
      (error) => {
        console.error('Ошибка распознавания голоса:', error);
        isRecording.value = false;
        errorMessage.value = typeof error === 'string' 
          ? error 
          : (error?.message || 'Ошибка распознавания голоса');
      }
    );
    
    if (success) {
      console.log('Запись успешно начата');
      isRecording.value = true;
      errorMessage.value = null;
    } else {
      console.error('Не удалось начать запись');
    }
    
    return success;
  }
  
  // Остановить запись голоса
  function stopVoiceRecording() {
    console.log('Останавливаем запись голоса');
    if (isRecording.value) {
      voiceRecognitionService.stopRecording();
      isRecording.value = false;
    }
  }
  
  // Изменить язык распознавания (для многоязычных приложений)
  function setLanguage(lang: string) {
    console.log('Устанавливаем язык распознавания:', lang);
    voiceRecognitionService.setLanguage(lang);
  }
  
  return {
    isRecording,
    isSupported,
    errorMessage,
    startVoiceRecording,
    stopVoiceRecording,
    setLanguage,
    clearError,
    setUpdateInputCallback
  };
}); 