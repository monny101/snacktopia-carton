
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface ProductHeaderProps {
  loading: boolean;
  filteredProducts: any[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  getCategoryName: (id: string) => string;
  getSubcategoryName: (id: string) => string;
  showLowStockWarning?: boolean;
  lowStockCount?: number;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  loading, 
  filteredProducts, 
  selectedCategory,
  selectedSubcategory,
  getCategoryName,
  getSubcategoryName,
  showLowStockWarning = false,
  lowStockCount = 0
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold mr-4">
          {loading 
            ? 'Loading products...' 
            : filteredProducts.length === 0 
              ? 'No products found' 
              : `${filteredProducts.length} products found`}
        </h2>
        
        {showLowStockWarning && lowStockCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle size={14} />
            {lowStockCount} low stock
          </Badge>
        )}
      </div>
      
      {/* Display active filters */}
      <div className="flex items-center gap-2">
        {selectedCategory && (
          <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            {getCategoryName(selectedCategory)}
          </Badge>
        )}
        {selectedSubcategory && (
          <Badge className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-blue-900">
            {getSubcategoryName(selectedSubcategory)}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
