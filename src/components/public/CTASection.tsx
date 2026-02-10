import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { Calendar, Clock } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="relative py-24 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=1920&auto=format&fit=crop")' }}>
      <div className="absolute inset-0 bg-secondary/80"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Réservez votre table dès maintenant</h2>
          <p className="text-xl text-accent/80 font-light">
            Pour un dîner romantique, un repas d'affaires ou une célébration en famille, nous vous promettons un moment inoubliable.
          </p>
          
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 inline-flex flex-col md:flex-row gap-8 items-center justify-center my-8">
            <div className="flex items-center gap-3">
              <Clock className="text-primary w-6 h-6" />
              <div className="text-left">
                <p className="font-bold text-sm uppercase tracking-wider text-primary">Ouverture</p>
                <p className="text-sm">Mar - Dim: 18h00 - 23h00</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <Calendar className="text-primary w-6 h-6" />
              <div className="text-left">
                <p className="font-bold text-sm uppercase tracking-wider text-primary">Fermeture</p>
                <p className="text-sm">Lundi toute la journée</p>
              </div>
            </div>
          </div>

          <div>
            <Link to="/reservation">
              <Button size="lg" variant="primary" className="px-12 py-4 text-lg shadow-xl shadow-primary/20">
                Réserver une table
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;