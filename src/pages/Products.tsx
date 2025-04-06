
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Loader2, Filter, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define types for product and category data
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  subcategory_id: string;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  description?: string;
}

const Products: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Fetch categories, subcategories, and products from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
        
        if (subcategoriesError) throw subcategoriesError;
        setSubcategories(subcategoriesData || []);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
          
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply category filter
    if (selectedCategory) {
      const categorySubcategories = subcategories.filter(
        sub => categories.find(cat => cat.id === sub.category_id && cat.id === selectedCategory)
      );
      result = result.filter(product => 
        categorySubcategories.some(sub => sub.id === product.subcategory_id)
      );
    }
    
    // Apply subcategory filter
    if (selectedSubcategory) {
      result = result.filter(product => product.subcategory_id === selectedSubcategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(search) || 
        (product.description && product.description.toLowerCase().includes(search))
      );
    }
    
    // Apply sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSubcategory, searchTerm, sortBy, categories, subcategories]);

  // Get subcategories for the selected category
  const categorySubcategories = selectedCategory 
    ? subcategories.filter(sub => sub.category_id === selectedCategory) 
    : [];

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (searchTerm) params.set('search', searchTerm);
    
    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedCategory, selectedSubcategory, searchTerm, location.pathname]);

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Helper function to get subcategory name by ID
  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {/* Search and Filter Section */}
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
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSearchTerm('');
                  setSortBy('default');
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results section */}
      <div>
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <SlidersHorizontal className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-500 mb-2">No products found</p>
            <p className="text-gray-400">Try adjusting your filters or search term</p>
          </div>
        ) : (
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
                  category: getCategoryName(subcategories.find(sub => sub.id === product.subcategory_id)?.category_id || ''),
                  subcategory: getSubcategoryName(product.subcategory_id || '')
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
