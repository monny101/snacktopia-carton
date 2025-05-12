
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  subcategory: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  // Randomize rating data for demo purposes
  const rating = Math.floor(Math.random() * 10) / 2 + 3; // Random rating between 3 and 5
  const reviews = Math.floor(Math.random() * 200) + 5; // Random number of reviews

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="relative block h-48 overflow-hidden bg-gray-50">
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain p-4"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
          }}
        />
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Product Details */}
        <div className="flex-1">
          <div className="flex items-center text-sm mb-1">
            <span className="text-gray-500">{product.category}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-500">{product.subcategory}</span>
          </div>
          
          <Link to={`/products/${product.id}`}>
            <h3 className="text-base font-semibold mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating */}
          <div className="flex items-center mt-1 mb-3">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : i < rating 
                        ? 'fill-yellow-400/50 text-yellow-400' 
                        : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({reviews})
            </span>
          </div>
          
          <p className="text-mondoBlue font-bold text-lg">₦{product.price.toLocaleString()}</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button 
            variant="default"
            size="sm"
            onClick={handleAddToCart} 
            className="flex-1 bg-mondoBlue hover:bg-blue-700"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Link to={`/products/${product.id}`} className="inline-block">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
