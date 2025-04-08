
/**
 * Cart types for the application
 */

/**
 * CartItem interface representing an item in the shopping cart
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

/**
 * CartContextType interface for the shopping cart context
 */
export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  getItemCount: () => number;
  subtotal: number;
}
