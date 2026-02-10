
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  RestaurantInfo, 
  updateRestaurantInfo, 
  uploadRestaurantImage,
  OpeningHoursDay 
} from '../../../services/api/restaurants';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import LoadingSpinner from '../../shared/LoadingSpinner';
import { Upload, X, Save, Clock, MapPin, Globe, Phone, Mail } from 'lucide-react';
import { cn } from '../../../utils/cn';

const schema = z.object({
  name: z.string().min(2, "Nom requis"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  address: z.string().min(5, "Adresse requise"),
  phone: z.string().min(8, "Téléphone requis"),
  email: z.string().email("Email invalide"),
  website: z.string().url().optional().or(z.literal('')),
  settings: z.object({
    delivery_fee: z.number().min(0),
    tax_rate: z.number().min(0).max(100),
    min_order_free_delivery: z.number().optional(),
    preparation_time: z.number().min(1)
  }),
  social: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal(''))
  })
});

type FormData = z.infer<typeof schema>;

interface GeneralSettingsProps {
  initialData: RestaurantInfo | null;
  onRefresh: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ initialData, onRefresh }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openingHours, setOpeningHours] = useState<Record<string, OpeningHoursDay>>({});

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        tagline: initialData.tagline,
        description: initialData.description,
        address: initialData.address,
        phone: initialData.phone,
        email: initialData.email,
        website: initialData.website,
        settings: initialData.settings,
        social: initialData.social
      });
      setLogoPreview(initialData.logo_url || null);
      setOpeningHours(initialData.openingHours);
    }
  }, [initialData, reset]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const url = await uploadRestaurantImage(file);
        setLogoPreview(url);
      } catch (err) {
        alert("Erreur lors de l'upload du logo");
      }
    }
  };

  const updateDayHours = (day: string, field: keyof OpeningHoursDay | 'secondShift', value: any) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleHoursTemplate = (type: 'week' | 'all') => {
    const template = { open: "18:00", close: "23:00", closed: false };
    const newHours = { ...openingHours };
    
    Object.keys(newHours).forEach(day => {
      if (type === 'all' || (day !== 'sunday' && day !== 'monday')) {
        newHours[day] = { ...template, closed: newHours[day].closed };
      }
    });
    setOpeningHours(newHours);
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      await updateRestaurantInfo({
        ...data,
        logo_url: logoPreview || undefined,
        openingHours
      });
      alert("Paramètres enregistrés avec succès !");
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const daysMap: Record<string, string> = {
    monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', 
    thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche'
  };

  if (!initialData) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Identity */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Globe size={20} className="text-primary"/> Identité
        </h3>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative group">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400 text-center px-2">Logo 200x200</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <Upload className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            {logoPreview && (
              <button 
                type="button" 
                onClick={() => setLogoPreview(null)} 
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <X size={12}/> Supprimer
              </button>
            )}
          </div>

          <div className="flex-grow space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Nom du Restaurant" {...register('name')} error={errors.name?.message} />
              <Input label="Slogan (Tagline)" {...register('tagline')} />
            </div>
            <Input textarea label="Description courte" {...register('description')} className="min-h-[80px]" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-primary"/> Coordonnées
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
           <Input label="Adresse Complète" textarea {...register('address')} error={errors.address?.message} />
           <div className="space-y-4">
              <Input label="Téléphone" iconLeft={<Phone size={16}/>} {...register('phone')} error={errors.phone?.message} />
              <Input label="Email" type="email" iconLeft={<Mail size={16}/>} {...register('email')} error={errors.email?.message} />
              <Input label="Site Web" iconLeft={<Globe size={16}/>} {...register('website')} error={errors.website?.message} />
           </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Clock size={20} className="text-primary"/> Horaires d'ouverture
           </h3>
           <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => handleHoursTemplate('week')}>Semaine Type</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleHoursTemplate('all')}>Tous les jours</Button>
           </div>
        </div>

        <div className="space-y-4">
           {Object.entries(daysMap).map(([key, label]) => {
              const dayData = openingHours[key] || { open: "00:00", close: "00:00", closed: true };
              return (
                 <div key={key} className="flex flex-col md:flex-row items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-32 flex items-center gap-2">
                       <input 
                          type="checkbox" 
                          checked={dayData.closed} 
                          onChange={(e) => updateDayHours(key, 'closed', e.target.checked)}
                          className="rounded text-primary focus:ring-primary"
                       />
                       <span className={cn("font-bold text-sm", dayData.closed ? "text-slate-400" : "text-slate-700")}>{label}</span>
                    </div>
                    
                    {!dayData.closed && (
                       <div className="flex flex-grow items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                             <input 
                                type="time" 
                                value={dayData.open}
                                onChange={(e) => updateDayHours(key, 'open', e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                             />
                             <span className="text-slate-400">-</span>
                             <input 
                                type="time" 
                                value={dayData.close}
                                onChange={(e) => updateDayHours(key, 'close', e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                             />
                          </div>

                          <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                             <input 
                                type="checkbox" 
                                checked={!!dayData.secondShift}
                                onChange={(e) => updateDayHours(key, 'secondShift', e.target.checked ? { open: "19:00", close: "23:00" } : undefined)}
                                className="rounded text-primary focus:ring-primary"
                             />
                             Double service
                          </label>

                          {dayData.secondShift && (
                             <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                <span className="text-slate-400 text-xs">et</span>
                                <input 
                                   type="time" 
                                   value={dayData.secondShift.open}
                                   onChange={(e) => updateDayHours(key, 'secondShift', { ...dayData.secondShift, open: e.target.value })}
                                   className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                                />
                                <span className="text-slate-400">-</span>
                                <input 
                                   type="time" 
                                   value={dayData.secondShift.close}
                                   onChange={(e) => updateDayHours(key, 'secondShift', { ...dayData.secondShift, close: e.target.value })}
                                   className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                                />
                             </div>
                          )}
                       </div>
                    )}
                    {dayData.closed && <span className="text-sm text-slate-400 italic">Fermé toute la journée</span>}
                 </div>
              );
           })}
        </div>
      </div>

      {/* Order Settings & Social */}
      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Paramètres de Commande</h3>
            <div className="space-y-4">
               <Input label="Frais de Livraison (FCFA)" type="number" {...register('settings.delivery_fee', { valueAsNumber: true })} />
               <Input label="TVA (%)" type="number" {...register('settings.tax_rate', { valueAsNumber: true })} />
               <Input label="Min. pour livraison gratuite (FCFA)" type="number" {...register('settings.min_order_free_delivery', { valueAsNumber: true })} />
               <Input label="Temps de prép. moyen (min)" type="number" {...register('settings.preparation_time', { valueAsNumber: true })} />
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Réseaux Sociaux</h3>
            <div className="space-y-4">
               <Input label="Facebook" placeholder="https://facebook.com/..." {...register('social.facebook')} />
               <Input label="Instagram" placeholder="https://instagram.com/..." {...register('social.instagram')} />
               <Input label="Twitter / X" placeholder="https://twitter.com/..." {...register('social.twitter')} />
               <Input label="TikTok" placeholder="https://tiktok.com/@..." {...register('social.tiktok')} />
            </div>
         </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 flex justify-end">
         <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex gap-4 items-center">
            <span className="text-sm text-slate-500 hidden md:inline">N'oubliez pas d'enregistrer vos modifications.</span>
            <Button type="submit" isLoading={isSaving} leftIcon={<Save size={18}/>} className="shadow-lg shadow-primary/20">
               Enregistrer les modifications
            </Button>
         </div>
      </div>

    </form>
  );
};

export default GeneralSettings;
