
import React from 'react';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  subcategory_id: string;
  featured: boolean;
}

interface ProductGridProps {
  loading: boolean;
  filteredProducts: Product[];
  getCategoryName: (subcategoryId: string) => string;
  getSubcategoryName: (subcategoryId: string) => string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  loading, 
  filteredProducts,
  getCategoryName,
  getSubcategoryName
}) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <SlidersHorizontal className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-xl font-medium text-gray-700 mb-2">No products found</p>
        <p className="text-gray-500 max-w-md">Try adjusting your filters or search term to find what you're looking for.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredProducts.map(product => (
        <ProductCard 
          key={product.id} 
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image_url || 'https://placehold.co/400x300?text=No+Image',
            description: product.description || '',
            category: getCategoryName(product.subcategory_id || ''),
            subcategory: getSubcategoryName(product.subcategory_id || '')
          }} 
        />
      ))}
    </div>
  );
};

export default ProductGrid;
