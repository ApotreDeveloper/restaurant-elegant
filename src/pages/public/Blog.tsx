
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  getBlogPosts, 
  getBlogCategories, 
  getRecentPosts, 
  BlogPost 
} from '../../services/api/blog';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '../../utils/imageHelpers';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  User, 
  ChevronRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorMessage from '../../components/shared/ErrorMessage';
import EmptyState from '../../components/shared/EmptyState';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchData = async () => {
    // Only set loading if we have no posts (initial load) to avoid flickering on updates
    if (posts.length === 0) setLoading(true);
    setError(null);
    try {
      const [allPosts, cats, recent] = await Promise.all([
        getBlogPosts({ category: activeCategory, search: searchQuery }),
        getBlogCategories(),
        getRecentPosts()
      ]);
      setPosts(allPosts);
      setCategories(cats);
      setRecentPosts(recent);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le journal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, searchQuery]);

  // Real-time subscription for blog posts
  useRealtimeSubscription('blog_posts', (payload) => {
    if (payload.eventType === 'INSERT' && payload.new.status === 'published') {
      fetchData();
    } else if (payload.eventType === 'UPDATE' && payload.new.status === 'published') {
      fetchData();
    } else if (payload.eventType === 'DELETE') {
      fetchData();
    }
  });

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const isDefaultView = activeCategory === 'Tout' && !searchQuery;
  const gridPosts = isDefaultView ? posts.slice(1, visibleCount + 1) : posts.slice(0, visibleCount);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-accent min-h-screen pb-20">
      <Helmet>
        <title>Le Journal | Actualités & Inspiration Culinaire</title>
        <meta name="description" content="Découvrez nos articles sur la gastronomie, les coulisses du restaurant et nos inspirations culinaires." />
      </Helmet>

      <div className="bg-secondary text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Le Journal</h1>
          <p className="text-accent/60 uppercase tracking-widest text-sm max-w-2xl mx-auto">
            Actualités, Coulisses et Inspiration Culinaire
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-[70%]">
            
            {loading ? (
              <LoadingSkeleton variant="blogCard" count={3} />
            ) : error ? (
              <ErrorMessage 
                variant="card" 
                message={error} 
                onRetry={fetchData} 
                title="Erreur de chargement"
              />
            ) : (
              <>
                {isDefaultView && featuredPost && (
                  <div className="mb-12 group relative rounded-xl overflow-hidden shadow-xl bg-white animate-in slide-in-from-bottom-4 duration-500">
                    <div className="h-64 md:h-96 overflow-hidden relative">
                      <img 
                        src={getOptimizedImageUrl(featuredPost.image, { width: 800, height: 400 })}
                        srcSet={getResponsiveImageSrcSet(featuredPost.image, [640, 800, 1024])}
                        sizes="(max-width: 768px) 100vw, 70vw"
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 bg-primary text-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">
                        À la une
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-4 text-xs text-secondary/60 mb-4 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(featuredPost.published_at || '')}</span>
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {featuredPost.read_time} min</span>
                      </div>
                      <Link to={`/blog/${featuredPost.slug}`}>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                      </Link>
                      <p className="text-secondary/70 text-lg mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between border-t border-secondary/10 pt-6">
                        <div className="flex items-center gap-3">
                          <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-bold text-secondary">{featuredPost.author.name}</p>
                            <p className="text-xs text-secondary/50">Auteur</p>
                          </div>
                        </div>
                        <Link to={`/blog/${featuredPost.slug}`}>
                          <Button variant="outline" rightIcon={<ArrowRight size={16} />}>Lire la suite</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {gridPosts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {gridPosts.map((post) => (
                      <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col hover:-translate-y-1">
                        <div className="h-48 overflow-hidden relative">
                           <img 
                              src={getOptimizedImageUrl(post.image, { width: 400, height: 250 })}
                              srcSet={getResponsiveImageSrcSet(post.image, [320, 480])}
                              sizes="(max-width: 640px) 100vw, 33vw"
                              alt={post.title} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                           />
                           <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-secondary px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                              {post.category}
                           </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                           <div className="flex items-center gap-2 text-[10px] text-secondary/50 uppercase tracking-widest mb-3">
                              <span className="flex items-center gap-1"><Calendar size={10}/> {formatDate(post.published_at || '')}</span>
                              <span>•</span>
                              <span>{post.read_time} min</span>
                           </div>
                           <Link to={`/blog/${post.slug}`} className="mb-3 block">
                              <h3 className="font-serif text-xl font-bold text-secondary leading-tight group-hover:text-primary transition-colors">
                                 {post.title}
                              </h3>
                           </Link>
                           <p className="text-secondary/60 text-sm mb-6 line-clamp-2 flex-grow">
                              {post.excerpt}
                           </p>
                           <div className="flex items-center justify-between pt-4 border-t border-secondary/5">
                              <span className="text-xs font-bold text-secondary flex items-center gap-2">
                                 <User size={12} className="text-primary" /> {post.author.name}
                              </span>
                           </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={FileText}
                    title="Aucun article trouvé"
                    message="Essayez une autre recherche ou catégorie."
                    action={{
                      label: "Voir tous les articles",
                      onClick: () => {setSearchQuery(''); setActiveCategory('Tout');},
                      icon: <RefreshCw size={16} />
                    }}
                  />
                )}

                {!loading && gridPosts.length < (isDefaultView ? posts.length - 1 : posts.length) && (
                  <div className="mt-12 text-center">
                     <Button 
                       variant="outline" 
                       onClick={() => setVisibleCount(prev => prev + 4)}
                       className="px-8"
                     >
                        Charger plus d'articles
                     </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full lg:w-[30%] lg:sticky lg:top-24 h-fit space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-secondary/5">
              <h3 className="font-serif text-lg font-bold text-secondary mb-4">Recherche</h3>
              <Input 
                 placeholder="Rechercher un article..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 iconRight={<Search size={16} />}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-secondary/5">
              <h3 className="font-serif text-lg font-bold text-secondary mb-4">Catégories</h3>
              <div className="flex flex-col space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "flex items-center justify-between text-sm py-2 px-3 rounded transition-colors",
                      activeCategory === cat 
                        ? "bg-primary/10 text-primary font-bold" 
                        : "text-secondary/70 hover:bg-secondary/5 hover:text-secondary"
                    )}
                  >
                    <span>{cat}</span>
                    {activeCategory === cat && <ChevronRight size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-secondary/5">
              <h3 className="font-serif text-lg font-bold text-secondary mb-6">Récemment</h3>
              <div className="space-y-6">
                {recentPosts.slice(0, 5).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0">
                       <img 
                         src={getOptimizedImageUrl(post.image, { width: 100, height: 100 })} 
                         alt="" 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                       />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-secondary leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                          {post.title}
                       </h4>
                       <span className="text-[10px] text-secondary/40 uppercase tracking-wider">{formatDate(post.published_at || '')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-primary text-secondary p-8 rounded-lg shadow-lg text-center relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="font-serif text-xl font-bold mb-2">Restez informé</h3>
                  <p className="text-sm opacity-80 mb-4">Recevez nos meilleures recettes et actualités chaque mois.</p>
                  <Input placeholder="Email" className="bg-white/90 border-transparent text-secondary placeholder:text-secondary/50 mb-3" />
                  <Button variant="secondary" size="sm" className="w-full">S'inscrire</Button>
               </div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
