
import type { Database as GeneratedDatabase } from './types';

// Define additional type checking for our components
export type Tables<T extends keyof GeneratedDatabase['public']['Tables']> = 
  GeneratedDatabase['public']['Tables'][T]['Row'];

export type ChatMessage = Tables<'chat_messages'> & {
  profiles?: {
    full_name: string;
  };
};

export type Profile = Tables<'profiles'>;
export type Product = Tables<'products'>;
export type Category = Tables<'categories'>;
export type Subcategory = Tables<'subcategories'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type Address = Tables<'addresses'>;
