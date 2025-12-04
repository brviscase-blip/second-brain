import React, { useState, useEffect } from 'react';
import { Habit, ViewState, HabitCategory, Theme } from './types';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import { ListIcon, BarChartIcon, PlusIcon, BrainIcon, SunIcon, MoonIcon } from './components/Icons';
import { getKaizenAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('second_brain_db');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Data corruption in local storage, resetting db.");
          return [];
        }
      }
    }
    return [
        { id: '1', title: 'Leitura Técnica', description: '30 minutos de documentação', category: HabitCategory.SKILL_ACQUISITION, streak: 3, completedDates: [], createdAt: new Date().toISOString() },
        { id: '2', title: 'Deep Work', description: 'Bloco de foco sem distrações', category: HabitCategory.DEEP_WORK, streak: 5, completedDates: [], createdAt: new Date().toISOString() }
    ];
  });

  const [view, setView] = useState<ViewState>('habits');
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') as Theme || 'dark';
    }
    return 'dark';
  });
  
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.DEEP_WORK);

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    localStorage.setItem('second_brain_db', JSON.stringify(habits));
  }, [habits]);

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let streak = 0;
    let checkDate = new Date();
    const lastCompleted = sorted[0];
    
    if (lastCompleted === today) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1); 
    } else if (lastCompleted === yesterday) {
        checkDate.setDate(checkDate.getDate() - 1); 
    } else {
        return 0; 
    }

    while (true) {
        const checkString = checkDate.toISOString().split('T')[0];
        if (completedDates.includes(checkString)) {
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
      return {
        ...h,
        completedDates: newCompletedDates,
        streak: calculateStreak(newCompletedDates)
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
    if(window.confirm("Deseja arquivar este protocolo?")) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative transition-colors duration-500 font-sans">
      
      {/* Modern Header - Frosted Glass effect if sticky, but simple here */}
      <header className="px-6 py-6 pt-10 z-10 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Second Brain</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button 
                onClick={handleGetAdvice}
                disabled={loadingAdvice}
                className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all active:scale-95 disabled:opacity-70"
            >
                <BrainIcon className={`w-5 h-5 ${loadingAdvice ? 'animate-pulse' : ''}`} />
            </button>
        </div>
      </header>

      {/* AI Advice Pill */}
      {advice && (
        <div className="px-6 pb-2 animate-fadeIn">
            <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative">
                <div className="flex gap-3">
                    <div className="min-w-[4px] bg-indigo-500 rounded-full"></div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pr-6 italic">"{advice}"</p>
                </div>
                <button onClick={() => setAdvice('')} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">✕</button>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-32 scroll-smooth">
        {view === 'habits' && (
          <div className="space-y-1 mt-2">
            {habits.length === 0 ? (
                <div className="text-center py-20 px-6">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-1">Tudo limpo por aqui</h3>
                    <p className="text-slate-500 text-sm">Adicione seu primeiro protocolo para começar a rastrear.</p>
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
          <div className="animate-slideUp pt-4 px-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Novo Protocolo</h2>
            <form onSubmit={addHabit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider ml-1">Nome do Hábito</label>
                <input 
                  type="text" 
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Ex: Leitura focada"
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-lg font-medium transition-all shadow-sm placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider ml-1">Categoria</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(HabitCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-3 text-xs font-bold uppercase rounded-xl border transition-all duration-200 ${
                        newHabitCategory === cat 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setView('habits')}
                    className="flex-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                  >
                    Criar Protocolo
                  </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {view === 'habits' && (
        <div className="absolute bottom-28 right-6 z-20">
             <button 
                onClick={() => setView('add')}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-600/40 flex items-center justify-center transition-transform hover:-translate-y-1 active:scale-90"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
      )}

      {/* Modern Glass Navigation */}
      <nav className="absolute bottom-6 left-6 right-6 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 z-30 flex items-center justify-around px-2">
          <button 
            onClick={() => setView('habits')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${view === 'habits' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ListIcon className={`w-6 h-6 mb-0.5 transition-transform ${view === 'habits' ? '-translate-y-1' : ''}`} />
            {view === 'habits' && <span className="absolute bottom-2 w-1 h-1 bg-indigo-600 rounded-full"></span>}
          </button>
          
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${view === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <BarChartIcon className={`w-6 h-6 mb-0.5 transition-transform ${view === 'dashboard' ? '-translate-y-1' : ''}`} />
             {view === 'dashboard' && <span className="absolute bottom-2 w-1 h-1 bg-indigo-600 rounded-full"></span>}
          </button>
      </nav>

    </div>
  );
};

export default App;