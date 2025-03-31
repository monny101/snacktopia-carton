
import React from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

const Categories: React.FC = () => {
  const categories: Category[] = [
    {
      id: '1',
      name: 'Snacks',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      slug: 'snacks'
    },
    {
      id: '2',
      name: 'Soaps',
      image: 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      slug: 'soaps'
    },
    {
      id: '3',
      name: 'Detergents',
      image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      slug: 'detergents'
    },
    {
      id: '4',
      name: 'Sweets',
      image: 'https://images.unsplash.com/photo-1581798459219-361b284b3bf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      slug: 'sweets'
    },
    {
      id: '5',
      name: 'Food Ingredients',
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      slug: 'food-ingredients'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${category.slug}`}
              className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-200">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mondoBlue/80 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
