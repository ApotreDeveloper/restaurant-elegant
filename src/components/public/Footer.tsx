
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight, Clock, UtensilsCrossed } from 'lucide-react';

const Footer: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Merci pour votre inscription à notre newsletter !");
  };

  return (
    <footer className="bg-secondary text-accent border-t-4 border-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Restaurant Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-full">
                <UtensilsCrossed className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary tracking-wide">LE GOURMET</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-accent/60">Élégance Culinaire</p>
              </div>
            </div>
            <p className="text-accent/70 leading-relaxed text-sm">
              Une expérience gastronomique inoubliable au cœur de Paris. 
              Tradition, innovation et passion dans chaque assiette depuis 1995.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-serif text-xl text-primary font-bold mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { label: 'Accueil', path: '/' },
                { label: 'Menu', path: '/menu' },
                { label: 'Réserver', path: '/reservation' },
                { label: 'Commander', path: '/commande' },
                { label: 'Galerie', path: '/galerie' },
                { label: 'Blog', path: '/blog' },
                { label: 'À Propos', path: '/a-propos' },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-accent/70 hover:text-primary hover:translate-x-1 transition-all duration-300 flex items-center gap-2 text-sm group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="font-serif text-xl text-primary font-bold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-accent/80 group">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                <span>123 Avenue des Champs-Élysées,<br/>75008 Paris, France</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-accent/80 group">
                <Phone className="w-5 h-5 text-primary shrink-0 group-hover:text-white transition-colors" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-accent/80 group">
                <Mail className="w-5 h-5 text-primary shrink-0 group-hover:text-white transition-colors" />
                <span>contact@legourmet.fr</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours & Social & Newsletter */}
          <div className="space-y-8">
            {/* Opening Hours */}
            <div>
               <h4 className="font-serif text-xl text-primary font-bold mb-4">Horaires</h4>
                <div className="flex items-start gap-3 text-sm text-accent/80">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="flex justify-between w-40"><span>Mar - Dim:</span> <span>18h00 - 23h00</span></p>
                    <p className="flex justify-between w-40 text-red-400 mt-1"><span>Lundi:</span> <span>Fermé</span></p>
                  </div>
                </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center hover:bg-primary hover:text-secondary transition-all duration-300" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center hover:bg-primary hover:text-secondary transition-all duration-300" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center hover:bg-primary hover:text-secondary transition-all duration-300" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>

            {/* Newsletter */}
            <div>
               <h4 className="font-serif text-sm font-bold text-accent uppercase tracking-widest mb-3">Newsletter</h4>
               <form onSubmit={handleSubmit} className="relative">
                 <input 
                   type="email" 
                   placeholder="Votre email" 
                   className="w-full bg-accent/5 border border-accent/20 rounded px-4 py-2 text-sm text-accent placeholder:text-accent/30 focus:outline-none focus:border-primary transition-colors pr-10"
                   required
                 />
                 <button type="submit" className="absolute right-1 top-1 p-1 bg-primary text-secondary rounded hover:bg-white transition-colors">
                    <ArrowRight size={16} />
                 </button>
               </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-accent/10 bg-secondary/50">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-accent/40">
          <p>© {new Date().getFullYear()} Le Gourmet Élégant. Tous droits réservés.</p>
          <p className="hidden md:block">Propulsé par Le Gourmet</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-primary transition-colors">Mentions Légales</Link>
            <Link to="#" className="hover:text-primary transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
