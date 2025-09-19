// Типы данных
export * from './types';

// Конфигурация и утилиты
import api, { TokenUtils } from './config';
export * from './config';

// Сервисы
import { AuthService } from './auth';
import { ProfileService } from './profile';
import * as ChatService from '../chatSocket';
import { weekPlanApi } from './weekPlan';

// Экспорт API уведомлений
export * from './notifications';

// Объединение всех сервисов в один API объект
const ApiService = {
  // Утилиты токена как методы ApiService
  isAuthenticated: () => TokenUtils.isAuthenticated(),
  getToken: () => TokenUtils.getToken(),
  setToken: (t: string) => TokenUtils.setToken(t),
  clearAuth: () => TokenUtils.clearAuth(),
  
  // Аутентификация
  register: AuthService.register,
  login: AuthService.login,
  logout: AuthService.logout,
  telegramAuth: AuthService.telegramAuth,
  
  // Профиль
  getProfile: ProfileService.getProfile,
  updateProfile: ProfileService.updateProfile,
  saveFitnessGoal: ProfileService.saveFitnessGoal,
  getFitnessGoal: ProfileService.getFitnessGoal,
  
  // Чат
  sendChatMessage: ChatService.sendChatMessage,
  getChatHistory: ChatService.getChatHistory,
  clearChatHistory: ChatService.clearChatHistory,
  getChatMessageStatus: ChatService.getChatMessageStatus,

  // Недельный план
  ...weekPlanApi
};

// Экспорт индивидуальных сервисов для более гранулярного использования
export { AuthService, ProfileService, ChatService, weekPlanApi };

// Экспорт API как основного объекта по умолчанию
export default ApiService; 

export * from './user';
export * from './notifications';
export * from './types'; 