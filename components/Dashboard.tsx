import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Habit } from '../types';

interface DashboardProps {
  habits: Habit[];
}

const Dashboard: React.FC<DashboardProps> = ({ habits }) => {
  const getLast7DaysData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let completedCount = 0;
      habits.forEach(h => {
        if (h.completedDates.includes(dateStr)) {
          completedCount++;
        }
      });

      data.push({
        day: date.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
        completed: completedCount,
        fullDate: dateStr
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();
  const totalCompletedToday = habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length;
  const completionRate = habits.length > 0 ? Math.round((totalCompletedToday / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Metric Cards - Modern Layout */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="w-16 h-16 bg-blue-500 rounded-full blur-2xl"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Hoje</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{totalCompletedToday}</span>
            <span className="text-slate-400 text-sm font-medium">/ {habits.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className={`w-16 h-16 rounded-full blur-2xl ${completionRate >= 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Eficiência</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-bold tracking-tight ${completionRate >= 80 ? 'text-emerald-500' : 'text-slate-900 dark:text-slate-200'}`}>
              {completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Modern Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Consistência Semanal</h3>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                    return (
                        <div className="bg-slate-800 text-white text-xs py-1 px-3 rounded-lg shadow-xl">
                        {payload[0].value} hábitos
                        </div>
                    );
                    }
                    return null;
                }}
              />
              <Bar dataKey="completed" radius={[6, 6, 6, 6]} animationDuration={1000} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fullDate === new Date().toISOString().split('T')[0] ? '#6366f1' : '#e2e8f0'} 
                    className="dark:fill-slate-800 hover:fill-indigo-400 dark:hover:fill-slate-700 transition-all"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Card */}
      <div className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
            <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-indigo-600 dark:text-indigo-400">Filosofia do Sistema</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
            "A consistência supera a intensidade." <br/> Mantenha o fluxo contínuo. Não quebre a corrente.
            </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-5 dark:opacity-10 transform translate-x-4 translate-y-4">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;