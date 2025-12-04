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
    <div className="relative group mb-3 px-1">
      <div className={`
        relative overflow-hidden transition-all duration-300 ease-out
        rounded-2xl border
        ${isCompletedToday 
          ? 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 border-indigo-200 dark:border-indigo-900/50 shadow-md shadow-indigo-100 dark:shadow-none' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700'}
      `}>
        
        {/* Progress Bar Indicator for completed items */}
        {isCompletedToday && (
           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 dark:bg-indigo-400" />
        )}

        <div className="p-4 pl-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`
                text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase
                ${isCompletedToday 
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
              `}>
                {habit.category}
              </span>
              
              {habit.streak > 0 && (
                <div className="flex items-center text-orange-500 dark:text-orange-400 text-[10px] font-bold gap-1">
                  <FlameIcon className="w-3 h-3 fill-orange-500 dark:fill-orange-400" />
                  <span>{habit.streak}</span>
                </div>
              )}
            </div>
            
            <h3 className={`
              font-semibold text-base truncate transition-colors
              ${isCompletedToday 
                ? 'text-slate-800 dark:text-slate-100 line-through decoration-indigo-300 dark:decoration-indigo-700 decoration-2 opacity-70' 
                : 'text-slate-900 dark:text-white'}
            `}>
              {habit.title}
            </h3>
            
            {habit.description && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate font-medium">
                    {habit.description}
                </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button 
                onClick={() => onDelete(habit.id)}
                className="p-2 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                title="Remover hábito"
            >
                <TrashIcon className="w-4 h-4" />
            </button>

            <button
                onClick={() => onToggle(habit.id)}
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90
                ${isCompletedToday 
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 rotate-0' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}
                `}
            >
                <CheckIcon className={`w-6 h-6 transition-transform duration-300 ${isCompletedToday ? 'scale-100' : 'scale-75'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;