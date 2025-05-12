
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  product_count?: number;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Get categories and count of products in each category via subcategories
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            subcategories:subcategories(
              id,
              products:products(count)
            )
          `)
          .order('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          toast({
            title: "Error fetching categories",
            description: "There was a problem loading categories",
            variant: "destructive",
          });
          return;
        }

        // Find top products for each category to get sample images
        const categoriesWithImages = await Promise.all(
          data.map(async (category) => {
            // Calculate total products in this category
            const productCount = category.subcategories.reduce((acc, sub) => {
              return acc + (sub.products[0]?.count || 0);
            }, 0);
            
            // Get first product with image from any subcategory in this category
            const { data: productData } = await supabase
              .from('products')
              .select('image_url')
              .in('subcategory_id', category.subcategories.map(sub => sub.id))
              .not('image_url', 'is', null)
              .limit(1);
            
            const image_url = productData?.[0]?.image_url || 'https://placehold.co/600x400?text=No+Image';
            
            return {
              ...category,
              product_count: productCount,
              image_url
            };
          })
        );
        
        setCategories(categoriesWithImages);
      } catch (error) {
        console.error('Exception fetching categories:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading categories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-6 md:py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative rounded-lg overflow-hidden">
                <Skeleton className="h-32 md:h-40 w-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 md:py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-800">Shop by Category</h2>
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.id}`}
                className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="h-32 md:h-40 bg-gray-200">
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-3">
                    <h3 className="text-white font-bold text-sm md:text-base">{category.name}</h3>
                    {category.product_count !== undefined && category.product_count > 0 && (
                      <p className="text-white/90 text-xs mt-1">{category.product_count} products</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No categories found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
