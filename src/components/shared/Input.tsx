import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  textarea?: boolean;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  className,
  type,
  label,
  error,
  iconLeft,
  iconRight,
  textarea,
  id,
  ...props
}, ref) => {
  const inputId = id || React.useId();
  
  const containerClasses = "relative flex items-center";
  const inputClasses = cn(
    "w-full bg-transparent border-b border-secondary/20 py-2 text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans",
    iconLeft && "pl-10",
    iconRight && "pr-10",
    error && "border-red-500 focus:border-red-500",
    className
  );

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">
          {label}
        </label>
      )}
      
      <div className={containerClasses}>
        {iconLeft && (
          <div className="absolute left-0 text-secondary/50 pointer-events-none flex items-center justify-center h-full pb-1">
            {iconLeft}
          </div>
        )}
        
        {textarea ? (
          <textarea
            id={inputId}
            className={cn(inputClasses, "resize-y min-h-[100px]")}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            className={inputClasses}
            ref={ref as React.Ref<HTMLInputElement>}
            {...props}
          />
        )}

        {iconRight && (
          <div className="absolute right-0 text-secondary/50 pointer-events-none flex items-center justify-center h-full pb-1">
            {iconRight}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1 animate-pulse">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;