import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AboutPreview: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative z-10 shadow-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop" 
                alt="Chef plating dish" 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Decor frame */}
            <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary z-0 hidden md:block"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 z-0 hidden md:block"></div>
          </div>

          {/* Text Side */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">Depuis 1995</span>
              <h2 className="font-serif text-4xl md:text-5xl text-secondary font-bold mt-2 mb-6">Notre Histoire</h2>
              <div className="w-20 h-1 bg-primary"></div>
            </div>

            <div className="text-secondary/70 leading-relaxed space-y-4 text-lg">
              <p>
                <span className="text-6xl float-left mr-3 text-primary font-serif leading-none mt-[-10px]">A</span>
                u cœur de Paris, le Gourmet Élégant est bien plus qu'un restaurant : c'est une invitation au voyage des sens. Fondé par le visionnaire Chef Auguste Gusteau, notre établissement perpétue l'excellence de la gastronomie française.
              </p>
              <p>
                Nous croyons que chaque plat raconte une histoire. Celle de nos producteurs locaux, celle des saisons qui passent, et celle de la passion qui anime notre brigade chaque matin.
              </p>
              <p>
                Dans un cadre raffiné mêlant architecture haussmannienne et touches contemporaines, nous vous invitons à redécouvrir les classiques, audacieusement revisités.
              </p>
            </div>

            <div className="pt-4">
              <Link 
                to="/a-propos" 
                className="inline-flex items-center gap-2 text-secondary font-bold uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-primary transition-colors"
              >
                En savoir plus <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;