
import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Check } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import ProductFilter from '@/components/ProductFilter';
import ProductHeader from '@/components/ProductHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorCard } from '@/components/ui/error-card';
import { 
  supabase, 
  TablesInsert, 
  TablesUpdate,
  Tables 
} from '@/integrations/supabase/client';

// Type definitions
type Product = Tables<'products'>;
type Category = Tables<'categories'>;
type Subcategory = Tables<'subcategories'>;

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
  const [topBrands, setTopBrands] = useState<string[]>([
    'Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'
  ]);

  // Load data from URL params
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const search = searchParams.get('search') || '';
    
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSearchTerm(search);
    
    // Focus search input if search is in URL
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
        console.error('Error fetching categories or subcategories:', error);
        setError('Failed to load categories. Please refresh the page.');
      }
    };

    fetchCategoriesAndSubcategories();
  }, []);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('products').select('*');
        
        if (selectedCategory) {
          const subcategoriesInCategory = subcategories
            .filter(sub => {
              const category = categories.find(cat => cat.id === sub.category_id);
              return category?.id === selectedCategory;
            })
            .map(sub => sub.id);
            
          if (subcategoriesInCategory.length > 0) {
            query = query.in('subcategory_id', subcategoriesInCategory);
          }
        }
        
        if (selectedSubcategory) {
          query = query.eq('subcategory_id', selectedSubcategory);
        }
        
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }
        
        const { data, error: productsError } = await query;
        
        if (productsError) throw productsError;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCategory, selectedSubcategory, searchTerm, categories, subcategories]);
  
  // Update URL params when filters change
  const updateUrlParams = (
    category: string, 
    subcategory: string, 
    search: string
  ) => {
    const params = new URLSearchParams();
    
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (search) params.set('search', search);
    
    setSearchParams(params);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    updateUrlParams(categoryId, '', searchTerm);
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    updateUrlParams(selectedCategory, subcategoryId, searchTerm);
  };
  
  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(selectedCategory, selectedSubcategory, searchTerm);
    setIsSearchFocused(false);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    updateUrlParams(selectedCategory, selectedSubcategory, '');
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
  
  // Filter products for display
  const filteredProducts = products;

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

            {/* Search suggestions panel */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                <div className="p-2">
                  {searchTerm ? (
                    <>
                      {/* Search autocomplete suggestions */}
                      <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center">
                        <Search className="h-4 w-4 text-gray-400 mr-2" />
                        <span>Search for "<strong>{searchTerm}</strong>"</span>
                      </div>
                      
                      {/* Sample popular searches */}
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <div className="text-xs text-gray-500 px-3 py-1">Popular Searches</div>
                        <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer">
                          Food items
                        </div>
                        <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer">
                          Soap powder
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Recent searches (if no current search term) */}
                      <div className="text-xs text-gray-500 px-3 py-1">Recent Searches</div>
                      <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between">
                        <span>Rice</span>
                        <X className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer flex items-center justify-between">
                        <span>Detergent</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-6">
        {/* Filters - hidden on mobile unless expanded */}
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
            
            {/* Top Brands Section */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Top Brands</h3>
              <div className="grid grid-cols-3 gap-2">
                {topBrands.map(brand => (
                  <div 
                    key={brand} 
                    className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 mb-1 flex items-center justify-center text-xs font-medium">
                      {brand.substring(0, 1)}
                    </div>
                    <span className="text-xs text-center">{brand}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gray-100 mb-1 flex items-center justify-center text-xs">
                    +
                  </div>
                  <span className="text-xs">More</span>
                </div>
              </div>
            </div>

            <ProductFilter
              categories={categories}
              subcategories={subcategories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={handleSubcategoryChange}
            />
            
            {/* Price Range Filter */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-gray-800">Price Range</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    className="text-sm h-9"
                  />
                </div>
                <div>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    className="text-sm h-9"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-sm"
              >
                Apply
              </Button>
            </div>
            
            {/* Clear All Filters */}
            {(selectedCategory || selectedSubcategory || searchTerm) && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-sm text-gray-600"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setSearchTerm('');
                    updateUrlParams('', '', '');
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> 
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        <div>
          <ProductHeader
            totalProducts={filteredProducts.length}
            searchTerm={searchTerm}
            categoryName={selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.name : ''}
            subcategoryName={selectedSubcategory ? subcategories.find(sub => sub.id === selectedSubcategory)?.name : ''}
          />
          
          <div className="mt-6">
            <ProductGrid
              loading={loading}
              filteredProducts={filteredProducts}
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
