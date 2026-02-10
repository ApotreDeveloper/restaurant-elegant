
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { RevenueData } from '../../services/api/dashboard';
import { formatPrice } from '../../utils/helpers';

interface RevenueChartProps {
  data: RevenueData[];
  loading?: boolean;
  period: 'week' | 'month';
  onPeriodChange: (period: 'week' | 'month') => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading, period, onPeriodChange }) => {
  if (loading) {
    return (
      <div className="h-[300px] w-full bg-slate-50 rounded-lg animate-pulse flex items-center justify-center text-slate-300">
        Chargement du graphique...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800 text-lg">Revenus</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => onPeriodChange('week')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              period === 'week' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            7 Jours
          </button>
          <button
            onClick={() => onPeriodChange('month')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              period === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            30 Jours
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [formatPrice(value), 'Revenu']}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#D4AF37" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
