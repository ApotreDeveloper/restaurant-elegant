
import React from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  Truck, 
  ShoppingBag,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { OrderData, OrderStatus, PaymentStatus } from '../../services/api/orders';
import { formatPrice, formatDate } from '../../utils/helpers';
import { cn } from '../../utils/cn';

interface OrderDetailsModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  onUpdatePayment: (id: string, status: PaymentStatus) => Promise<void>;
  isLoading?: boolean;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePayment,
  isLoading
}) => {
  if (!order) return null;

  const steps = [
    { id: 'pending', label: 'En attente', icon: Clock },
    { id: 'confirmed', label: 'Confirmée', icon: CheckCircle },
    { id: 'preparing', label: 'En préparation', icon: ShoppingBag },
    { id: 'ready', label: 'Prête', icon: CheckCircle },
    { id: 'delivered', label: 'Livrée', icon: Truck },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'cancelled';

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const win = window.open('', '', 'height=600,width=800');
      win?.document.write('<html><head><title>Reçu Commande</title>');
      win?.document.write('<style>body{font-family:sans-serif; padding: 20px;} .header{text-align:center; margin-bottom: 20px;} table{width:100%; border-collapse: collapse;} th, td{border-bottom: 1px solid #ddd; padding: 8px; text-align: left;} .total{font-weight: bold; text-align: right;}</style>');
      win?.document.write('</head><body>');
      win?.document.write(printContent.innerHTML);
      win?.document.write('</body></html>');
      win?.document.close();
      win?.print();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Commande #${order.id}`}
      size="xl"
      footer={
        <>
          <Button variant="outline" leftIcon={<Printer size={16}/>} onClick={handlePrint}>
            Imprimer
          </Button>
          {!isCancelled && order.status !== 'delivered' && (
             <Button 
                variant="outline" 
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" 
                onClick={() => onUpdateStatus(order.id!, 'cancelled')}
             >
                Annuler
             </Button>
          )}
          <Button onClick={onClose}>Fermer</Button>
        </>
      }
    >
      <div className="space-y-8">
        
        {/* Status Stepper */}
        {!isCancelled ? (
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
            {steps.map((step, idx) => {
              const isActive = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isActive ? "bg-primary border-primary text-secondary" : "bg-white border-slate-200 text-slate-300",
                    isCurrent && "ring-4 ring-primary/20"
                  )}>
                    <step.icon size={14} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : "text-slate-300"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
             <AlertCircle size={24} />
             <div>
                <h4 className="font-bold">Commande Annulée</h4>
                <p className="text-sm">Cette commande a été annulée et ne sera pas traitée.</p>
             </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
           {/* Customer & Delivery */}
           <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-primary"/> Livraison
                 </h4>
                 <div className="space-y-2 text-sm text-slate-600">
                    <p className="font-bold">{order.customer.name}</p>
                    <p>{order.delivery.address || "Retrait au restaurant"}</p>
                    {order.delivery.instructions && (
                       <p className="text-orange-600 italic mt-2">Note: {order.delivery.instructions}</p>
                    )}
                 </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Phone size={16} className="text-primary"/> Contact
                 </h4>
                 <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><Phone size={14}/> {order.customer.phone}</p>
                    <p className="flex items-center gap-2"><Mail size={14}/> {order.customer.email}</p>
                 </div>
              </div>
           </div>

           {/* Actions & Payment */}
           <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary"/> Actions Rapides
                 </h4>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut Commande</label>
                       <select 
                          value={order.status}
                          onChange={(e) => onUpdateStatus(order.id!, e.target.value as OrderStatus)}
                          disabled={isCancelled}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                       >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmée</option>
                          <option value="preparing">En préparation</option>
                          <option value="ready">Prête</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                       </select>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paiement</label>
                       <select 
                          value={order.payment_status}
                          onChange={(e) => onUpdatePayment(order.id!, e.target.value as PaymentStatus)}
                          disabled={isCancelled}
                          className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                       >
                          <option value="pending">En attente</option>
                          <option value="paid">Payé</option>
                          <option value="failed">Échoué</option>
                       </select>
                    </div>
                 </div>
              </div>

              {order.notes && (
                 <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="font-bold text-yellow-800 text-sm mb-2">Note Interne</h4>
                    <p className="text-yellow-700 text-sm">{order.notes}</p>
                 </div>
              )}
           </div>
        </div>

        {/* Order Items */}
        <div>
           <h4 className="font-bold text-slate-700 mb-4">Articles Commandés</h4>
           <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                    <tr>
                       <th className="px-4 py-3">Article</th>
                       <th className="px-4 py-3 text-center">Qté</th>
                       <th className="px-4 py-3 text-right">Prix Unit.</th>
                       <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                       <tr key={idx}>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatPrice(item.price)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                       </tr>
                    ))}
                 </tbody>
                 <tfoot className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                       <td colSpan={3} className="px-4 py-2 text-right">Sous-total</td>
                       <td className="px-4 py-2 text-right">{formatPrice(order.subtotal)}</td>
                    </tr>
                    <tr>
                       <td colSpan={3} className="px-4 py-2 text-right text-slate-500 font-normal">TVA (18%)</td>
                       <td className="px-4 py-2 text-right text-slate-500 font-normal">{formatPrice(order.tax)}</td>
                    </tr>
                    <tr>
                       <td colSpan={3} className="px-4 py-2 text-right text-slate-500 font-normal">Livraison</td>
                       <td className="px-4 py-2 text-right text-slate-500 font-normal">{formatPrice(order.delivery_fee)}</td>
                    </tr>
                    <tr className="bg-slate-100 text-base">
                       <td colSpan={3} className="px-4 py-3 text-right">Total</td>
                       <td className="px-4 py-3 text-right text-primary">{formatPrice(order.total_amount)}</td>
                    </tr>
                 </tfoot>
              </table>
           </div>
        </div>
      </div>
      
      {/* Hidden Receipt for Print */}
      <div id="receipt-content" className="hidden">
         <div className="header">
            <h1>Le Gourmet Élégant</h1>
            <p>123 Avenue des Champs-Élysées, Paris</p>
            <p>Tel: +33 1 23 45 67 89</p>
            <h3>Reçu de Commande #{order.id}</h3>
            <p>Date: {formatDate(order.created_at)}</p>
         </div>
         <hr/>
         <div className="customer">
            <p><strong>Client:</strong> {order.customer.name}</p>
            <p><strong>Tel:</strong> {order.customer.phone}</p>
            <p><strong>Type:</strong> {order.delivery.type === 'delivery' ? 'Livraison' : 'À emporter'}</p>
            {order.delivery.address && <p><strong>Adresse:</strong> {order.delivery.address}</p>}
         </div>
         <hr/>
         <table>
            <thead>
               <tr>
                  <th>Qté</th>
                  <th>Article</th>
                  <th>Prix</th>
                  <th>Total</th>
               </tr>
            </thead>
            <tbody>
               {order.items.map((item, idx) => (
                  <tr key={idx}>
                     <td>{item.quantity}</td>
                     <td>{item.name}</td>
                     <td>{formatPrice(item.price)}</td>
                     <td>{formatPrice(item.price * item.quantity)}</td>
                  </tr>
               ))}
            </tbody>
         </table>
         <hr/>
         <div className="total">
            <p>Sous-total: {formatPrice(order.subtotal)}</p>
            <p>TVA: {formatPrice(order.tax)}</p>
            <p>Livraison: {formatPrice(order.delivery_fee)}</p>
            <h3>Total: {formatPrice(order.total_amount)}</h3>
         </div>
         <hr/>
         <p style={{textAlign: 'center', fontSize: '12px'}}>Merci de votre confiance !</p>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
