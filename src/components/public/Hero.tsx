import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1920&auto=format&fit=crop",
    title: "L'Excellence Gastronomique",
    subtitle: "Une cuisine d'auteur au cœur de Paris"
  },
  {
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1920&auto=format&fit=crop",
    title: "Saveurs Authentiques",
    subtitle: "Des produits de saison sublimés avec passion"
  },
  {
    image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1920&auto=format&fit=crop",
    title: "Un Cadre D'Exception",
    subtitle: "L'élégance à la française pour vos moments précieux"
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed transform scale-105 transition-transform duration-[10000ms] ease-linear"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1.1)' : 'scale(1.0)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/40 to-secondary/80" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center z-10 px-4">
        <div className="max-w-4xl space-y-8 animate-fade-in-up">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-primary font-bold tracking-tight drop-shadow-lg leading-tight">
            {slides[currentSlide].title}
          </h1>
          <p className="font-sans text-xl md:text-2xl text-accent/90 font-light tracking-widest uppercase mb-10 drop-shadow-md">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
            <Link to="/menu">
              <Button size="lg" variant="primary" className="w-full md:w-auto min-w-[200px] border-2 border-primary">
                Découvrir le Menu
              </Button>
            </Link>
            <Link to="/reservation">
              <Button size="lg" variant="outline" className="w-full md:w-auto min-w-[200px] text-accent border-accent hover:bg-accent hover:text-secondary bg-transparent/20 backdrop-blur-sm">
                Réserver une Table
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 border border-white/50",
              index === currentSlide ? "bg-primary w-8" : "bg-transparent hover:bg-white/30"
            )}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows (Desktop) */}
      <button 
        onClick={prevSlide}
        className="hidden md:flex absolute left-8 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-primary transition-colors p-2 z-20"
      >
        <ChevronLeft size={48} />
      </button>
      <button 
        onClick={nextSlide}
        className="hidden md:flex absolute right-8 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-primary transition-colors p-2 z-20"
      >
        <ChevronRight size={48} />
      </button>
    </section>
  );
};

export default Hero;