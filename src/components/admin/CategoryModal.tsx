
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { MenuCategory } from '../../services/api/menu';

const schema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: MenuCategory | null;
  isLoading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true
    }
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        is_active: initialData.is_active
      });
    } else if (isOpen) {
      reset({ is_active: true, name: '', description: '' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="Nom de la catégorie" 
          {...register('name')} 
          error={errors.name?.message} 
        />
        
        <Input 
          label="Description (Optionnel)" 
          textarea
          {...register('description')} 
          error={errors.description?.message} 
        />

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
           <input 
             type="checkbox" 
             id="is_active" 
             {...register('is_active')}
             className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
           />
           <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
             Catégorie active (visible sur le site)
           </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
           <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Annuler
           </Button>
           <Button type="submit" isLoading={isLoading}>
              Enregistrer
           </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
