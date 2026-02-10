
import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Search, 
  Plus, 
  Download, 
  Calendar as CalendarIcon, 
  List, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Phone,
  Mail,
  Edit,
  Trash2,
  Coffee
} from 'lucide-react';
import { 
  getReservations, 
  createAdminReservation, 
  updateReservation, 
  deleteReservation,
  updateReservationStatus,
  ReservationData, 
  ReservationFilters 
} from '../../services/api/reservations';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import ReservationFormModal from '../../components/admin/ReservationFormModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { cn } from '../../utils/cn';

const Reservations: React.FC = () => {
  // View State
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  
  // Filters State
  const [filters, setFilters] = useState<ReservationFilters>({
    status: 'all',
    search: '',
    startDate: undefined,
    endDate: undefined
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data Fetching
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data } = await getReservations(filters);
      setReservations(data);
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filters]);

  // Handlers
  const handleStatusUpdate = async (id: string, status: string) => {
    await updateReservationStatus(id, status);
    fetchReservations();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      await deleteReservation(id);
      fetchReservations();
    }
  };

  const handleModalSubmit = async (data: any) => {
    setModalLoading(true);
    try {
      if (selectedReservation?.id) {
        await updateReservation(selectedReservation.id, data);
      } else {
        await createAdminReservation(data);
      }
      setIsModalOpen(false);
      fetchReservations();
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (res: ReservationData) => {
    setSelectedReservation(res);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setSelectedReservation(null);
    setIsModalOpen(true);
  };

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-slate-100 text-slate-700",
    };
    const labels = {
      pending: "En attente",
      confirmed: "Confirmée",
      cancelled: "Annulée",
      completed: "Terminée",
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider", styles[status as keyof typeof styles] || styles.pending)}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // --- CALENDAR VIEW COMPONENTS ---
  const CalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
             <h3 className="text-lg font-bold text-slate-800 capitalize">
               {format(currentDate, 'MMMM yyyy', { locale: fr })}
             </h3>
             <div className="flex bg-slate-100 rounded-md p-1">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft size={16}/></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-2 text-xs font-bold">Aujourd'hui</button>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight size={16}/></button>
             </div>
          </div>
          <div className="flex gap-4 text-xs">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> En attente</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Confirmée</div>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
           {weekDays.map(day => (
              <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                 {day}
              </div>
           ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
           {days.map((day, dayIdx) => {
              const dayReservations = reservations.filter(r => isSameDay(parseISO(r.reservation_date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "min-h-[120px] bg-white p-2 transition-colors hover:bg-slate-50 relative group",
                    !isCurrentMonth && "bg-slate-50 text-slate-400",
                    isToday(day) && "bg-blue-50/30"
                  )}
                  onClick={() => {
                     // Filter list to this day? Or open add modal for this day
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                     <span className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                        isToday(day) ? "bg-primary text-secondary" : "text-slate-700"
                     )}>
                        {format(day, dateFormat)}
                     </span>
                     {dayReservations.length > 0 && (
                        <span className="text-[10px] font-bold bg-slate-100 px-1.5 rounded-full text-slate-600">
                           {dayReservations.length}
                        </span>
                     )}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                     {dayReservations.map(res => (
                        <div 
                           key={res.id} 
                           onClick={(e) => { e.stopPropagation(); openEditModal(res); }}
                           className={cn(
                              "text-[10px] px-1.5 py-1 rounded truncate cursor-pointer border-l-2 transition-all hover:brightness-95",
                              res.status === 'confirmed' ? "bg-green-50 border-green-500 text-green-800" :
                              res.status === 'pending' ? "bg-yellow-50 border-yellow-500 text-yellow-800" :
                              "bg-slate-100 border-slate-400 text-slate-600"
                           )}
                           title={`${res.reservation_time} - ${res.customer_name} (${res.number_of_guests}p)`}
                        >
                           <span className="font-bold mr-1">{res.reservation_time}</span>
                           {res.customer_name}
                        </div>
                     ))}
                  </div>

                  {/* Quick Add Button (Hover) */}
                  <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        // Pre-fill date in modal (logic needed in modal open)
                        openNewModal();
                     }}
                     className="absolute bottom-2 right-2 p-1 bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                     <Plus size={12} />
                  </button>
                </div>
              );
           })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Gestion des Réservations</h2>
           <p className="text-slate-500 text-sm">Gérez les tables, disponibilités et demandes clients.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
              <button 
                onClick={() => setView('table')}
                className={cn("px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all", view === 'table' ? "bg-secondary text-white" : "text-slate-500 hover:bg-slate-50")}
              >
                 <List size={16} /> Liste
              </button>
              <button 
                onClick={() => setView('calendar')}
                className={cn("px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-all", view === 'calendar' ? "bg-secondary text-white" : "text-slate-500 hover:bg-slate-50")}
              >
                 <CalendarIcon size={16} /> Calendrier
              </button>
           </div>
           <Button variant="outline" leftIcon={<Download size={16}/>} className="border-slate-300 text-slate-600">
              Exporter
           </Button>
           <Button leftIcon={<Plus size={18}/>} onClick={openNewModal}>
              Nouvelle Réservation
           </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(status => (
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
                  {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'confirmed' ? 'Confirmés' : status === 'cancelled' ? 'Annulés' : 'Terminés'}
               </button>
            ))}
         </div>
         
         <div className="relative w-full md:w-72">
            <Input 
               placeholder="Rechercher (Nom, Tel, Email)..." 
               value={filters.search}
               onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
               iconLeft={<Search size={16} />}
               className="bg-slate-50 border-slate-200"
            />
         </div>
      </div>

      {/* Content */}
      {view === 'calendar' ? (
         <CalendarView />
      ) : (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
               <div className="p-12 text-center"><LoadingSpinner /></div>
            ) : reservations.length === 0 ? (
               <div className="p-12 text-center text-slate-500">
                  <Coffee size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Aucune réservation trouvée pour ces filtres.</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                           <th className="px-6 py-4">Client</th>
                           <th className="px-6 py-4">Date & Heure</th>
                           <th className="px-6 py-4">Couverts</th>
                           <th className="px-6 py-4">Contact</th>
                           <th className="px-6 py-4">Statut</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {reservations.map(res => (
                           <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="font-bold text-slate-800">{res.customer_name}</div>
                                 {res.special_requests && (
                                    <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                       <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                       Note: {res.special_requests}
                                    </div>
                                 )}
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <CalendarIcon size={14} className="text-slate-400" />
                                    {new Date(res.reservation_date).toLocaleDateString()}
                                 </div>
                                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <Clock size={14} className="text-slate-400" />
                                    {res.reservation_time}
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Users size={16} className="text-slate-400" />
                                    {res.number_of_guests} pers.
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                       <Phone size={12} /> {res.customer_phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                       <Mail size={12} /> {res.customer_email}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <StatusBadge status={res.status || 'pending'} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {res.status === 'pending' && (
                                       <>
                                          <button onClick={() => handleStatusUpdate(res.id!, 'confirmed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Confirmer">
                                             <CheckCircle size={18} />
                                          </button>
                                          <button onClick={() => handleStatusUpdate(res.id!, 'cancelled')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Annuler">
                                             <XCircle size={18} />
                                          </button>
                                       </>
                                    )}
                                    <button onClick={() => openEditModal(res)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="Modifier">
                                       <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(res.id!)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" title="Supprimer">
                                       <Trash2 size={18} />
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
               <span>Affichage 1-10 sur {reservations.length}</span>
               <div className="flex gap-1">
                  <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Précédent</button>
                  <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Suivant</button>
               </div>
            </div>
         </div>
      )}

      {/* Modal */}
      <ReservationFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedReservation}
        isLoading={modalLoading}
      />

    </div>
  );
};

export default Reservations;
