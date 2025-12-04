export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  createdAt: string;
}

export enum HabitCategory {
  HEALTH = 'Saúde',
  LEARNING = 'Aprendizado',
  PRODUCTIVITY = 'Produtividade',
  MINDFULNESS = 'Mindfulness',
  OTHER = 'Outro',
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalHabits: number;
}

export type ViewState = 'habits' | 'dashboard' | 'add';