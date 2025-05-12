import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  quantity: number;
}

const FeaturedProducts: React.FC = () => {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (error) throw error;
        
        // Use fetched products if available, otherwise we'll keep using mock data
        if (data && data.length > 0) {
          setFeaturedProducts(data as Product[]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
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
      image: product.image_url || 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      quantity: 1
    });
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/4 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-10" />
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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-mondoYellow text-mondoBlue text-xs font-bold px-2 py-1 rounded-full">
                    Featured
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-14">{product.name}</h3>
                  <p className="text-mondoBlue font-bold text-xl mb-4">₦{product.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)} 
                      className="bg-mondoBlue hover:bg-blue-700 flex-1"
                      disabled={product.quantity < 1}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Link to={`/products/${product.id}`} className="inline-block">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
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
        <div className="text-center mt-8">
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
