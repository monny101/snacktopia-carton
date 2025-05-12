
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  image?: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData as Category[]);
          
          // For each category, fetch a product image to represent it
          const images: Record<string, string> = {};
          
          await Promise.all(
            categoriesData.map(async (category) => {
              // Get first product in this category that has an image
              const { data: productData } = await supabase
                .from('products')
                .select('image_url')
                .filter('category_id', 'eq', category.id)
                .not('image_url', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1);
                
              if (productData && productData.length > 0 && productData[0].image_url) {
                images[category.id] = productData[0].image_url;
              }
            })
          );
          
          setCategoryImages(images);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Default images for categories without product images
  const defaultImages: Record<string, string> = {
    'Snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'Soaps': 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'Detergents': 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'Sweets': 'https://images.unsplash.com/photo-1581798459219-361b284b3bf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'Food Ingredients': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-lg shadow-md overflow-hidden">
                <Skeleton className="aspect-square" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.length > 0 ? (
            categories.map((category) => {
              // Get image from product or use default based on category name
              const imageUrl = categoryImages[category.id] || 
                defaultImages[category.name] || 
                'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
              
              // Convert category name to slug for URL
              const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <Link 
                  key={category.id} 
                  to={`/products?category=${category.id}`}
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-200">
                    <img 
                      src={imageUrl} 
                      alt={category.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mondoBlue/80 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No categories found.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
