import React, { useState, useEffect } from 'react';
import { Habit, ViewState, HabitCategory, Theme } from './types';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import { ListIcon, BarChartIcon, PlusIcon, BrainIcon, SunIcon, MoonIcon } from './components/Icons';
import { getKaizenAdvice } from './services/geminiService';

const App: React.FC = () => {
  // Lazy initialization for robust LocalStorage handling
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
    // Default/Initial Data if storage is empty
    return [
        { id: '1', title: 'READ TECHNICAL MANUAL', category: HabitCategory.SKILL_ACQUISITION, streak: 3, completedDates: [], createdAt: new Date().toISOString() },
        { id: '2', title: 'DEEP WORK SESSION (4H)', category: HabitCategory.DEEP_WORK, streak: 5, completedDates: [], createdAt: new Date().toISOString() }
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
  
  // Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.DEEP_WORK);

  // Theme Handling
  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Save to local storage whenever habits change
  useEffect(() => {
    localStorage.setItem('second_brain_db', JSON.stringify(habits));
  }, [habits]);

  // Recalculate Streaks Logic
  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let streak = 0;
    let checkDate = new Date();
    
    // Check if streak is active (completed today or yesterday)
    const lastCompleted = sorted[0];
    if (lastCompleted === today) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1); 
    } else if (lastCompleted === yesterday) {
        // Streak is alive but not completed today yet.
        // Logic choice: Does streak count today? 
        // Usually current streak includes consecutive past days.
        // If we want to count continuous days:
        // We start checking from yesterday backwards.
        checkDate.setDate(checkDate.getDate() - 1); 
    } else {
        return 0; 
    }

    while (true) {
        const checkString = checkDate.toISOString().split('T')[0];
        if (completedDates.includes(checkString)) {
             // If we already counted today as 1, we don't increment for today again, but the loop logic handles past days
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
    if(window.confirm("CONFIRM ARCHIVAL: This protocol will be removed from tracking.")) {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      
      {/* Header */}
      <header className="bg-white dark:bg-black p-6 border-b border-zinc-200 dark:border-zinc-800 z-10 sticky top-0">
        <div className="flex justify-between items-center mb-1">
            <h1 className="text-lg font-black tracking-tighter uppercase">Second Brain <span className="text-blue-600">OS</span></h1>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500"
                >
                    {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                <button 
                    onClick={handleGetAdvice}
                    disabled={loadingAdvice}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-black p-2 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                    <BrainIcon className={`w-5 h-5 ${loadingAdvice ? 'animate-pulse' : ''}`} />
                </button>
            </div>
        </div>
        <div className="flex justify-between items-end">
             <p className="text-zinc-400 text-xs font-mono uppercase">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
        
        {advice && (
             <div className="mt-4 bg-zinc-100 dark:bg-zinc-900 border-l-4 border-blue-600 p-4 text-sm shadow-sm animate-fadeIn relative">
                 <p className="font-mono text-zinc-800 dark:text-zinc-300 pr-4">"{advice}"</p>
                 <button onClick={() => setAdvice('')} className="absolute top-2 right-2 text-zinc-400 hover:text-black dark:hover:text-white">✕</button>
             </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-0 scroll-smooth bg-zinc-50 dark:bg-zinc-950">
        {view === 'habits' && (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {habits.length === 0 ? (
                <div className="text-center py-24 opacity-40">
                    <p className="font-bold uppercase tracking-widest">No Protocols Active</p>
                    <p className="text-xs mt-2 font-mono">Initialize new system.</p>
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
            <div className="h-24"></div> 
          </div>
        )}

        {view === 'dashboard' && <div className="p-4 pb-24"><Dashboard habits={habits} /></div>}

        {view === 'add' && (
          <div className="p-6 animate-slideUp">
            <h2 className="text-2xl font-black uppercase mb-8">Initialize Protocol</h2>
            <form onSubmit={addHabit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Protocol Name</label>
                <input 
                  type="text" 
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="EXECUTE: "
                  className="w-full p-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-600 dark:focus:border-blue-600 text-lg font-bold transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Sector</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(HabitCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-3 text-xs font-bold uppercase rounded-md border-2 transition-all ${
                        newHabitCategory === cat 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold uppercase tracking-wider py-4 rounded-lg shadow-none transition-all active:scale-[0.99]"
                  >
                    Confirm Protocol
                  </button>
                  <button 
                    type="button"
                    onClick={() => setView('habits')}
                    className="w-full mt-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold uppercase py-3"
                  >
                    Cancel
                  </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Floating Action Button (Only on Habits view) */}
      {view === 'habits' && (
        <button 
          onClick={() => setView('add')}
          className="absolute bottom-24 right-6 bg-blue-600 text-white w-14 h-14 rounded-lg shadow-2xl flex items-center justify-center hover:bg-blue-700 active:translate-y-1 transition-all z-20"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-0 absolute bottom-0 w-full z-30">
        <div className="grid grid-cols-2">
          <button 
            onClick={() => setView('habits')}
            className={`flex flex-col items-center justify-center gap-1 p-4 transition-colors ${view === 'habits' ? 'border-t-2 border-black dark:border-white text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-t-2 border-transparent'}`}
          >
            <ListIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Logs</span>
          </button>
          
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 p-4 transition-colors ${view === 'dashboard' ? 'border-t-2 border-black dark:border-white text-black dark:text-white' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 border-t-2 border-transparent'}`}
          >
            <BarChartIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Metrics</span>
          </button>
        </div>
      </nav>

    </div>
  );
};

export default App;