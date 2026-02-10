
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  MapPin, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  Utensils,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { createReservation, checkAvailability, TIME_SLOTS } from '../../services/api/reservations';
import { getMenuItems, MenuItem } from '../../services/api/menu';
import { getRestaurantInfo, RestaurantInfo } from '../../services/api/restaurants';
import { cn } from '../../utils/cn';
import { formatPrice } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';

const phoneRegex = /^(\+225|00225)?\s?(\d{2}\s?){4}\d{2}$/;

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().regex(phoneRegex, "Format invalide (ex: +225 07 07 07 07 07)"),
  date: z.string().min(1, "La date est requise").refine((date) => {
    const d = new Date(date);
    const now = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(now.getMonth() + 3);
    return d >= new Date(now.setHours(0,0,0,0)) && d <= threeMonths;
  }, "Date invalide (entre aujourd'hui et dans 3 mois)"),
  time: z.string().min(1, "L'heure est requise"),
  guests: z.number().min(1, "Au moins 1 personne").max(12, "Maximum 12 personnes via le formulaire"),
  dish_id: z.string().optional(),
  notes: z.string().max(500, "Maximum 500 caractères").optional(),
});

type FormData = z.infer<typeof schema>;

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="flex items-center justify-between mb-8 relative">
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary/10 -z-10"></div>
    {[1, 2, 3].map((step) => (
      <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2",
          currentStep >= step 
            ? "bg-primary border-primary text-secondary" 
            : "bg-white border-secondary/20 text-secondary/40"
        )}>
          {currentStep > step ? <CheckCircle2 size={16} /> : step}
        </div>
        <span className={cn(
          "text-xs uppercase tracking-wider font-bold transition-colors duration-300 hidden sm:block",
          currentStep >= step ? "text-primary" : "text-secondary/40"
        )}>
          {step === 1 ? "Infos" : step === 2 ? "Détails" : "Confirmation"}
        </span>
      </div>
    ))}
  </div>
);

const Reservation: React.FC = () => {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    trigger,
    formState: { errors, isSubmitting } 
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      guests: 2,
      time: '',
    },
    mode: 'onChange'
  });

  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const selectedGuests = watch('guests');
  const selectedName = watch('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, info] = await Promise.all([
          getMenuItems(),
          getRestaurantInfo()
        ]);
        setMenuItems(items);
        setRestaurantInfo(info);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const check = async () => {
        setLoadingAvailability(true);
        try {
          const blocked = await checkAvailability(selectedDate);
          setBlockedSlots(blocked);
        } catch (err) {
          console.error("Availability check failed", err);
        } finally {
          setLoadingAvailability(false);
        }
      };
      check();
    }
  }, [selectedDate]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'phone'];
    if (step === 2) fieldsToValidate = ['date', 'time', 'guests', 'dish_id', 'notes'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // Create Payload compatible with API
      const payload: any = {
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        reservation_date: data.date,
        reservation_time: data.time,
        number_of_guests: data.guests,
        dish_id: data.dish_id || null,
        special_requests: data.notes
      };

      const result = await createReservation(payload);
      if (result.success) {
        setBookingId(result.id);
      } else {
        setError(result.error || "Erreur inconnue");
      }
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Une erreur est survenue lors de la réservation.");
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="bg-accent min-h-screen pb-20">
      <Helmet>
        <title>Réserver une Table | Le Gourmet Élégant</title>
        <meta name="description" content="Réservez votre table en ligne pour un déjeuner ou un dîner au Gourmet Élégant. Confirmation immédiate." />
      </Helmet>

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-secondary overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1920&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary/30" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
           <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-accent/60 mb-4">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-primary">Réservation</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-4">Réserver une Table</h1>
          <p className="text-lg text-accent/80 font-light italic">
            "Assurez votre moment d'exception au cœur de Paris."
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: FORM */}
          <div className="w-full lg:w-3/5 bg-white rounded-lg shadow-xl p-6 md:p-10 border-t-4 border-primary">
            <StepIndicator currentStep={step} totalSteps={3} />
            
            {error && (
              <ErrorMessage 
                variant="banner" 
                message={error} 
                title="Erreur de réservation"
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="min-h-[400px] flex flex-col justify-between">
              {/* Steps (Same as before) */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <h3 className="font-serif text-2xl text-secondary font-bold mb-6 flex items-center gap-2">
                    <User className="text-primary" /> Informations Personnelles
                  </h3>
                  
                  <div className="space-y-5">
                    <Input 
                      label="Nom Complet" 
                      placeholder="Jean Dupont"
                      {...register('name')}
                      error={errors.name?.message}
                      iconLeft={<User size={16}/>}
                    />
                    <Input 
                      label="Email" 
                      placeholder="jean@example.com"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                      iconLeft={<Mail size={16}/>}
                    />
                    <Input 
                      label="Téléphone" 
                      placeholder="+225 07 07 07 07 07"
                      {...register('phone')}
                      error={errors.phone?.message}
                      iconLeft={<Phone size={16}/>}
                      className="tracking-widest"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <h3 className="font-serif text-2xl text-secondary font-bold mb-6 flex items-center gap-2">
                    <Calendar className="text-primary" /> Détails de la Réservation
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Input 
                        type="date"
                        label="Date"
                        min={today}
                        max={maxDateStr}
                        {...register('date')}
                        error={errors.date?.message}
                      />
                    </div>
                    <div>
                      <Input 
                        type="number"
                        label="Nombre de personnes"
                        min={1}
                        max={12}
                        {...register('guests', { valueAsNumber: true })}
                        error={errors.guests?.message}
                        iconLeft={<Users size={16}/>}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-2 flex items-center gap-2">
                      <Clock size={14} /> Heure
                    </label>
                    {loadingAvailability ? (
                      <div className="py-4 text-center text-sm text-secondary/50 flex items-center justify-center gap-2">
                         <LoadingSpinner size="sm" /> Vérification des disponibilités...
                      </div>
                    ) : !selectedDate ? (
                      <div className="p-4 bg-secondary/5 text-secondary/50 text-sm text-center italic rounded">
                        Veuillez sélectionner une date pour voir les horaires.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {TIME_SLOTS.map((time) => {
                           const isBlocked = blockedSlots.includes(time);
                           return (
                            <label 
                              key={time}
                              className={cn(
                                "cursor-pointer border rounded py-2 text-center text-sm transition-all relative overflow-hidden",
                                selectedTime === time 
                                  ? "bg-primary text-secondary border-primary font-bold shadow-md" 
                                  : isBlocked 
                                    ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice" 
                                    : "bg-white text-secondary border-secondary/20 hover:border-primary hover:text-primary"
                              )}
                            >
                              <input 
                                type="radio" 
                                value={time} 
                                {...register('time')} 
                                className="sr-only" 
                                disabled={isBlocked}
                              />
                              {time}
                              {isBlocked && <div className="absolute inset-0 flex items-center justify-center bg-white/50"><div className="w-[120%] h-px bg-gray-300 rotate-45 absolute"></div></div>}
                            </label>
                           );
                        })}
                      </div>
                    )}
                    {errors.time && <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.time.message}</p>}
                  </div>

                  <div className="pt-4 border-t border-secondary/10">
                    <label className="block text-xs uppercase tracking-wider text-secondary/70 font-bold mb-2 flex items-center gap-2">
                      <Utensils size={14} /> Pré-commander un plat (Optionnel)
                    </label>
                    <select 
                      {...register('dish_id')}
                      className="w-full bg-transparent border-b border-secondary/20 py-2 text-secondary focus:outline-none focus:border-primary transition-colors text-sm"
                    >
                      <option value="">-- Choisir un plat --</option>
                      {menuItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name} - {formatPrice(item.price)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                     <Input 
                        textarea
                        label="Demandes Spéciales"
                        placeholder="Allergies, anniversaire, table isolée..."
                        {...register('notes')}
                        error={errors.notes?.message}
                        iconLeft={<MessageSquare size={16} className="mt-1"/>}
                     />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                  <h3 className="font-serif text-2xl text-secondary font-bold mb-6 text-center">
                    Récapitulatif
                  </h3>
                  
                  <div className="bg-accent/30 p-6 rounded-lg border border-primary/20 space-y-4 text-sm">
                     <div className="flex justify-between border-b border-secondary/10 pb-2">
                        <span className="text-secondary/60">Nom</span>
                        <span className="font-bold text-secondary">{selectedName}</span>
                     </div>
                     <div className="flex justify-between border-b border-secondary/10 pb-2">
                        <span className="text-secondary/60">Date</span>
                        <span className="font-bold text-secondary">{new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                     </div>
                     <div className="flex justify-between border-b border-secondary/10 pb-2">
                        <span className="text-secondary/60">Heure</span>
                        <span className="font-bold text-secondary">{selectedTime}</span>
                     </div>
                     <div className="flex justify-between border-b border-secondary/10 pb-2">
                        <span className="text-secondary/60">Invités</span>
                        <span className="font-bold text-secondary">{selectedGuests} personnes</span>
                     </div>
                     {watch('dish_id') && (
                        <div className="flex justify-between border-b border-secondary/10 pb-2">
                           <span className="text-secondary/60">Plat pré-commandé</span>
                           <span className="font-bold text-secondary truncate max-w-[150px]">{menuItems.find(i => i.id === watch('dish_id'))?.name}</span>
                        </div>
                     )}
                  </div>

                  <p className="text-xs text-secondary/50 text-center italic">
                    En cliquant sur confirmer, vous acceptez nos conditions d'annulation (voir ci-contre).
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-auto">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    className="border-secondary/20 text-secondary hover:bg-secondary/5"
                    leftIcon={<ChevronLeft size={16} />}
                  >
                    Retour
                  </Button>
                ) : <div></div>}

                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    rightIcon={<ChevronRight size={16} />}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    className="shadow-xl shadow-primary/20"
                  >
                    CONFIRMER LA RÉSERVATION
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: INFO PANEL */}
          <div className="w-full lg:w-2/5 space-y-6">
            
            <div className="bg-secondary text-accent p-8 rounded-lg shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="font-serif text-2xl font-bold text-primary mb-6 border-b border-primary/30 pb-4">
                    {restaurantInfo?.name || "Le Gourmet Élégant"}
                  </h3>
                  
                  <ul className="space-y-4 text-sm">
                    <li className="flex items-start gap-3">
                      <MapPin className="text-primary shrink-0 mt-1" size={18} />
                      <span className="opacity-90">{restaurantInfo?.address || "123 Avenue des Champs-Élysées, Paris"}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone className="text-primary shrink-0" size={18} />
                      <span className="opacity-90">{restaurantInfo?.phone || "+33 1 23 45 67 89"}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail className="text-primary shrink-0" size={18} />
                      <span className="opacity-90">{restaurantInfo?.email || "contact@legourmet.fr"}</span>
                    </li>
                  </ul>

                  <div className="mt-8">
                     <h4 className="font-bold text-primary text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock size={16} /> Horaires
                     </h4>
                     <div className="grid grid-cols-2 gap-2 text-sm opacity-80">
                        {/* Dynamic hours ideally, keeping placeholder for now */}
                        <span>Mar - Dim</span>
                        <span className="text-right">18h00 - 23h00</span>
                        <span className="text-red-400">Lundi</span>
                        <span className="text-right text-red-400">Fermé</span>
                     </div>
                  </div>
               </div>
               
               <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                  <img src="https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=400&fit=crop" className="w-full h-full object-cover" alt="Ambience" />
               </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-secondary/50">
               <h4 className="font-bold text-secondary text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={16} className="text-secondary" /> Politique d'annulation
               </h4>
               <p className="text-sm text-secondary/70 leading-relaxed">
                  Toute annulation doit être effectuée au moins 24 heures à l'avance. 
                  Pour les groupes de plus de 6 personnes, une empreinte bancaire pourra être demandée.
                  Votre table sera conservée 15 minutes après l'heure de réservation.
               </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!bookingId} onClose={() => {setBookingId(null); window.location.reload();}} title="Réservation Confirmée">
         <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
               <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="font-serif text-3xl text-secondary font-bold mb-2">Merci {selectedName} !</h3>
            <p className="text-secondary/70 mb-6">
               Votre table a été réservée avec succès. Un email de confirmation a été envoyé à <strong>{watch('email')}</strong>.
            </p>
            
            <div className="bg-accent/30 p-4 rounded border border-primary/20 inline-block mb-8">
               <span className="text-xs uppercase tracking-widest text-secondary/50 block mb-1">Référence</span>
               <span className="text-2xl font-mono font-bold text-primary">{bookingId}</span>
            </div>

            <div className="flex justify-center">
               <Link to="/">
                  <Button onClick={() => setBookingId(null)}>Retour à l'accueil</Button>
               </Link>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Reservation;
