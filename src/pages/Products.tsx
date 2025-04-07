
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductFilter from '@/components/ProductFilter';
import ProductHeader from '@/components/ProductHeader';
import ProductGrid from '@/components/ProductGrid';
import { toast } from '@/hooks/use-toast';

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
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          toast({
            title: "Error",
            description: "Could not load categories",
            variant: "destructive"
          });
          throw categoriesError;
        }
        
        setCategories(categoriesData || []);
        
        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
        
        if (subcategoriesError) {
          console.error('Error fetching subcategories:', subcategoriesError);
          toast({
            title: "Error",
            description: "Could not load subcategories",
            variant: "destructive"
          });
          throw subcategoriesError;
        }
        
        setSubcategories(subcategoriesData || []);
        
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
          
        if (productsError) {
          console.error('Error fetching products:', productsError);
          toast({
            title: "Error",
            description: "Could not load products",
            variant: "destructive"
          });
          throw productsError;
        }
        
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
    const foundSubcategory = subcategories.find(sub => sub.id === categoryId);
    if (!foundSubcategory) return 'Unknown';
    
    const category = categories.find(cat => cat.id === foundSubcategory.category_id);
    return category ? category.name : 'Unknown';
  };

  // Helper function to get subcategory name by ID
  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = subcategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : 'Unknown';
  };
  
  // Reset filters function
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchTerm('');
    setSortBy('default');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {/* Search and Filter Section - Extracted to component */}
      <ProductFilter 
        categories={categories}
        subcategories={subcategories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        searchTerm={searchTerm}
        sortBy={sortBy}
        showFilters={showFilters}
        categorySubcategories={categorySubcategories}
        setShowFilters={setShowFilters}
        setSearchTerm={setSearchTerm}
        setSortBy={setSortBy}
        setSelectedCategory={setSelectedCategory}
        setSelectedSubcategory={setSelectedSubcategory}
        resetFilters={resetFilters}
      />
      
      {/* Results section */}
      <div>
        {/* Products header - Extracted to component */}
        <ProductHeader 
          loading={loading}
          filteredProducts={filteredProducts}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          getCategoryName={getCategoryName}
          getSubcategoryName={getSubcategoryName}
        />
        
        {/* Product grid - Extracted to component */}
        <ProductGrid 
          loading={loading}
          filteredProducts={filteredProducts}
          getCategoryName={getCategoryName}
          getSubcategoryName={getSubcategoryName}
        />
      </div>
    </div>
  );
};

export default Products;
