import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, MapPin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-accent py-12 border-t border-primary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          {/* Contact */}
          <div>
            <h3 className="font-serif text-xl text-primary mb-4">Contact</h3>
            <div className="flex flex-col space-y-3 items-center md:items-start">
              <p className="flex items-center gap-2"><MapPin size={18} className="text-primary"/> 123 Av. Champs-Élysées, Paris</p>
              <p className="flex items-center gap-2"><Phone size={18} className="text-primary"/> +33 1 23 45 67 89</p>
              <p className="flex items-center gap-2"><Mail size={18} className="text-primary"/> reservation@gourmet.fr</p>
            </div>
          </div>

          {/* Logo & Hours */}
          <div className="flex flex-col items-center">
            <h2 className="font-serif text-2xl font-bold text-primary mb-2">LE GOURMET</h2>
            <p className="text-sm text-accent/80 italic mb-6">L'élégance à la française</p>
            <div className="text-sm space-y-1">
              <p>Mardi - Dimanche</p>
              <p className="text-primary">18h00 - 23h00</p>
            </div>
          </div>

          {/* Social & Links */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="font-serif text-xl text-primary mb-4">Suivez-nous</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="hover:text-primary transition-colors"><Facebook /></a>
              <a href="#" className="hover:text-primary transition-colors"><Instagram /></a>
              <a href="#" className="hover:text-primary transition-colors"><Twitter /></a>
            </div>
            <div className="flex flex-col space-y-2 text-sm text-accent/70">
              <Link to="/mentions-legales" className="hover:text-primary">Mentions Légales</Link>
              <Link to="/confidentialite" className="hover:text-primary">Politique de Confidentialité</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-xs text-accent/40 border-t border-accent/10 pt-4">
          © {new Date().getFullYear()} Le Gourmet Élégant. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;