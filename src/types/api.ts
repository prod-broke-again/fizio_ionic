// Общий интерфейс ответа API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

// Интерфейс для сообщения чата с сервера
export interface ChatHistoryItem {
  id: number;
  user_id: number;
  message: string;
  response: string;
  created_at: string;
  updated_at: string;
}

// Интерфейс для отправленного сообщения
export interface ChatSendData {
  message_id: number;
  message: string;
  is_processing: boolean;
  response?: string;
}

// Интерфейс для статуса сообщения
export interface ChatMessageStatus {
  message_id: number;
  is_processing: boolean;
  response?: string; 
}

// Интерфейс для ответа на отправку сообщения
export type ChatSendApiResponse = ApiResponse<ChatSendData>;

// Интерфейс для ответа статуса сообщения 
export type ChatMessageStatusResponse = ApiResponse<ChatMessageStatus>;

// Интерфейс для ответа истории чата
export type ChatHistoryResponse = ApiResponse<ChatHistoryItem[]>;

export interface Meal {
  id: number;
  name: string;
  calories: number;
  time: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  completed: boolean;
}

export interface Workout {
  id: number;
  name: string;
  duration: number;
  calories: number;
  type: 'cardio' | 'strength' | 'flexibility';
  completed: boolean;
}

export interface DayPlan {
  date: string;
  meals: Meal[];
  workouts: Workout[];
  progress: number;
}

export interface WeekPlanResponse {
  data: DayPlan[];
}

export interface DayPlanResponse {
  data: DayPlan;
}

export interface ProgressResponse {
  data: {
    progress: number;
  };
} 