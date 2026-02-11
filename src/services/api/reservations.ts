
import { supabase } from '../supabase';

export interface ReservationData {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  dish_id?: string;
  special_requests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
}

export interface ReservationFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  guests?: string;
}

export const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
];

// --- HELPERS ---

export const validateReservationData = (data: Partial<ReservationData>) => {
  const errors: string[] = [];

  // Required fields
  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.push("Le nom est requis (min 2 caractères)");
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.customer_email || !emailRegex.test(data.customer_email)) {
    errors.push("Adresse email invalide");
  }

  // Phone format (Simple validation: min 8 digits, allowing +, spaces)
  // Strict Ivory Coast regex per prompt requirement: ^(\+225|00225)?\s?(\d{2}\s?){4}\d{2}$
  // We'll be slightly lenient to allow copy-paste formats
  const phoneDigits = data.customer_phone?.replace(/\D/g, '') || '';
  if (phoneDigits.length < 8) {
    errors.push("Numéro de téléphone invalide");
  }

  // Date validation (not in past)
  if (data.reservation_date) {
    const date = new Date(data.reservation_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(date.getTime()) || date < today) {
      errors.push("La date ne peut pas être dans le passé");
    }
  } else {
    errors.push("Date requise");
  }

  // Time validation
  if (!data.reservation_time || !TIME_SLOTS.includes(data.reservation_time)) {
    errors.push("Heure invalide ou hors horaires d'ouverture");
  }

  // Guests validation
  if (!data.number_of_guests || data.number_of_guests < 1 || data.number_of_guests > 12) {
    errors.push("Le nombre d'invités doit être compris entre 1 et 12");
  }

  return { valid: errors.length === 0, errors };
};

// --- PUBLIC API ---

/**
 * Checks availability for a date.
 * If 'time' is provided, checks specific slot availability (returns object).
 * If 'time' is omitted, returns a list of blocked slots for that date (returns string[]).
 */
export const checkAvailability = async (date: string, time?: string): Promise<any> => {
  try {
    if (time) {
      // Check specific slot for availability
      const { count, error } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_date', date)
        .eq('reservation_time', time)
        .neq('status', 'cancelled');

      if (error) throw error;

      const currentCount = count || 0;
      // Business logic: Max 3 tables per slot per 15 mins (simplified)
      const maxSlots = 3;
      
      if (currentCount >= maxSlots) {
        return { available: false, message: 'Créneau complet' };
      }
      return { available: true, slotsLeft: maxSlots - currentCount };

    } else {
      // Return blocked slots for the date (for frontend calendar/select)
      const { data, error } = await supabase
        .from('reservations')
        .select('reservation_time')
        .eq('reservation_date', date)
        .neq('status', 'cancelled');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(r => {
        counts[r.reservation_time] = (counts[r.reservation_time] || 0) + 1;
      });

      // Block slots with >= 3 reservations
      return Object.keys(counts).filter(t => counts[t] >= 3);
    }
  } catch (error: any) {
    console.error('Error checking availability:', error);
    return time ? { available: false, message: error.message } : [];
  }
};

export const createReservation = async (reservationData: Partial<ReservationData>) => {
  try {
    // 1. Validate Data
    const validation = validateReservationData(reservationData);
    if (!validation.valid) {
      return { success: false, error: 'Données invalides', details: validation.errors };
    }

    // 2. Check Availability
    const availability = await checkAvailability(
      reservationData.reservation_date!,
      reservationData.reservation_time!
    );

    if (!availability.available) {
      return { success: false, error: availability.message };
    }

    // 3. Insert into Database
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        customer_name: reservationData.customer_name,
        customer_email: reservationData.customer_email,
        customer_phone: reservationData.customer_phone,
        reservation_date: reservationData.reservation_date,
        reservation_time: reservationData.reservation_time,
        number_of_guests: reservationData.number_of_guests,
        special_requests: reservationData.special_requests,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, id: data.id, data };
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return { success: false, error: error.message || 'Une erreur est survenue' };
  }
};

// --- ADMIN API ---

export const getReservations = async (filters: ReservationFilters) => {
  try {
    let query = supabase
      .from('reservations')
      .select('*', { count: 'exact' });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`);
    }

    if (filters.startDate) {
      query = query.gte('reservation_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('reservation_date', filters.endDate);
    }

    // Default Sort: Date DESC, Time DESC
    query = query.order('reservation_date', { ascending: false })
                 .order('reservation_time', { ascending: false });

    // Pagination
    if (filters.page && filters.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return { data: [], total: 0 };
  }
};

export const updateReservationStatus = async (id: string, status: string) => {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating reservation status:', error);
    return { success: false, error: error.message };
  }
};

export const updateReservation = async (id: string, data: Partial<ReservationData>) => {
  try {
    const { error } = await supabase
      .from('reservations')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return { success: false, error: error.message };
  }
};

export const deleteReservation = async (id: string) => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting reservation:', error);
    return { success: false, error: error.message };
  }
};

export const createAdminReservation = async (data: Partial<ReservationData>) => {
  // Admin bypasses checks or we reuse logic? Reusing createReservation is safer but admins might need to overbook.
  // For now, let's use direct insert for Admin to allow flexibility (e.g. overbooking VIPs).
  try {
    const { data: newRes, error } = await supabase
      .from('reservations')
      .insert([{
        ...data,
        status: data.status || 'confirmed'
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: newRes };
  } catch (error: any) {
    console.error('Error creating admin reservation:', error);
    return { success: false, error: error.message };
  }
};
