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
        day: date.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase(),
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
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Daily Execution</p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{totalCompletedToday}<span className="text-zinc-300 dark:text-zinc-600">/</span>{habits.length}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold tracking-widest uppercase">Efficiency Rate</p>
          <div className="flex items-end gap-2 mt-2">
            <span className={`text-3xl font-black leading-none ${completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-900 dark:text-zinc-200'}`}>
              {completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-widest mb-6">7-Day Performance Output</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                    backgroundColor: '#18181b', 
                    color: '#fff', 
                    borderRadius: '0px', 
                    border: 'none', 
                    fontSize: '12px',
                    textTransform: 'uppercase'
                }}
              />
              <Bar dataKey="completed" radius={[2, 2, 0, 0]} animationDuration={1000} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fullDate === new Date().toISOString().split('T')[0] ? '#2563eb' : '#3f3f46'} 
                    className="dark:fill-zinc-700 hover:fill-zinc-900 dark:hover:fill-zinc-500 transition-all"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Philosophy Card */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-black">
        <h3 className="font-bold text-xs uppercase tracking-widest mb-2 text-zinc-900 dark:text-zinc-200">System Note</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-mono">
          Consistency is the only metric that matters. Do not break the chain. 
          Optimize your daily workflow to ensure 100% protocol adherence.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;