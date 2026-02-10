
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { TIME_SLOTS, ReservationData } from '../../services/api/reservations';
import { Calendar, Clock, User, Mail, Phone, Users, MessageSquare } from 'lucide-react';

const schema = z.object({
  customer_name: z.string().min(2, "Nom requis"),
  customer_email: z.string().email("Email invalide"),
  customer_phone: z.string().min(8, "Téléphone invalide"),
  reservation_date: z.string().min(1, "Date requise"),
  reservation_time: z.string().min(1, "Heure requise"),
  number_of_guests: z.number().min(1, "Min 1 personne").max(20, "Max 20"),
  special_requests: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

type FormData = z.infer<typeof schema>;

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: ReservationData | null;
  isLoading?: boolean;
}

const ReservationFormModal: React.FC<ReservationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'confirmed',
      number_of_guests: 2
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
            customer_name: initialData.customer_name,
            customer_email: initialData.customer_email,
            customer_phone: initialData.customer_phone,
            reservation_date: initialData.reservation_date,
            reservation_time: initialData.reservation_time,
            number_of_guests: initialData.number_of_guests,
            special_requests: initialData.special_requests || '',
            status: initialData.status as any || 'confirmed'
        });
      } else {
        reset({
          status: 'confirmed',
          number_of_guests: 2,
          reservation_date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier la Réservation" : "Nouvelle Réservation"}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Client Section */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="font-bold text-secondary text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
            <User size={16} className="text-primary"/> Informations Client
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label="Nom Complet" 
              {...register('customer_name')} 
              error={errors.customer_name?.message} 
            />
            <Input 
              label="Email" 
              type="email" 
              {...register('customer_email')} 
              error={errors.customer_email?.message}
              iconLeft={<Mail size={16}/>}
            />
            <Input 
              label="Téléphone" 
              {...register('customer_phone')} 
              error={errors.customer_phone?.message}
              iconLeft={<Phone size={16}/>}
            />
          </div>
        </div>

        {/* Reservation Section */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="font-bold text-secondary text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-primary"/> Détails Réservation
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
             <Input 
                type="date"
                label="Date"
                {...register('reservation_date')}
                error={errors.reservation_date?.message}
             />
             <div>
                <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">
                  Heure
                </label>
                <div className="relative">
                   <select 
                      {...register('reservation_time')}
                      className="w-full bg-transparent border-b border-secondary/20 py-2 text-secondary focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                   >
                      <option value="">Choisir...</option>
                      {TIME_SLOTS.map(time => (
                         <option key={time} value={time}>{time}</option>
                      ))}
                   </select>
                   <Clock size={16} className="absolute right-0 top-2 text-secondary/30 pointer-events-none" />
                </div>
                {errors.reservation_time && <p className="text-red-500 text-xs mt-1">{errors.reservation_time.message}</p>}
             </div>
             <Input 
                type="number"
                label="Couverts"
                {...register('number_of_guests', { valueAsNumber: true })}
                error={errors.number_of_guests?.message}
                iconLeft={<Users size={16}/>}
             />
          </div>
        </div>

        {/* Status & Notes */}
        <div>
           <div className="flex gap-4 mb-4">
              <div className="w-1/3">
                 <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-1">
                    Statut
                 </label>
                 <select 
                    {...register('status')}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                 >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="completed">Terminée</option>
                 </select>
              </div>
           </div>
           
           <Input 
              textarea
              label="Demandes Spéciales / Notes"
              placeholder="Allergies, table préférée, etc."
              {...register('special_requests')}
              iconLeft={<MessageSquare size={16} className="mt-1"/>}
           />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
           <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Annuler
           </Button>
           <Button type="submit" isLoading={isLoading}>
              {initialData ? "Mettre à jour" : "Créer la réservation"}
           </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationFormModal;
