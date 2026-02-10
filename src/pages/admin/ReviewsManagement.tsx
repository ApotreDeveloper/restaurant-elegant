
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  MessageSquare, 
  Download, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Clock
} from 'lucide-react';
import { 
  getReviews, 
  getReviewStats, 
  updateReviewStatus, 
  deleteReview,
  bulkUpdateReviewStatus,
  bulkDeleteReviews,
  Review, 
  ReviewStats, 
  ReviewFilters 
} from '../../services/api/reviews';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/helpers';

// --- Sub-components ---

const StarRating = ({ rating, size = 16 }: { rating: number, size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        size={size} 
        className={cn(
          rating >= star ? "fill-primary text-primary" : "text-slate-200 fill-slate-200"
        )} 
      />
    ))}
  </div>
);

const RatingDistribution = ({ stats }: { stats: ReviewStats }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4">Répartition des notes</h3>
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.distribution[rating as keyof typeof stats.distribution];
          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={rating} className="flex items-center gap-3 text-sm">
              <span className="w-8 font-bold text-slate-600 flex items-center gap-1">
                {rating} <Star size={10} className="text-slate-400" />
              </span>
              <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-slate-400 text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ReviewCardProps {
  review: Review;
  selected: boolean;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  selected, 
  onSelect, 
  onApprove, 
  onReject, 
  onDelete 
}) => {
  return (
    <div className={cn(
      "bg-white rounded-xl p-5 shadow-sm border transition-all duration-300 group",
      selected ? "border-primary ring-1 ring-primary" : "border-slate-200 hover:shadow-md"
    )}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={selected}
            onChange={() => onSelect(review.id)}
            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
          />
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold uppercase text-sm">
            {review.author.substring(0, 2)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{review.author}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{new Date(review.date).toLocaleDateString()}</span>
              <span>•</span>
              <span className={cn(
                "font-bold uppercase text-[10px] px-1.5 py-0.5 rounded",
                review.status === 'approved' ? "bg-green-100 text-green-700" :
                review.status === 'rejected' ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              )}>
                {review.status === 'approved' ? 'Approuvé' : review.status === 'rejected' ? 'Rejeté' : 'En attente'}
              </span>
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mb-4 pl-7 border-l-2 border-slate-100">
        "{review.comment}"
      </p>

      <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-50">
        {review.status !== 'approved' && (
          <button 
            onClick={() => onApprove(review.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <Check size={14} /> Approuver
          </button>
        )}
        {review.status !== 'rejected' && (
          <button 
            onClick={() => onReject(review.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <X size={14} /> Rejeter
          </button>
        )}
        <div className="w-px h-6 bg-slate-200 mx-1"></div>
        <button 
          onClick={() => onDelete(review.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Main Page ---

const ReviewsManagement: React.FC = () => {
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReviewFilters>({ status: 'all', search: '', sortBy: 'newest' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set<string>());

  // Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        getReviews(filters),
        getReviewStats()
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Actions
  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map(r => r.id)));
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await updateReviewStatus(id, status);
    fetchData(); // Refresh to update stats and list
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer définitivement cet avis ?")) {
      await deleteReview(id);
      fetchData();
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    const ids = Array.from(selectedIds) as string[];
    if (ids.length === 0) return;

    if (action === 'delete') {
      if (!window.confirm(`Supprimer ${ids.length} avis ?`)) return;
      await bulkDeleteReviews(ids);
    } else {
      await bulkUpdateReviewStatus(ids, action === 'approve' ? 'approved' : 'rejected');
    }
    
    setSelectedIds(new Set());
    fetchData();
  };

  return (
    <div className="pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Gestion des Avis</h2>
           <p className="text-slate-500 text-sm">Modérez et analysez les retours clients.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" leftIcon={<Download size={16}/>} className="border-slate-300 text-slate-600">
              Exporter CSV
           </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Avis</div>
             <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
                <MessageSquare className="text-slate-300" size={20} />
             </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
             <div className="text-yellow-700 text-xs font-bold uppercase tracking-wider mb-2">En Attente</div>
             <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-yellow-800">{stats.pending}</span>
                <Clock className="text-yellow-400" size={20} />
             </div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
             <div className="text-green-700 text-xs font-bold uppercase tracking-wider mb-2">Approuvés</div>
             <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-800">{stats.approved}</span>
                <CheckCircle2 className="text-green-400" size={20} />
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Note Moyenne</div>
             <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{stats.averageRating}</span>
                <div className="flex pb-1"><StarRating rating={Math.round(stats.averageRating)} size={14} /></div>
             </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Filters & Distribution */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Search & Sort */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Filtres</h3>
              <Input 
                 placeholder="Rechercher..." 
                 value={filters.search}
                 onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                 iconLeft={<Search size={16} />}
                 className="bg-slate-50"
              />
              
              <div>
                 <label className="text-xs font-bold text-slate-500 block mb-2">Statut</label>
                 <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                 >
                    <option value="all">Tous</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvés</option>
                    <option value="rejected">Rejetés</option>
                 </select>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 block mb-2">Note</label>
                 <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={filters.rating}
                    onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value === 'all' ? 'all' : Number(e.target.value) }))}
                 >
                    <option value="all">Toutes</option>
                    <option value="5">5 Étoiles</option>
                    <option value="4">4 Étoiles</option>
                    <option value="3">3 Étoiles</option>
                    <option value="2">2 Étoiles</option>
                    <option value="1">1 Étoile</option>
                 </select>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 block mb-2">Trier par</label>
                 <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                 >
                    <option value="newest">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                    <option value="rating_desc">Note: Haute à Basse</option>
                    <option value="rating_asc">Note: Basse à Haute</option>
                 </select>
              </div>
           </div>

           {/* Rating Distribution Chart */}
           {stats && <RatingDistribution stats={stats} />}

        </div>

        {/* Right Content: Review List */}
        <div className="lg:col-span-3 space-y-4">
           
           {/* Bulk Actions Toolbar (Sticky) */}
           {selectedIds.size > 0 && (
              <div className="sticky top-20 z-20 bg-white p-3 rounded-lg shadow-lg border border-primary/20 flex items-center justify-between animate-in slide-in-from-top-2">
                 <div className="flex items-center gap-3">
                    <span className="bg-primary text-secondary text-xs font-bold px-2 py-1 rounded-full">{selectedIds.size}</span>
                    <span className="text-sm font-bold text-slate-700">Sélectionnés</span>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => handleBulkAction('approve')} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Approuver"><Check size={18}/></button>
                    <button onClick={() => handleBulkAction('reject')} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Rejeter"><X size={18}/></button>
                    <button onClick={() => handleBulkAction('delete')} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Supprimer"><Trash2 size={18}/></button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2">Annuler</button>
                 </div>
              </div>
           )}

           {/* Results Count & Select All */}
           <div className="flex justify-between items-center px-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600">
                 <input type="checkbox" checked={selectedIds.size === reviews.length && reviews.length > 0} onChange={handleSelectAll} className="rounded border-slate-300 text-primary focus:ring-primary" />
                 Tout sélectionner
              </label>
              <span className="text-xs text-slate-400">{reviews.length} résultats</span>
           </div>

           {/* Reviews Grid */}
           {loading ? (
              <div className="py-20 flex justify-center"><LoadingSpinner /></div>
           ) : reviews.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
                 <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
                 <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun avis trouvé</h3>
                 <p className="text-slate-500 text-sm">Essayez de modifier vos filtres.</p>
                 <button onClick={() => setFilters({ status: 'all', search: '', sortBy: 'newest' })} className="mt-4 text-primary font-bold text-sm hover:underline">Réinitialiser les filtres</button>
              </div>
           ) : (
              <div className="space-y-4">
                 {reviews.map(review => (
                    <ReviewCard 
                       key={review.id} 
                       review={review}
                       selected={selectedIds.has(review.id)}
                       onSelect={handleSelect}
                       onApprove={(id) => handleUpdateStatus(id, 'approved')}
                       onReject={(id) => handleUpdateStatus(id, 'rejected')}
                       onDelete={handleDelete}
                    />
                 ))}
              </div>
           )}

        </div>
      </div>

    </div>
  );
};

export default ReviewsManagement;
