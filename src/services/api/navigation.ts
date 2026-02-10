
import { supabase } from '../supabase';

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  parent_id?: string | null;
  display_order: number;
  is_active: boolean;
}

export const getNavigationMenu = async (): Promise<NavigationItem[]> => {
  try {
    const { data, error } = await supabase
      .from('navigation_menu')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    return [];
  }
};

export const createMenuItem = async (data: Omit<NavigationItem, 'id'>) => {
  try {
    const { data: newItem, error } = await supabase
      .from('navigation_menu')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: newItem };
  } catch (error) {
    console.error('Error creating menu item:', error);
    return { success: false, error };
  }
};

export const updateMenuItem = async (id: string, data: Partial<NavigationItem>) => {
  try {
    const { data: updatedItem, error } = await supabase
      .from('navigation_menu')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: updatedItem };
  } catch (error) {
    console.error('Error updating menu item:', error);
    return { success: false, error };
  }
};

export const deleteMenuItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('navigation_menu')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return { success: false, error };
  }
};

export const reorderMenuItems = async (orderedIds: string[]) => {
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1
    }));

    const { error } = await supabase
      .from('navigation_menu')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error reordering menu items:', error);
    return { success: false, error };
  }
};
