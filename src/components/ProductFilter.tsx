
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  last_updated_at: string;
  last_updated_by?: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
  last_updated_at: string;
  last_updated_by?: string;
}

interface ProductFilterProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onSubcategoryChange: (subcategoryId: string | null) => void;
  searchTerm?: string;
  sortBy?: 'default' | 'priceAsc' | 'priceDesc';
  showFilters?: boolean;
  categorySubcategories?: Subcategory[];
  setShowFilters?: (show: boolean) => void;
  setSearchTerm?: (term: string) => void;
  setSortBy?: (sort: 'default' | 'priceAsc' | 'priceDesc') => void;
  resetFilters?: () => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  priceRange,
  setPriceRange,
  onCategoryChange,
  onSubcategoryChange,
  searchTerm = '',
  sortBy = 'default',
  showFilters = true,
  categorySubcategories = [],
  setShowFilters = () => {},
  setSearchTerm = () => {},
  setSortBy = () => {},
  resetFilters = () => {}
}) => {
  // Determine subcategories for the selected category
  const filteredSubcategories = selectedCategory 
    ? subcategories.filter(s => s.category_id === selectedCategory) 
    : categorySubcategories;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      {/* Mobile Filter Header */}
      <div className="p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Sort By</h3>
        <div className="space-y-2">
          {[
            { value: 'default', label: 'Relevance' },
            { value: 'priceAsc', label: 'Price: Low to High' },
            { value: 'priceDesc', label: 'Price: High to Low' }
          ].map((option) => (
            <button
              key={option.value}
              className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md ${
                sortBy === option.value 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSortBy(option.value as typeof sortBy)}
            >
              {option.label}
              {sortBy === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                if (selectedCategory === category.id) {
                  onCategoryChange(null);
                } else {
                  onCategoryChange(category.id);
                }
              }}
              className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md ${
                selectedCategory === category.id 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.name}
              {selectedCategory === category.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      {selectedCategory && filteredSubcategories.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Subcategories</h3>
          <div className="space-y-2">
            {filteredSubcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => {
                  if (selectedSubcategory === subcategory.id) {
                    onSubcategoryChange(null);
                  } else {
                    onSubcategoryChange(subcategory.id);
                  }
                }}
                className={`flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md ${
                  selectedSubcategory === subcategory.id 
                    ? 'bg-blue-50 text-blue-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {subcategory.name}
                {selectedSubcategory === subcategory.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Availability</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="in-stock" className="text-sm text-gray-700">In Stock Only</label>
            <Switch id="in-stock" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="deals" className="text-sm text-gray-700">Special Deals</label>
            <Switch id="deals" />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="featured" className="text-sm text-gray-700">Featured Items</label>
            <Switch id="featured" />
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      {(selectedCategory || selectedSubcategory || sortBy !== 'default') && (
        <div className="p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="w-full text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-2" />
            Reset All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
