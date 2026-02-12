import React, { useEffect } from 'react';
import Header from '../public/Header';
import Footer from '../public/Footer';
import { useSiteSettingsStore } from '../../stores/useSiteSettingsStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const fetchSiteSettings = useSiteSettingsStore((state) => state.fetchSiteSettings);

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  return (
    <div className="min-h-screen flex flex-col bg-accent font-sans text-secondary">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
