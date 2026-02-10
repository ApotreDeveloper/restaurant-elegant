
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  getAboutPageData, 
  getRestaurantInfo, 
  AboutPageData, 
  RestaurantInfo
} from '../../services/api/restaurants';
import { 
  Star, 
  Heart, 
  Leaf, 
  Award, 
  Target, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Quote, 
  Instagram, 
  Linkedin, 
  Twitter,
  RefreshCw
} from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Button from '../../components/shared/Button';
import { getOptimizedImageUrl } from '../../utils/imageHelpers';

const IconMap: any = {
  Star,
  Heart,
  Leaf,
  Award
};

const About: React.FC = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [info, setInfo] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aboutData, restaurantInfo] = await Promise.all([
        getAboutPageData(),
        getRestaurantInfo()
      ]);
      setData(aboutData);
      setInfo(restaurantInfo);
    } catch (err: any) {
      console.error(err);
      setError("Impossible de charger les informations. Veuillez vérifier votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <LoadingSkeleton variant="hero" />
      <div className="grid md:grid-cols-2 gap-8">
        <LoadingSkeleton variant="text" count={5} />
        <LoadingSkeleton variant="text" count={5} />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <ErrorMessage 
        variant="card" 
        title="Erreur de chargement" 
        message={error || "Données indisponibles"} 
        onRetry={fetchData} 
      />
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>À Propos & Histoire | Le Gourmet Élégant</title>
        <meta name="description" content="Découvrez l'histoire du Gourmet Élégant, notre mission, nos valeurs et l'équipe passionnée qui œuvre pour votre plaisir culinaire." />
      </Helmet>
      
      {/* Header */}
      <div className="bg-secondary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">{data.title}</h1>
          {data.subtitle && <p className="text-xl text-accent/80 font-light max-w-2xl mx-auto">{data.subtitle}</p>}
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={getOptimizedImageUrl(data.story_image, { width: 800, height: 600 })} 
                alt="Notre histoire" 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 border-4 border-primary/20 pointer-events-none"></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <h2 className="font-serif text-4xl text-secondary font-bold relative inline-block">
              {data.story_title || "Notre Histoire"}
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary"></span>
            </h2>
            <div 
              className="prose prose-lg text-secondary/70 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.story_content }}
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-secondary/5 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-primary">
                <Target size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">Notre Mission</h3>
              <p className="text-secondary/70 leading-relaxed">
                {data.mission}
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-secondary/5 hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-primary">
                <Eye size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">Notre Vision</h3>
              <p className="text-secondary/70 leading-relaxed">
                {data.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      {data.values && data.values.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-secondary font-bold mb-4">Nos Valeurs</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.values.map((value) => {
              const Icon = IconMap[value.icon] || Star;
              return (
                <div key={value.id} className="text-center p-6 group">
                  <div className="w-20 h-20 mx-auto bg-secondary text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Icon size={32} />
                  </div>
                  <h4 className="font-bold text-xl text-secondary mb-3">{value.title}</h4>
                  <p className="text-sm text-secondary/60">{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quote Parallax */}
      <section className="py-24 bg-fixed bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1920&auto=format&fit=crop")' }}>
        <div className="absolute inset-0 bg-secondary/80"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <Quote size={64} className="text-primary mx-auto mb-8 opacity-50" />
          <blockquote className="font-serif text-3xl md:text-5xl text-white font-bold leading-tight mb-8 italic">
            "{data.chef_quote}"
          </blockquote>
          <cite className="text-primary text-xl font-bold uppercase tracking-widest not-italic">
            — {data.chef_quote_author}
          </cite>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl text-secondary font-bold mb-4">L'Équipe</h2>
          <p className="text-secondary/60 max-w-2xl mx-auto">
            Des passionnés dévoués à faire de votre repas un moment d'exception.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {data.team_members.map((member) => (
            <div key={member.id} className="group bg-white rounded-xl overflow-hidden shadow-lg border border-secondary/5 hover:shadow-xl transition-all">
              <div className="h-80 overflow-hidden relative">
                <img 
                  src={getOptimizedImageUrl(member.photo_url, { width: 400, height: 500 })} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <div className="flex gap-4 text-white">
                    {member.social?.instagram && <a href={member.social.instagram} className="hover:text-primary transition-colors"><Instagram size={20}/></a>}
                    {member.social?.linkedin && <a href={member.social.linkedin} className="hover:text-primary transition-colors"><Linkedin size={20}/></a>}
                    {member.social?.twitter && <a href={member.social.twitter} className="hover:text-primary transition-colors"><Twitter size={20}/></a>}
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <h4 className="font-serif text-xl font-bold text-secondary">{member.name}</h4>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">{member.role}</p>
                <p className="text-secondary/60 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info / Location */}
      {info && (
        <section className="py-20 bg-secondary text-accent">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h2 className="font-serif text-4xl font-bold text-white mb-6">Nous Trouver</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-primary mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Adresse</h4>
                      <p className="opacity-80">{info.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="text-primary mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Téléphone</h4>
                      <p className="opacity-80">{info.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="text-primary mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Email</h4>
                      <p className="opacity-80">{info.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="text-primary mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Horaires</h4>
                      <p className="opacity-80">
                        Mar - Dim : 18h00 - 23h00<br/>
                        Dimanche midi : 12h00 - 14h30
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-secondary">
                    Contactez-nous
                  </Button>
                </div>
              </div>
              <div className="h-[400px] rounded-xl overflow-hidden shadow-2xl border-4 border-white/10">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.221573030368!2d2.299723215674898!3d48.87222397928886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fc4f8f8f8f8%3A0x4f8f8f8f8f8f8f8!2sChamps-%C3%89lys%C3%A9es!5e0!3m2!1sen!2sfr!4v1620000000000!5m2!1sen!2sfr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title="Map"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default About;
