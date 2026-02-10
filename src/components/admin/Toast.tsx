
import React from 'react';
import { useToast, ToastType } from '../../contexts/ToastContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastItem: React.FC<{ id: string; message: string; type: ToastType; onClose: () => void }> = ({
  id,
  message,
  type,
  onClose
}) => {
  const configs = {
    success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
    error: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
    warning: { icon: AlertTriangle, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', iconColor: 'text-orange-500' },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border shadow-lg w-80 transform transition-all duration-300 animate-in slide-in-from-right",
      config.bg, config.border
    )}>
      <Icon size={20} className={cn("shrink-0 mt-0.5", config.iconColor)} />
      <p className={cn("text-sm font-medium flex-grow", config.text)}>{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};
