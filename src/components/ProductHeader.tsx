
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductHeaderProps {
  loading?: boolean;
  filteredProducts?: Product[];
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
  getCategoryName?: (id: string) => string;
  getSubcategoryName?: (id: string) => string;
  showLowStockWarning?: boolean;
  lowStockCount?: number;
  totalProducts?: number;
  searchTerm?: string;
  categoryName?: string;
  subcategoryName?: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  loading = false, 
  filteredProducts = [], 
  selectedCategory = null,
  selectedSubcategory = null,
  getCategoryName = () => "",
  getSubcategoryName = () => "",
  showLowStockWarning = false,
  lowStockCount = 0,
  totalProducts,
  searchTerm,
  categoryName,
  subcategoryName
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
      <div className="flex flex-col md:flex-row md:items-center">
        <h2 className="text-xl font-semibold mr-4">
          {loading 
            ? 'Loading products...' 
            : filteredProducts.length === 0 
              ? 'No products found' 
              : totalProducts !== undefined
                ? `${totalProducts} products found`
                : `${filteredProducts.length} products found`}
        </h2>
        
        {showLowStockWarning && lowStockCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle size={14} />
            {lowStockCount} low stock
          </Badge>
        )}

        {searchTerm && (
          <span className="text-sm text-gray-500 mt-1 md:mt-0 md:ml-2">
            Search: "{searchTerm}"
          </span>
        )}
      </div>
      
      {/* Display active filters */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedCategory && getCategoryName && (
          <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            {getCategoryName(selectedCategory)}
          </Badge>
        )}
        {categoryName && (
          <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            {categoryName}
          </Badge>
        )}
        {selectedSubcategory && getSubcategoryName && (
          <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-blue-900">
            {getSubcategoryName(selectedSubcategory)}
          </Badge>
        )}
        {subcategoryName && (
          <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-blue-900">
            {subcategoryName}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
