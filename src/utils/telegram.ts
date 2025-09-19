// Типы данных для Telegram WebApp
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
  sendData: (data: any) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: any, callback: Function) => void;
  showAlert: (message: string, callback: Function) => void;
  showConfirm: (message: string, callback: Function) => void;
  HapticFeedback: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
    selectionChanged: () => void;
  };
  isVersionAtLeast: (version: string) => boolean;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    setParams: (params: any) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: Function) => void;
    offClick: (callback: Function) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: Function) => void;
    offClick: (callback: Function) => void;
  };
}

// Глобальное объявление для доступа к telegram.WebApp в window
declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

// Вспомогательная функция для проверки, запущено ли приложение внутри Telegram WebApp
export function isTelegramWebApp(): boolean {
  try {
    // НОВЫЙ СПОСОБ: Проверка sessionStorage на наличие tgWebAppData
    try {
      const sessionHasWebAppData = sessionStorage.getItem('tgWebAppData') !== null;
      const sessionHasWebAppVersion = sessionStorage.getItem('tgWebAppVersion') !== null;
      const sessionHasWebAppPlatform = sessionStorage.getItem('tgWebAppPlatform') !== null;
      
      if (sessionHasWebAppData && sessionHasWebAppVersion) {
        console.log('Telegram WebApp определен через sessionStorage');
        return true;
      }
    } catch (e) {
      console.warn('Ошибка при доступе к sessionStorage:', e);
    }
    
    // НОВЫЙ СПОСОБ: Проверка URL хеша на наличие tgWebAppData
    try {
      const hashPart = window.location.hash;
      if (hashPart && hashPart.includes('tgWebAppData=')) {
        console.log('Telegram WebApp определен через URL хеш');
        return true;
      }
    } catch (e) {
      console.warn('Ошибка при анализе URL хеша:', e);
    }
    
    // Проверка URL на наличие параметров tgWebAppData и tgWebAppVersion
    const urlParams = new URLSearchParams(window.location.search);
    const hasWebAppData = urlParams.has('tgWebAppData') || urlParams.has('web_app_data');
    const hasWebAppVersion = urlParams.has('tgWebAppVersion') || urlParams.has('web_app_version');
    
    // Проверка на наличие объекта Telegram.WebApp
    const hasTelegramObject = window.Telegram !== undefined && window.Telegram.WebApp !== undefined;
    
    // Проверка на наличие user_agent с WebView
    const userAgent = navigator.userAgent.toLowerCase();
    const hasWebViewInUA = userAgent.includes('webview') || userAgent.includes('telegram');
    
    // Проверка на события Telegram WebApp
    const hasEventLogs = window.localStorage.getItem('tg_events') !== null;
    
    console.log('isTelegramWebApp детальная проверка:', {
      hasTelegramObject,
      hasWebAppData,
      hasWebAppVersion,
      hasWebViewInUA,
      hasEventLogs,
      sessionStorage: sessionStorage.getItem('tgWebAppData') !== null,
      urlHash: window.location.hash.includes('tgWebAppData='),
      userAgent
    });
    
    // Проверяем наличие объекта Telegram.WebApp и данных пользователя/хеша
    if (hasTelegramObject) {
      // Логи данных из Telegram
      try {
        console.log('Telegram WebApp версия:', window.Telegram.WebApp.version);
        console.log('Telegram initData:', window.Telegram.WebApp.initData);
        
        // Проверка на наличие данных в initData
        const hasInitData = window.Telegram.WebApp.initData && window.Telegram.WebApp.initData.length > 0;
        console.log('Наличие данных в initData:', hasInitData);
        
        // Более детальный лог initDataUnsafe для отладки
        const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
        const hasUser = !!initDataUnsafe?.user;
        const hasHash = !!initDataUnsafe?.hash;
        
        console.log('Telegram initDataUnsafe:', {
          query_id: initDataUnsafe?.query_id,
          user: initDataUnsafe?.user ? {
            id: initDataUnsafe.user.id,
            first_name: initDataUnsafe.user.first_name,
            last_name: initDataUnsafe.user.last_name,
            username: initDataUnsafe.user.username
          } : 'нет данных пользователя',
          auth_date: initDataUnsafe?.auth_date,
          hash: initDataUnsafe?.hash ? 'присутствует' : 'отсутствует',
          start_param: initDataUnsafe?.start_param
        });
        
        // Определяем, действительно ли это Telegram WebApp с реальными данными
        if (hasInitData || hasUser || hasHash) {
          console.log('Telegram WebApp определен по объекту Telegram.WebApp с данными');
          
          // Сохраняем признак, что это Telegram WebApp для будущих проверок
          window.localStorage.setItem('tg_events', 'true');
          
          return true;
        }
        
        // Если скрипт Telegram присутствует, но данных нет, и мы не в режиме разработки
        if (process.env.NODE_ENV !== 'development') {
          console.log('Telegram WebApp объект существует, но нет необходимых данных');
          return false;
        }
      } catch (error) {
        console.error('Ошибка при логировании данных Telegram:', error);
      }
    }
    
    // Если были ранее обнаружены события Telegram, считаем что это Telegram
    if (hasEventLogs) {
      console.log('Telegram WebApp определен по предыдущим событиям');
      return true;
    }
    
    // Запасной вариант проверки по URL-параметрам и User-Agent
    const isTelegram = (hasWebAppData && hasWebAppVersion) || hasWebViewInUA;
    
    console.log('isTelegramWebApp результат:', isTelegram);
    return isTelegram;
  } catch (error) {
    console.error('Ошибка при определении Telegram WebApp:', error);
    return false;
  }
}

// Функция для получения данных пользователя из Telegram WebApp
export function getTelegramUser() {
  // Сначала пробуем получить из объекта Telegram WebApp
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    console.log('getTelegramUser: Получены данные пользователя из WebApp', user);
    return user;
  }
  
  // Затем из sessionStorage
  try {
    const tgWebAppData = sessionStorage.getItem('tgWebAppData');
    if (tgWebAppData) {
      const userData = extractUserFromTgWebAppData(tgWebAppData);
      if (userData) {
        console.log('getTelegramUser: Получены данные пользователя из sessionStorage', userData);
        return userData;
      }
    }
  } catch (e) {
    console.warn('Ошибка при получении данных из sessionStorage:', e);
  }
  
  // Затем из URL хеша
  try {
    const hashPart = window.location.hash;
    if (hashPart && hashPart.includes('tgWebAppData=')) {
      const hashParams = new URLSearchParams(hashPart.substring(1));
      const tgWebAppData = hashParams.get('tgWebAppData');
      if (tgWebAppData) {
        const userData = extractUserFromTgWebAppData(tgWebAppData);
        if (userData) {
          console.log('getTelegramUser: Получены данные пользователя из URL хеша', userData);
          return userData;
        }
      }
    }
  } catch (e) {
    console.warn('Ошибка при получении данных из URL хеша:', e);
  }
  
  console.error('getTelegramUser: Не удалось получить данные пользователя');
  return null;
}

// Вспомогательная функция для извлечения данных пользователя из tgWebAppData
function extractUserFromTgWebAppData(tgWebAppData: string): any {
  try {
    // tgWebAppData имеет формат query_id=XXX&user=%7B...%7D&auth_date=XXX&signature=XXX
    const params = new URLSearchParams(tgWebAppData);
    const userStr = params.get('user');
    
    if (userStr) {
      // userStr содержит URL-закодированный JSON объект
      const userData = JSON.parse(decodeURIComponent(userStr));
      return userData;
    }
  } catch (e) {
    console.error('Ошибка при извлечении данных пользователя из tgWebAppData:', e);
  }
  
  return null;
}

// Функция для проверки валидности initData
export function validateTelegramInitData(): boolean {
  if (!isTelegramWebApp()) {
    console.error('validateTelegramInitData: Не в контексте Telegram WebApp');
    return false;
  }
  
  const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
  
  // Проверяем наличие хэша и даты авторизации
  if (!initDataUnsafe?.hash || !initDataUnsafe?.auth_date) {
    console.error('validateTelegramInitData: Отсутствует hash или auth_date', {
      hash: !!initDataUnsafe?.hash,
      auth_date: !!initDataUnsafe?.auth_date
    });
    return false;
  }
  
  // Проверяем, что auth_date не старше 24 часов
  const authDate = initDataUnsafe?.auth_date || 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = currentTime - authDate;
  console.log('validateTelegramInitData: Разница во времени (сек):', timeDiff);
  
  if (timeDiff > 86400) {
    console.error('validateTelegramInitData: Данные устарели (более 24 часов)');
    return false;
  }
  
  console.log('validateTelegramInitData: Данные валидны');
  return true;
}

// Функция для установки темы на основе настроек Telegram
export function applyTelegramTheme() {
  if (isTelegramWebApp()) {
    const webApp = window.Telegram.WebApp;
    
    // Применяем цвета темы Telegram к CSS переменным
    document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color);
    document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color);
    document.documentElement.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color);
    document.documentElement.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color);
    document.documentElement.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color);
    document.documentElement.style.setProperty('--tg-theme-button-text-color', webApp.themeParams.button_text_color);
    
    // Установка цветовой схемы для Ionic
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(webApp.colorScheme);
  }
}

// Функция для настройки главной кнопки Telegram
export function setupMainButton(text: string, onClick: () => void) {
  if (isTelegramWebApp()) {
    const mainButton = window.Telegram.WebApp.MainButton;
    
    mainButton.setText(text);
    mainButton.onClick(onClick);
    mainButton.show();
  }
}

// Функция для скрытия главной кнопки Telegram
export function hideMainButton() {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.MainButton.hide();
  }
}

// Функция для настройки кнопки "Назад" Telegram
export function setupBackButton(onClick: () => void) {
  if (isTelegramWebApp()) {
    const backButton = window.Telegram.WebApp.BackButton;
    
    backButton.onClick(onClick);
    backButton.show();
  }
}

// Функция для скрытия кнопки "Назад" Telegram
export function hideBackButton() {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.BackButton.hide();
  }
}

// Функция для отправки данных в Telegram
export function sendDataToTelegram(data: any) {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  }
}

// Функция для закрытия WebApp
export function closeTelegramWebApp() {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.close();
  }
}

// Функция инициализации Telegram Web App
export function initTelegramWebApp() {
  try {
    // Если к моменту инициализации объект WebApp доступен
    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Инициализация Telegram WebApp через API');
      
      // Проверяем наличие реальных данных
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      const hasInitData = window.Telegram.WebApp.initData && window.Telegram.WebApp.initData.length > 0;
      const hasUser = !!initDataUnsafe?.user;
      const hasHash = !!initDataUnsafe?.hash;
      
      // Сохраняем признак, что мы в Telegram WebApp только если есть реальные данные
      if (hasInitData || hasUser || hasHash) {
        window.localStorage.setItem('tg_events', 'true');
      }
      
      // Сообщаем Telegram, что приложение готово
      window.Telegram.WebApp.ready();
      
      // Применяем тему
      applyTelegramTheme();
      
      // Отслеживаем событие изменения темы
      window.Telegram.WebApp.onEvent('themeChanged', applyTelegramTheme);
      
      // Также отслеживаем другие события для диагностики
      window.Telegram.WebApp.onEvent('viewportChanged', (data: any) => {
        console.log('Telegram viewport changed:', data);
      });
      
      window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
        console.log('Telegram main button clicked');
      });
      
      return true;
    } else {
      console.warn('Telegram WebApp объект не найден при инициализации');
      
      // Пробуем получить данные из sessionStorage для применения темы
      try {
        const themeParamsStr = sessionStorage.getItem('tgWebAppThemeParams');
        if (themeParamsStr) {
          const themeParams = JSON.parse(themeParamsStr);
          console.log('Получены параметры темы из sessionStorage:', themeParams);
          
          // Применяем тему из sessionStorage
          document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
          document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
          document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
          document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color);
          document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
          document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
          
          // Устанавливаем темную тему по умолчанию, если это Telegram
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          
          return true;
        }
      } catch (e) {
        console.warn('Ошибка при получении параметров темы из sessionStorage:', e);
      }
      
      // Пробуем получить данные из URL хеша
      try {
        const hashPart = window.location.hash;
        if (hashPart && hashPart.includes('tgWebAppThemeParams=')) {
          const hashParams = new URLSearchParams(hashPart.substring(1));
          const themeParamsStr = hashParams.get('tgWebAppThemeParams');
          if (themeParamsStr) {
            const themeParams = JSON.parse(decodeURIComponent(themeParamsStr));
            console.log('Получены параметры темы из URL хеша:', themeParams);
            
            // Применяем тему из URL хеша
            document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
            document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
            document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
            document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color);
            document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
            document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
            
            // Устанавливаем темную тему по умолчанию, если это Telegram
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            
            return true;
          }
        }
      } catch (e) {
        console.warn('Ошибка при получении параметров темы из URL хеша:', e);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка при инициализации Telegram WebApp:', error);
    return false;
  }
} 