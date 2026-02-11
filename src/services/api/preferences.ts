
import { supabase } from '../supabase';

export interface SitePreferences {
  id: string;
  language: string;
  currency: string;
  timezone: string;
  date_format: string;
  time_format: string;
  admin_theme: 'light' | 'dark' | 'auto';
  notifications: {
    email_reservations: boolean;
    email_orders: boolean;
    email_reviews: boolean;
  };
  order_settings: {
    delivery_fee: number;
    tax_rate: number;
    free_delivery_threshold: number;
    prep_time: number;
  };
}

export const getSitePreferences = async () => {
  try {
    const { data, error } = await supabase
      .from('site_preferences')
      .select('*')
      .limit(1)
      .single();
    
    // If no row exists (shouldn't happen with migration, but safe fallback)
    if (error && error.code === 'PGRST116') {
       return { success: true, data: null };
    }

    if (error) throw error;
    
    return { success: true, data: data as SitePreferences };
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return { success: false, error: error.message };
  }
};

export const updateSitePreferences = async (preferencesData: Partial<SitePreferences>) => {
  try {
    // Check if record exists
    const { data: existing } = await supabase
      .from('site_preferences')
      .select('id')
      .limit(1)
      .single();
    
    let result;
    
    const payload = {
        ...preferencesData,
        updated_at: new Date().toISOString()
    };

    if (existing) {
      result = await supabase
        .from('site_preferences')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('site_preferences')
        .insert([payload])
        .select()
        .single();
    }
    
    const { data, error } = result;
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return { success: false, error: error.message };
  }
};
