import { ref } from 'vue';
import ApiService from './api';
import { 
  isTelegramWebApp, 
  initTelegramWebApp, 
  getTelegramUser,
  validateTelegramInitData
} from '../utils/telegram';
import type { TelegramAuthData } from './api/types';

// Используем общий тип TelegramAuthData из API типов

const isInTelegram = ref(false);
const isTelegramAuthComplete = ref(false);
const telegramError = ref<string | null>(null);

export default {
  // Инициализация Telegram WebApp
  init() {
    console.log('Инициализация Telegram Service');
    
    try {
      // Проверка, есть ли данные в sessionStorage или URL хеше
      const sessionHasWebAppData = sessionStorage.getItem('tgWebAppData') !== null;
      
      // Проверка URL хеша
      const hashPart = window.location.hash;
      const hashHasWebAppData = hashPart && hashPart.includes('tgWebAppData=');
      
      console.log('Проверка данных Telegram:', {
        sessionStorage: sessionHasWebAppData,
        urlHash: hashHasWebAppData
      });
      
      // Если есть данные в sessionStorage или URL хеше, принудительно считаем что мы в Telegram
      if (sessionHasWebAppData || hashHasWebAppData) {
        console.log('Обнаружены данные Telegram в sessionStorage или URL хеше');
        window.localStorage.setItem('tg_events', 'true');
      }
    } catch (e) {
      console.warn('Ошибка при проверке sessionStorage/URL хеша:', e);
    }
    
    // Пытаемся обнаружить Telegram WebApp
    const isTelegram = isTelegramWebApp();
    console.log('Результат определения Telegram WebApp:', isTelegram);
    
    isInTelegram.value = isTelegram;
    
    // Если обнаружен Telegram WebApp, инициализируем его
    if (isInTelegram.value) {
      console.log('Инициализация Telegram WebApp из сервиса');
      const result = initTelegramWebApp();
      console.log('Результат инициализации Telegram WebApp:', result);
      
      // Проверяем наличие данных пользователя для более точного определения
      const userData = getTelegramUser();
      if (!userData && process.env.NODE_ENV !== 'development') {
        console.log('Несмотря на обнаружение Telegram WebApp, данные пользователя отсутствуют. Вероятно, это не настоящий Telegram WebApp.');
        isInTelegram.value = false;
      }
    }
    
    return isInTelegram.value;
  },

  // Проверка, запущено ли приложение в Telegram WebApp
  isInTelegramWebApp() {
    try {
      // Проверяем sessionStorage и URL-хеш
      const sessionHasWebAppData = sessionStorage.getItem('tgWebAppData') !== null;
      const hashPart = window.location.hash;
      const hashHasWebAppData = hashPart && hashPart.includes('tgWebAppData=');
      
      // Если есть явные признаки Telegram в данных, возвращаем true
      if (sessionHasWebAppData || hashHasWebAppData) {
        if (!isInTelegram.value) {
          console.log('Telegram WebApp определен через данные в sessionStorage/URL хеше');
          isInTelegram.value = true;
        }
        return true;
      }
    } catch (e) {
      console.warn('Ошибка при проверке sessionStorage/URL хеша:', e);
    }
    
    // Дополнительно проверяем текущее состояние через утилиту
    const currentState = isTelegramWebApp();
    
    // Если утилита определила Telegram WebApp, дополнительно проверяем наличие данных пользователя
    if (currentState) {
      const userData = getTelegramUser();
      if (!userData && process.env.NODE_ENV !== 'development') {
        console.log('Утилита определила Telegram WebApp, но данные пользователя отсутствуют');
        isInTelegram.value = false;
        return false;
      }
    }
    
    // Если состояние изменилось - обновляем его
    if (currentState !== isInTelegram.value) {
      console.log('Обновление статуса Telegram WebApp:', currentState);
      isInTelegram.value = currentState;
    }
    
    return isInTelegram.value;
  },

  // Проверка, завершена ли авторизация через Telegram
  isTelegramAuth() {
    return isTelegramAuthComplete.value;
  },

  // Получение ошибки авторизации
  getTelegramError() {
    return telegramError.value;
  },

  // Автоматическая авторизация через Telegram
  async autoLogin() {
    console.log('=== НАЧАЛО АВТОЛОГИНА ===');
    console.log('1. Проверка isInTelegram:', isInTelegram.value);
    
    if (!isInTelegram.value) {
      console.log('❌ ОШИБКА: Не в Telegram WebApp');
      return false;
    }

    try {
      console.log('2. Проверяем window.Telegram:', !!window.Telegram);
      console.log('3. Проверяем window.Telegram.WebApp:', !!window.Telegram?.WebApp);
      console.log('4. Проверяем window.Telegram.WebApp.initDataUnsafe:', !!window.Telegram?.WebApp?.initDataUnsafe);
      
      // Логируем все данные из Telegram WebApp
      console.log('5. ВСЕ ДАННЫЕ ИЗ TELEGRAM WEBAPP:');
      console.log(JSON.stringify({
        initData: window.Telegram?.WebApp?.initData,
        initDataUnsafe: window.Telegram?.WebApp?.initDataUnsafe,
        version: window.Telegram?.WebApp?.version,
        colorScheme: window.Telegram?.WebApp?.colorScheme,
        themeParams: window.Telegram?.WebApp?.themeParams,
        isExpanded: window.Telegram?.WebApp?.isExpanded,
        viewportHeight: window.Telegram?.WebApp?.viewportHeight,
        viewportStableHeight: window.Telegram?.WebApp?.viewportStableHeight,
        headerColor: window.Telegram?.WebApp?.headerColor,
        backgroundColor: window.Telegram?.WebApp?.backgroundColor,
        isClosingConfirmationEnabled: window.Telegram?.WebApp?.isClosingConfirmationEnabled,
        BackButton: window.Telegram?.WebApp?.BackButton,
        MainButton: window.Telegram?.WebApp?.MainButton,
        HapticFeedback: window.Telegram?.WebApp?.HapticFeedback,
        isVersionAtLeast: window.Telegram?.WebApp?.isVersionAtLeast,
        setHeaderColor: window.Telegram?.WebApp?.setHeaderColor,
        setBackgroundColor: window.Telegram?.WebApp?.setBackgroundColor,
        enableClosingConfirmation: window.Telegram?.WebApp?.enableClosingConfirmation,
        disableClosingConfirmation: window.Telegram?.WebApp?.disableClosingConfirmation,
        onEvent: window.Telegram?.WebApp?.onEvent,
        offEvent: window.Telegram?.WebApp?.offEvent,
        sendData: window.Telegram?.WebApp?.sendData,
        openLink: window.Telegram?.WebApp?.openLink,
        openTelegramLink: window.Telegram?.WebApp?.openTelegramLink,
        showPopup: window.Telegram?.WebApp?.showPopup,
        showAlert: window.Telegram?.WebApp?.showAlert,
        showConfirm: window.Telegram?.WebApp?.showConfirm,
        ready: window.Telegram?.WebApp?.ready,
        expand: window.Telegram?.WebApp?.expand,
        close: window.Telegram?.WebApp?.close
      }, null, 2));

      // Проверяем sessionStorage
      console.log('6. ПРОВЕРКА SESSION STORAGE:');
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        console.log(`${key}:`, sessionStorage.getItem(key));
      }

      // Проверяем URL
      console.log('7. ПРОВЕРКА URL:');
      console.log('window.location.href:', window.location.href);
      console.log('window.location.hash:', window.location.hash);
      console.log('window.location.search:', window.location.search);

      // Извлечение данных пользователя
      const userData = getTelegramUser();
      console.log('8. ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:', userData);
      
      if (!userData) {
        console.log('❌ ОШИБКА: Нет данных пользователя');
        telegramError.value = 'Не удалось получить данные пользователя Telegram';
        return false;
      }

      if (!userData.id) {
        console.log('❌ ОШИБКА: Нет ID пользователя');
        telegramError.value = 'Данные пользователя Telegram неполные или некорректные';
        return false;
      }

      // Получаем хеш для авторизации
      let hashValue: string | null = null;
      
      console.log('9. ПОИСК ХЕША:');
      
      // Получаем данные из sessionStorage
      const tgWebAppData = sessionStorage.getItem('tgWebAppData');
      
      // Пробуем получить из объекта Telegram.WebApp
      if (window.Telegram?.WebApp?.initDataUnsafe?.hash) {
        hashValue = window.Telegram.WebApp.initDataUnsafe.hash;
        console.log('✅ Хеш найден в Telegram WebApp API');
      } 
      // Затем из sessionStorage
      else if (tgWebAppData) {
        const params = new URLSearchParams(tgWebAppData);
        hashValue = params.get('hash');
        if (hashValue) {
          console.log('✅ Хеш найден в sessionStorage');
        }
      }
      // Затем из URL хеша
      else if (window.location.hash && window.location.hash.includes('tgWebAppData=')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const tgWebAppData = hashParams.get('tgWebAppData');
        if (tgWebAppData) {
          const params = new URLSearchParams(tgWebAppData);
          hashValue = params.get('hash');
          if (hashValue) {
            console.log('✅ Хеш найден в URL хеше');
          }
        }
      }
      
      if (!hashValue) {
        console.log('❌ ОШИБКА: Хеш не найден нигде');
        return false;
      }

      // Формируем данные для авторизации
      const authData: TelegramAuthData = {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        username: userData.username,
        photo_url: userData.photo_url,
        auth_date: window.Telegram?.WebApp?.initDataUnsafe?.auth_date || Math.floor(Date.now() / 1000),
        hash: hashValue,
        start_param: window.Telegram?.WebApp?.initDataUnsafe?.start_param,
        // Передаем initData для серверной валидации (если бэкенд поддерживает)
        init_data: window.Telegram?.WebApp?.initData || undefined
      };

      console.log('10. ДАННЫЕ ДЛЯ АВТОРИЗАЦИИ:', authData);

      // Отправляем запрос на авторизацию
      console.log('11. ОТПРАВКА ЗАПРОСА НА АВТОРИЗАЦИЮ');
      const response = await ApiService.telegramAuth(authData);
      console.log('12. ОТВЕТ СЕРВЕРА:', response);

      if (response.success) {
        console.log('✅ АВТОРИЗАЦИЯ УСПЕШНА');
        isTelegramAuthComplete.value = true;
        telegramError.value = null;
        return true;
      } else {
        console.log('❌ ОШИБКА АВТОРИЗАЦИИ:', response.message);
        telegramError.value = response.message || 'Ошибка авторизации через Telegram';
        return false;
      }
    } catch (error) {
      console.log('❌ КРИТИЧЕСКАЯ ОШИБКА:', error);
      telegramError.value = 'Произошла ошибка при авторизации';
      return false;
    } finally {
      console.log('=== КОНЕЦ АВТОЛОГИНА ===');
    }
  }
}; 