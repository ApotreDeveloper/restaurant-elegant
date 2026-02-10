
import { supabase } from '../supabase';

export interface Review {
  id: string;
  author: string; // Mapped from customer_name
  rating: number; // 1-5
  comment: string;
  date: string; // ISO String, mapped from created_at
  status: 'approved' | 'pending' | 'rejected';
  email?: string; // Optional
}

export interface ReviewFilters {
  status?: 'all' | 'approved' | 'pending' | 'rejected';
  rating?: number | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'newest' | 'oldest' | 'rating_desc' | 'rating_asc';
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// --- HELPERS ---

const mapReviewFromDB = (data: any): Review => ({
  id: data.id,
  author: data.customer_name,
  rating: data.rating,
  comment: data.comment,
  date: data.created_at,
  status: data.status,
  email: data.email // Might be undefined if not in DB schema
});

export const validateReviewData = (data: Partial<Review>) => {
  const errors: string[] = [];
  
  if (!data.author || data.author.trim().length < 2) {
    errors.push("Le nom doit contenir au moins 2 caractères");
  }
  
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.push("La note doit être comprise entre 1 et 5");
  }
  
  if (!data.comment || data.comment.trim().length < 10) {
    errors.push("Le commentaire doit contenir au moins 10 caractères");
  }
  
  if (data.comment && data.comment.length > 1000) {
    errors.push("Le commentaire est trop long (max 1000 caractères)");
  }

  return { valid: errors.length === 0, errors };
};

// --- PUBLIC API ---

export const getApprovedReviews = async (limit = 10): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(mapReviewFromDB);
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    return [];
  }
};

export const createReview = async (reviewData: { author: string, rating: number, comment: string, email?: string }): Promise<{ success: boolean; error?: string; details?: string[] }> => {
  try {
    // Validate
    const validation = validateReviewData(reviewData);
    if (!validation.valid) {
      return { success: false, error: 'Données invalides', details: validation.errors };
    }

    const { error } = await supabase
      .from('reviews')
      .insert([{
        customer_name: reviewData.author,
        rating: reviewData.rating,
        comment: reviewData.comment,
        // status defaults to 'pending' in DB
      }]);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error creating review:', error);
    return { success: false, error: error.message || 'Impossible de soumettre l\'avis' };
  }
};

export const getPublicReviewStats = async () => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('status', 'approved');
    
    if (error) throw error;
    
    const stats = {
      totalReviews: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
    };

    if (!data || data.length === 0) {
      return { success: true, data: stats };
    }
    
    stats.totalReviews = data.length;
    const sumRatings = data.reduce((sum, review) => sum + review.rating, 0);
    stats.averageRating = Number((sumRatings / stats.totalReviews).toFixed(1));
    
    data.forEach(review => {
      const r = Math.round(review.rating);
      if (stats.distribution[r] !== undefined) {
        stats.distribution[r]++;
      }
    });
    
    return { success: true, data: stats };
  } catch (error: any) {
    console.error('Error fetching reviews stats:', error);
    return { success: false, error: error.message };
  }
};

// --- ADMIN API ---

export const getReviews = async (filters: ReviewFilters = {}): Promise<Review[]> => {
  try {
    let query = supabase.from('reviews').select('*');

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.rating && filters.rating !== 'all') {
      query = query.eq('rating', filters.rating);
    }

    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,comment.ilike.%${filters.search}%`);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'oldest': 
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_desc': 
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_asc': 
        query = query.order('rating', { ascending: true });
        break;
      case 'newest': 
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapReviewFromDB);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return [];
  }
};

export const getReviewStats = async (): Promise<ReviewStats> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating, status');

    if (error) throw error;

    const stats: ReviewStats = {
      total: data.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    let sumRating = 0;
    let ratedCount = 0;

    data.forEach((r: any) => {
      // Status Counts
      if (r.status === 'pending') stats.pending++;
      else if (r.status === 'approved') stats.approved++;
      else if (r.status === 'rejected') stats.rejected++;

      // Rating Stats (include all or just approved? Usually all for internal stats, or approved for public)
      // For admin dashboard, seeing global average is useful
      if (r.rating) {
        sumRating += r.rating;
        ratedCount++;
        const ratingKey = Math.round(r.rating) as keyof typeof stats.distribution;
        if (stats.distribution[ratingKey] !== undefined) {
          stats.distribution[ratingKey]++;
        }
      }
    });

    stats.averageRating = ratedCount > 0 ? Number((sumRating / ratedCount).toFixed(1)) : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
};

export const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteReview = async (id: string) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const bulkUpdateReviewStatus = async (ids: string[], status: 'approved' | 'rejected') => {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ status })
      .in('id', ids);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const bulkDeleteReviews = async (ids: string[]) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
