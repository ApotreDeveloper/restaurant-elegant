
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Bell, Globe, ShoppingBag, Moon, Clock } from 'lucide-react';
import { getSitePreferences, updateSitePreferences } from '../../../services/api/preferences'; 
import Button from '../../shared/Button';
import LoadingSpinner from '../../shared/LoadingSpinner';
import Input from '../../shared/Input';
import { useToast } from '../../../contexts/ToastContext';

const PreferencesSettings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      language: 'fr',
      currency: 'FCFA',
      timezone: 'Africa/Abidjan',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      admin_theme: 'light',
      email_notifications_reservations: true,
      email_notifications_orders: true,
      email_notifications_reviews: true,
      delivery_fee: 1000,
      tax_rate: 18,
      free_delivery_threshold: 0,
      prep_time: 30
    }
  });

  // Watch theme to apply immediately
  const watchedTheme = watch('admin_theme');

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Apply theme effect
  useEffect(() => {
    if (watchedTheme) {
        // Simple logic to just store it for now, real app would apply class to html/body
        localStorage.setItem('admin-theme', watchedTheme);
    }
  }, [watchedTheme]);

  const fetchPreferences = async () => {
    setLoading(true);
    const result = await getSitePreferences();
    if (result.success && result.data) {
      reset({
        language: result.data.language,
        currency: result.data.currency,
        timezone: result.data.timezone,
        date_format: result.data.date_format,
        time_format: result.data.time_format,
        admin_theme: result.data.admin_theme,
        email_notifications_reservations: result.data.notifications?.email_reservations ?? true,
        email_notifications_orders: result.data.notifications?.email_orders ?? true,
        email_notifications_reviews: result.data.notifications?.email_reviews ?? true,
        delivery_fee: result.data.order_settings?.delivery_fee ?? 1000,
        tax_rate: result.data.order_settings?.tax_rate ?? 18,
        free_delivery_threshold: result.data.order_settings?.free_delivery_threshold ?? 0,
        prep_time: result.data.order_settings?.prep_time ?? 30
      });
    }
    setLoading(false);
  };
  
  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    const preferencesData = {
      language: formData.language,
      currency: formData.currency,
      timezone: formData.timezone,
      date_format: formData.date_format,
      time_format: formData.time_format,
      admin_theme: formData.admin_theme,
      notifications: {
        email_reservations: formData.email_notifications_reservations,
        email_orders: formData.email_notifications_orders,
        email_reviews: formData.email_notifications_reviews
      },
      order_settings: {
        delivery_fee: parseFloat(formData.delivery_fee),
        tax_rate: parseFloat(formData.tax_rate),
        free_delivery_threshold: parseFloat(formData.free_delivery_threshold || 0),
        prep_time: parseInt(formData.prep_time)
      }
    };
    
    const result = await updateSitePreferences(preferencesData);
    
    if (result.success) {
      showSuccess('Préférences enregistrées avec succès');
    } else {
      showError(result.error || 'Erreur lors de l\'enregistrement');
    }
    
    setIsSubmitting(false);
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in">
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Langue & Devise */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Globe size={20} className="text-primary" /> Régionalisation
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Langue du site</label>
                    <select {...register('language')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">Langue par défaut pour l'interface publique.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Devise</label>
                    <select {...register('currency')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                        <option value="FCFA">FCFA (Franc CFA)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="USD">USD (Dollar américain)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Fuseau horaire</label>
                    <select {...register('timezone')} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                        <option value="Africa/Abidjan">Africa/Abidjan (GMT)</option>
                        <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        <option value="Europe/Paris">Europe/Paris (CET)</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Date & Heure */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Date & Heure
            </h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">Format de date</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" {...register('date_format')} value="DD/MM/YYYY" className="text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600">DD/MM/YYYY (ex: 25/12/2024)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" {...register('date_format')} value="MM/DD/YYYY" className="text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600">MM/DD/YYYY (ex: 12/25/2024)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" {...register('date_format')} value="YYYY-MM-DD" className="text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600">YYYY-MM-DD (ex: 2024-12-25)</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">Format de l'heure</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" {...register('time_format')} value="24h" className="text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600">24 heures (14:30)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" {...register('time_format')} value="12h" className="text-primary focus:ring-primary" />
                            <span className="text-sm text-slate-600">12 heures (2:30 PM)</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {/* Paramètres de Commande */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" /> Commandes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Frais de Livraison (FCFA)" type="number" {...register('delivery_fee')} />
                <Input label="TVA (%)" type="number" step="0.1" {...register('tax_rate')} />
                <Input label="Livraison gratuite dès (FCFA)" type="number" {...register('free_delivery_threshold')} />
                <Input label="Temps prépa. moyen (min)" type="number" {...register('prep_time')} />
            </div>
        </div>

        {/* Notifications & Thème */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-primary" /> Notifications Email
                </h3>
                <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <span className="text-sm font-medium text-slate-700">Nouvelles réservations</span>
                        <input type="checkbox" {...register('email_notifications_reservations')} className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <span className="text-sm font-medium text-slate-700">Nouvelles commandes</span>
                        <input type="checkbox" {...register('email_notifications_orders')} className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <span className="text-sm font-medium text-slate-700">Nouveaux avis</span>
                        <input type="checkbox" {...register('email_notifications_reviews')} className="rounded border-slate-300 text-primary focus:ring-primary w-5 h-5" />
                    </label>
                </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Moon size={20} className="text-primary" /> Thème Admin
                </h3>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" {...register('admin_theme')} value="light" className="text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600">Clair</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" {...register('admin_theme')} value="dark" className="text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600">Sombre</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" {...register('admin_theme')} value="auto" className="text-primary focus:ring-primary" />
                        <span className="text-sm text-slate-600">Auto</span>
                    </label>
                </div>
            </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="sticky bottom-4 z-10 flex justify-end">
         <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex gap-4 items-center">
            <span className="text-sm text-slate-500 hidden md:inline">Les modifications sont appliquées immédiatement.</span>
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save size={18}/>} className="shadow-lg shadow-primary/20">
               Enregistrer les préférences
            </Button>
         </div>
      </div>
    </form>
  );
};

export default PreferencesSettings;