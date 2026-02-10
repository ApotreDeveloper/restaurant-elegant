
import React from 'react';
import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'inline' | 'banner' | 'page' | 'card';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = "Erreur",
  message = "Une erreur inattendue est survenue.", 
  onRetry, 
  variant = 'inline',
  className 
}) => {
  if (variant === 'page') {
    return (
      <div className={cn("min-h-[60vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in", className)}>
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-secondary mb-3">{title}</h2>
        <p className="text-secondary/70 max-w-md mb-8 leading-relaxed">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} leftIcon={<RefreshCw size={18} />}>
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn("bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-red-800", className)}>
        <AlertTriangle className="shrink-0 text-red-500" size={24} />
        <div className="flex-grow">
          <h4 className="font-bold text-sm uppercase tracking-wide mb-1">{title}</h4>
          <p className="text-sm text-red-600/90">{message}</p>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-white border border-red-200 rounded-md text-sm font-bold text-red-600 hover:bg-red-50 transition-colors shrink-0 flex items-center gap-2"
          >
            <RefreshCw size={14} /> Réessayer
          </button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("bg-white border border-red-100 rounded-xl p-8 text-center shadow-sm", className)}>
        <AlertCircle className="mx-auto text-red-400 mb-4" size={40} />
        <h3 className="font-bold text-secondary mb-2">{title}</h3>
        <p className="text-sm text-secondary/60 mb-6">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw size={14}/>}>
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  // Inline
  return (
    <div className={cn("flex items-center gap-2 text-red-600 text-sm py-2", className)}>
      <AlertCircle size={16} className="shrink-0" />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline font-bold hover:text-red-800 ml-1">
          Réessayer
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
