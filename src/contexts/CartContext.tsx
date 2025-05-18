import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartContextType } from '@/types/cart';

// Default context value
const defaultContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
  getItemCount: () => 0,
  subtotal: 0
};

// Create context
const CartContext = createContext<CartContextType>(defaultContext);

// Custom hook to use cart context
export const useCart = () => useContext(CartContext);

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
        // If there's an error parsing, reset the cart
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Calculate subtotal when items change
    const newSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(newSubtotal);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Add item to cart
  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add it
        return [...currentItems, item];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return; // Don't allow quantities less than 1
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Get total number of items in cart
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Get total cost (can include delivery, taxes, etc. in future)
  const getTotalCost = () => {
    return subtotal;
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      clearCart, 
      updateQuantity, 
      getItemCount,
      subtotal,
      getTotalCost // add to context value
    }}>
      {children}
    </CartContext.Provider>
  );
};
