import React, { useState, useEffect } from 'react';
import { Habit, ViewState, HabitCategory, Theme, COLORS } from './types';
import HabitCard from './components/HabitCard';
import Dashboard from './components/Dashboard';
import { ListIcon, BarChartIcon, PlusIcon, SunIcon, MoonIcon, BellIcon, ClockIcon } from './components/Icons';

const App: React.FC = () => {
  // --- STATE ---
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
        { 
            id: '1', 
            title: 'Leitura Técnica', 
            description: '30 minutos de documentação', 
            category: HabitCategory.SKILL_ACQUISITION, 
            streak: 3, 
            completedDates: [], 
            createdAt: new Date().toISOString(),
            frequency: [0,1,2,3,4,5,6],
            color: 'indigo',
            icon: '📚'
        },
        { 
            id: '2', 
            title: 'Deep Work', 
            description: 'Bloco de foco sem distrações', 
            category: HabitCategory.DEEP_WORK, 
            streak: 5, 
            completedDates: [], 
            createdAt: new Date().toISOString(),
            frequency: [1,2,3,4,5], // Mon-Fri
            color: 'emerald',
            icon: '🧠',
            notificationTime: '09:00'
        }
    ];
  });

  const [view, setView] = useState<ViewState>('habits');
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme') as Theme;
        return saved || 'dark';
    }
    return 'dark';
  });
  
  // Add Habit Form State
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.DEEP_WORK);
  const [newHabitTime, setNewHabitTime] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('indigo');
  const [newHabitIcon, setNewHabitIcon] = useState('⚡');
  const [newHabitFreq, setNewHabitFreq] = useState<number[]>([0,1,2,3,4,5,6]);

  const ICONS = ['⚡', '📚', '💪', '🧘', '💧', '💊', '🧠', '💰', '🎯', '🏃', '💤', '🥗'];

  // --- EFFECTS ---

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist habits
  useEffect(() => {
    try {
        localStorage.setItem('second_brain_db', JSON.stringify(habits));
    } catch (e) {
        console.error("Failed to save to localStorage");
    }
  }, [habits]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
  }, []);

  // Notification Check Loop (Simple Polling)
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        habits.forEach(h => {
            if (h.notificationTime === currentTime && !h.completedDates.includes(now.toISOString().split('T')[0])) {
                 // Only notify if today is a scheduled day
                 if (h.frequency.includes(now.getDay())) {
                     if ('Notification' in window && Notification.permission === 'granted') {
                         new Notification(`Hora de: ${h.title}`, {
                             body: "Mantenha a disciplina. Execute o protocolo.",
                             icon: '/favicon.ico' 
                         });
                     }
                 }
            }
        });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [habits]);


  // --- LOGIC ---

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let streak = 0;
    let checkDate = new Date();
    const lastCompleted = sorted[0];
    
    // Check if streak is alive (completed today or yesterday)
    if (lastCompleted !== today && lastCompleted !== yesterday) {
        // Technically streak is 0 if not done yesterday, but visually we might want to show previous streak
        // strictly speaking, streak resets if you miss a day.
        return 0; 
    }

    // Simple consecutive day check (ignoring frequency gaps for simplicity in this version)
    // A robust system would check frequency, but for now we count consecutive logged days.
    let currentCheck = new Date(lastCompleted);
    
    for (let i = 0; i < sorted.length; i++) {
        const d = sorted[i];
        const dateStr = currentCheck.toISOString().split('T')[0];
        if (d === dateStr) {
            streak++;
            currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const toggleHabit = (id: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      
      const isCompleted = h.completedDates.includes(dateStr);
      let newCompletedDates;
      
      if (isCompleted) {
        newCompletedDates = h.completedDates.filter(d => d !== dateStr);
      } else {
        newCompletedDates = [...h.completedDates, dateStr];
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
      createdAt: new Date().toISOString(),
      frequency: newHabitFreq,
      color: newHabitColor,
      icon: newHabitIcon,
      notificationTime: newHabitTime
    };
    
    setHabits([...habits, newHabit]);
    
    // Reset Form
    setNewHabitTitle('');
    setNewHabitTime('');
    setNewHabitFreq([0,1,2,3,4,5,6]);
    setView('habits');
  };

  const deleteHabit = (id: string) => {
    if(window.confirm("Arquivar protocolo permanentemente?")) {
        setHabits(prev => prev.filter(h => h.id !== id));
    }
  }

  const toggleFreqDay = (dayIndex: number) => {
      if (newHabitFreq.includes(dayIndex)) {
          if (newHabitFreq.length > 1) {
             setNewHabitFreq(newHabitFreq.filter(d => d !== dayIndex));
          }
      } else {
          setNewHabitFreq([...newHabitFreq, dayIndex]);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative transition-colors duration-500 font-sans border-x border-slate-200 dark:border-slate-800">
      
      {/* Header */}
      <header className="px-6 py-6 pt-10 z-10 flex justify-between items-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 border-b border-slate-100 dark:border-slate-900">
        <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans uppercase">Second Brain</h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                Protocolos Ativos
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-32 scroll-smooth">
        {view === 'habits' && (
          <div className="space-y-1">
            {habits.length === 0 ? (
                <div className="text-center py-20 px-6 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                        <ListIcon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Sem Protocolos</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">Adicione um novo hábito para começar o monitoramento.</p>
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
          <div className="animate-slideUp pt-2 px-2 pb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Novo Protocolo</h2>
            <form onSubmit={addHabit} className="space-y-6">
              
              {/* Nome */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Definição</label>
                <input 
                  type="text" 
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Ex: Leitura focada"
                  className="w-full p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  autoFocus
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Ícone</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {ICONS.map(icon => (
                        <button
                            key={icon}
                            type="button"
                            onClick={() => setNewHabitIcon(icon)}
                            className={`min-w-[48px] h-12 text-xl rounded-xl border flex items-center justify-center transition-all ${newHabitIcon === icon ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md scale-110' : 'bg-transparent border-slate-200 dark:border-slate-800 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'}`}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
              </div>

               {/* Color Selection */}
               <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Cor do Sistema</label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {Object.keys(COLORS).map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setNewHabitColor(color)}
                            className={`w-8 h-8 rounded-full transition-all ring-2 ring-offset-2 dark:ring-offset-slate-950 ${COLORS[color as keyof typeof COLORS]} ${newHabitColor === color ? 'ring-slate-400 dark:ring-white scale-110' : 'ring-transparent opacity-50 hover:opacity-100'}`}
                        />
                    ))}
                </div>
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(HabitCategory).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHabitCategory(cat)}
                      className={`p-3 text-[10px] font-bold uppercase rounded-xl border transition-all ${
                        newHabitCategory === cat 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduling: Freq & Time */}
              <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1">Frequência</label>
                    <div className="flex justify-between bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => toggleFreqDay(idx)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                    newHabitFreq.includes(idx)
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                        <ClockIcon className="w-3 h-3" /> Horário (Opcional)
                    </label>
                    <input 
                        type="time"
                        value={newHabitTime}
                        onChange={(e) => setNewHabitTime(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">Notificações serão enviadas se o navegador permitir.</p>
                  </div>
              </div>

              <div className="pt-4 flex gap-4">
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