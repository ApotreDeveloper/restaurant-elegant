
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DashboardStatsProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel = "vs hier",
  color = 'primary',
  loading = false,
}) => {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-pulse h-[140px]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
          <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="w-24 h-4 bg-slate-100 rounded"></div>
          <div className="w-32 h-8 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-lg transition-colors", colorStyles[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend > 0 ? "bg-green-50 text-green-600" : trend < 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
          )}>
            {trend > 0 ? <ArrowUpRight size={14} /> : trend < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
           <p className="text-2xl font-bold text-slate-800">{value}</p>
           {trendLabel && <span className="text-xs text-slate-400 font-light">{trendLabel}</span>}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
