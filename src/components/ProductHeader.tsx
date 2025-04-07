
import React from 'react';

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
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  loading, 
  filteredProducts, 
  selectedCategory,
  selectedSubcategory,
  getCategoryName,
  getSubcategoryName
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        {loading 
          ? 'Loading products...' 
          : filteredProducts.length === 0 
            ? 'No products found' 
            : `${filteredProducts.length} products found`}
      </h2>
      
      {/* Display active filters */}
      <div className="flex items-center gap-2">
        {selectedCategory && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
            {getCategoryName(selectedCategory)}
          </span>
        )}
        {selectedSubcategory && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-blue-900">
            {getSubcategoryName(selectedSubcategory)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
