
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreVertical,
  ShoppingBag,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  getOrders, 
  getOrderStats,
  updateOrderStatus, 
  updatePaymentStatus,
  OrderData, 
  OrderFilters, 
  OrderStatus
} from '../../services/api/orders';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import DashboardStats from '../../components/admin/DashboardStats';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/helpers';
import { cn } from '../../utils/cn';

const Orders: React.FC = () => {
  // Data State
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState({ total: 0, revenue: 0, active: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    deliveryType: 'all',
    paymentStatus: 'all',
    search: '',
  });

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([
        getOrders(filters),
        getOrderStats()
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Handlers
  const handleStatusUpdate = async (id: string, status: any) => {
    await updateOrderStatus(id, status);
    fetchData();
    if (selectedOrder && selectedOrder.id === id) {
       setSelectedOrder(prev => prev ? ({ ...prev, status }) : null);
    }
  };

  const handlePaymentUpdate = async (id: string, status: any) => {
    await updatePaymentStatus(id, status);
    fetchData();
    if (selectedOrder && selectedOrder.id === id) {
       setSelectedOrder(prev => prev ? ({ ...prev, payment_status: status }) : null);
    }
  };

  const openOrderDetails = (order: OrderData) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Status Badge Helper
  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      preparing: "bg-orange-100 text-orange-700",
      ready: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    
    const labels = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En prép.",
      ready: "Prête",
      delivered: "Livrée",
      cancelled: "Annulée",
    };

    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap", styles[status])}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Gestion des Commandes</h2>
           <p className="text-slate-500 text-sm">Suivez et gérez les commandes en temps réel.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-primary" />
           </div>
           <Button variant="outline" leftIcon={<Download size={16}/>} className="border-slate-300 text-slate-600">
              Exporter CSV
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <DashboardStats 
            title="Total Commandes" 
            value={stats.total} 
            icon={<ShoppingBag size={20} />} 
            color="blue"
            loading={loading}
         />
         <DashboardStats 
            title="Revenus" 
            value={formatPrice(stats.revenue)} 
            icon={<DollarSign size={20} />} 
            color="primary"
            loading={loading}
         />
         <DashboardStats 
            title="En Cours" 
            value={stats.active} 
            icon={<Clock size={20} />} 
            color="orange"
            loading={loading}
         />
         <DashboardStats 
            title="Livrées" 
            value={stats.delivered} 
            icon={<CheckCircle size={20} />} 
            color="green"
            loading={loading}
         />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
         {/* Top Row: Search & Status Tabs */}
         <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
               {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(status => (
                  <button
                     key={status}
                     onClick={() => setFilters(prev => ({ ...prev, status }))}
                     className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border",
                        filters.status === status 
                           ? "bg-secondary text-white border-secondary" 
                           : "bg-white text-slate-500 border-slate-200 hover:border-secondary/50"
                     )}
                  >
                     {status === 'all' ? 'Toutes' : status === 'preparing' ? 'En prép.' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
               ))}
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-64">
               <Input 
                  placeholder="Rechercher (ID, Client)..." 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  iconLeft={<Search size={16} />}
                  className="bg-slate-50 border-slate-200"
               />
            </div>
         </div>

         {/* Bottom Row: Additional Filters */}
         <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Type:</span>
               <select 
                  className="text-sm bg-slate-50 border-none rounded px-2 py-1 text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-100"
                  onChange={(e) => setFilters(prev => ({ ...prev, deliveryType: e.target.value }))}
               >
                  <option value="all">Tous</option>
                  <option value="delivery">Livraison</option>
                  <option value="pickup">À emporter</option>
               </select>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold text-slate-500 uppercase">Paiement:</span>
               <select 
                  className="text-sm bg-slate-50 border-none rounded px-2 py-1 text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-100"
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
               >
                  <option value="all">Tous</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="failed">Échoué</option>
               </select>
            </div>
         </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {loading ? (
            <div className="p-12 text-center"><LoadingSpinner /></div>
         ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
               <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
               <p>Aucune commande trouvée pour ces filtres.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                        <th className="px-6 py-4">N° Commande</th>
                        <th className="px-6 py-4">Client</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-center">Articles</th>
                        <th className="px-6 py-4 text-right">Montant</th>
                        <th className="px-6 py-4">Paiement</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-6 py-4">
                              <span className="font-mono font-bold text-slate-700">{order.id}</span>
                              <div className="text-xs text-slate-400 mt-1">{formatDate(order.created_at)}</div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{order.customer.name}</div>
                              <div className="text-xs text-slate-500">{order.customer.phone}</div>
                           </td>
                           <td className="px-6 py-4">
                              {order.delivery.type === 'delivery' ? (
                                 <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                    <Truck size={12} /> Livraison
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                                    <ShoppingBag size={12} /> Emporter
                                 </div>
                              )}
                           </td>
                           <td className="px-6 py-4 text-center">
                              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                                 {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right font-bold text-slate-700">
                              {formatPrice(order.total_amount)}
                           </td>
                           <td className="px-6 py-4">
                              {order.payment_status === 'paid' ? (
                                 <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><CheckCircle size={12}/> Payé</span>
                              ) : order.payment_status === 'failed' ? (
                                 <span className="text-red-600 flex items-center gap-1 text-xs font-bold"><XCircle size={12}/> Échoué</span>
                              ) : (
                                 <span className="text-yellow-600 flex items-center gap-1 text-xs font-bold"><Clock size={12}/> Attente</span>
                              )}
                           </td>
                           <td className="px-6 py-4">
                              <StatusBadge status={order.status} />
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button 
                                    onClick={() => openOrderDetails(order)}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                                    title="Voir détails"
                                 >
                                    <Eye size={18} />
                                 </button>
                                 <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors group-hover:opacity-100 opacity-0">
                                    <MoreVertical size={18} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
         
         {/* Pagination Placeholder */}
         <div className="border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-500">
            <span>Affichage {orders.length > 0 ? '1' : '0'}-{orders.length} sur {orders.length}</span>
            <div className="flex gap-1">
               <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Précédent</button>
               <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Suivant</button>
            </div>
         </div>
      </div>

      {/* Details Modal */}
      <OrderDetailsModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         order={selectedOrder}
         onUpdateStatus={handleStatusUpdate}
         onUpdatePayment={handlePaymentUpdate}
      />

    </div>
  );
};

export default Orders;
