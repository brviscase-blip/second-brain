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
      relative overflow-hidden p-4 rounded-xl border transition-all duration-300 shadow-sm
      ${isCompletedToday 
        ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100' 
        : 'bg-white border-slate-200 hover:shadow-md'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              habit.category === 'Saúde' ? 'bg-blue-100 text-blue-700' :
              habit.category === 'Aprendizado' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {habit.category}
            </span>
            <div className="flex items-center text-orange-500 text-xs font-bold gap-1">
              <FlameIcon className="w-3 h-3 fill-orange-500" />
              <span>{habit.streak} dias</span>
            </div>
          </div>
          <h3 className={`font-bold text-lg ${isCompletedToday ? 'text-emerald-800' : 'text-slate-800'}`}>
            {habit.title}
          </h3>
          {habit.description && <p className="text-slate-500 text-sm mt-0.5">{habit.description}</p>}
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => onDelete(habit.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Excluir hábito"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => onToggle(habit.id)}
                className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                ${isCompletedToday 
                    ? 'bg-emerald-500 text-white scale-110 rotate-0' 
                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200 rotate-180'}
                `}
            >
                <CheckIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
      
      {/* Progress Bar Background Effect */}
      {isCompletedToday && (
        <div className="absolute bottom-0 left-0 h-1 bg-emerald-400 animate-slideRight w-full" />
      )}
    </div>
  );
};

export default HabitCard;