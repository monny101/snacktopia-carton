
import React, { useEffect, useState } from 'react';
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
  featured?: boolean;
}

const FeaturedProducts: React.FC = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        // If no featured products, get the latest ones
        if (!data || data.length === 0) {
          const { data: latestProducts, error: latestError } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(8);
          
          if (latestError) {
            console.error('Error fetching latest products:', latestError);
            return;
          }
          
          setProducts(latestProducts || []);
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  // Default placeholder image if none is provided
  const getImageUrl = (url?: string) => {
    if (!url || url.trim() === '') {
      return 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    }
    return url;
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Featured Products</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={getImageUrl(product.image_url)} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  {product.featured && (
                    <div className="absolute top-2 right-2 bg-mondoYellow text-mondoBlue text-xs font-bold px-2 py-1 rounded-full">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-14">{product.name}</h3>
                  <p className="text-mondoBlue font-bold text-xl mb-4">₦{product.price.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(product)} 
                      className="bg-mondoBlue hover:bg-blue-700 flex-1"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Link to={`/products/${product.id}`} className="inline-block">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {products.length === 0 && !loading && (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No products found. Add some products in the admin panel.</p>
                <Link to="/admin/products" className="text-mondoBlue hover:underline mt-2 inline-block">
                  Add Products
                </Link>
              </div>
            )}
          </div>
        )}
        
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
