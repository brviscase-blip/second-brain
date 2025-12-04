import React from 'react';
import { Habit } from '../types';
import { CheckIcon, FlameIcon, TrashIcon } from './Icons';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete }) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <div className={`
      relative group p-0 border-l-4 transition-all duration-200
      ${isCompletedToday 
        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' 
        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'}
    `}>
      <div className="p-4 flex items-center justify-between border border-l-0 border-zinc-200 dark:border-zinc-800 h-full">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
              {habit.category}
            </span>
            {habit.streak > 0 && (
                <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-[10px] font-bold gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                <FlameIcon className="w-3 h-3" />
                <span>{habit.streak} DAY STREAK</span>
                </div>
            )}
          </div>
          <h3 className={`font-bold text-base uppercase tracking-tight ${isCompletedToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {habit.title}
          </h3>
          {habit.description && <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">{habit.description}</p>}
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => onDelete(habit.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all"
                title="Archive Protocol"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => onToggle(habit.id)}
                className={`
                w-10 h-10 border-2 flex items-center justify-center transition-all duration-200 rounded-md
                ${isCompletedToday 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : 'bg-transparent border-zinc-300 dark:border-zinc-600 text-transparent hover:border-zinc-400 dark:hover:border-zinc-500'}
                `}
            >
                <CheckIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;