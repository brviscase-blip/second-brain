import React, { useState } from 'react';
import { Habit, COLOR_VARIANTS } from '../types';
import { CheckIcon, FlameIcon, TrashIcon, CalendarIcon, ClockIcon } from './Icons';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string, dateStr: string) => void;
  onDelete: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete }) => {
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);
  
  // Resolve colors based on habit selection, default to indigo if missing
  // @ts-ignore
  const theme = COLOR_VARIANTS[habit.color] || COLOR_VARIANTS.indigo;

  const renderHistoryGrid = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isDone = habit.completedDates.includes(dateStr);
      const isToday = dateStr === today;
      
      days.push(
        <button
          key={dateStr}
          onClick={() => onToggle(habit.id, dateStr)}
          title={dateStr}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all
            ${isDone 
              ? `${theme.bg} text-white border-transparent` 
              : `bg-transparent ${theme.border} text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800`}
            ${isToday ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600' : ''}
          `}
        >
          {isDone ? <CheckIcon className="w-4 h-4" /> : d.getDate()}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative group mb-3 px-1">
      <div className={`
        relative overflow-hidden transition-all duration-300 ease-out
        rounded-2xl border
        ${isCompletedToday 
          ? `${theme.lightBg} ${theme.border} shadow-md` 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700'}
      `}>
        
        {/* Progress Indicator */}
        {isCompletedToday && (
           <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.bg}`} />
        )}

        <div className="p-4 pl-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Metadata Header */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-lg leading-none filter drop-shadow-sm`}>
                {habit.icon || '📝'}
              </span>
              
              <span className={`
                text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase border
                ${theme.border} ${theme.text} bg-white/50 dark:bg-black/20
              `}>
                {habit.category}
              </span>

              {habit.notificationTime && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                   <ClockIcon className="w-3 h-3" />
                   {habit.notificationTime}
                </div>
              )}
              
              {habit.streak > 0 && (
                <div className="flex items-center text-orange-500 dark:text-orange-400 text-[10px] font-bold gap-1 ml-auto sm:ml-0">
                  <FlameIcon className="w-3 h-3 fill-orange-500 dark:fill-orange-400" />
                  <span>{habit.streak}</span>
                </div>
              )}
            </div>
            
            <h3 className={`
              font-semibold text-base truncate transition-colors
              ${isCompletedToday 
                ? 'text-slate-800 dark:text-slate-100 line-through decoration-slate-300 dark:decoration-slate-600 decoration-2 opacity-70' 
                : 'text-slate-900 dark:text-white'}
            `}>
              {habit.title}
            </h3>
            
            {habit.description && (
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate font-medium">
                    {habit.description}
                </p>
            )}
            
            {/* Frequency Badges */}
            <div className="flex gap-1 mt-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                    <span key={idx} className={`
                        text-[8px] w-4 h-4 flex items-center justify-center rounded-full
                        ${habit.frequency.includes(idx) 
                            ? 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 font-bold' 
                            : 'text-slate-300 dark:text-slate-700 opacity-50'}
                    `}>
                        {day}
                    </span>
                ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <button
                onClick={() => onToggle(habit.id, today)}
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90
                ${isCompletedToday 
                    ? `${theme.bg} text-white shadow-lg rotate-0` 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}
                `}
            >
                <CheckIcon className={`w-6 h-6 transition-transform duration-300 ${isCompletedToday ? 'scale-100' : 'scale-75'}`} />
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
                <CalendarIcon className="w-3 h-3" />
                {showHistory ? 'Ocultar Histórico' : 'Editar / Ver Histórico'}
            </button>
            <button 
                onClick={() => onDelete(habit.id)}
                className="text-xs font-medium text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
            >
                <TrashIcon className="w-3 h-3" />
            </button>
        </div>

        {/* Calendar Grid (History) */}
        {showHistory && (
             <div className="p-4 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold text-center">Últimos 30 dias</p>
                <div className="flex flex-wrap gap-2 justify-center">
                    {renderHistoryGrid()}
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default HabitCard;
