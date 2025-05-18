import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';

interface ProductHeaderProps {
  loading?: boolean;
  filteredProducts?: any[];
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
    <div className="flex flex-col gap-3">
      {/* Header Title and Results Count */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold text-gray-900">
            {selectedCategory && getCategoryName && `${getCategoryName(selectedCategory)} `}
            {selectedSubcategory && getSubcategoryName && `${getSubcategoryName(selectedSubcategory)} `}
            {!selectedCategory && !selectedSubcategory && 'All Products'}
          </h1>
          <p className="text-sm text-gray-500">
            {loading 
              ? 'Loading...' 
              : filteredProducts.length === 0 
                ? 'No products found' 
                : totalProducts !== undefined
                  ? `${totalProducts.toLocaleString()} products`
                  : `${filteredProducts.length.toLocaleString()} products`}
          </p>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <p className="text-sm text-gray-600">
            Search results for "<span className="font-medium">{searchTerm}</span>"
          </p>
        )}
      </div>

      {/* Status Warnings */}
      {showLowStockWarning && lowStockCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle size={14} />
            {lowStockCount} products low in stock
          </Badge>
        </div>
      )}

      {/* Category Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {selectedCategory && getCategoryName && (
          <>
            <Badge variant="secondary" className="bg-blue-50 text-blue-600">
              {getCategoryName(selectedCategory)}
            </Badge>
            {selectedSubcategory && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                {getSubcategoryName(selectedSubcategory)}
              </Badge>
            )}
          </>
        )}
        {categoryName && (
          <>
            <Badge variant="secondary" className="bg-blue-50 text-blue-600">
              {categoryName}
            </Badge>
            {subcategoryName && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                {subcategoryName}
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
