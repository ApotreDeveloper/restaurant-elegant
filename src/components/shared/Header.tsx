
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Calendar, UtensilsCrossed } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../shared/Button';
import { useCartStore } from '../../stores/useCartStore';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cart = useCartStore((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Galerie', path: '/galerie' },
    { name: 'Blog', path: '/blog' },
    { name: 'À propos', path: '/a-propos' },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isScrolled 
          ? "bg-secondary/95 backdrop-blur-md py-2 shadow-xl border-primary/20" 
          : "bg-secondary/80 backdrop-blur-sm py-4 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={scrollToTop}
          className="group flex items-center gap-2 z-50"
        >
          <div className="bg-primary/10 p-2 rounded-full border border-primary/30 group-hover:border-primary transition-colors">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl md:text-2xl font-bold text-primary tracking-wider leading-none">
              LE GOURMET
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-accent/60 group-hover:text-primary/80 transition-colors">
              Élégance Culinaire
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:text-primary relative group py-2",
                isActive ? "text-primary" : "text-accent"
              )}
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  <span className={cn(
                    "absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA & Cart */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/commande" className="relative group p-2">
            <ShoppingBag className="w-5 h-5 text-accent group-hover:text-primary transition-colors" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-secondary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                {cart.length}
              </span>
            )}
          </Link>

          <div className="h-6 w-px bg-accent/20 mx-2"></div>

          <Link to="/reservation">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-primary/50 hover:border-primary hover:bg-primary hover:text-secondary text-primary"
              leftIcon={<Calendar size={14} />}
            >
              Réserver
            </Button>
          </Link>
          <Link to="/commande">
             <Button variant="primary" size="sm">
               Commander
             </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-4 z-50">
           <Link to="/commande" className="relative group p-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-secondary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-primary hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={cn(
        "fixed inset-0 bg-secondary/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-500 lg:hidden",
        isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <nav className="flex flex-col items-center gap-8 w-full px-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "text-2xl font-serif font-bold text-accent hover:text-primary transition-colors",
                isActive && "text-primary"
              )}
            >
              {link.name}
            </NavLink>
          ))}
          
          <div className="w-16 h-px bg-primary/30 my-4"></div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Link to="/reservation" className="w-full">
              <Button variant="outline" className="w-full justify-center text-lg py-4">
                Réserver une table
              </Button>
            </Link>
            <Link to="/commande" className="w-full">
              <Button variant="primary" className="w-full justify-center text-lg py-4">
                Commander en ligne
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
