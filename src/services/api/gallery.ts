
import { supabase } from '../supabase';

export type GalleryCategory = 'Restaurant' | 'Plats' | 'Événements' | 'Équipe';

// Mapping helpers to match DB schema (lowercase) with UI (Title Case)
const categoryMap: Record<string, string> = {
  'Restaurant': 'restaurant',
  'Plats': 'dishes',
  'Événements': 'events',
  'Équipe': 'team'
};

const reverseCategoryMap: Record<string, GalleryCategory> = {
  'restaurant': 'Restaurant',
  'dishes': 'Plats',
  'events': 'Événements',
  'team': 'Équipe'
};

export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  category: GalleryCategory;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
}

// --- PUBLIC READ API ---

export const getGalleryImages = async (category?: string, featuredOnly?: boolean): Promise<GalleryImage[]> => {
  try {
    let query = supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (category && category !== 'Tout') {
      const dbCategory = categoryMap[category];
      if (dbCategory) {
        query = query.eq('category', dbCategory);
      }
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      url: item.image_url,
      category: reverseCategoryMap[item.category] || 'Restaurant',
      is_featured: item.is_featured,
      display_order: item.display_order,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};

export const getFeaturedImages = async (): Promise<GalleryImage[]> => {
  return getGalleryImages(undefined, true);
};

export const getGalleryCategories = async (): Promise<string[]> => {
  return ['Tout', 'Restaurant', 'Plats', 'Événements', 'Équipe'];
};

// --- ADMIN WRITE API ---

export const uploadGalleryImages = async (files: File[], metadata: Partial<GalleryImage> = {}) => {
  try {
    const uploadedImages = [];

    // Get current max display order to append new images
    const { data: maxOrderData } = await supabase
      .from('gallery')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1);
    
    let currentOrder = (maxOrderData?.[0]?.display_order || 0) + 1;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      const dbCategory = metadata.category ? categoryMap[metadata.category] : 'restaurant';

      const { data: newImage, error: insertError } = await supabase
        .from('gallery')
        .insert([{
          title: metadata.title || file.name.split('.')[0],
          description: metadata.description || '',
          image_url: urlData.publicUrl,
          category: dbCategory,
          is_featured: metadata.is_featured || false,
          display_order: currentOrder++
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      uploadedImages.push({
        id: newImage.id,
        title: newImage.title,
        description: newImage.description,
        url: newImage.image_url,
        category: reverseCategoryMap[newImage.category] || 'Restaurant',
        is_featured: newImage.is_featured,
        display_order: newImage.display_order,
        created_at: newImage.created_at
      });
    }

    return { success: true, data: uploadedImages };
  } catch (error: any) {
    console.error('Error uploading gallery images:', error);
    return { success: false, error: error.message };
  }
};

export const updateGalleryImage = async (id: string, data: Partial<GalleryImage>) => {
  try {
    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.category !== undefined) updates.category = categoryMap[data.category];
    if (data.is_featured !== undefined) updates.is_featured = data.is_featured;
    if (data.display_order !== undefined) updates.display_order = data.display_order;

    const { data: updated, error } = await supabase
      .from('gallery')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      data: {
        ...updated,
        url: updated.image_url,
        category: reverseCategoryMap[updated.category] || 'Restaurant'
      }
    };
  } catch (error: any) {
    console.error('Error updating gallery image:', error);
    return { success: false, error: error.message };
  }
};

export const deleteGalleryImage = async (id: string) => {
  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting gallery image:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMultipleImages = async (ids: string[]) => {
  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting gallery images:', error);
    return { success: false, error: error.message };
  }
};

export const reorderGalleryImages = async (orderedIds: string[]) => {
  try {
    const updates = orderedIds.map((id, index) => ({
      id,
      display_order: index + 1
    }));

    const { error } = await supabase
      .from('gallery')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error reordering gallery images:', error);
    return { success: false, error: error.message };
  }
};
