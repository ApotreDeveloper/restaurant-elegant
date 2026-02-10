
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '../../stores/useCartStore';
import { getMenuItems, getMenuCategories, MenuItem, MenuCategory } from '../../services/api/menu';
import { createOrder, transformOrderItems } from '../../services/api/orders';
import { formatPrice } from '../../utils/helpers';
import { orderSchema } from '../../utils/validators';
import { DELIVERY_FEE, TAX_RATE } from '../../utils/constants';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  CheckCircle2, 
  Store,
  ChevronRight,
  ArrowLeft,
  X,
  Utensils
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import { z } from 'zod';

type CheckoutFormData = z.infer<typeof orderSchema>;

const Order: React.FC = () => {
  // Data State
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Cart & Order State
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, deliveryType, setDeliveryType } = useCartStore();
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState<{id: string, time: string} | null>(null);
  
  // Mobile Cart Drawer State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const { 
    register, 
    handleSubmit, 
    trigger,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(orderSchema)
  });

  // --- Calculations ---
  const subtotal = cartTotal();
  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + deliveryFee;

  // --- Fetch Data ---
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, menuItems] = await Promise.all([
          getMenuCategories(),
          getMenuItems()
        ]);
        setCategories(cats);
        setItems(menuItems);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- Handlers ---
  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(i => i.category_id === activeCategory);

  const handleNextStep = async () => {
    if (checkoutStep === 1) {
      const isValid = await trigger(['name', 'email', 'phone']);
      if (isValid) setCheckoutStep(2);
    } else if (checkoutStep === 2) {
      if (deliveryType === 'delivery') {
         const address = watch('address');
         if (!address || address.length < 5) {
            alert("Veuillez entrer une adresse de livraison valide.");
            return;
         }
      }
      setCheckoutStep(3);
    }
  };

  const handlePlaceOrder = async (data: CheckoutFormData) => {
    try {
      // Build flattened payload for the API
      const payload = {
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' 
           ? `${data.address || ''} ${data.instructions ? `(Note: ${data.instructions})` : ''}`.trim()
           : undefined,
        order_items: transformOrderItems(cart),
        total_amount: total
      };

      const result = await createOrder(payload);

      if (result.success && result.id) {
        setOrderSuccess({ id: result.id, time: result.estimatedTime || '' });
        clearCart();
        setCheckoutStep(4); // Success step
      } else {
        alert(result.error || "Une erreur est survenue lors de la commande.");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur inattendue est survenue.");
    }
  };

  const CartSummary = ({ isMobile = false }) => (
    <div className={cn("flex flex-col h-full", isMobile ? "p-0" : "p-6")}>
      {!isMobile && (
        <h3 className="font-serif text-2xl text-secondary font-bold mb-6 flex items-center gap-2">
           Votre Commande
        </h3>
      )}

      {/* Items List */}
      <div className="flex-grow overflow-y-auto mb-6 pr-2 space-y-4 max-h-[40vh] md:max-h-[calc(100vh-450px)]">
        {cart.length === 0 ? (
          <div className="text-center py-10 text-secondary/50">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-secondary/5 shadow-sm">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-secondary line-clamp-1">{item.name}</span>
                  <span className="font-bold text-sm text-primary whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex items-center gap-3 bg-secondary/5 rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-secondary/60 hover:text-primary"><Minus size={14} /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-secondary/60 hover:text-primary"><Plus size={14} /></button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {cart.length > 0 && (
        <div className="border-t border-secondary/10 pt-4 space-y-4">
          {/* Delivery Toggle */}
          <div className="flex p-1 bg-secondary/5 rounded-lg relative">
            <div 
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded shadow-sm transition-all duration-300",
                deliveryType === 'delivery' ? "left-1" : "left-[calc(50%+2px)]"
              )} 
            />
            <button 
              onClick={() => setDeliveryType('delivery')}
              className={cn("flex-1 relative z-10 text-xs font-bold uppercase tracking-wider py-2 text-center transition-colors", deliveryType === 'delivery' ? "text-primary" : "text-secondary/50")}
            >
              Livraison
            </button>
            <button 
              onClick={() => setDeliveryType('pickup')}
              className={cn("flex-1 relative z-10 text-xs font-bold uppercase tracking-wider py-2 text-center transition-colors", deliveryType === 'pickup' ? "text-primary" : "text-secondary/50")}
            >
              À emporter
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-secondary/70">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-secondary/70">
              <span>TVA (18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-secondary/70">
              <span>Frais de livraison</span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Gratuit'}</span>
            </div>
            <div className="flex justify-between text-xl font-serif font-bold text-secondary pt-2 border-t border-secondary/10">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <Button 
            onClick={() => {
               setIsMobileCartOpen(false);
               setIsCheckoutOpen(true);
            }} 
            className="w-full py-4 shadow-xl shadow-primary/20"
            size="lg"
          >
            PASSER LA COMMANDE
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-accent min-h-screen pb-24 md:pb-0">
      <Helmet>
        <title>Commander en Ligne | Le Gourmet Élégant</title>
        <meta name="description" content="Commandez vos plats préférés en ligne pour la livraison ou à emporter. Paiement sécurisé et livraison rapide." />
      </Helmet>
      
      {/* Hero */}
      <div className="bg-secondary text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">Commander en Ligne</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Dégustez nos créations chez vous. Livraison rapide ou à emporter.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: Menu Grid */}
          <div className="w-full lg:w-[65%]">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar sticky top-20 z-20 bg-accent/95 backdrop-blur py-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                  activeCategory === 'all' ? "bg-primary border-primary text-secondary shadow-md" : "bg-white border-transparent text-secondary/60 hover:bg-white/80"
                )}
              >
                Tout
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                    activeCategory === cat.id ? "bg-primary border-primary text-secondary shadow-md" : "bg-white border-transparent text-secondary/60 hover:bg-white/80"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            {loading ? (
               <LoadingSkeleton variant="menuCard" count={4} />
            ) : filteredItems.length === 0 ? (
               <EmptyState 
                 icon={Utensils}
                 title="Menu vide"
                 message="Aucun plat disponible pour le moment."
               />
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {filteredItems.map(item => (
                   <div key={item.id} className="bg-white rounded-lg shadow-sm border border-secondary/5 overflow-hidden flex h-32 group hover:shadow-md transition-shadow">
                      <div className="w-32 h-full bg-secondary/10 shrink-0 relative overflow-hidden">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-grow p-4 flex flex-col justify-between">
                         <div>
                            <h3 className="font-serif font-bold text-secondary line-clamp-1">{item.name}</h3>
                            <p className="text-xs text-secondary/60 mt-1 line-clamp-2">{item.description}</p>
                         </div>
                         <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-primary">{formatPrice(item.price)}</span>
                            {item.is_available ? (
                              <button 
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 rounded-full bg-secondary/10 text-secondary hover:bg-primary hover:text-secondary flex items-center justify-center transition-colors"
                              >
                                <Plus size={16} />
                              </button>
                            ) : (
                              <span className="text-[10px] text-red-400 font-bold uppercase">Épuisé</span>
                            )}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* RIGHT: Cart Sidebar (Desktop Sticky) */}
          <div className="hidden lg:block w-[35%] sticky top-24">
             <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-secondary/5">
                <CartSummary />
             </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary/10 p-4 lg:hidden z-40 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
         <div className="flex flex-col">
            <span className="text-xs text-secondary/60 font-bold uppercase">Total Panier</span>
            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
         </div>
         <Button 
            onClick={() => setIsMobileCartOpen(true)}
            className="rounded-full px-6"
            rightIcon={<ShoppingBag size={18} />}
         >
            Voir ({cart.reduce((a, b) => a + b.quantity, 0)})
         </Button>
      </div>

      {/* Mobile Cart Sheet/Modal */}
      {isMobileCartOpen && (
         <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
               <div className="flex items-center justify-between p-4 border-b border-secondary/10">
                  <h3 className="font-serif text-xl font-bold text-secondary">Votre Panier</h3>
                  <button onClick={() => setIsMobileCartOpen(false)} className="p-2 hover:bg-secondary/5 rounded-full">
                     <X size={24} />
                  </button>
               </div>
               <div className="flex-grow overflow-hidden">
                  <CartSummary isMobile={true} />
               </div>
            </div>
         </div>
      )}

      {/* Checkout Modal */}
      <Modal 
        isOpen={isCheckoutOpen} 
        onClose={() => { if (!orderSuccess) setIsCheckoutOpen(false); }}
        size="lg"
        title={orderSuccess ? "Commande Confirmée" : "Finaliser la commande"}
      >
        {orderSuccess ? (
           <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                 <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-secondary mb-2">Merci pour votre commande !</h3>
              <p className="text-secondary/60 mb-6">Votre commande a été reçue et est en cours de préparation.</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                 <div className="bg-accent/30 p-4 rounded border border-primary/20">
                    <span className="text-xs uppercase tracking-widest text-secondary/50 block mb-1">Numéro</span>
                    <span className="font-mono font-bold text-xl text-primary">{orderSuccess.id.split('-').pop() || orderSuccess.id}</span>
                 </div>
                 <div className="bg-accent/30 p-4 rounded border border-primary/20">
                    <span className="text-xs uppercase tracking-widest text-secondary/50 block mb-1">Estimation</span>
                    <span className="font-mono font-bold text-xl text-secondary">{orderSuccess.time}</span>
                 </div>
              </div>

              <Button onClick={() => { setOrderSuccess(null); setIsCheckoutOpen(false); setCheckoutStep(1); }}>
                 Retour au menu
              </Button>
           </div>
        ) : (
           <form onSubmit={handleSubmit(handlePlaceOrder)} className="flex flex-col h-full min-h-[400px]">
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8 gap-4">
                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", checkoutStep >= 1 ? "bg-primary text-secondary" : "bg-secondary/10 text-secondary/40")}>1</div>
                 <div className={cn("h-1 w-12", checkoutStep >= 2 ? "bg-primary" : "bg-secondary/10")}></div>
                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", checkoutStep >= 2 ? "bg-primary text-secondary" : "bg-secondary/10 text-secondary/40")}>2</div>
                 <div className={cn("h-1 w-12", checkoutStep >= 3 ? "bg-primary" : "bg-secondary/10")}></div>
                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", checkoutStep >= 3 ? "bg-primary text-secondary" : "bg-secondary/10 text-secondary/40")}>3</div>
              </div>

              {/* Steps Content */}
              <div className="flex-grow">
                 {checkoutStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                       <h4 className="font-bold text-lg text-secondary mb-4">Informations de contact</h4>
                       <Input label="Nom Complet" {...register('name')} error={errors.name?.message} />
                       <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                       <Input label="Téléphone" {...register('phone')} error={errors.phone?.message} placeholder="+225..." />
                    </div>
                 )}

                 {checkoutStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                       <h4 className="font-bold text-lg text-secondary mb-4">
                          {deliveryType === 'delivery' ? 'Adresse de livraison' : 'Retrait en restaurant'}
                       </h4>
                       
                       {deliveryType === 'delivery' ? (
                          <>
                             <Input textarea label="Adresse Complète" {...register('address')} error={errors.address?.message} placeholder="Quartier, Rue, Porte..." />
                             <Input textarea label="Instructions de livraison (Optionnel)" {...register('instructions')} placeholder="Code porte, étage, etc." className="min-h-[80px]" />
                             <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded">
                                <Clock size={16} /> Temps estimé : 45-60 min
                             </div>
                          </>
                       ) : (
                          <div className="bg-secondary/5 p-6 rounded text-center">
                             <Store size={48} className="mx-auto text-primary mb-4" />
                             <p className="font-bold text-secondary">Le Gourmet Élégant</p>
                             <p className="text-sm text-secondary/70">123 Avenue des Champs-Élysées, Paris</p>
                             <p className="text-xs text-secondary/50 mt-4">Votre commande sera prête dans environ 20 minutes.</p>
                          </div>
                       )}
                    </div>
                 )}

                 {checkoutStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                       <h4 className="font-bold text-lg text-secondary mb-2">Récapitulatif</h4>
                       
                       <div className="bg-secondary/5 p-4 rounded text-sm space-y-2">
                          <p><span className="font-bold text-secondary">Nom:</span> {watch('name')}</p>
                          <p><span className="font-bold text-secondary">Contact:</span> {watch('phone')} | {watch('email')}</p>
                          {deliveryType === 'delivery' && (
                             <p><span className="font-bold text-secondary">Livraison à:</span> {watch('address')}</p>
                          )}
                          <p><span className="font-bold text-secondary">Type:</span> {deliveryType === 'delivery' ? 'Livraison à domicile' : 'À emporter'}</p>
                       </div>

                       <div className="border-t border-b border-secondary/10 py-4">
                          {cart.map(item => (
                             <div key={item.id} className="flex justify-between text-sm py-1">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                             </div>
                          ))}
                       </div>

                       <div className="flex justify-between items-center text-xl font-bold text-primary">
                          <span>Total à payer</span>
                          <span>{formatPrice(total)}</span>
                       </div>
                    </div>
                 )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-between pt-8 border-t border-secondary/10 mt-6">
                 {checkoutStep > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setCheckoutStep(s => s - 1)} leftIcon={<ArrowLeft size={16}/>}>Retour</Button>
                 ) : (
                    <div></div>
                 )}
                 
                 {checkoutStep < 3 ? (
                    <Button type="button" onClick={handleNextStep} rightIcon={<ChevronRight size={16}/>}>Suivant</Button>
                 ) : (
                    <Button type="submit" isLoading={isSubmitting} className="shadow-lg shadow-primary/20">Confirmer la commande</Button>
                 )}
              </div>
           </form>
        )}
      </Modal>

    </div>
  );
};

export default Order;
