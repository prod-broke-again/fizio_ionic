// Определение типов для Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  start(): void;
  stop(): void;
  abort(): void;
}

// Определяем конструктор для SpeechRecognition
interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

type RecognitionCallback = (transcript: string) => void;

export class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private currentCallback: RecognitionCallback | null = null;
  private currentErrorCallback: ((error: any) => void) | null = null;
  private fallbackMode: boolean = false; // Режим резервной отладки
  
  constructor() {
    console.log('Инициализация VoiceRecognitionService');
    
    // Если есть параметр в URL для тестового режима, включаем его
    if (window.location.search.includes('test_voice=true')) {
      this.fallbackMode = true;
      this.isSupported = true;
      console.log('Включен тестовый режим распознавания голоса');
      return;
    }
    
    // Проверяем поддержку SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.isSupported = true;
      console.log('Распознавание речи поддерживается браузером');
      
      try {
        // Используем префикс webkit для Safari или стандартный для других браузеров
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognitionAPI();
        
        // Настройки распознавания
        if (this.recognition) {
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = 'ru-RU'; // Устанавливаем русский язык по умолчанию
          
          // Добавляем обработчик события завершения
          this.recognition.onend = (event: Event) => {
            console.log('Распознавание завершено по событию onend');
            // Если текущий callback ещё установлен, то результата не было
            // Вызываем его с пустой строкой
            if (this.currentCallback) {
              console.log('Не получен результат, вызываем callback с пустой строкой');
              this.currentCallback('');
              this.clearCallbacks();
            }
          };
        }
      } catch (error) {
        console.error('Ошибка при инициализации распознавания речи:', error);
        this.isSupported = false;
      }
    } else {
      console.warn('Распознавание речи не поддерживается браузером');
    }
  }
  
  private clearCallbacks() {
    this.currentCallback = null;
    this.currentErrorCallback = null;
  }
  
  public startRecording(onResult: RecognitionCallback, onError?: (error: any) => void): boolean {
    console.log('Запуск распознавания голоса');
    
    // Если включен тестовый режим, имитируем распознавание с небольшой задержкой
    if (this.fallbackMode) {
      console.log('Работаем в тестовом режиме');
      
      setTimeout(() => {
        console.log('Имитируем получение результата распознавания');
        onResult('Это тестовый режим распознавания голоса. Распознавание работает.');
      }, 2000);
      
      return true;
    }
    
    if (!this.isSupported || !this.recognition) {
      const errorMsg = 'Распознавание речи не поддерживается в вашем браузере';
      console.error(errorMsg);
      if (onError) onError(new Error(errorMsg));
      return false;
    }
    
    try {
      // Сохраняем текущие callback-и
      this.currentCallback = onResult;
      this.currentErrorCallback = onError || null;
      
      // Обработчик результата
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        try {
          if (event.results && event.results.length > 0) {
            const transcript = event.results[0][0].transcript;
            console.log('Распознан текст:', transcript);
            
            if (this.currentCallback) {
              this.currentCallback(transcript);
              this.clearCallbacks();
            }
          } else {
            console.warn('Получен пустой результат распознавания');
            if (this.currentCallback) {
              this.currentCallback('');
              this.clearCallbacks();
            }
          }
        } catch (err) {
          console.error('Ошибка при обработке результата распознавания:', err);
          if (this.currentErrorCallback) {
            this.currentErrorCallback(err);
            this.clearCallbacks();
          }
        }
      };
      
      // Обработчик ошибок
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Ошибка распознавания:', event.error);
        if (this.currentErrorCallback) {
          this.currentErrorCallback(event.error);
          this.clearCallbacks();
        }
      };
      
      // Начинаем запись
      this.recognition.start();
      console.log('Распознавание успешно запущено');
      return true;
    } catch (error) {
      console.error('Ошибка при запуске распознавания:', error);
      if (onError) onError(error);
      this.clearCallbacks();
      return false;
    }
  }
  
  public stopRecording(): void {
    console.log('Остановка распознавания');
    
    // В тестовом режиме ничего не делаем
    if (this.fallbackMode) {
      return;
    }
    
    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('Распознавание остановлено');
      } catch (error) {
        console.error('Ошибка при остановке распознавания:', error);
      }
      this.clearCallbacks();
    }
  }
  
  public isRecognitionSupported(): boolean {
    return this.isSupported;
  }
  
  public setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
      console.log('Установлен язык распознавания:', lang);
    }
  }
}

// Создаем синглтон сервиса для использования во всем приложении
export const voiceRecognitionService = new VoiceRecognitionService(); 