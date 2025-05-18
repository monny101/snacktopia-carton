import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Check, ChevronDown } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import ProductFilter from '@/components/ProductFilter';
import ProductHeader from '@/components/ProductHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorCard } from '@/components/ui/error-card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions
type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Subcategory = Database['public']['Tables']['subcategories']['Row'];

const Products: React.FC = () => {
  // URL params
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc' | 'newest' | 'popular'>('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Load data from URL params
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'default';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSearchTerm(search);
    setSortBy(sort as typeof sortBy);
    if (minPrice) setSelectedPriceRange(prev => ({ ...prev, min: Number(minPrice) }));
    if (maxPrice) setSelectedPriceRange(prev => ({ ...prev, max: Number(maxPrice) }));
    
    if (search) {
      setIsSearchFocused(true);
    }
  }, [searchParams]);

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
          
        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories.');
      }
    };
    
    fetchCategoriesAndSubcategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase.from('products').select('*');
        
        if (selectedCategory) {
          const categorySubcategories = subcategories
            .filter(sub => sub.category_id === selectedCategory)
            .map(sub => sub.id);
          query = query.in('subcategory_id', categorySubcategories);
        }
        
        if (selectedSubcategory) {
          query = query.eq('subcategory_id', selectedSubcategory);
        }
        
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        if (selectedPriceRange.min !== null) {
          query = query.gte('price', selectedPriceRange.min);
        }

        if (selectedPriceRange.max !== null) {
          query = query.lte('price', selectedPriceRange.max);
        }

        switch (sortBy) {
          case 'priceAsc':
            query = query.order('price', { ascending: true });
            break;
          case 'priceDesc':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'popular':
            query = query.order('quantity', { ascending: false });
            break;
          default:
            query = query.order('name');
        }
        
        const { data, error: productsError } = await query;
        
        if (productsError) throw productsError;
        setProducts(data || []);

        // Calculate price range
        if (data && data.length > 0) {
          const prices = data.map(p => p.price);
          setPriceRange({
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
          });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, searchTerm, sortBy, selectedPriceRange, categories, subcategories]);
  
  // Update URL params when filters change
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'default') params.set('sort', sortBy);
    if (selectedPriceRange.min !== null) params.set('minPrice', selectedPriceRange.min.toString());
    if (selectedPriceRange.max !== null) params.set('maxPrice', selectedPriceRange.max.toString());
    
    setSearchParams(params);
  };
  
  useEffect(() => {
    updateUrlParams();
  }, [selectedCategory, selectedSubcategory, searchTerm, sortBy, selectedPriceRange]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(false);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle price range change
  const handlePriceRangeChange = (min: number | null, max: number | null) => {
    setSelectedPriceRange({ min, max });
  };
  
  // Helper functions to get category and subcategory names
  const getCategoryName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return '';
    
    const category = categories.find(cat => cat.id === subcategory.category_id);
    return category?.name || '';
  };
  
  const getSubcategoryName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory?.name || '';
  };
  
  // Handle filter toggle
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Calculate subcategories for the selected category
  const categorySubcategories = selectedCategory 
    ? subcategories.filter(sub => sub.category_id === selectedCategory) 
    : [];
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchTerm('');
    setSortBy('default');
    setSelectedPriceRange({ min: null, max: null });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Error display */}
      {error && (
        <div className="mb-6">
          <ErrorCard
            title="Error Loading Products"
            description={error}
            onDismiss={() => setError(null)}
            action={{
              label: "Try Again",
              onClick: () => window.location.reload()
            }}
          />
        </div>
      )}

      {/* Search and filter bar */}
      <div className="sticky top-16 z-20 -mx-4 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          {/* Search */}
          <div className="relative flex-1">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-9 h-10 bg-gray-50 border-gray-200 rounded-full focus:bg-white"
                  onFocus={() => setIsSearchFocused(true)}
                />
                {searchTerm && (
                  <button 
                    type="button" 
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Clear search</span>
                  </button>
                )}
              </div>
            </form>

            {/* Search suggestions */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-2">
                  {searchTerm ? (
                    <>
                      <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Search for "<strong>{searchTerm}</strong>"</span>
                      </div>
                      
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <div className="text-xs text-gray-500 px-3 py-1">Popular Searches</div>
                        <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer">
                          Groceries
                        </div>
                        <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer">
                          Electronics
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500 px-3 py-1">Recent Searches</div>
                      <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between">
                        <span>Rice</span>
                        <X className="h-3 w-3 text-gray-400" />
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  className="w-full bg-gray-50 text-center py-2 text-sm text-gray-600 hover:bg-gray-100 border-t border-gray-100"
                  onClick={() => setIsSearchFocused(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              Sort By
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {[
                  { value: 'default', label: 'Relevance' },
                  { value: 'newest', label: 'Newest Arrivals' },
                  { value: 'priceAsc', label: 'Price: Low to High' },
                  { value: 'priceDesc', label: 'Price: High to Low' },
                  { value: 'popular', label: 'Most Popular' }
                ].map((option) => (
                  <button
                    key={option.value}
                    className={`w-full px-4 py-2 text-left text-sm ${
                      sortBy === option.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSortBy(option.value as typeof sortBy);
                      setShowSortDropdown(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {option.label}
                      {sortBy === option.value && <Check className="h-4 w-4" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFilters}
            className={`h-10 w-10 rounded-full ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
          >
            <Filter className="h-5 w-5" />
            <span className="sr-only">Toggle filters</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-6">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:sticky lg:top-32">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-semibold">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleFilters}
                className="h-8 w-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategories - only show when a category is selected */}
            {selectedCategory && categorySubcategories.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">Subcategories</h3>
                <div className="space-y-2">
                  {categorySubcategories.map(subcategory => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryChange(subcategory.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${
                        selectedSubcategory === subcategory.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Price Range</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Input 
                    type="number" 
                    placeholder="₦ Min" 
                    value={selectedPriceRange.min || ''}
                    onChange={(e) => handlePriceRangeChange(
                      e.target.value ? Number(e.target.value) : null,
                      selectedPriceRange.max
                    )}
                    className="text-sm h-9"
                  />
                </div>
                <div>
                  <Input 
                    type="number" 
                    placeholder="₦ Max" 
                    value={selectedPriceRange.max || ''}
                    onChange={(e) => handlePriceRangeChange(
                      selectedPriceRange.min,
                      e.target.value ? Number(e.target.value) : null
                    )}
                    className="text-sm h-9"
                  />
                </div>
              </div>
              
              {/* Price range quick select */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Under ₦5K', min: 0, max: 5000 },
                  { label: '₦5K - ₦10K', min: 5000, max: 10000 },
                  { label: '₦10K - ₦20K', min: 10000, max: 20000 },
                  { label: 'Over ₦20K', min: 20000, max: null }
                ].map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    className={`text-xs ${
                      selectedPriceRange.min === range.min && selectedPriceRange.max === range.max
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : ''
                    }`}
                    onClick={() => handlePriceRangeChange(range.min, range.max)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || selectedSubcategory || selectedPriceRange.min || selectedPriceRange.max || searchTerm) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="mb-3">
                  <h3 className="font-semibold text-sm text-gray-800">Active Filters</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategory && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 gap-1">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedSubcategory && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 gap-1">
                      {subcategories.find(s => s.id === selectedSubcategory)?.name}
                      <button onClick={() => setSelectedSubcategory('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(selectedPriceRange.min !== null || selectedPriceRange.max !== null) && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 gap-1">
                      {selectedPriceRange.min !== null && selectedPriceRange.max !== null
                        ? `₦${selectedPriceRange.min} - ₦${selectedPriceRange.max}`
                        : selectedPriceRange.min !== null
                        ? `Min ₦${selectedPriceRange.min}`
                        : `Max ₦${selectedPriceRange.max}`}
                      <button onClick={() => setSelectedPriceRange({ min: null, max: null })}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-sm text-gray-600"
                  onClick={resetFilters}
                >
                  <X className="mr-2 h-4 w-4" /> 
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div>
          <ProductHeader
            loading={loading}
            filteredProducts={products}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            getCategoryName={getCategoryName}
            getSubcategoryName={getSubcategoryName}
            searchTerm={searchTerm}
          />
          
          <div className="mt-6">
            <ProductGrid
              loading={loading}
              filteredProducts={products}
              getCategoryName={getCategoryName}
              getSubcategoryName={getSubcategoryName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
