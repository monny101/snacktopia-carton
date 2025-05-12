
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type Subcategory = Database['public']['Tables']['subcategories']['Row'];

interface ProductFilterProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  searchTerm: string;
  sortBy: 'default' | 'priceAsc' | 'priceDesc';
  showFilters: boolean;
  categorySubcategories: Subcategory[];
  setShowFilters: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  setSortBy: (sort: 'default' | 'priceAsc' | 'priceDesc') => void;
  setSelectedCategory: (id: string | null) => void;
  setSelectedSubcategory: (id: string | null) => void;
  resetFilters: () => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  searchTerm,
  sortBy,
  showFilters,
  categorySubcategories,
  setShowFilters,
  setSearchTerm,
  setSortBy,
  setSelectedCategory,
  setSelectedSubcategory,
  resetFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Sort options */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">Sort by:</label>
          <select
            id="sort"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'default' | 'priceAsc' | 'priceDesc')}
          >
            <option value="default">Default</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
        
        {/* Filter toggle button (mobile) */}
        <Button 
          variant="outline" 
          className="md:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      
      {/* Filter options - visible on desktop or when toggled on mobile */}
      <div className={`md:flex ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-4">
          {/* Category filter */}
          <div className="flex flex-col">
            <label htmlFor="category" className="text-sm font-medium mb-1">Category</label>
            <select
              id="category"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Subcategory filter - only visible when a category is selected */}
          {selectedCategory && (
            <div className="flex flex-col">
              <label htmlFor="subcategory" className="text-sm font-medium mb-1">Subcategory</label>
              <select
                id="subcategory"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSubcategory || ''}
                onChange={(e) => setSelectedSubcategory(e.target.value || null)}
              >
                <option value="">All Subcategories</option>
                {categorySubcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Reset filters button */}
          <div className="flex items-end">
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="text-blue-500 hover:text-blue-700"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
