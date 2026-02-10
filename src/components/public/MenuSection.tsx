
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuItem, getDailySpecials } from '../../services/api/menu';
import { useCartStore } from '../../stores/useCartStore';
import { formatPrice } from '../../utils/helpers';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '../../utils/imageHelpers';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import { ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';

interface MenuSectionProps {
  items?: MenuItem[];
}

const MenuSection: React.FC<MenuSectionProps> = ({ items: propItems }) => {
  const [items, setItems] = useState<MenuItem[]>(propItems || []);
  const [loading, setLoading] = useState(!propItems);
  const [error, setError] = useState<string | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (propItems) {
      setItems(propItems);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const featuredItems = await getDailySpecials();
        setItems(featuredItems);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les suggestions du chef.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propItems]);

  if (loading) return <div className="py-24 text-center"><LoadingSpinner size="lg" /></div>;
  if (error) return (
    <div className="py-24 text-center text-red-500 flex flex-col items-center gap-2">
      <AlertCircle size={32} />
      <p>{error}</p>
    </div>
  );
  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-accent">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <span className="text-primary text-sm font-bold uppercase tracking-[0.2em] mb-3 block">Pour vos papilles</span>
          <h2 className="font-serif text-4xl md:text-5xl text-secondary font-bold mb-6">Nos Spécialités</h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {items.map((item) => (
            <div key={item.id} className="group relative bg-white shadow-lg overflow-hidden h-[450px] flex flex-col rounded-lg hover:-translate-y-2 transition-transform duration-300">
              {/* Image Container */}
              <div className="h-3/5 overflow-hidden relative">
                <img 
                  src={getOptimizedImageUrl(item.image, { width: 600, height: 450 })}
                  srcSet={getResponsiveImageSrcSet(item.image)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  alt={item.name} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center">
                  <p className="text-accent text-lg italic font-serif leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    "{item.description}"
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow p-6 flex flex-col justify-between bg-white relative z-10">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-serif text-xl font-bold text-secondary group-hover:text-primary transition-colors line-clamp-1" title={item.name}>{item.name}</h3>
                    <span className="font-bold text-primary text-lg ml-2 whitespace-nowrap">{formatPrice(item.price)}</span>
                  </div>
                  <p className="text-secondary/60 text-sm line-clamp-2">{item.description}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-secondary/10 flex justify-between items-center">
                  <span className="text-xs uppercase text-secondary/40 font-bold tracking-wider">
                    {item.category?.name || 'Spécialité'}
                  </span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="text-primary hover:text-secondary font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    <ShoppingBag size={16} /> Commander
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link to="/menu">
            <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
              Voir tout le menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
