import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Heart, ShieldCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

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

  // Calculate discount
  const discount = Math.floor(Math.random() * 30) + 10; // Random discount between 10-40%
  const originalPrice = Math.round(product.price * (100 / (100 - discount)));

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Product Image and Quick Actions */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-50">
        <div className="absolute top-2 left-2 z-10 flex gap-1">
          <Badge variant="secondary" className="bg-blue-500 text-white">-{discount}%</Badge>
          {Math.random() > 0.5 && (
            <Badge variant="secondary" className="bg-orange-500 text-white">DEAL</Badge>
          )}
        </div>
        
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).onerror = null;
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
          }}
        />

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform flex gap-2">
            <Link to={`/products/${product.id}`}>
              <Button size="sm" variant="secondary" className="bg-white hover:bg-gray-50">
                <Eye className="h-4 w-4 mr-1" />
                Quick View
              </Button>
            </Link>
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          {/* Category */}
          <div className="flex items-center text-xs mb-1">
            <span className="text-gray-500">{product.category}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-500">{product.subcategory}</span>
          </div>
          
          {/* Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="text-sm font-medium mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Pricing */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-blue-600">₦{product.price.toLocaleString()}</span>
              <span className="text-sm text-gray-500 line-through">₦{originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs text-green-600">Official Store</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <Button 
          onClick={handleAddToCart} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
