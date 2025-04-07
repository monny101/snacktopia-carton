
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronRight, Home, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  subcategory_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  category?: Category;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        if (!id) return;

        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) {
          console.error('Error fetching product:', productError);
          return;
        }

        setProduct(productData);

        // Fetch subcategory details
        if (productData.subcategory_id) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('*')
            .eq('id', productData.subcategory_id)
            .single();

          if (subcategoryError) {
            console.error('Error fetching subcategory:', subcategoryError);
          } else {
            setSubcategory(subcategoryData);

            // Fetch category details
            if (subcategoryData.category_id) {
              const { data: categoryData, error: categoryError } = await supabase
                .from('categories')
                .select('*')
                .eq('id', subcategoryData.category_id)
                .single();

              if (categoryError) {
                console.error('Error fetching category:', categoryError);
              } else {
                setCategory(categoryData);
              }
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url
      });
    }

    toast({
      title: 'Added to cart',
      description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart.`,
      duration: 2000,
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  // Default placeholder image if none is provided
  const getImageUrl = (url?: string) => {
    if (!url || url.trim() === '') {
      return 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    }
    return url;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Home className="h-4 w-4 mr-1" />
        <a href="/" className="hover:text-blue-600">Home</a>
        <ChevronRight className="h-4 w-4 mx-1" />
        {category && (
          <>
            <span>{category.name}</span>
            <ChevronRight className="h-4 w-4 mx-1" />
          </>
        )}
        {subcategory && (
          <>
            <span>{subcategory.name}</span>
            <ChevronRight className="h-4 w-4 mx-1" />
          </>
        )}
        <span className="text-gray-900 font-medium">{product?.name || 'Product Details'}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="w-full h-[400px] rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image with Zoom Effect */}
          <div className="relative overflow-hidden bg-gray-100 rounded-lg border">
            <div 
              className="relative aspect-square overflow-hidden"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              style={{ 
                cursor: 'zoom-in'
              }}
            >
              <img
                src={getImageUrl(product?.image_url)}
                alt={product?.name}
                className="w-full h-full object-contain transition-transform duration-300"
                style={{
                  transform: isHovering ? 'scale(1.5)' : 'scale(1)'
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product?.name}</h1>
            <div className="text-2xl font-bold text-mondoBlue mb-4">
              ₦{product?.price?.toLocaleString() || 0}
            </div>
            
            {product?.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                  <Info className="h-5 w-5 mr-1" /> Description
                </h2>
                <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  className="w-20 border border-gray-300 rounded-md px-3 py-2 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleAddToCart}
                  className="bg-mondoBlue hover:bg-blue-700 text-white flex items-center gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Category:</span>{' '}
                  <span className="text-gray-600">{category?.name || 'Uncategorized'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Subcategory:</span>{' '}
                  <span className="text-gray-600">{subcategory?.name || 'None'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Product ID:</span>{' '}
                  <span className="text-gray-600">{product?.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
