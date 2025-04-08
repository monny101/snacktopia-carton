
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const FeaturedProducts: React.FC = () => {
  const { addItem } = useCart();

  // Mock featured products
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Potato Chips (Carton)',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'snacks'
    },
    {
      id: '2',
      name: 'Luxury Bath Soap (24 Pack)',
      price: 12500,
      image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'soaps'
    },
    {
      id: '3',
      name: 'Ultra Clean Detergent (Bulk)',
      price: 9500,
      image: 'https://images.unsplash.com/photo-1583947582774-311effb951b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'detergents'
    },
    {
      id: '4',
      name: 'Mixed Candy Assortment (3kg)',
      price: 8000,
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'sweets'
    },
    {
      id: '5',
      name: 'Aromatic Spice Collection',
      price: 7500,
      image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'food-ingredients'
    },
    {
      id: '6',
      name: 'Gourmet Chocolate Cookies (Box)',
      price: 6500,
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'snacks'
    },
    {
      id: '7',
      name: 'Antibacterial Kitchen Soap (12 Pack)',
      price: 5800,
      image: 'https://images.unsplash.com/photo-1584305574916-6f1a7622b824?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'soaps'
    },
    {
      id: '8',
      name: 'Fabric Softener Bulk Pack',
      price: 11200,
      image: 'https://images.unsplash.com/photo-1616363301214-d6401c888c62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      category: 'detergents'
    }
  ];

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1 // Add the required quantity property
    });
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-mondoYellow text-mondoBlue text-xs font-bold px-2 py-1 rounded-full">
                  Featured
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-14">{product.name}</h3>
                <p className="text-mondoBlue font-bold text-xl mb-4">₦{product.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAddToCart(product)} 
                    className="bg-mondoBlue hover:bg-blue-700 flex-1"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Link to={`/products/${product.id}`} className="inline-block">
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/products">
            <Button variant="outline" className="border-mondoBlue text-mondoBlue hover:bg-mondoBlue hover:text-white">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
