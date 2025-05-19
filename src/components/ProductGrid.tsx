import React from 'react';
import { Loader2, SlidersHorizontal, Package } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-50 animate-pulse" />
            <div className="p-3 md:p-4">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg md:text-xl font-medium text-gray-700 mb-2">No products found</h2>
        <p className="text-gray-500 max-w-md mb-6">
          We couldn't find any products matching your criteria. Try adjusting your filters or search term.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
