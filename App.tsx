import React, { useState, useEffect, useCallback } from 'react';
import { Habit, ViewState, HabitCategory } from './types';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import { ListIcon, BarChartIcon, PlusIcon, BrainIcon } from './components/Icons';
import { getKaizenAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [view, setView] = useState<ViewState>('habits');
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  
  // Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.LEARNING);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('kaizen_habits');
    if (saved) {
      setHabits(JSON.parse(saved));
    } else {
        // Initial Dummy Data
        setHabits([
            { id: '1', title: 'Ler 10 páginas', category: HabitCategory.LEARNING, streak: 3, completedDates: [], createdAt: new Date().toISOString() },
            { id: '2', title: 'Beber 2L de água', category: HabitCategory.HEALTH, streak: 5, completedDates: [], createdAt: new Date().toISOString() }
        ]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('kaizen_habits', JSON.stringify(habits));
  }, [habits]);

  // Recalculate Streaks Logic
  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    // Sort dates desc
    const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let streak = 0;
    let checkDate = new Date();
    
    // Check if today is done, if not, start checking from yesterday to keep streak alive strictly
    // But for a forgiving streak, if today is not done, we check if yesterday was done.
    
    if (sorted[0] === today) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday
    } else if (sorted[0] === yesterday) {
        // Did not do today yet, but streak is valid from yesterday
        checkDate.setDate(checkDate.getDate() - 1); // Start check from yesterday
    } else {
        return 0; // Broken streak
    }

    // Iterate backwards
    while (true) {
        const checkString = checkDate.toISOString().split('T')[0];
        if (completedDates.includes(checkString)) {
             // If we already counted today, don't double count
             if (checkString !== today) streak++;
             checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;

      const today = new Date().toISOString().split('T')[0];
      const isCompleted = h.completedDates.includes(today);
      
      let newCompletedDates;
      if (isCompleted) {
        newCompletedDates = h.completedDates.filter(d => d !== today);
      } else {
        newCompletedDates = [...h.completedDates, today];
      }

      const newStreak = calculateStreak(newCompletedDates);

      return {
        ...h,
        completedDates: newCompletedDates,
        streak: newStreak
      };
    }));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      title: newHabitTitle,
      category: newHabitCategory,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString()
    };

    setHabits([...habits, newHabit]);
    setNewHabitTitle('');
    setView('habits');
  };

  const deleteHabit = (id: string) => {
    if(window.confirm("Tem certeza que deseja remover este hábito?")) {
        setHabits(prev => prev.filter(h => h.id !== id));
    }
  }

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getKaizenAdvice(habits);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <header className="bg-white p-6 pb-4 shadow-sm z-10">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Zona de Hábitos</h1>
                <p className="text-slate-500 text-sm font-medium">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
            <button 
                onClick={handleGetAdvice}
                disabled={loadingAdvice}
                className="bg-indigo-50 p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
                <BrainIcon className={`w-6 h-6 ${loadingAdvice ? 'animate-pulse' : ''}`} />
            </button>
        </div>
        
        {advice && (
             <div className="mt-4 bg-indigo-600 text-white p-3 rounded-lg text-sm shadow-md animate-fadeIn flex items-start gap-2">
                 <BrainIcon className="w-4 h-4 mt-0.5 shrink-0" />
                 <p>{advice}</p>
                 <button onClick={() => setAdvice('')} className="ml-auto text-indigo-200 hover:text-white">x</button>
             </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
        {view === 'habits' && (
          <div className="space-y-4">
            {habits.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <p>Nenhum hábito cadastrado.</p>
                    <p className="text-sm">Comece hoje sua jornada Kaizen.</p>
                </div>
            ) : (
                habits.map(habit => (
                <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    onToggle={toggleHabit}
                    onDelete={deleteHabit}
                />
                ))
            )}
          </div>
        )}

        {view === 'dashboard' && <Dashboard habits={habits} />}

        {view === 'add' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-slideUp">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Novo Hábito</h2>
            <form onSubmit={addHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">O que você vai fazer?</label>
                <input 
                  type="text" 
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Ex: Ler 15 min, Meditar..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(HabitCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        newHabitCategory === cat 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-medium' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 mt-4"
              >
                Criar Compromisso
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Floating Action Button (Only on Habits view) */}
      {view === 'habits' && (
        <button 
          onClick={() => setView('add')}
          className="absolute bottom-24 right-6 bg-slate-900 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-90 transition-all z-20"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 p-2 absolute bottom-0 w-full z-30">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setView('habits')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-xl transition-colors ${view === 'habits' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ListIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Hoje</span>
          </button>
          
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-xl transition-colors ${view === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChartIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Progresso</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

export default App;