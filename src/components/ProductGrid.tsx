
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <SlidersHorizontal className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-xl font-medium text-gray-500 mb-2">No products found</p>
        <p className="text-gray-400">Try adjusting your filters or search term</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
