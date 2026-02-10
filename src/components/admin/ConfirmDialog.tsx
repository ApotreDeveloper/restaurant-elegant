
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  requireCheckbox?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  variant = 'danger',
  requireCheckbox = false
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const styles = {
    danger: {
      icon: AlertCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      button: 'bg-red-600 hover:bg-red-700 text-white border-transparent'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      button: 'bg-orange-500 hover:bg-orange-600 text-white border-transparent'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
    }
  };

  const style = styles[variant];
  const Icon = style.icon;

  const handleConfirm = () => {
    if (requireCheckbox && !isChecked) return;
    onConfirm();
    setIsChecked(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      title={title}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", style.iconBg)}>
          <Icon size={32} className={style.iconColor} />
        </div>
        
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          {message}
        </p>

        {requireCheckbox && (
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg w-full mb-6 cursor-pointer border border-slate-200">
            <input 
              type="checkbox" 
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-xs font-bold text-slate-700 text-left">
              Je comprends que cette action est irréversible.
            </span>
          </label>
        )}

        <div className="flex gap-3 w-full">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={requireCheckbox && !isChecked}
            className={cn("flex-1", style.button)}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
