
import { supabase } from '../supabase';

export type Allergen = 'Gluten' | 'Lactose' | 'Fruits à coque' | 'Fruits de mer' | 'Œufs' | 'Soja' | 'Poisson' | 'Céleri';

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image?: string;
  allergens: Allergen[];
  is_daily_special: boolean;
  is_available: boolean;
  calories?: number;
  display_order?: number;
  // Join fields
  category?: {
    name: string;
  };
}

export interface MenuFilters {
  category_id?: string;
  search?: string;
  allergens?: Allergen[];
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'price_asc' | 'price_desc' | 'name';
  is_available?: boolean;
  is_daily_special?: boolean;
}

// --- PUBLIC READ API ---

export const getMenuCategories = async (activeOnly = true): Promise<MenuCategory[]> => {
  try {
    let query = supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return [];
  }
};

export const getMenuItems = async (filters: MenuFilters = {}): Promise<MenuItem[]> => {
  try {
    let query = supabase
      .from('menu_items')
      .select('*, menu_categories(name)');

    if (filters.category_id && filters.category_id !== 'all') {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.is_available !== undefined) {
      query = query.eq('is_available', filters.is_available);
    }

    if (filters.is_daily_special) {
      query = query.eq('is_daily_special', true);
    }

    // Filter items that DO NOT contain any of the selected allergens (Safety filter)
    if (filters.allergens && filters.allergens.length > 0) {
      // Using not overlaps to exclude items containing the allergens
      query = query.not('allergens', 'ov', filters.allergens);
    }

    // Sorting
    if (filters.sort === 'price_asc' || filters.sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (filters.sort === 'price_desc' || filters.sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (filters.sort === 'name' || filters.sort === 'name-asc') {
      query = query.order('name', { ascending: true });
    } else {
      query = query.order('display_order', { ascending: true });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match MenuItem interface
    return (data || []).map((item: any) => ({
      ...item,
      image: item.image_url, // Map DB column image_url to app property image
      category: item.menu_categories // Map relation
    }));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
};

export const getMenuItem = async (id: string): Promise<MenuItem | undefined> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, menu_categories(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return undefined;

    return {
      ...data,
      image: data.image_url,
      category: data.menu_categories
    };
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return undefined;
  }
};

export const getDailySpecials = async (): Promise<MenuItem[]> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, menu_categories(name)')
      .eq('is_daily_special', true)
      .eq('is_available', true)
      .limit(6);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      image: item.image_url,
      category: item.menu_categories
    }));
  } catch (error) {
    console.error('Error fetching daily specials:', error);
    return [];
  }
};

// Alias for backward compatibility if needed, though we will update usage
export const getFeaturedMenu = getDailySpecials;

// --- ADMIN WRITE API ---

export const createCategory = async (data: Partial<MenuCategory>) => {
  try {
    const { data: newCat, error } = await supabase
      .from('menu_categories')
      .insert([{
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        // display_order...
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: newCat };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message };
  }
};

export const updateCategory = async (id: string, data: Partial<MenuCategory>) => {
  try {
    const { data: updatedCat, error } = await supabase
      .from('menu_categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: updatedCat };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { count } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return { success: false, error: 'Cannot delete category containing items.' };
    }

    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
};

export const reorderCategories = async (orderedIds: string[]) => {
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1
    }));

    const { error } = await supabase
      .from('menu_categories')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error reordering categories:', error);
    return { success: false, error: error.message };
  }
};

export const createMenuItem = async (data: Partial<MenuItem>) => {
  try {
    const dbData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category_id: data.category_id,
      image_url: data.image,
      allergens: data.allergens,
      is_daily_special: data.is_daily_special,
      is_available: data.is_available,
    };

    const { data: newItem, error } = await supabase
      .from('menu_items')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return { 
      success: true, 
      data: { ...newItem, image: newItem.image_url } 
    };
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return { success: false, error: error.message };
  }
};

export const updateMenuItem = async (id: string, data: Partial<MenuItem>) => {
  try {
    const dbData: any = { ...data };
    if (data.image !== undefined) {
      dbData.image_url = data.image;
      delete dbData.image;
    }
    delete dbData.category;

    const { data: updatedItem, error } = await supabase
      .from('menu_items')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { 
      success: true, 
      data: { ...updatedItem, image: updatedItem.image_url } 
    };
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMenuItem = async (id: string) => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return { success: false, error: error.message };
  }
};

export const reorderMenuItems = async (orderedIds: string[]) => {
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1
    }));

    const { error } = await supabase
      .from('menu_items')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error reordering menu items:', error);
    return { success: false, error: error.message };
  }
};

export const uploadMenuImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `menu/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading menu image:', error);
    throw error;
  }
};
