export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  streak: number;
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
  createdAt: string;
  
  // Customization & Scheduling (New Features)
  icon: string; // Emoji
  color: string; // Tailwind color class key (e.g., 'indigo', 'rose')
  frequency: number[]; // Array of days 0-6 (0 = Sunday, 1 = Monday...)
  notificationTime?: string; // "HH:MM" format
}

export enum HabitCategory {
  BIO_HACKING = 'BIO-OPTIMIZATION',
  DEEP_WORK = 'DEEP WORK',
  SKILL_ACQUISITION = 'SKILL ACQ',
  SYSTEMS = 'SYSTEMS',
  STRATEGY = 'STRATEGY',
  HEALTH = 'HEALTH',
  MINDFULNESS = 'MINDFULNESS'
}

export type ViewState = 'habits' | 'dashboard' | 'add';
export type Theme = 'light' | 'dark';

export const COLORS = {
  indigo: 'bg-indigo-500',
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-500',
};

export const COLOR_VARIANTS = {
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', lightBg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500', lightBg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-500', lightBg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', lightBg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-500', lightBg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' },
};
