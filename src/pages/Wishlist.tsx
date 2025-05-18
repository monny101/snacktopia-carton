
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, Loader2, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ErrorCard } from '@/components/ui/error-card';

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    quantity: number;
  };
}

const WishlistPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlistItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product: products (
            id, name, description, price, image_url, quantity
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      setWishlistItems(data as WishlistItem[]);
    } catch (err: any) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load your wishlist items. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load wishlist items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;

      // Update the local state
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemId));
      
      toast({
        title: 'Item Removed',
        description: 'Item removed from your wishlist',
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist',
        variant: 'destructive',
      });
    }
  };

  const addToCart = (product: WishlistItem['product']) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1
    });
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Wishlist</h2>
          <p className="text-gray-600 mb-6">Please login to view and manage your wishlist</p>
          <Link to="/login">
            <Button className="w-full">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorCard
          title="Error Loading Wishlist"
          description={error}
          onDismiss={() => setError(null)}
          action={{
            label: "Try Again",
            onClick: fetchWishlistItems
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Browse our products and heart the items you love</p>
          <Link to="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={item.product.image_url || 'https://placehold.co/300x200?text=No+Image'}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <Link to={`/product/${item.product.id}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600">
                    {item.product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-500 line-clamp-2 mb-3">
                  {item.product.description || 'No description available'}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-600 font-semibold">₦{item.product.price.toLocaleString()}</span>
                  <span className={item.product.quantity > 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                    {item.product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={() => addToCart(item.product)}
                    disabled={item.product.quantity <= 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
