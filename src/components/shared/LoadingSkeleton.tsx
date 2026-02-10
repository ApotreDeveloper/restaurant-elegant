
import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'menuCard' | 'blogCard' | 'galleryGrid' | 'hero' | 'table';
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'text', count = 1, className }) => {
  const items = Array.from({ length: count });

  if (variant === 'menuCard') {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}>
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden h-[450px] flex flex-col border border-slate-100">
            <div className="h-3/5 bg-slate-200 animate-pulse" />
            <div className="p-6 flex flex-col justify-between flex-grow">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-slate-200 rounded w-2/3 animate-pulse" />
                  <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-4">
                <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
                <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'blogCard') {
    return (
      <div className={cn("grid md:grid-cols-2 gap-8", className)}>
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full border border-slate-100">
            <div className="h-48 bg-slate-200 animate-pulse" />
            <div className="p-6 flex flex-col flex-grow space-y-4">
              <div className="flex gap-2">
                <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
              </div>
              <div className="pt-4 mt-auto border-t border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'galleryGrid') {
    return (
      <div className={cn("columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4", className)}>
        {items.map((_, i) => (
          <div 
            key={i} 
            className="bg-slate-200 rounded-lg animate-pulse break-inside-avoid"
            style={{ height: `${Math.random() * 200 + 200}px` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={cn("relative h-[40vh] min-h-[300px] bg-slate-200 animate-pulse w-full", className)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
          <div className="h-4 bg-slate-300 rounded w-48 opacity-50" />
          <div className="h-12 bg-slate-300 rounded w-96 opacity-50" />
          <div className="h-6 bg-slate-300 rounded w-64 opacity-50" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn("w-full bg-white rounded-lg border border-slate-200 overflow-hidden", className)}>
        <div className="h-12 bg-slate-50 border-b border-slate-200 animate-pulse" />
        {items.map((_, i) => (
          <div key={i} className="flex items-center p-4 border-b border-slate-100 gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-slate-50 rounded w-1/4 animate-pulse" />
            </div>
            <div className="w-20 h-8 bg-slate-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-slate-200 rounded animate-pulse" 
          style={{ width: `${Math.random() * 30 + 70}%` }} 
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
