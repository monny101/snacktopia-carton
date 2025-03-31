
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

// Mock product data (would come from API in production)
const allProducts = [
  {
    id: '1',
    name: 'Premium Potato Chips (Carton)',
    description: 'A full carton of premium potato chips, perfect for retail or events. Contains 48 packets of crispy, salted potato chips made from the finest potatoes. Each packet is sealed for freshness and has a long shelf life. Ideal for shops, schools, offices, and events.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'snacks',
    subcategory: 'chips',
    features: ['48 packets per carton', 'Long shelf life', 'Premium quality', 'Resealable packets'],
    weight: '24kg',
    dimensions: '50cm x 40cm x 30cm'
  },
  {
    id: '2',
    name: 'Luxury Bath Soap (24 Pack)',
    description: 'Premium bath soaps with moisturizing ingredients. Bulk pack contains 24 individually wrapped bars. Each soap bar is enriched with shea butter and natural extracts to leave your skin feeling soft and refreshed. Perfect for hotels, guest houses, and homes that want to offer a luxury bathing experience.',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'soaps',
    subcategory: 'bath-soaps',
    features: ['24 individually wrapped bars', 'Enriched with shea butter', 'Long-lasting fragrance', 'Moisturizing formula'],
    weight: '3.6kg',
    dimensions: '40cm x 30cm x 20cm'
  },
  {
    id: '3',
    name: 'Ultra Clean Detergent (Bulk)',
    description: 'Heavy-duty laundry detergent for tough stains. Bulk package for commercial or large family use. This industrial-strength detergent is perfect for laundromats, hotels, and large households. Removes even the toughest stains while being gentle on fabrics and colors. The concentrated formula means you need less product per wash.',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1583947582774-311effb951b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'detergents',
    subcategory: 'laundry',
    features: ['10kg bucket', 'Industrial strength', 'Stain-removing formula', 'Color-safe'],
    weight: '10kg',
    dimensions: '30cm x 30cm x 35cm'
  },
  {
    id: '4',
    name: 'Mixed Candy Assortment (3kg)',
    description: 'Assorted candies and sweets in a bulk 3kg package. Perfect for events or retail. This mixed candy assortment includes a variety of flavors and types, including hard candies, chewy candies, and lollipops. Great for parties, offices, reception areas, or for reselling in retail environments.',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'sweets',
    subcategory: 'candy',
    features: ['3kg bulk package', 'Variety of flavors', 'Individually wrapped pieces', 'Long shelf life'],
    weight: '3kg',
    dimensions: '35cm x 25cm x 15cm'
  }
];

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching product data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const foundProduct = allProducts.find(p => p.id === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError('Product not found');
      }
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
        image: product.image
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-mondoBlue" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">Sorry, the product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')} className="bg-mondoBlue hover:bg-blue-700">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-mondoBlue">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/products" className="text-sm text-gray-500 hover:text-mondoBlue">
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link 
                  to={`/products?category=${product.category}`} 
                  className="text-sm text-gray-500 hover:text-mondoBlue"
                >
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Link>
              </div>
            </li>
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
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-[400px] object-contain"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-mondoBlue">₦{product.price.toLocaleString()}</span>
              <span className="ml-2 text-sm text-gray-500">Per carton/pack</span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
            </div>

            {/* Product Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Features:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {product.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            {/* Product Specs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Specifications:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="text-gray-700">{product.weight}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dimensions</p>
                  <p className="text-gray-700">{product.dimensions}</p>
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
                className="bg-mondoBlue hover:bg-blue-700 flex-1"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Link to="/cart" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-mondoBlue text-mondoBlue hover:bg-mondoBlue hover:text-white"
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
