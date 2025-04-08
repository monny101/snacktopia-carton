
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  subcategory_id: string;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data from Supabase
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      
      try {
        // Get product details
        console.log("Fetching product with ID:", id);
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) {
          console.error("Error fetching product:", productError);
          throw productError;
        }
        
        if (!productData) {
          console.log("Product not found");
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        console.log("Product data retrieved:", productData);
        setProduct(productData);
        
        // Get subcategory details if product has a subcategory
        if (productData.subcategory_id) {
          console.log("Fetching subcategory:", productData.subcategory_id);
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('subcategories')
            .select('*')
            .eq('id', productData.subcategory_id)
            .single();
            
          if (subcategoryError) {
            console.error("Error fetching subcategory:", subcategoryError);
            throw subcategoryError;
          }
          
          console.log("Subcategory data:", subcategoryData);
          setSubcategory(subcategoryData);
          
          // Get category details if subcategory has a category
          if (subcategoryData && subcategoryData.category_id) {
            console.log("Fetching category:", subcategoryData.category_id);
            const { data: categoryData, error: categoryError } = await supabase
              .from('categories')
              .select('*')
              .eq('id', subcategoryData.category_id)
              .single();
              
            if (categoryError) {
              console.error("Error fetching category:", categoryError);
              throw categoryError;
            }
            
            console.log("Category data:", categoryData);
            setCategory(categoryData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching product details:', error);
        setError('Error loading product details');
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '',
        quantity: quantity // Use the quantity state value for the added item
      });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">Sorry, the product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')} className="bg-blue-500 hover:bg-blue-700">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Prepare product features from description (sample implementation)
  const features = product.description ? 
    product.description.split('. ').filter(s => s.length > 0).slice(0, 4) : 
    ["No features available"];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-blue-500">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/products" className="text-sm text-gray-500 hover:text-blue-500">
                  Products
                </Link>
              </div>
            </li>
            {category && (
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link 
                    to={`/products?category=${category.id}`} 
                    className="text-sm text-gray-500 hover:text-blue-500"
                  >
                    {category.name}
                  </Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm text-gray-700 font-medium">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="flex justify-center items-center bg-gray-100 rounded-lg p-4">
            <img 
              src={product.image_url || 'https://placehold.co/400x300?text=No+Image'} 
              alt={product.name} 
              className="max-w-full max-h-[400px] object-contain"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-blue-500">₦{product.price.toLocaleString()}</span>
              <span className="ml-2 text-sm text-gray-500">Per carton/pack</span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
            </div>

            {/* Product Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            {/* Product Specs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Details:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-700">{category?.name || 'Uncategorized'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subcategory</p>
                  <p className="text-gray-700">{subcategory?.name || 'None'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Stock</p>
                  <p className="text-gray-700">{product.quantity}</p>
                </div>
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="text-gray-700 mr-3">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  onClick={decreaseQuantity} 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-1 text-center w-12">{quantity}</span>
                <button 
                  onClick={increaseQuantity} 
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleAddToCart} 
                className="bg-blue-500 hover:bg-blue-700 flex-1"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Link to="/cart" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  size="lg"
                >
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
