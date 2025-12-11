import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductVariant {
  id: string;
  style: string;
  price: number;
  originalPrice?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  variant: ProductVariant;
  color: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const id = `${item.productId}-${item.variant.id}-${item.color}`;
        const existingItem = get().items.find((i) => i.id === id);
        
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, id }] });
        }
        set({ isOpen: true });
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      
      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
    }),
    {
      name: 'glamour-cart',
    }
  )
);
