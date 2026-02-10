
import React from 'react';
import { LucideIcon, Search } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = Search, 
  title = "Aucune donnée", 
  message = "Il n'y a rien à afficher pour le moment.", 
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-secondary/10", className)}>
      <div className="bg-secondary/5 p-6 rounded-full mb-6">
        <Icon size={48} className="text-secondary/30" />
      </div>
      <h3 className="text-xl font-serif font-bold text-secondary mb-2">{title}</h3>
      <p className="text-secondary/60 max-w-sm mb-8 text-sm leading-relaxed">{message}</p>
      {action && (
        <Button onClick={action.onClick} leftIcon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
