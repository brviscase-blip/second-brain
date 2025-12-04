import React, { useState, useEffect } from 'react';
import { Habit, ViewState, HabitCategory, Theme } from './types';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import { ListIcon, BarChartIcon, PlusIcon, BrainIcon, SunIcon, MoonIcon } from './components/Icons';
import { getKaizenAdvice } from './services/geminiService';

const App: React.FC = () => {
  // Safe localStorage initialization
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('second_brain_db');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Data corruption in local storage, resetting db.");
      }
    }
    // Default Starter Habits
    return [
        { id: '1', title: 'Leitura Técnica', description: '30 minutos de documentação', category: HabitCategory.SKILL_ACQUISITION, streak: 3, completedDates: [], createdAt: new Date().toISOString() },
        { id: '2', title: 'Deep Work', description: 'Bloco de foco sem distrações', category: HabitCategory.DEEP_WORK, streak: 5, completedDates: [], createdAt: new Date().toISOString() }
    ];
  });

  const [view, setView] = useState<ViewState>('habits');
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  
  // FORCE DARK MODE DEFAULT
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme') as Theme;
        return saved || 'dark'; // Default to dark if nothing saved
    }
    return 'dark';
  });
  
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.DEEP_WORK);

  // Apply theme class to HTML element
  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Persist habits
  useEffect(() => {
    try {
        localStorage.setItem('second_brain_db', JSON.stringify(habits));
    } catch (e) {
        console.error("Failed to save to localStorage");
    }
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
    if(window.confirm("Arquivar protocolo permanentemente?")) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative transition-colors duration-500 font-sans border-x border-slate-200 dark:border-slate-800">
      
      {/* Modern Header */}
      <header className="px-6 py-6 pt-10 z-10 flex justify-between items-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 border-b border-slate-100 dark:border-slate-900">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">SECOND BRAIN</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button 
                onClick={handleGetAdvice}
                disabled={loadingAdvice}
                className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Get AI Advice"
            >
                <BrainIcon className={`w-5 h-5 ${loadingAdvice ? 'animate-pulse' : ''}`} />
            </button>
        </div>
      </header>

      {/* AI Advice Pill */}
      {advice && (
        <div className="px-6 py-4 animate-fadeIn">
            <div className="bg-slate-900 dark:bg-indigo-950/30 p-4 rounded-xl border-l-4 border-indigo-500 shadow-md relative">
                <p className="text-sm font-medium text-slate-200 dark:text-indigo-100 leading-relaxed pr-6">"{advice}"</p>
                <button onClick={() => setAdvice('')} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors p-1">✕</button>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-32 scroll-smooth">
        {view === 'habits' && (
          <div className="space-y-1">
            {habits.length === 0 ? (
                <div className="text-center py-20 px-6 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                        <ListIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Sistema Vazio</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">Inicie um novo protocolo para começar o monitoramento.</p>
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Novo Protocolo</h2>
            <form onSubmit={addHabit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Definição</label>
                <input 
                  type="text" 
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Ex: Leitura focada"
                  className="w-full p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-medium transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  autoFocus
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Categoria</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(HabitCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-4 text-xs font-bold uppercase rounded-xl border transition-all duration-200 ${
                        newHabitCategory === cat 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setView('habits')}
                    className="flex-1 bg-transparent text-slate-500 dark:text-slate-400 font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase text-xs tracking-wider"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 uppercase text-xs tracking-wider"
                  >
                    Inicializar
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
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-900/30 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
        </div>
      )}

      {/* Modern Glass Navigation */}
      <nav className="absolute bottom-6 left-6 right-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-30 flex items-center justify-around px-2">
          <button 
            onClick={() => setView('habits')}
            className={`flex flex-col items-center justify-center w-full h-full rounded-l-2xl transition-all ${view === 'habits' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ListIcon className={`w-6 h-6 mb-1 ${view === 'habits' ? 'fill-indigo-100 dark:fill-indigo-900/30' : ''}`} />
          </button>
          
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>

          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full rounded-r-2xl transition-all ${view === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <BarChartIcon className={`w-6 h-6 mb-1 ${view === 'dashboard' ? 'fill-indigo-100 dark:fill-indigo-900/30' : ''}`} />
          </button>
      </nav>

    </div>
  );
};

export default App;