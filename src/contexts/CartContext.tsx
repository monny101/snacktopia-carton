
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void; // Added for Cart.tsx
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  subtotal: number; // Added for Cart.tsx and Checkout.tsx
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage', error);
      return [];
    }
  });

  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  // Update localStorage when cart changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      
      // Calculate totals
      const itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const amount = items.reduce((acc, item) => acc + ((item.quantity || 1) * item.price), 0);
      
      setTotalItems(itemCount);
      setTotalAmount(amount);
      setSubtotal(amount);
    } catch (error) {
      console.error('Error saving cart to localStorage', error);
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: (existingItem.quantity || 1) + 1
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Alias for updateItemQuantity to maintain compatibility with Cart.tsx
  const updateQuantity = updateItemQuantity;

  const clearCart = () => {
    setItems([]);
  };

  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    updateQuantity, // Added for Cart.tsx
    clearCart,
    totalItems,
    totalAmount,
    subtotal // Added for Cart.tsx and Checkout.tsx
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};
