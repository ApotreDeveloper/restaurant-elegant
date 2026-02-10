
import { supabase } from '../supabase';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type DeliveryType = 'delivery' | 'pickup';

export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DeliveryInfo {
  type: DeliveryType;
  address?: string;
  instructions?: string;
}

export interface OrderData {
  id?: string;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  notes?: string;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  deliveryType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address?: string;
  delivery_type: DeliveryType;
  order_items: OrderItem[];
  total_amount: number;
}

// --- HELPERS ---

export const validateOrderData = (data: CreateOrderPayload) => {
  const errors: string[] = [];
  
  if (!data.customer_name || data.customer_name.length < 2) errors.push("Nom requis");
  if (!data.customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email)) errors.push("Email invalide");
  if (!data.customer_phone || data.customer_phone.length < 8) errors.push("Téléphone requis");
  
  if (data.delivery_type === 'delivery' && (!data.delivery_address || data.delivery_address.trim().length < 5)) {
    errors.push("Adresse de livraison requise");
  }
  
  if (!data.order_items || !Array.isArray(data.order_items) || data.order_items.length === 0) {
    errors.push("Le panier est vide");
  } else {
    data.order_items.forEach((item, idx) => {
      if (!item.menu_item_id) errors.push(`Article ${idx+1}: ID manquant`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Article ${idx+1}: Quantité invalide`);
      if (item.price === undefined || item.price < 0) errors.push(`Article ${idx+1}: Prix invalide`);
    });
  }

  return { valid: errors.length === 0, errors };
};

export const calculateOrderTotal = (items: OrderItem[], deliveryType: DeliveryType) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% Tax
  const deliveryFee = deliveryType === 'delivery' ? 1000 : 0;
  const total = subtotal + tax + deliveryFee;
  
  return { subtotal, tax, deliveryFee, total };
};

export const transformOrderItems = (cartItems: any[]): OrderItem[] => {
  return cartItems.map(item => ({
    menu_item_id: item.id || item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    price: item.price
  }));
};

// --- PUBLIC API ---

export const createOrder = async (orderData: CreateOrderPayload) => {
  try {
    // 1. Validate Data
    const validation = validateOrderData(orderData);
    if (!validation.valid) {
      return { success: false, error: 'Données de commande invalides', details: validation.errors };
    }

    // 2. Transform Items (Ensure minimal data stored)
    const itemsToStore = orderData.order_items.map(item => ({
      menu_item_id: item.menu_item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    // 3. Verify Totals
    const totals = calculateOrderTotal(itemsToStore, orderData.delivery_type);
    
    // Check if total matches client total (allowing small float tolerance)
    if (Math.abs(totals.total - orderData.total_amount) > 100) {
       console.warn(`Total mismatch: Client ${orderData.total_amount} vs Calc ${totals.total}`);
       // We accept the client intent but ideally we should enforce calculated total.
       // For this implementation we'll proceed but use calculated total for safety.
    }

    // 4. Insert into Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        delivery_address: orderData.delivery_address || null,
        delivery_type: orderData.delivery_type,
        order_items: itemsToStore,
        total_amount: totals.total,
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    
    const estimatedTime = orderData.delivery_type === 'delivery' ? '45-60 min' : '20-30 min';
    
    return { 
      success: true, 
      id: data.id,
      estimatedTime: estimatedTime,
      data
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message || 'Impossible de créer la commande' };
  }
};

// --- ADMIN API ---

export const getOrders = async (filters: OrderFilters = {}) => {
  try {
    let query = supabase.from('orders').select('*');

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    if (filters.deliveryType && filters.deliveryType !== 'all') {
      query = query.eq('delivery_type', filters.deliveryType);
    }
    if (filters.search) {
      query = query.or(`id.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    // Sort by date desc
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Transform DB rows to OrderData
    return (data || []).map((row: any) => {
      const items = row.order_items as OrderItem[];
      const { subtotal, tax, deliveryFee } = calculateOrderTotal(items, row.delivery_type);
      
      return {
        id: row.id,
        customer: {
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone
        },
        delivery: {
          type: row.delivery_type,
          address: row.delivery_address,
          instructions: '' // Not stored separately in DB schema provided
        },
        items: items,
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        total_amount: row.total_amount,
        status: row.status,
        payment_status: row.payment_status,
        created_at: row.created_at
      } as OrderData;
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const getOrder = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const items = data.order_items as OrderItem[];
    const { subtotal, tax, deliveryFee } = calculateOrderTotal(items, data.delivery_type);

    return {
      id: data.id,
      customer: {
        name: data.customer_name,
        email: data.customer_email,
        phone: data.customer_phone
      },
      delivery: {
        type: data.delivery_type,
        address: data.delivery_address
      },
      items,
      subtotal,
      tax,
      delivery_fee: deliveryFee,
      total_amount: data.total_amount,
      status: data.status,
      payment_status: data.payment_status,
      created_at: data.created_at
    } as OrderData;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  try {
    const updates: any = { status };
    if (status === 'delivered') {
      updates.payment_status = 'paid';
    }
    
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePaymentStatus = async (id: string, status: PaymentStatus) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteOrder = async (id: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getOrderStats = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount, payment_status');

    if (error) throw error;

    const total = data.length;
    const active = data.filter((o: any) => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
    ).length;
    const delivered = data.filter((o: any) => o.status === 'delivered').length;
    
    const revenue = data
      .filter((o: any) => o.status !== 'cancelled')
      .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

    return { total, revenue, active, delivered };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return { total: 0, revenue: 0, active: 0, delivered: 0 };
  }
};
