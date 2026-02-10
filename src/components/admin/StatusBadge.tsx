
import React from 'react';
import { cn } from '../../utils/cn';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Truck, 
  ChefHat, 
  CheckSquare,
  File,
  Globe
} from 'lucide-react';

export type StatusVariant = 'default' | 'outline' | 'ghost';
export type StatusSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: StatusSize;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  // General / Reservations
  pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'En attente' },
  confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Confirmé' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Annulé' },
  completed: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckSquare, label: 'Terminé' },
  
  // Orders
  preparing: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: ChefHat, label: 'En cuisine' },
  ready: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle, label: 'Prête' },
  delivered: { color: 'bg-green-100 text-green-700 border-green-200', icon: Truck, label: 'Livrée' },
  
  // Payment
  paid: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Payé' },
  failed: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Échoué' },
  
  // Reviews
  approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Approuvé' },
  rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejeté' },
  
  // Generic
  draft: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: File, label: 'Brouillon' },
  published: { color: 'bg-green-100 text-green-700 border-green-200', icon: Globe, label: 'Publié' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default', 
  size = 'md', 
  className,
  showIcon = true 
}) => {
  const config = statusConfig[status.toLowerCase()] || { 
    color: 'bg-gray-100 text-gray-700 border-gray-200', 
    icon: CheckCircle, 
    label: status 
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border",
      config.color,
      sizeClasses[size],
      variant === 'outline' && "bg-transparent border-current",
      className
    )}>
      {showIcon && <Icon size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
