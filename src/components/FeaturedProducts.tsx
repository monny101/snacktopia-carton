
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  quantity: number;
  category_name?: string;
  subcategory_name?: string;
}

const FeaturedProducts: React.FC = () => {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Query for featured products with their category and subcategory names
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            subcategory:subcategory_id(
              name,
              category:category_id(name)
            )
          `)
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) {
          console.error('Error fetching featured products:', error);
          toast({
            title: "Error fetching products",
            description: "There was a problem loading featured products",
            variant: "destructive",
          });
          return;
        }
        
        // Process the data to include category and subcategory names
        const processedData = data.map(product => {
          return {
            ...product,
            category_name: product.subcategory?.category?.name || '',
            subcategory_name: product.subcategory?.name || '',
          };
        });
        
        setFeaturedProducts(processedData as unknown as Product[]);
      } catch (error) {
        console.error('Exception fetching featured products:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || 'https://placehold.co/600x400?text=No+Image',
      quantity: 1
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  if (loading) {
    return (
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-800">Featured Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-3 md:p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/4 mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-gray-800">Featured Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-40 overflow-hidden bg-gray-200">
                  <img 
                    src={product.image_url || 'https://placehold.co/600x400?text=No+Image'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-mondoYellow text-mondoBlue text-xs font-bold px-2 py-1 rounded-full">
                    Featured
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-sm md:text-lg font-semibold mb-1 line-clamp-2 h-10 md:h-14">{product.name}</h3>
                  <p className="text-mondoBlue font-bold text-lg mb-2 md:mb-4">₦{product.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)} 
                      className="bg-mondoBlue hover:bg-blue-700 flex-1 text-xs md:text-sm py-1 h-auto"
                      disabled={product.quantity < 1}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                      {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Link to={`/products/${product.id}`} className="inline-block">
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No featured products found.</p>
            </div>
          )}
        </div>
        <div className="text-center mt-6 md:mt-8">
          <Link to="/products">
            <Button variant="outline" className="border-mondoBlue text-mondoBlue hover:bg-mondoBlue hover:text-white">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
