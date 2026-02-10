
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { GalleryImage } from '../../services/api/gallery';
import { Trash2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(2, "Titre requis"),
  description: z.string().optional(),
  category: z.string(),
  is_featured: z.boolean(),
  display_order: z.number().optional()
});

type FormData = z.infer<typeof schema>;

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  image: GalleryImage | null;
  isLoading?: boolean;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  image,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (image) {
      reset({
        title: image.title,
        description: image.description,
        category: image.category,
        is_featured: image.is_featured,
        display_order: image.display_order
      });
    }
  }, [image, reset]);

  if (!image) return null;

  const handleDelete = async () => {
    if (window.confirm("Supprimer cette image ?")) {
      await onDelete(image.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Éditer l'image"
      size="xl"
    >
      <div className="flex flex-col md:flex-row gap-8">
         {/* Image Preview */}
         <div className="w-full md:w-1/2">
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm aspect-square md:aspect-auto md:h-full relative">
               <img src={image.url} alt={image.title} className="w-full h-full object-contain" />
            </div>
         </div>

         {/* Form */}
         <div className="w-full md:w-1/2">
            <form onSubmit={handleSubmit((data) => onSave(image.id, data))} className="space-y-5">
               <Input 
                  label="Titre" 
                  {...register('title')} 
                  error={errors.title?.message} 
               />
               
               <div>
                  <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">Catégorie</label>
                  <select 
                     {...register('category')}
                     className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                     <option value="Restaurant">Restaurant</option>
                     <option value="Plats">Plats</option>
                     <option value="Événements">Événements</option>
                     <option value="Équipe">Équipe</option>
                  </select>
               </div>

               <Input 
                  label="Description" 
                  textarea
                  {...register('description')} 
               />

               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" {...register('is_featured')} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                     <span className="text-sm font-bold text-slate-700">Mettre à la Une</span>
                  </label>
                  <p className="text-xs text-slate-500 pl-8">
                     L'image apparaîtra dans le carrousel de la page d'accueil de la galerie.
                  </p>
               </div>

               <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
                  <button 
                     type="button"
                     onClick={handleDelete}
                     className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                     <Trash2 size={16} /> Supprimer
                  </button>
                  <div className="flex gap-3">
                     <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                        Annuler
                     </Button>
                     <Button type="submit" isLoading={isLoading}>
                        Enregistrer
                     </Button>
                  </div>
               </div>
            </form>
         </div>
      </div>
    </Modal>
  );
};

export default ImageEditorModal;
