
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
      website: data.website || '', // Assuming website column might exist or default empty
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

export const updateRestaurantInfo = async (data: Partial<RestaurantInfo>): Promise<{ success: boolean }> => {
  try {
    // Transform back to DB structure
    const dbData: any = {};
    if (data.name) dbData.name = data.name;
    if (data.tagline) dbData.tagline = data.tagline;
    if (data.description) dbData.description = data.description;
    if (data.address) dbData.address = data.address;
    if (data.phone) dbData.phone = data.phone;
    if (data.email) dbData.email = data.email;
    if (data.logo_url) dbData.logo_url = data.logo_url;
    if (data.openingHours) dbData.opening_hours = data.openingHours;
    if (data.social) dbData.social_links = data.social;
    
    // We update the single row that exists (or ID if we had it in context)
    // For simplicity, we update all rows or the first one found.
    // In a multi-tenant system, we would filter by ID.
    // Here we assume one restaurant.
    
    // First get the ID
    const { data: existing } = await supabase.from('restaurants').select('id').single();
    
    if (existing) {
      const { error } = await supabase
        .from('restaurants')
        .update(dbData)
        .eq('id', existing.id);
      
      if (error) throw error;
    } else {
        // Handle case where no restaurant exists (insert?)
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    return { success: false };
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
      subtitle: '', // Not in schema, defaulting
      story_title: 'Notre Histoire', // Default
      story_content: data.content || '',
      story_image: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1200', // Default if missing
      mission: data.mission || '',
      vision: data.vision || '',
      chef_quote: '',
      chef_quote_author: '',
      team_members: data.team_members || [],
      values: [ // Hardcoded/Default values as not in schema
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

export const updateAboutPageData = async (data: Partial<AboutPageData>): Promise<{ success: boolean }> => {
  try {
    const dbData: any = {};
    if (data.title) dbData.title = data.title;
    if (data.story_content) dbData.content = data.story_content;
    if (data.mission) dbData.mission = data.mission;
    if (data.vision) dbData.vision = data.vision;
    if (data.team_members) dbData.team_members = data.team_members;

    const { data: existing } = await supabase.from('about_page').select('id').single();

    if (existing) {
      const { error } = await supabase
        .from('about_page')
        .update(dbData)
        .eq('id', existing.id);
      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating about page:', error);
    return { success: false };
  }
};
