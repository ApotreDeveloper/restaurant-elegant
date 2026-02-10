
import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'form' | 'text';
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'text', count = 1, className }) => {
  const items = Array.from({ length: count });

  if (variant === 'table') {
    return (
      <div className={cn("w-full bg-white rounded-lg border border-slate-200 overflow-hidden", className)}>
        <div className="h-10 bg-slate-50 border-b border-slate-200 animate-pulse" />
        {items.map((_, i) => (
          <div key={i} className="flex items-center p-4 border-b border-slate-100 gap-4">
            <div className="w-8 h-8 bg-slate-100 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-slate-50 rounded w-1/4 animate-pulse" />
            </div>
            <div className="w-20 h-6 bg-slate-50 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
        {items.map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg" />
              <div className="w-16 h-6 bg-slate-100 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-slate-100 rounded" />
              <div className="w-32 h-8 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-slate-100 rounded animate-pulse w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
