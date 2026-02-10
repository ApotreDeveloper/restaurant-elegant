
import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCartStore } from '../../stores/useCartStore';
import { formatPrice } from '../../utils/helpers';
import { 
  getMenuItems, 
  getMenuCategories, 
  MenuCategory, 
  MenuItem, 
  Allergen 
} from '../../services/api/menu';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '../../utils/imageHelpers';
import { 
  Search, 
  Filter, 
  Plus, 
  ShoppingBag, 
  Info,
  CheckCircle2,
  XCircle,
  Wheat,
  Milk,
  Nut,
  Fish,
  Egg,
  Bean,
  Leaf,
  RefreshCw,
  Utensils,
  Minus
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Modal from '../../components/shared/Modal';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';

const AllergenIcons: Record<Allergen, React.ReactNode> = {
  'Gluten': <Wheat size={14} />,
  'Lactose': <Milk size={14} />,
  'Fruits à coque': <Nut size={14} />,
  'Fruits de mer': <Fish size={14} />,
  'Œufs': <Egg size={14} />,
  'Soja': <Bean size={14} />,
  'Poisson': <Fish size={14} />,
  'Céleri': <Leaf size={14} />,
};

const Menu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [sortOption, setSortOption] = useState<'price-asc' | 'price-desc' | 'name-asc'>('name-asc');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  const fetchData = async () => {
    // Only set loading on initial fetch
    if (items.length === 0) setLoading(true);
    setError(null);
    try {
      const [cats, menuItems] = await Promise.all([
        getMenuCategories(),
        getMenuItems() 
      ]);
      setCategories(cats);
      setItems(menuItems); 
    } catch (err: any) {
      console.error(err);
      setError("Impossible de charger le menu. Veuillez vérifier votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscription for menu updates
  useRealtimeSubscription('menu_items', (payload) => {
    if (payload.eventType === 'UPDATE') {
      // Update local state, preserving joined fields (like category object)
      setItems((prevItems) => 
        prevItems.map((item) => 
          item.id === payload.new.id ? { ...item, ...payload.new } : item
        )
      );
      
      // Also update selected item if it's currently open
      if (selectedItem && selectedItem.id === payload.new.id) {
        setSelectedItem((prev) => prev ? { ...prev, ...payload.new } : null);
      }
    } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
      // For insertions/deletions, refetch to ensure correct sort order and categories
      fetchData();
    }
  });

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category_id === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAllergens = selectedAllergens.length === 0 || 
                             !item.allergens.some(a => selectedAllergens.includes(a));
    
    return matchesCategory && matchesSearch && matchesAllergens;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setModalQuantity(1);
  };

  const handleAddToCartFromModal = () => {
    if (selectedItem) {
      addToCart(selectedItem, modalQuantity);
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-accent/30">
      <Helmet>
        <title>La Carte & Menu | Le Gourmet Élégant</title>
        <meta name="description" content="Découvrez notre carte gastronomique : entrées, plats raffinés et desserts gourmands. Cuisine française authentique." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-secondary overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1920&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary/30" />
        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <span className="text-primary font-bold uppercase tracking-[0.2em] mb-4 block">Gastronomie & Saveurs</span>
          <h1 className="font-serif text-5xl md:text-6xl text-white font-bold mb-6">Notre Carte</h1>
          <p className="text-xl text-accent/80 font-light max-w-2xl mx-auto italic">
            "Une invitation au voyage à travers les saisons et les terroirs."
          </p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[72px] lg:top-[88px] z-30 bg-white/95 backdrop-blur-md border-y border-secondary/10 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                    activeCategory === 'all' 
                      ? "bg-primary text-secondary shadow-md" 
                      : "bg-secondary/5 text-secondary/70 hover:bg-secondary/10"
                  )}
                >
                  Tout
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                      activeCategory === cat.id 
                        ? "bg-primary text-secondary shadow-md" 
                        : "bg-secondary/5 text-secondary/70 hover:bg-secondary/10"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0 md:w-64">
                <Input 
                  placeholder="Rechercher un plat..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-secondary/5 border-transparent focus:bg-white h-10 py-1 text-sm"
                  iconLeft={<Search size={16}/>}
                />
              </div>

              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={cn(
                    "h-10 px-4 rounded-md border flex items-center gap-2 text-sm font-bold transition-colors",
                    isFilterOpen || selectedAllergens.length > 0
                      ? "bg-secondary text-primary border-secondary"
                      : "bg-white text-secondary border-secondary/20 hover:border-primary"
                  )}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filtres</span>
                  {(selectedAllergens.length > 0) && (
                    <span className="bg-primary text-secondary text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1">
                      {selectedAllergens.length}
                    </span>
                  )}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white shadow-xl rounded-lg border border-secondary/10 p-5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="mb-4">
                      <h4 className="font-serif text-lg font-bold text-secondary mb-3 border-b pb-2">Trier par</h4>
                      <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="w-full p-2 bg-secondary/5 rounded border border-secondary/10 text-sm outline-none focus:border-primary"
                      >
                        <option value="name-asc">Nom (A-Z)</option>
                        <option value="price-asc">Prix (Croissant)</option>
                        <option value="price-desc">Prix (Décroissant)</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-bold text-secondary mb-3 border-b pb-2">Sans Allergènes</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Gluten', 'Lactose', 'Fruits à coque', 'Fruits de mer', 'Œufs', 'Soja', 'Poisson', 'Céleri'] as Allergen[]).map((allergen) => (
                          <label key={allergen} className="flex items-center gap-2 cursor-pointer group">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              selectedAllergens.includes(allergen) ? "bg-primary border-primary" : "border-secondary/30 group-hover:border-primary"
                            )}>
                              {selectedAllergens.includes(allergen) && <CheckCircle2 size={12} className="text-secondary" />}
                            </div>
                            <span className="text-sm text-secondary/80">{allergen}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <LoadingSkeleton variant="menuCard" count={6} />
        ) : error ? (
          <ErrorMessage 
            variant="card" 
            message={error} 
            onRetry={fetchData} 
            title="Impossible de charger le menu"
          />
        ) : filteredItems.length === 0 ? (
          <EmptyState 
            icon={Utensils}
            title="Aucun plat trouvé"
            message="Aucun plat ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
            action={{
              label: "Réinitialiser les filtres",
              onClick: () => {setSearchQuery(''); setSelectedAllergens([]); setActiveCategory('all');},
              icon: <RefreshCw size={16} />
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleItemClick(item)}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full border border-transparent hover:border-primary/10"
              >
                {/* Card Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary/10">
                  <img 
                    src={getOptimizedImageUrl(item.image, { width: 400, height: 300 })}
                    srcSet={getResponsiveImageSrcSet(item.image, [320, 480, 640])}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt={item.name} 
                    loading="lazy"
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                      !item.is_available && "grayscale opacity-80"
                    )}
                  />
                  
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                     {categories.find(c => c.id === item.category_id)?.name}
                  </div>

                  {item.is_daily_special && (
                    <div className="absolute top-4 left-4 bg-primary text-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
                      <Leaf size={12} /> Suggestion
                    </div>
                  )}

                  {!item.is_available && (
                    <div className="absolute inset-0 bg-secondary/50 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-500 text-white px-4 py-2 font-bold uppercase tracking-widest rounded shadow-lg transform -rotate-12 border-2 border-white">
                        Indisponible
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl font-bold text-secondary group-hover:text-primary transition-colors leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  
                  <p className="text-secondary/60 text-sm mb-4 line-clamp-2 flex-grow">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4 h-6">
                    {item.allergens.map(allergen => (
                      <div key={allergen} className="text-secondary/40 hover:text-primary transition-colors" title={allergen}>
                        {AllergenIcons[allergen]}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-secondary/5 flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-primary">{formatPrice(item.price)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.is_available) addToCart(item);
                      }}
                      disabled={!item.is_available}
                      className="bg-secondary text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)}
        size="lg"
      >
        {selectedItem && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-square md:aspect-auto rounded-lg overflow-hidden bg-secondary/10">
               <img 
                 src={getOptimizedImageUrl(selectedItem.image, { width: 600 })}
                 alt={selectedItem.name} 
                 className="w-full h-full object-cover"
               />
               {selectedItem.is_daily_special && (
                  <div className="absolute top-4 left-4 bg-primary text-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                    Suggestion du Chef
                  </div>
               )}
            </div>

            <div className="flex flex-col">
              <div className="mb-auto">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-primary font-bold uppercase tracking-widest text-xs">
                     {categories.find(c => c.id === selectedItem.category_id)?.name}
                   </span>
                   {selectedItem.is_available ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-wider">
                         <CheckCircle2 size={14} /> Disponible
                      </span>
                   ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase tracking-wider">
                         <XCircle size={14} /> Épuisé
                      </span>
                   )}
                </div>
                
                <h2 className="font-serif text-3xl md:text-4xl text-secondary font-bold mb-4">
                  {selectedItem.name}
                </h2>
                <p className="text-secondary/70 text-lg leading-relaxed mb-6 italic">
                  "{selectedItem.description}"
                </p>

                {selectedItem.allergens.length > 0 && (
                  <div className="bg-secondary/5 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-secondary text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Info size={16} /> Allergènes
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.allergens.map(allergen => (
                        <span key={allergen} className="bg-white border border-secondary/20 px-3 py-1 rounded-full text-xs font-medium text-secondary/70 flex items-center gap-2">
                          {AllergenIcons[allergen]} {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-secondary/10">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center border border-secondary/20 rounded-md overflow-hidden">
                      <button 
                        onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                        className="p-3 hover:bg-secondary/10 transition-colors"
                        disabled={!selectedItem.is_available}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-bold text-lg">{modalQuantity}</span>
                      <button 
                        onClick={() => setModalQuantity(modalQuantity + 1)}
                        className="p-3 hover:bg-secondary/10 transition-colors"
                        disabled={!selectedItem.is_available}
                      >
                        <Plus size={16} />
                      </button>
                   </div>
                   <span className="text-3xl font-serif font-bold text-primary">
                     {formatPrice(selectedItem.price * modalQuantity)}
                   </span>
                </div>

                <Button 
                  onClick={handleAddToCartFromModal}
                  disabled={!selectedItem.is_available}
                  className="w-full py-4 text-lg shadow-xl shadow-primary/10"
                  variant="primary"
                  leftIcon={<ShoppingBag size={20} />}
                >
                  Ajouter à la commande
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Menu;
