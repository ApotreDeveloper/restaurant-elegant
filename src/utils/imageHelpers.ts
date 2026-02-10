
interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Appends transformation parameters to Supabase Storage URLs.
 * Requires Supabase Image Transformations to be enabled.
 */
export const getOptimizedImageUrl = (url: string | undefined, options: ImageOptions = {}): string => {
  if (!url) return '';

  // Check if URL is from Supabase Storage
  // Usually this would check for your specific Supabase project URL, but generic check for 'supabase' is safer for now.
  if (!url.includes('supabase')) return url;

  const { width, height, quality = 80, format = 'webp', resize = 'cover' } = options;

  // Build transformation params
  const params = new URLSearchParams();

  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  params.append('quality', quality.toString());
  if (format) params.append('format', format);
  params.append('resize', resize);

  // Handle existing query params if any
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

/**
 * Generates a srcSet string for responsive images using Supabase transformations.
 */
export const getResponsiveImageSrcSet = (url: string | undefined, sizes: number[] = [320, 640, 1024, 1920]): string => {
  if (!url) return '';
  
  if (!url.includes('supabase')) return '';

  return sizes
    .map(size => `${getOptimizedImageUrl(url, { width: size })} ${size}w`)
    .join(', ');
};
