
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  ArrowRight,
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  RefreshCcw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { formatPrice } from '../../utils/helpers';
import { 
  getDashboardStats, 
  getRevenueData, 
  getRecentReservations, 
  getRecentOrders,
  DashboardStats as DashboardStatsType,
  RevenueData,
  RecentReservation,
  RecentOrder
} from '../../services/api/dashboard';
import { supabase } from '../../services/supabase';

import DashboardStats from '../../components/admin/DashboardStats';
import RevenueChart from '../../components/admin/RevenueChart';
import Button from '../../components/shared/Button';

const COLORS = ['#D4AF37', '#1B2838', '#94A3B8', '#EF4444'];

const Dashboard: React.FC = () => {
  // State
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month'>('week');

  // Real-time subscription state (placeholder for now)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch Data
  const fetchData = async () => {
    try {
      const [statsData, revData, resData, ordData] = await Promise.all([
        getDashboardStats(),
        getRevenueData(revenuePeriod),
        getRecentReservations(),
        getRecentOrders()
      ]);
      setStats(statsData);
      setRevenueData(revData);
      setRecentReservations(resData);
      setRecentOrders(ordData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Real-time listeners (Example)
    const ordersSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        console.log('New order!', payload);
        // Refresh data or update local state
        fetchData(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [revenuePeriod]);

  // Pie Chart Data
  const orderDistribution = stats ? [
    { name: 'Confirmées', value: stats.orders.confirmed },
    { name: 'En cuisine', value: stats.orders.preparing },
    { name: 'En attente', value: stats.orders.pending },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord</h2>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            Dernière mise à jour : {lastUpdated.toLocaleTimeString()}
            <button onClick={() => { setLoading(true); fetchData(); }} className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
              <RefreshCcw size={14} />
            </button>
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/orders">
             <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:text-primary">Gérer Commandes</Button>
          </Link>
          <Link to="/admin/reservations">
             <Button size="sm">Nouvelle Réservation</Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats 
          title="Revenus du jour" 
          value={stats ? formatPrice(stats.revenue.today) : "..."} 
          icon={<DollarSign className="w-6 h-6" />}
          trend={stats?.revenue.trend}
          color="primary"
          loading={loading}
        />
        <DashboardStats 
          title="Commandes" 
          value={stats ? stats.orders.total : "..."} 
          icon={<ShoppingBag className="w-6 h-6" />}
          trend={10} // Mock trend
          color="blue"
          loading={loading}
        />
        <DashboardStats 
          title="Réservations" 
          value={stats ? stats.reservations.today : "..."} 
          icon={<Calendar className="w-6 h-6" />}
          trend={stats?.reservations.trend}
          color="green"
          loading={loading}
        />
        <DashboardStats 
          title="Avis en attente" 
          value={stats ? stats.reviews.pending : "..."} 
          icon={<Star className="w-6 h-6" />}
          color="orange"
          loading={loading}
          trendLabel="Nécessite action"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Revenue Chart (60%) */}
        <div className="lg:col-span-3 h-[400px]">
          <RevenueChart 
            data={revenueData} 
            loading={loading} 
            period={revenuePeriod} 
            onPeriodChange={setRevenuePeriod} 
          />
        </div>

        {/* Distribution Chart (40%) */}
        <div className="lg:col-span-2 h-[400px] bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-4">État des Commandes</h3>
          <div className="flex-grow">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center animate-pulse bg-slate-50 rounded">...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [value, 'Commandes']} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity Tables */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Recent Reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-primary" /> Réservations Récentes
            </h3>
            <Link to="/admin/reservations" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Chargement...</div>
            ) : recentReservations.map((res) => (
              <div key={res.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {res.customer_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{res.customer_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                       <span>{new Date(res.date).toLocaleDateString()} • {res.time}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span>{res.guests} pers.</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    res.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {res.status}
                  </span>
                  <button className="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-blue-600" /> Commandes Récentes
            </h3>
            <Link to="/admin/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
               <div className="p-8 text-center text-slate-400">Chargement...</div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-400">#{order.id.split('-')[1]}</span>
                      <span className="font-bold text-slate-800 text-sm">{order.customer_name}</span>
                   </div>
                   <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12}/> {order.created_at}</span>
                      <span className="font-bold text-slate-700">{formatPrice(order.total_amount)}</span>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   {order.status === 'pending' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                   <select 
                      defaultValue={order.status}
                      className="text-xs border-none bg-slate-100 rounded px-2 py-1 text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-200"
                   >
                      <option value="pending">En attente</option>
                      <option value="preparing">En cuisine</option>
                      <option value="ready">Prête</option>
                      <option value="delivered">Livrée</option>
                   </select>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Notifications / Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Alert 1 */}
         <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
               <h4 className="text-red-800 font-bold text-sm mb-1">Stock Critique</h4>
               <p className="text-red-600 text-xs">Le stock de "Foie Gras" est inférieur au seuil d'alerte (3 unités restantes).</p>
            </div>
         </div>

         {/* Alert 2 */}
         <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start gap-3">
            <Star className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div>
               <h4 className="text-orange-800 font-bold text-sm mb-1">Modération requise</h4>
               <p className="text-orange-600 text-xs">4 nouveaux avis clients sont en attente de validation.</p>
            </div>
         </div>

         {/* Alert 3 */}
         <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <div>
               <h4 className="text-blue-800 font-bold text-sm mb-1">Service du soir</h4>
               <p className="text-blue-600 text-xs">12 réservations confirmées pour ce soir. Taux d'occupation estimé : 85%.</p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
