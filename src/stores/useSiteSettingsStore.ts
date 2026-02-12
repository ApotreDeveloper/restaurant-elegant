import { create } from 'zustand';
import { getNavigationMenu, NavigationItem } from '../services/api/navigation';
import { getSitePreferences, SitePreferences } from '../services/api/preferences';

interface SiteSettingsState {
  navigationMenu: NavigationItem[];
  preferences: SitePreferences | null;
  isLoading: boolean;
  fetchSiteSettings: () => Promise<void>;
}

const defaultNavigation: NavigationItem[] = [
  { id: 'default-home', label: 'Accueil', url: '/', display_order: 1, is_active: true },
  { id: 'default-menu', label: 'Menu', url: '/menu', display_order: 2, is_active: true },
  { id: 'default-gallery', label: 'Galerie', url: '/galerie', display_order: 3, is_active: true },
  { id: 'default-blog', label: 'Blog', url: '/blog', display_order: 4, is_active: true },
  { id: 'default-about', label: 'À propos', url: '/a-propos', display_order: 5, is_active: true }
];

export const useSiteSettingsStore = create<SiteSettingsState>((set) => ({
  navigationMenu: defaultNavigation,
  preferences: null,
  isLoading: false,
  fetchSiteSettings: async () => {
    set({ isLoading: true });
    try {
      const [navigation, preferencesResult] = await Promise.all([
        getNavigationMenu(),
        getSitePreferences()
      ]);

      const preferences = preferencesResult.success ? (preferencesResult.data ?? null) : null;

      if (preferences) {
        localStorage.setItem('site-language', preferences.language || 'fr');
        localStorage.setItem('site-currency', preferences.currency || 'FCFA');
        document.documentElement.lang = preferences.language || 'fr';
      }

      set({
        navigationMenu: navigation.length > 0 ? navigation.filter((item) => item.is_active) : defaultNavigation,
        preferences,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching site settings:', error);
      set({ isLoading: false });
    }
  }
}));
