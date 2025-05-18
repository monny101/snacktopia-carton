
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WishlistButtonProps {
  productId: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkWishlistStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single();

        setIsInWishlist(!!data);
      } catch (err) {
        console.error('Error checking wishlist status:', err);
      }
    };

    checkWishlistStatus();
  }, [productId, user, isAuthenticated]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Please Login',
        description: 'You need to be logged in to add items to your wishlist.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user!.id)
          .eq('product_id', productId);

        if (error) throw error;

        setIsInWishlist(false);
        toast({
          title: 'Removed from Wishlist',
          description: 'Item has been removed from your wishlist.',
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert([{ user_id: user!.id, product_id: productId }]);

        if (error) throw error;

        setIsInWishlist(true);
        toast({
          title: 'Added to Wishlist',
          description: 'Item has been added to your wishlist.',
        });
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size="icon"
      className={isInWishlist ? "bg-red-100 text-red-600 border-red-200 hover:bg-red-200" : ""}
      onClick={toggleWishlist}
      disabled={loading}
    >
      <Heart className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
      <span className="sr-only">{isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
    </Button>
  );
};

export default WishlistButton;
