
import { supabase } from '../supabase';

export interface BlogAuthor {
  id?: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: string;
  author: BlogAuthor;
  read_time: number;
  status: 'published' | 'draft';
}

export interface BlogFilters {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  status?: 'published' | 'draft' | 'all';
}

// Default author until a profiles table is implemented
const DEFAULT_AUTHOR: BlogAuthor = {
  name: "Le Gourmet",
  avatar: "https://ui-avatars.com/api/?name=Le+Gourmet&background=D4AF37&color=fff",
  bio: "L'équipe du restaurant."
};

// Helper to transform DB result to App Type
const transformPost = (item: any): BlogPost => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  excerpt: item.excerpt || '',
  content: item.content || '',
  image: item.featured_image_url || '',
  published_at: item.published_at,
  created_at: item.created_at,
  updated_at: item.updated_at,
  category: item.category || 'Général',
  author: DEFAULT_AUTHOR, 
  read_time: item.read_time || 5,
  status: item.status
});

// --- PUBLIC READ ---

export const getBlogPosts = async (filters: BlogFilters = {}): Promise<BlogPost[]> => {
  try {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    } else if (!filters.status) {
      // Default: only published posts
      query = query.eq('status', 'published');
    }

    if (filters.category && filters.category !== 'Tout') {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    if (filters.limit) {
      const from = filters.offset || 0;
      query = query.range(from, from + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(transformPost);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const getBlogPost = async (id: string): Promise<BlogPost | undefined> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return undefined;

    return transformPost(data);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return undefined;
  }
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
    }
    
    return transformPost(data);
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return undefined;
  }
};

export const getRelatedPosts = async (category: string, currentId: string): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .eq('category', category)
      .neq('id', currentId)
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    return (data || []).map(transformPost);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
};

export const getRecentPosts = async (limit = 5): Promise<BlogPost[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, featured_image_url, published_at, category, status, read_time, excerpt')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(transformPost);
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
};

export const getBlogCategories = async (): Promise<string[]> => {
  return ['Tout', 'Menu', 'Vins', 'Événements', 'Cuisine', 'Coulisses'];
};

// --- ADMIN WRITE ---

export const createBlogPost = async (data: Partial<BlogPost>): Promise<BlogPost> => {
  try {
    const dbData = {
      title: data.title || 'Nouvel Article',
      slug: data.slug || `draft-${Date.now()}`,
      excerpt: data.excerpt,
      content: data.content || '',
      featured_image_url: data.image,
      category: data.category || 'Cuisine',
      status: 'draft',
      read_time: 0
    };

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return transformPost(newPost);
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

export const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<BlogPost> => {
  try {
    const dbData: any = {};
    if (data.title !== undefined) dbData.title = data.title;
    if (data.slug !== undefined) dbData.slug = data.slug;
    if (data.excerpt !== undefined) dbData.excerpt = data.excerpt;
    if (data.content !== undefined) {
        dbData.content = data.content;
        // Calculate read time
        const words = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        dbData.read_time = Math.ceil(words / 200);
    }
    if (data.image !== undefined) dbData.featured_image_url = data.image;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.status !== undefined) dbData.status = data.status;
    if (data.published_at !== undefined) dbData.published_at = data.published_at;

    const { data: updated, error } = await supabase
      .from('blog_posts')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformPost(updated);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

export const deleteBlogPost = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return false;
  }
};

export const publishBlogPost = async (id: string): Promise<BlogPost> => {
  return updateBlogPost(id, { status: 'published', published_at: new Date().toISOString() });
};

export const unpublishBlogPost = async (id: string): Promise<BlogPost> => {
  return updateBlogPost(id, { status: 'draft', published_at: null });
};

export const duplicateBlogPost = async (id: string): Promise<BlogPost> => {
  try {
    const { data: original, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const dbData = {
      ...original,
      id: undefined,
      title: `${original.title} (Copie)`,
      slug: `${original.slug}-copie-${Date.now()}`,
      status: 'draft',
      published_at: null,
      created_at: undefined,
      updated_at: undefined
    };

    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert([dbData])
      .select()
      .single();

    if (insertError) throw insertError;
    return transformPost(newPost);
  } catch (error: any) {
    console.error('Error duplicating post:', error);
    throw error;
  }
};

export const checkSlugUniqueness = async (slug: string, excludeId?: string): Promise<boolean> => {
  try {
    let query = supabase.from('blog_posts').select('id').eq('slug', slug);
    if (excludeId) query = query.neq('id', excludeId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data.length === 0;
  } catch (error) {
    console.error('Error checking slug:', error);
    return false;
  }
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

export const uploadBlogImage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `blog/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
};
