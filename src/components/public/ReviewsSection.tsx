
import React, { useEffect, useState } from 'react';
import { getApprovedReviews, Review } from '../../services/api/reviews';
import { Star, Quote, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import LoadingSpinner from '../shared/LoadingSpinner';

interface ReviewsSectionProps {
  reviews?: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews: propReviews }) => {
  const [reviews, setReviews] = useState<Review[]>(propReviews || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!propReviews);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propReviews) {
      setReviews(propReviews);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getApprovedReviews(10);
        setReviews(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les avis.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [propReviews]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews]);

  if (loading) return <div className="py-24 bg-secondary flex justify-center"><LoadingSpinner variant="white" /></div>;
  if (error) return null; // Silently fail for reviews section if error
  if (reviews.length === 0) return null;

  return (
    <section className="py-24 bg-secondary text-accent relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
        <Quote size={400} className="absolute -top-20 -left-20 transform rotate-12" />
        <Quote size={400} className="absolute -bottom-20 -right-20 transform rotate-180" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center gap-1 mb-4 text-primary">
            {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
          </div>
          <h2 className="font-serif text-4xl text-white font-bold mb-2">Ce que disent nos hôtes</h2>
          <p className="text-accent/60 uppercase tracking-widest text-sm">L'expérience Le Gourmet</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative h-[300px] flex items-center justify-center">
            {reviews.map((review, index) => {
              // Calculate position for simple transition effect
              const isActive = index === currentIndex;
              
              return (
                <div 
                  key={review.id}
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-1000 ease-in-out px-4",
                    isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                  )}
                >
                  <blockquote className="font-serif text-2xl md:text-3xl italic leading-relaxed mb-8 text-accent/90">
                    "{review.comment}"
                  </blockquote>
                  <cite className="not-italic flex flex-col items-center">
                    <span className="font-bold text-primary text-lg uppercase tracking-wider mb-1">{review.author}</span>
                    <span className="text-xs text-accent/50">{new Date(review.date).toLocaleDateString()}</span>
                  </cite>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex ? "bg-primary w-8" : "bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Avis ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
