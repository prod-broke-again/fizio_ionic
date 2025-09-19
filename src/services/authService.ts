import api from './api/config';
import type { User } from '../types/user'; // Предполагаем, что тип User будет определен

// --- Request Interfaces ---
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TelegramAuthRequest {
  id: number; // Telegram ID
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: number; // Unix timestamp
  hash: string;
}

export interface LinkTelegramRequest {
  telegram_id: number;
}

// --- Response Interfaces ---
export interface AuthSuccessResponse {
  success: true;
  data: {
    user: User;
    token: string;
  };
}

export interface RefreshTokenResponse {
  success: true;
  data: {
    token: string;
  };
}

export interface LogoutResponse {
  success: true;
  message: string;
}

export interface LinkTelegramResponse {
  success: true;
  message: string;
}

// --- Error Response Interface (Общий для API) ---
export interface ApiErrorResponse {
  success: false;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>; // Для ошибок валидации
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(data: RegisterRequest): Promise<AuthSuccessResponse> {
    const response = await api.post<AuthSuccessResponse>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthSuccessResponse> {
    const response = await api.post<AuthSuccessResponse>('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<LogoutResponse> {
    const response = await api.post<LogoutResponse>('/auth/logout');
    return response.data;
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  }

  async telegramLogin(data: TelegramAuthRequest): Promise<AuthSuccessResponse> {
    const response = await api.post<AuthSuccessResponse>('/auth/telegram', data);
    return response.data;
  }

  async linkTelegram(data: LinkTelegramRequest): Promise<LinkTelegramResponse> {
    const response = await api.post<LinkTelegramResponse>('/auth/telegram/link', data);
    return response.data;
  }
} 