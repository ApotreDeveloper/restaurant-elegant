
import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { getGalleryImages, getGalleryCategories, GalleryImage } from '../../services/api/gallery';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Share2, 
  Download,
  Play,
  Pause,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../utils/cn';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '../../utils/imageHelpers';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Tout');
  
  const [featuredImages, setFeaturedImages] = useState<GalleryImage[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [imgs, cats] = await Promise.all([
        getGalleryImages('Tout'),
        getGalleryCategories()
      ]);
      setImages(imgs);
      setCategories(cats);
      setFeaturedImages(imgs.filter(i => i.is_featured));
    } catch (err) {
      console.error(err);
      setError("Impossible de charger la galerie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredImages = activeCategory === 'Tout' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  useEffect(() => {
    if (!isAutoPlay || featuredImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prev => (prev + 1) % featuredImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, featuredImages.length]);

  const handleFeaturedChange = (index: number) => {
    setCurrentFeaturedIndex(index);
    setIsAutoPlay(false);
  };

  const openLightbox = (image: GalleryImage) => {
    const index = filteredImages.findIndex(i => i.id === image.id);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev + 1) % filteredImages.length);
  }, [filteredImages.length]);

  const prevImage = useCallback(() => {
    setIsImageLoading(true);
    setCurrentImageIndex(prev => (prev - 1 + filteredImages.length) % filteredImages.length);
  }, [filteredImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) nextImage();
    if (touchStart - touchEnd < -50) prevImage();
    setTouchStart(null);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Lien copié !");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      <Helmet>
        <title>Galerie Photos | Le Gourmet Élégant</title>
        <meta name="description" content="Découvrez l'ambiance et les plats de notre restaurant en images." />
      </Helmet>
      
      <div className="bg-secondary text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        <h1 className="font-serif text-5xl font-bold mb-4 relative z-10">Notre Galerie</h1>
        <p className="text-accent/60 uppercase tracking-widest text-sm relative z-10">Immersion visuelle dans l'univers du Gourmet</p>
      </div>

      {!loading && !error && featuredImages.length > 0 && (
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden group">
          {featuredImages.map((img, idx) => (
            <div 
              key={img.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                idx === currentFeaturedIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <img 
                src={getOptimizedImageUrl(img.url, { width: 1200 })} 
                alt={img.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-2xl animate-fade-in-up">
                <span className="bg-primary text-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 inline-block rounded">
                  À la une
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">{img.title}</h2>
                <p className="text-lg text-accent/90">{img.description}</p>
              </div>
            </div>
          ))}
          
          <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
            <button onClick={() => setIsAutoPlay(!isAutoPlay)} className="text-white hover:text-primary transition-colors">
               {isAutoPlay ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="flex gap-2">
              {featuredImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFeaturedChange(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    idx === currentFeaturedIndex ? "bg-primary w-8" : "bg-white/30 hover:bg-white"
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-12">
        
        {loading ? (
          <LoadingSkeleton variant="galleryGrid" count={12} />
        ) : error ? (
          <ErrorMessage 
            variant="page"
            message={error} 
            onRetry={fetchData} 
            title="Erreur"
          />
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border",
                    activeCategory === cat
                      ? "bg-secondary text-primary border-secondary shadow-lg transform scale-105"
                      : "bg-white text-secondary/60 border-transparent hover:bg-white/80 hover:shadow-md"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filteredImages.map((image) => (
                <div 
                  key={image.id}
                  className="break-inside-avoid group relative rounded-lg overflow-hidden cursor-zoom-in bg-secondary/10"
                  onClick={() => openLightbox(image)}
                >
                  <img 
                    src={getOptimizedImageUrl(image.url, { width: 400 })}
                    alt={image.title} 
                    loading="lazy"
                    className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-primary text-xs font-bold uppercase tracking-wider mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {image.category}
                    </span>
                    <h3 className="text-white font-serif text-xl font-bold mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                      {image.title}
                    </h3>
                    <p className="text-accent/70 text-sm line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                      {image.description}
                    </p>
                    <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      <ZoomIn size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredImages.length === 0 && (
               <EmptyState 
                 icon={ImageIcon}
                 title="Aucune image"
                 message="Aucune image dans cette catégorie."
               />
            )}
          </>
        )}
      </div>

      {lightboxOpen && filteredImages[currentImageIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 z-50"
          >
            <X size={32} />
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block hover:bg-white/5 rounded-full"
          >
            <ChevronLeft size={48} />
          </button>
          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 z-50 hidden md:block hover:bg-white/5 rounded-full"
          >
            <ChevronRight size={48} />
          </button>

          <div 
            className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative max-h-[80vh] max-w-[95vw] md:max-w-[80vw]">
               {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                     <LoadingSpinner variant="white" size="lg" />
                  </div>
               )}
               <img 
                src={getOptimizedImageUrl(filteredImages[currentImageIndex].url, { width: 1200, height: 800, resize: 'contain' })} 
                alt={filteredImages[currentImageIndex].title} 
                className={cn(
                   "max-h-[80vh] w-auto object-contain shadow-2xl transition-opacity duration-300",
                   isImageLoading ? "opacity-50" : "opacity-100"
                )}
                onLoad={() => setIsImageLoading(false)}
              />
            </div>

            <div className="mt-6 text-center max-w-2xl px-4 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-white font-serif text-2xl md:text-3xl font-bold mb-2">
                {filteredImages[currentImageIndex].title}
              </h3>
              <p className="text-accent/70 text-sm md:text-base mb-4">
                {filteredImages[currentImageIndex].description}
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/30 text-xs font-mono">
                  {currentImageIndex + 1} / {filteredImages.length}
                </span>
                <div className="w-px h-4 bg-white/10"></div>
                <button 
                   onClick={() => copyToClipboard(filteredImages[currentImageIndex].url)}
                   className="text-white/50 hover:text-primary transition-colors flex items-center gap-2 text-xs uppercase tracking-wider"
                >
                   <Share2 size={14} /> Partager
                </button>
                <a 
                   href={filteredImages[currentImageIndex].url} 
                   download 
                   target="_blank"
                   rel="noreferrer"
                   className="text-white/50 hover:text-primary transition-colors flex items-center gap-2 text-xs uppercase tracking-wider"
                >
                   <Download size={14} /> Ouvrir
                </a>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 h-16 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar mask-gradient-x">
               {filteredImages.map((img, idx) => (
                  <button
                     key={img.id}
                     onClick={() => { setIsImageLoading(true); setCurrentImageIndex(idx); }}
                     className={cn(
                        "h-full aspect-square rounded-md overflow-hidden transition-all duration-300 border-2 shrink-0",
                        idx === currentImageIndex ? "border-primary opacity-100 scale-110" : "border-transparent opacity-40 hover:opacity-80"
                     )}
                  >
                     <img 
                       src={getOptimizedImageUrl(img.url, { width: 100, height: 100 })} 
                       alt="" 
                       className="w-full h-full object-cover" 
                     />
                  </button>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
