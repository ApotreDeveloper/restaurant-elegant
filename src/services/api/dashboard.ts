
import { supabase } from '../supabase';

export interface DashboardStats {
  reservations: {
    today: number;
    trend: number; // percentage vs yesterday
  };
  orders: {
    pending: number;
    confirmed: number;
    preparing: number;
    total: number;
  };
  revenue: {
    today: number;
    trend: number;
  };
  reviews: {
    pending: number;
  };
}

export interface RevenueData {
  date: string;
  amount: number;
  orders: number;
}

export interface RecentReservation {
  id: string;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
  created_at: string;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Mock aggregation (In production, use RPC calls or backend aggregation)
  await new Promise(r => setTimeout(r, 800));
  
  return {
    reservations: {
      today: 12,
      trend: 8.5
    },
    orders: {
      pending: 5,
      confirmed: 12,
      preparing: 3,
      total: 24
    },
    revenue: {
      today: 450000, // FCFA
      trend: 12.5
    },
    reviews: {
      pending: 4
    }
  };
};

export const getRevenueData = async (period: 'week' | 'month' = 'week'): Promise<RevenueData[]> => {
  await new Promise(r => setTimeout(r, 1000));
  
  const data: RevenueData[] = [];
  const days = period === 'week' ? 7 : 30;
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    
    // Random mock data
    const baseAmount = 200000 + Math.random() * 300000;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const multiplier = isWeekend ? 1.5 : 1;

    data.push({
      date: dateStr,
      amount: Math.round(baseAmount * multiplier),
      orders: Math.round(15 * multiplier + Math.random() * 10)
    });
  }

  return data;
};

export const getRecentReservations = async (): Promise<RecentReservation[]> => {
  await new Promise(r => setTimeout(r, 600));
  return [
    { id: '1', customer_name: 'Jean Dupont', date: '2024-03-20', time: '19:30', guests: 2, status: 'confirmed' },
    { id: '2', customer_name: 'Marie Martin', date: '2024-03-20', time: '20:00', guests: 4, status: 'pending' },
    { id: '3', customer_name: 'Paul Durand', date: '2024-03-20', time: '20:30', guests: 2, status: 'cancelled' },
    { id: '4', customer_name: 'Sophie Petit', date: '2024-03-21', time: '12:30', guests: 6, status: 'confirmed' },
    { id: '5', customer_name: 'Lucas Bernard', date: '2024-03-21', time: '13:00', guests: 3, status: 'pending' },
  ];
};

export const getRecentOrders = async (): Promise<RecentOrder[]> => {
  await new Promise(r => setTimeout(r, 700));
  return [
    { id: 'CMD-001', customer_name: 'Alice Dubois', total_amount: 15000, status: 'pending', created_at: '18:30' },
    { id: 'CMD-002', customer_name: 'Thomas Morel', total_amount: 32000, status: 'preparing', created_at: '18:15' },
    { id: 'CMD-003', customer_name: 'Emma Laurent', total_amount: 8500, status: 'ready', created_at: '17:45' },
    { id: 'CMD-004', customer_name: 'Hugo Simon', total_amount: 24000, status: 'delivered', created_at: '17:30' },
    { id: 'CMD-005', customer_name: 'Chloé Michel', total_amount: 12500, status: 'confirmed', created_at: '18:00' },
  ];
};
