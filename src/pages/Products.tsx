
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductGrid from '@/components/ProductGrid';
import ProductHeader from '@/components/ProductHeader';
import ProductFilter from '@/components/ProductFilter';

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

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  subcategory_id: string;
  featured: boolean;
}

const Products: React.FC = () => {
  const { category: categoryParam, subcategory: subcategoryParam } = useParams<{ category?: string; subcategory?: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategoriesAndSubcategories = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .order('name');
        
        if (subcategoriesError) throw subcategoriesError; // Fixed: Changed subcategoryError to subcategoriesError
        setSubcategories(subcategoriesData || []);
        
        // If URL has category/subcategory params, set them as selected
        if (categoryParam) {
          const category = categoriesData?.find(c => c.name.toLowerCase() === categoryParam.toLowerCase());
          if (category) {
            setSelectedCategory(category.id);
          }
        }
        
        if (subcategoryParam) {
          const subcategory = subcategoriesData?.find(s => s.name.toLowerCase() === subcategoryParam.toLowerCase());
          if (subcategory) {
            setSelectedSubcategory(subcategory.id);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      }
    };
    
    fetchCategoriesAndSubcategories();
  }, [categoryParam, subcategoryParam]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Fetch all product images
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (imageError) throw imageError;
        
        // Organize images by product id
        const imagesMap: Record<string, string[]> = {};
        if (imageData) {
          imageData.forEach(image => {
            if (!imagesMap[image.product_id]) {
              imagesMap[image.product_id] = [];
            }
            imagesMap[image.product_id].push(image.image_url);
          });
        }
        setProductImages(imagesMap);
        
        setProducts(products || []);
        
        // Find min and max prices for the price filter
        if (products && products.length > 0) {
          const prices = products.map(p => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange([minPrice, maxPrice]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, subcategoryParam]);

  // Filter products based on selected category, subcategory, and price range
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (selectedCategory) {
      const productSubcategory = subcategories.find(s => s.id === product.subcategory_id);
      if (!productSubcategory || productSubcategory.category_id !== selectedCategory) {
        return false;
      }
    }
    
    // Filter by subcategory
    if (selectedSubcategory && product.subcategory_id !== selectedSubcategory) {
      return false;
    }
    
    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    return true;
  });

  // Handle category change
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string | null) => {
    setSelectedSubcategory(subcategoryId);
  };

  // Get category name by subcategory ID
  const getCategoryName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    if (!subcategory) return 'Uncategorized';
    
    const category = categories.find(c => c.id === subcategory.category_id);
    return category ? category.name : 'Uncategorized';
  };

  // Get subcategory name by ID
  const getSubcategoryName = (subcategoryId: string): string => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory ? subcategory.name : 'None';
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <ProductHeader 
        filteredProducts={filteredProducts}
        totalProducts={filteredProducts.length}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        getCategoryName={getCategoryName}
        getSubcategoryName={getSubcategoryName}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1">
          <ProductFilter 
            categories={categories}
            subcategories={subcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory} 
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
          />
        </div>
        
        <div className="lg:col-span-3">
          <ProductGrid 
            loading={loading} 
            filteredProducts={filteredProducts}
            getCategoryName={getCategoryName}
            getSubcategoryName={getSubcategoryName}
            productImages={productImages}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
