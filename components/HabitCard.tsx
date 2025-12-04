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
  
  // Resolve colors safely
  const colorKey = (habit.color in COLOR_VARIANTS) ? (habit.color as keyof typeof COLOR_VARIANTS) : 'indigo';
  const theme = COLOR_VARIANTS[colorKey];

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
          onClick={(e) => { e.stopPropagation(); onToggle(habit.id, dateStr); }}
          title={dateStr}
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors
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
    <div className="relative mb-3 animate-fadeIn">
      <div className={`
        relative overflow-hidden transition-colors duration-300 ease-out
        rounded-2xl border min-h-[5.5rem]
        ${isCompletedToday 
          ? `${theme.lightBg} ${theme.border} shadow-sm` 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}
      `}>
        
        {/* Progress Indicator Bar */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg} transition-opacity duration-300 ${isCompletedToday ? 'opacity-100' : 'opacity-0'}`} 
        />

        <div className="p-4 pl-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
            {/* Metadata Header */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-lg leading-none filter drop-shadow-sm select-none">
                {habit.icon || '📝'}
              </span>
              
              <span className={`
                text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase border
                ${theme.border} ${theme.text} bg-white/50 dark:bg-black/20 select-none
              `}>
                {habit.category}
              </span>

              {habit.notificationTime && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md select-none">
                   <ClockIcon className="w-3 h-3" />
                   {habit.notificationTime}
                </div>
              )}
            </div>
            
            <h3 className={`
              font-semibold text-base truncate transition-colors duration-300 select-none
              ${isCompletedToday 
                ? 'text-slate-500 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600' 
                : 'text-slate-900 dark:text-white'}
            `}>
              {habit.title}
            </h3>
            
            <div className="flex items-center gap-3 mt-1.5 h-4 select-none">
                 {habit.streak > 0 && (
                    <div className="flex items-center text-orange-500 dark:text-orange-400 text-[10px] font-bold gap-1">
                    <FlameIcon className="w-3 h-3 fill-orange-500 dark:fill-orange-400" />
                    <span>{habit.streak} dias</span>
                    </div>
                )}
                 {habit.description && (
                    <p className="text-slate-400 dark:text-slate-500 text-xs truncate max-w-[150px]">
                        {habit.description}
                    </p>
                 )}
            </div>
            
          </div>

          <div className="flex flex-col gap-2 items-end shrink-0">
            <button
                onClick={() => onToggle(habit.id, today)}
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0
                border
                ${isCompletedToday 
                    ? `${theme.bg} text-white shadow-md border-transparent` 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 border-slate-200 dark:border-slate-700'}
                `}
                aria-label={isCompletedToday ? "Desmarcar hábito" : "Marcar hábito como concluído"}
            >
                <CheckIcon className={`w-6 h-6 ${isCompletedToday ? 'stroke-[3px]' : 'stroke-2'}`} />
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-black/10 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowHistory(!showHistory); }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors p-1 select-none"
            >
                <CalendarIcon className="w-3 h-3" />
                {showHistory ? 'Fechar Histórico' : 'Histórico'}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(habit.id); }}
                className="text-xs font-medium text-slate-300 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors p-1"
                aria-label="Deletar hábito"
            >
                <TrashIcon className="w-3 h-3" />
            </button>
        </div>

        {/* Calendar Grid (History) */}
        {showHistory && (
             <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold text-center select-none">Últimos 30 dias</p>
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