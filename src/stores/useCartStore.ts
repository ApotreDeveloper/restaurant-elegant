
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '../services/api/menu';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  deliveryType: 'delivery' | 'pickup';
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryType: (type: 'delivery' | 'pickup') => void;
  cartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      deliveryType: 'delivery',
      addToCart: (item, quantity = 1) => set((state) => {
        const existing = state.cart.find((i) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity }] };
      }),
      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter((i) => i.id !== itemId),
      })),
      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter((i) => i.id !== itemId) };
        }
        return {
          cart: state.cart.map((i) => 
            i.id === itemId ? { ...i, quantity } : i
          )
        };
      }),
      clearCart: () => set({ cart: [] }),
      setDeliveryType: (type) => set({ deliveryType: type }),
      cartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'le-gourmet-cart-storage',
    }
  )
);
