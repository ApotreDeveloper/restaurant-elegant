
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  getBlogPostBySlug, 
  getRelatedPosts, 
  BlogPost as BlogPostType 
} from '../../services/api/blog';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Share2,
  MessageSquare
} from 'lucide-react';
import Button from '../../components/shared/Button';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { getOptimizedImageUrl, getResponsiveImageSrcSet } from '../../utils/imageHelpers';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      window.scrollTo(0, 0);
      try {
        const foundPost = await getBlogPostBySlug(slug);
        if (foundPost) {
          setPost(foundPost);
          const related = await getRelatedPosts(foundPost.category, foundPost.id);
          setRelatedPosts(related);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l'article.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) return (
    <div className="container mx-auto px-4 py-12">
       <LoadingSkeleton variant="hero" className="mb-8" />
       <LoadingSkeleton variant="text" count={10} />
    </div>
  );
  
  if (error) return (
    <ErrorMessage 
      variant="page" 
      title="Erreur de chargement" 
      message={error} 
      onRetry={() => window.location.reload()} 
    />
  );

  if (!post) return (
    <ErrorMessage 
      variant="page" 
      title="Article non trouvé" 
      message="L'article que vous cherchez n'existe pas ou a été déplacé."
      onRetry={() => window.history.back()}
    />
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{post.title} | Le Gourmet Élégant</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
      </Helmet>
      
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <img 
          src={getOptimizedImageUrl(post.image, { width: 1200 })}
          srcSet={getResponsiveImageSrcSet(post.image)}
          sizes="100vw"
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-secondary/30"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20">
           <div className="container mx-auto px-4 max-w-4xl">
              <div className="mb-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-white/80 animate-fade-in-up">
                 <Link to="/blog" className="bg-primary text-secondary px-3 py-1 rounded hover:bg-white transition-colors">
                    {post.category}
                 </Link>
                 <span className="flex items-center gap-2"><Calendar size={14}/> {formatDate(post.published_at || '')}</span>
                 <span className="flex items-center gap-2"><Clock size={14}/> {post.read_time} min lecture</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                 {post.title}
              </h1>
              <div className="flex items-center gap-3 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                 <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-full border-2 border-primary object-cover" />
                 <div>
                    <p className="text-white font-bold text-sm">{post.author.name}</p>
                    <p className="text-white/60 text-xs">Auteur</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
           
           <div className="hidden lg:block w-24 shrink-0">
              <div className="sticky top-32 flex flex-col gap-4 items-center">
                 <span className="text-xs font-bold uppercase tracking-widest text-secondary/40 rotate-180 writing-vertical-rl pb-4">Partager</span>
                 <button className="w-10 h-10 rounded-full border border-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-primary hover:text-secondary hover:border-primary transition-all"><Facebook size={18}/></button>
                 <button className="w-10 h-10 rounded-full border border-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-primary hover:text-secondary hover:border-primary transition-all"><Twitter size={18}/></button>
                 <button className="w-10 h-10 rounded-full border border-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-primary hover:text-secondary hover:border-primary transition-all"><Linkedin size={18}/></button>
                 <button className="w-10 h-10 rounded-full border border-secondary/10 flex items-center justify-center text-secondary/60 hover:bg-primary hover:text-secondary hover:border-primary transition-all"><Mail size={18}/></button>
              </div>
           </div>

           <div className="flex-grow max-w-3xl">
              
              <div className="flex items-center gap-2 text-xs text-secondary/50 uppercase tracking-widest mb-8">
                 <Link to="/" className="hover:text-primary">Accueil</Link> 
                 <span className="text-primary">/</span>
                 <Link to="/blog" className="hover:text-primary">Journal</Link>
                 <span className="text-primary">/</span>
                 <span className="truncate max-w-[200px]">{post.title}</span>
              </div>

              <div className="lg:hidden flex items-center justify-between border-y border-secondary/10 py-4 mb-8">
                 <span className="text-xs font-bold uppercase tracking-widest text-secondary/60 flex items-center gap-2">
                    <Share2 size={16} /> Partager cet article
                 </span>
                 <div className="flex gap-4">
                    <button className="text-secondary/60 hover:text-primary"><Facebook size={20}/></button>
                    <button className="text-secondary/60 hover:text-primary"><Twitter size={20}/></button>
                    <button className="text-secondary/60 hover:text-primary"><Mail size={20}/></button>
                 </div>
              </div>

              <div 
                className="prose prose-lg prose-headings:font-serif prose-headings:text-secondary prose-p:text-secondary/80 prose-blockquote:border-l-primary prose-blockquote:text-secondary prose-blockquote:font-serif prose-blockquote:italic prose-a:text-primary prose-img:rounded-lg prose-img:shadow-lg first-letter:float-left first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:mt-[-5px]"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />

              <div className="mt-16 bg-accent/30 p-8 rounded-lg border border-secondary/5 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                 <img src={post.author.avatar} alt={post.author.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md shrink-0" />
                 <div>
                    <h3 className="font-serif text-xl font-bold text-secondary mb-2">À propos de {post.author.name}</h3>
                    <p className="text-secondary/70 mb-4">{post.author.bio}</p>
                    <Link to="/blog" className="text-primary text-sm font-bold uppercase tracking-widest hover:underline">
                       Voir tous ses articles
                    </Link>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-secondary/10">
                 <h3 className="font-serif text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
                    <MessageSquare className="text-primary"/> Commentaires
                 </h3>
                 <div className="bg-gray-50 p-8 rounded-lg text-center border border-dashed border-gray-300">
                    <p className="text-secondary/50 italic">La section commentaires sera bientôt disponible.</p>
                 </div>
              </div>

           </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
         <div className="bg-accent py-16 mt-12 border-t border-secondary/5">
            <div className="container mx-auto px-4 max-w-6xl">
               <h3 className="font-serif text-3xl font-bold text-secondary text-center mb-12">
                  Dans la même catégorie
               </h3>
               <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map(relPost => (
                     <Link key={relPost.id} to={`/blog/${relPost.slug}`} className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="h-48 overflow-hidden">
                           <img 
                             src={getOptimizedImageUrl(relPost.image, { width: 400, height: 250 })}
                             alt={relPost.title} 
                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                           />
                        </div>
                        <div className="p-6">
                           <div className="text-[10px] uppercase tracking-widest text-secondary/50 mb-2">{formatDate(relPost.published_at || '')}</div>
                           <h4 className="font-serif text-lg font-bold text-secondary group-hover:text-primary transition-colors line-clamp-2 mb-3">
                              {relPost.title}
                           </h4>
                           <span className="text-xs font-bold text-primary uppercase tracking-wider group-hover:underline">Lire l'article</span>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default BlogPost;
