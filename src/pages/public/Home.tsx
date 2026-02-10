
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../../components/public/Hero';
import AboutPreview from '../../components/public/AboutPreview';
import MenuSection from '../../components/public/MenuSection';
import ReviewsSection from '../../components/public/ReviewsSection';
import CTASection from '../../components/public/CTASection';
import { useRestaurantStore } from '../../stores/useRestaurantStore';
import { getDailySpecials, MenuItem } from '../../services/api/menu';
import { getApprovedReviews, Review } from '../../services/api/reviews';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription';

const Home: React.FC = () => {
  const { fetchRestaurantInfo } = useRestaurantStore();
  const [dailySpecials, setDailySpecials] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([
          fetchRestaurantInfo(),
          getDailySpecials().then(setDailySpecials),
          getApprovedReviews().then(setReviews)
        ]);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, [fetchRestaurantInfo]);

  // Real-time subscription for new reviews
  useRealtimeSubscription('reviews', (payload) => {
    if (payload.eventType === 'INSERT' && payload.new.status === 'approved') {
      // New approved review, fetch reviews to update list
      getApprovedReviews().then(setReviews);
    } else if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
      // Review status updated to approved
      getApprovedReviews().then(setReviews);
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col w-full h-screen bg-accent">
        <LoadingSkeleton variant="hero" />
        <div className="container mx-auto px-4 py-12">
           <LoadingSkeleton variant="text" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <Helmet>
        <title>Accueil | Le Gourmet Élégant</title>
        <meta name="description" content="Le Gourmet Élégant, restaurant gastronomique à Paris. Découvrez notre carte de saison, réservez votre table ou commandez en ligne." />
      </Helmet>
      <Hero />
      <AboutPreview />
      <MenuSection items={dailySpecials} />
      <CTASection />
      <ReviewsSection reviews={reviews} />
    </div>
  );
};

export default Home;
