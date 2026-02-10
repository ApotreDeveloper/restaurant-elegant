
import React from 'react';
import { subDays, startOfMonth, subMonths, format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange, className }) => {
  
  const handlePreset = (preset: 'today' | '7days' | '30days' | 'month' | 'prevMonth') => {
    const today = new Date();
    let start = today;
    let end = today;

    switch (preset) {
      case 'today':
        break;
      case '7days':
        start = subDays(today, 7);
        break;
      case '30days':
        start = subDays(today, 30);
        break;
      case 'month':
        start = startOfMonth(today);
        break;
      case 'prevMonth':
        end = subDays(startOfMonth(today), 1);
        start = startOfMonth(subMonths(today, 1));
        break;
    }

    onChange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2 bg-white p-1 rounded-lg border border-slate-200", className)}>
      <div className="flex items-center gap-2 px-2 py-1">
        <Calendar size={16} className="text-slate-400" />
        <input 
          type="date" 
          value={startDate || ''} 
          onChange={(e) => onChange({ startDate: e.target.value, endDate: endDate || e.target.value })}
          className="text-xs font-medium text-slate-700 focus:outline-none border-b border-transparent focus:border-primary bg-transparent w-24"
        />
        <span className="text-slate-300">-</span>
        <input 
          type="date" 
          value={endDate || ''} 
          onChange={(e) => onChange({ startDate: startDate || e.target.value, endDate: e.target.value })}
          className="text-xs font-medium text-slate-700 focus:outline-none border-b border-transparent focus:border-primary bg-transparent w-24"
        />
      </div>
      
      <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

      <div className="flex gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0 no-scrollbar">
        {[
          { label: '7j', value: '7days' },
          { label: '30j', value: '30days' },
          { label: 'Ce mois', value: 'month' },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value as any)}
            className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500 hover:text-primary hover:bg-slate-50 rounded transition-colors whitespace-nowrap"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangePicker;
