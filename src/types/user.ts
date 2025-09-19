export interface User {
  id: number;
  name: string;
  email: string;
  telegram_id?: number | null;
  created_at?: string; // ISO 8601 date string
  updated_at?: string; // ISO 8601 date string
} 