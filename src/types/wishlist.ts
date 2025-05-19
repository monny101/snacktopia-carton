
// Custom type definitions for wishlist functionality
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string | null;
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    quantity: number;
  };
}

// Type assertion helper for wishlist data
export function isWishlistItem(item: any): item is WishlistItem {
  return (
    item &&
    typeof item === 'object' &&
    'id' in item &&
    'user_id' in item &&
    'product_id' in item
  );
}
