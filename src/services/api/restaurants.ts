import { supabase } from '../supabase';

export interface OpeningHoursDay {
  open: string;
  close: string;
  closed: boolean;
  secondShift?: { open: string; close: string };
}

export interface RestaurantInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  openingHours: Record<string, OpeningHoursDay>; // mon, tue, wed...
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    linkedin?: string;
  };
  settings: {
    delivery_fee: number;
    tax_rate: number; // percentage
    min_order_free_delivery?: number;
    preparation_time: number; // minutes
  };
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  social?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Value {
  id: string;
  title: string;
  description: string;
  icon: 'Star' | 'Heart' | 'Leaf' | 'Award';
}

export interface AboutPageData {
  title: string;
  subtitle: string;
  story_title: string;
  story_content: string;
  story_image: string;
  mission: string;
  vision: string;
  chef_quote: string;
  chef_quote_author: string;
  team_members: TeamMember[];
  values: Value[];
  awards: string[];
}

// --- API FUNCTIONS ---

export const getRestaurantInfo = async (): Promise<RestaurantInfo> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .single();

    if (error) throw error;

    // Transform DB snake_case to app camelCase and provide defaults
    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline || '',
      description: data.description || '',
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website || '',
      logo_url: data.logo_url,
      openingHours: data.opening_hours || {},
      social: data.social_links || {},
      // Mock settings as they are not in the initial migration schema
      settings: {
        delivery_fee: 1000,
        tax_rate: 18,
        min_order_free_delivery: 50000,
        preparation_time: 45
      }
    };
  } catch (error) {
    console.error('Error fetching restaurant info:', error);
    throw error;
  }
};

export const updateRestaurantInfo = async (data: Partial<RestaurantInfo>): Promise<RestaurantInfo> => {
  try {
    // Transform back to DB structure
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.tagline !== undefined) dbData.tagline = data.tagline;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.phone !== undefined) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.website !== undefined) dbData.website = data.website;
    if (data.logo_url !== undefined) dbData.logo_url = data.logo_url;
    if (data.openingHours !== undefined) dbData.opening_hours = data.openingHours;
    if (data.social !== undefined) dbData.social_links = data.social;
    
    // First get the ID
    const { data: existing, error: fetchError } = await supabase
      .from('restaurants')
      .select('id')
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!existing) {
      throw new Error('Aucun restaurant trouvé dans la base de données');
    }

    const { data: updated, error: updateError } = await supabase
      .from('restaurants')
      .update(dbData)
      .eq('id', existing.id)
      .select()
      .single();
    
    if (updateError) throw updateError;

    // Return the updated data in the same format as getRestaurantInfo
    return {
      id: updated.id,
      name: updated.name,
      tagline: updated.tagline || '',
      description: updated.description || '',
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      website: updated.website || '',
      logo_url: updated.logo_url,
      openingHours: updated.opening_hours || {},
      social: updated.social_links || {},
      settings: data.settings || {
        delivery_fee: 1000,
        tax_rate: 18,
        min_order_free_delivery: 50000,
        preparation_time: 45
      }
    };
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    throw error;
  }
};

export const uploadRestaurantImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `restaurant/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('restaurant-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getAboutPageData = async (): Promise<AboutPageData> => {
  try {
    const { data, error } = await supabase
      .from('about_page')
      .select('*')
      .single();

    if (error) throw error;

    return {
      title: data.title || '',
      subtitle: data.subtitle || '',
      story_title: data.story_title || 'Notre Histoire',
      story_content: data.content || '',
      story_image: data.story_image || 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1200',
      mission: data.mission || '',
      vision: data.vision || '',
      chef_quote: data.chef_quote || '',
      chef_quote_author: data.chef_quote_author || '',
      team_members: data.team_members || [],
      values: [
        { id: '1', title: "Qualité", description: "Sélection rigoureuse des meilleurs produits.", icon: "Star" },
        { id: '2', title: "Passion", description: "L'amour du métier dans chaque geste.", icon: "Heart" },
        { id: '3', title: "Authenticité", description: "Respect des traditions.", icon: "Leaf" },
        { id: '4', title: "Excellence", description: "Le souci du détail.", icon: "Award" }
      ],
      awards: ["Michelin", "Gault & Millau"]
    };
  } catch (error) {
    console.error('Error fetching about page data:', error);
    throw error;
  }
};

export const updateAboutPageData = async (data: Partial<AboutPageData>): Promise<AboutPageData> => {
  try {
    const dbData: any = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.subtitle !== undefined) dbData.subtitle = data.subtitle;
    if (data.story_title !== undefined) dbData.story_title = data.story_title;
    if (data.story_content !== undefined) dbData.content = data.story_content;
    if (data.story_image !== undefined) dbData.story_image = data.story_image;
    if (data.mission !== undefined) dbData.mission = data.mission;
    if (data.vision !== undefined) dbData.vision = data.vision;
    if (data.chef_quote !== undefined) dbData.chef_quote = data.chef_quote;
    if (data.chef_quote_author !== undefined) dbData.chef_quote_author = data.chef_quote_author;
    if (data.team_members !== undefined) dbData.team_members = data.team_members;

    const { data: existing, error: fetchError } = await supabase
      .from('about_page')
      .select('id')
      .single();

    if (fetchError) throw fetchError;

    if (!existing) {
      throw new Error('Aucune page "À Propos" trouvée dans la base de données');
    }

    const { data: updated, error: updateError } = await supabase
      .from('about_page')
      .update(dbData)
      .eq('id', existing.id)
      .select()
      .single();
      
    if (updateError) throw updateError;

    return {
      title: updated.title || '',
      subtitle: updated.subtitle || '',
      story_title: updated.story_title || 'Notre Histoire',
      story_content: updated.content || '',
      story_image: updated.story_image || '',
      mission: updated.mission || '',
      vision: updated.vision || '',
      chef_quote: updated.chef_quote || '',
      chef_quote_author: updated.chef_quote_author || '',
      team_members: updated.team_members || [],
      values: data.values || [],
      awards: data.awards || []
    };
  } catch (error) {
    console.error('Error updating about page:', error);
    throw error;
  }
};