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
  // Calculate completion for the last 7 days
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
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
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
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase">Hoje</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-800">{totalCompletedToday}/{habits.length}</span>
            <span className="text-sm text-slate-400 mb-1">hábitos</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase">Taxa</p>
          <div className="flex items-end gap-2 mt-1">
            <span className={`text-3xl font-bold ${completionRate >= 80 ? 'text-emerald-500' : 'text-indigo-500'}`}>
              {completionRate}%
            </span>
            <span className="text-sm text-slate-400 mb-1">concluído</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Consistência (7 Dias)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completed" radius={[4, 4, 0, 0]} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fullDate === new Date().toISOString().split('T')[0] ? '#10b981' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="font-bold text-lg mb-2">Filosofia Kaizen</h3>
        <p className="text-indigo-100 text-sm leading-relaxed">
          "Pequenas melhorias diárias criam grandes resultados ao longo do tempo."
          Não quebre a corrente. Se falhar um dia, recupere-se imediatamente no próximo.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;