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
  BIO_HACKING = 'BIO-OPTIMIZATION',
  DEEP_WORK = 'DEEP WORK',
  SKILL_ACQUISITION = 'SKILL ACQ',
  SYSTEMS = 'SYSTEMS',
  STRATEGY = 'STRATEGY',
}

export interface DayStatus {
  date: string; // YYYY-MM-DD
  completedCount: number;
  totalHabits: number;
}

export type ViewState = 'habits' | 'dashboard' | 'add';
export type Theme = 'light' | 'dark';