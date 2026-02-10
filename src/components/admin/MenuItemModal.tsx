
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { MenuItem, MenuCategory, Allergen, uploadMenuImage } from '../../services/api/menu';
import { Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  category_id: z.string().min(1, "Catégorie requise"),
  description: z.string().min(5, "Description requise"),
  price: z.number().min(0, "Prix invalide"),
  is_available: z.boolean(),
  is_daily_special: z.boolean(),
  allergens: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof schema>;

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: MenuItem | null;
  categories: MenuCategory[];
  isLoading?: boolean;
}

const ALLERGEN_OPTIONS: Allergen[] = ['Gluten', 'Lactose', 'Fruits à coque', 'Fruits de mer', 'Œufs', 'Soja', 'Poisson', 'Céleri'];

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isLoading
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_available: true,
      is_daily_special: false,
      allergens: []
    }
  });

  const selectedAllergens = watch('allergens') || [];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          category_id: initialData.category_id,
          description: initialData.description,
          price: initialData.price,
          is_available: initialData.is_available,
          is_daily_special: initialData.is_daily_special,
          allergens: initialData.allergens
        });
        setImagePreview(initialData.image || null);
      } else {
        reset({
          is_available: true,
          is_daily_special: false,
          allergens: [],
          price: 0
        });
        setImagePreview(null);
      }
      setImageFile(null);
      setUploadError(null);
    }
  }, [isOpen, initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("L'image ne doit pas dépasser 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    let imageUrl = imagePreview;

    if (imageFile) {
      try {
        imageUrl = await uploadMenuImage(imageFile);
      } catch (err) {
        setUploadError("Erreur lors de l'upload de l'image");
        return;
      }
    }

    await onSubmit({ ...data, image: imageUrl });
  };

  const toggleAllergen = (allergen: string) => {
    const current = selectedAllergens;
    if (current.includes(allergen)) {
      setValue('allergens', current.filter(a => a !== allergen));
    } else {
      setValue('allergens', [...current, allergen]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier le Plat" : "Nouveau Plat"}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        
        <div className="grid md:grid-cols-3 gap-6">
           {/* Image Section */}
           <div className="md:col-span-1 space-y-3">
              <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">Image du plat</label>
              <div 
                 className={cn(
                    "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all",
                    imagePreview ? "border-primary/50" : "border-slate-200 hover:border-primary/50 bg-slate-50"
                 )}
              >
                 {imagePreview ? (
                    <>
                       <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                       <button 
                          type="button"
                          onClick={() => { setImagePreview(null); setImageFile(null); }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                       >
                          <X size={14} />
                       </button>
                    </>
                 ) : (
                    <div className="text-center p-4">
                       <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                       <span className="text-xs text-slate-400">Glisser ou cliquer pour upload</span>
                    </div>
                 )}
                 <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                 />
              </div>
              {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
           </div>

           {/* Basic Info Section */}
           <div className="md:col-span-2 space-y-4">
              <Input 
                 label="Nom du plat" 
                 {...register('name')} 
                 error={errors.name?.message} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">Catégorie</label>
                    <select 
                       {...register('category_id')}
                       className="w-full bg-transparent border-b border-secondary/20 py-2 text-secondary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 text-sm"
                    >
                       <option value="">Choisir...</option>
                       {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                       ))}
                    </select>
                    {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
                 </div>
                 
                 <Input 
                    type="number"
                    label="Prix (FCFA)"
                    {...register('price', { valueAsNumber: true })}
                    error={errors.price?.message}
                 />
              </div>

              <Input 
                 textarea
                 label="Description"
                 {...register('description')}
                 error={errors.description?.message}
                 className="min-h-[80px]"
              />
           </div>
        </div>

        {/* Settings & Allergens */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
           
           {/* Availability */}
           <div className="space-y-4">
              <h4 className="font-bold text-sm text-secondary uppercase tracking-wide">Disponibilité</h4>
              <div className="space-y-3">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" {...register('is_available')} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">Disponible à la commande</span>
                 </label>
                 
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" {...register('is_daily_special')} className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">Plat du jour / Suggestion</span>
                 </label>
              </div>
           </div>

           {/* Allergens */}
           <div className="space-y-4">
              <h4 className="font-bold text-sm text-secondary uppercase tracking-wide">Allergènes</h4>
              <div className="flex flex-wrap gap-2">
                 {ALLERGEN_OPTIONS.map(allergen => (
                    <button
                       type="button"
                       key={allergen}
                       onClick={() => toggleAllergen(allergen)}
                       className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all border",
                          selectedAllergens.includes(allergen) 
                             ? "bg-red-50 text-red-600 border-red-200" 
                             : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                       )}
                    >
                       {allergen}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
           <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Annuler
           </Button>
           <Button type="submit" isLoading={isLoading}>
              {initialData ? "Mettre à jour" : "Ajouter le plat"}
           </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MenuItemModal;
