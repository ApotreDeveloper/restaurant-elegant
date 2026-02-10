
import { create } from 'zustand';
import { getRestaurantInfo, getAboutPageData, RestaurantInfo, AboutPageData } from '../services/api/restaurants';

interface RestaurantState {
  restaurantInfo: RestaurantInfo | null;
  aboutPage: AboutPageData | null;
  isLoading: boolean;
  error: string | null;
  fetchRestaurantInfo: () => Promise<void>;
  fetchAboutPage: () => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurantInfo: null,
  aboutPage: null,
  isLoading: false,
  error: null,
  fetchRestaurantInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const info = await getRestaurantInfo();
      set({ restaurantInfo: info, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  fetchAboutPage: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getAboutPageData();
      set({ aboutPage: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
