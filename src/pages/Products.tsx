
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { Loader2, Filter, SlidersHorizontal } from 'lucide-react';

// Mock data for products
const allProducts = [
  {
    id: '1',
    name: 'Premium Potato Chips (Carton)',
    description: 'A full carton of premium potato chips, perfect for retail or events. Contains 48 packets.',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'snacks',
    subcategory: 'chips'
  },
  {
    id: '2',
    name: 'Luxury Bath Soap (24 Pack)',
    description: 'Premium bath soaps with moisturizing ingredients. Bulk pack contains 24 individually wrapped bars.',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'soaps',
    subcategory: 'bath-soaps'
  },
  {
    id: '3',
    name: 'Ultra Clean Detergent (Bulk)',
    description: 'Heavy-duty laundry detergent for tough stains. Bulk package for commercial or large family use.',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1583947582774-311effb951b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'detergents',
    subcategory: 'laundry'
  },
  {
    id: '4',
    name: 'Mixed Candy Assortment (3kg)',
    description: 'Assorted candies and sweets in a bulk 3kg package. Perfect for events or retail.',
    price: 8000,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'sweets',
    subcategory: 'candy'
  },
  {
    id: '5',
    name: 'Aromatic Spice Collection',
    description: 'Collection of premium cooking spices in bulk packaging for restaurants or catering businesses.',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'food-ingredients',
    subcategory: 'spices'
  },
  {
    id: '6',
    name: 'Gourmet Chocolate Cookies (Box)',
    description: 'Premium chocolate cookies in a bulk box of 36 individually wrapped packets.',
    price: 6500,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'snacks',
    subcategory: 'cookies'
  },
  {
    id: '7',
    name: 'Antibacterial Kitchen Soap (12 Pack)',
    description: 'Specialized kitchen soap with antibacterial properties. Pack of 12 bottles.',
    price: 5800,
    image: 'https://images.unsplash.com/photo-1584305574916-6f1a7622b824?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'soaps',
    subcategory: 'kitchen-soaps'
  },
  {
    id: '8',
    name: 'Fabric Softener Bulk Pack',
    description: 'Professional grade fabric softener for laundry businesses. 10-liter bulk container.',
    price: 11200,
    image: 'https://images.unsplash.com/photo-1616363301214-d6401c888c62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'detergents',
    subcategory: 'fabric-care'
  },
  {
    id: '9',
    name: 'Chocolate Bars Wholesale Box',
    description: 'Premium chocolate bars in a wholesale box of 48 bars. Ideal for reselling or events.',
    price: 13500,
    image: 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'sweets',
    subcategory: 'chocolate'
  },
  {
    id: '10',
    name: 'Cooking Oil (5L)',
    description: 'High-quality vegetable cooking oil in a 5-liter container. Perfect for restaurants or large families.',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1616500457363-89acdad8fcde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'food-ingredients',
    subcategory: 'oils'
  },
  {
    id: '11',
    name: 'Rice Crackers Bulk Pack',
    description: 'Light and crispy rice crackers in a bulk package of 36 individual servings.',
    price: 5200,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'snacks',
    subcategory: 'crackers'
  },
  {
    id: '12',
    name: 'Hand Soap Dispenser Pack (6)',
    description: 'Set of 6 hand soap dispensers with moisturizing formula. Ideal for businesses or large households.',
    price: 4800,
    image: 'https://images.unsplash.com/photo-1584305572586-090dca040af5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    category: 'soaps',
    subcategory: 'hand-soaps'
  }
];

// Category data
const categories = [
  { id: 'snacks', name: 'Snacks', subcategories: ['chips', 'cookies', 'crackers'] },
  { id: 'soaps', name: 'Soaps', subcategories: ['bath-soaps', 'kitchen-soaps', 'hand-soaps'] },
  { id: 'detergents', name: 'Detergents', subcategories: ['laundry', 'fabric-care'] },
  { id: 'sweets', name: 'Sweets', subcategories: ['candy', 'chocolate'] },
  { id: 'food-ingredients', name: 'Food Ingredients', subcategories: ['spices', 'oils'] }
];

const Products: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  const [products, setProducts] = useState(allProducts);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');

  // Simulate loading state
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSubcategory, searchTerm, sortBy]);

  // Filter products based on category, subcategory, and search
  useEffect(() => {
    let filteredProducts = [...allProducts];
    
    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }
    
    if (selectedSubcategory) {
      filteredProducts = filteredProducts.filter(product => product.subcategory === selectedSubcategory);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(search) || 
        product.description.toLowerCase().includes(search)
      );
    }
    
    // Sort products
    if (sortBy === 'priceAsc') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      filteredProducts.sort((a, b) => b.price - a.price);
    }
    
    setProducts(filteredProducts);
  }, [selectedCategory, selectedSubcategory, searchTerm, sortBy]);

  // Get subcategories for the selected category
  const subcategories = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)?.subcategories || [] 
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mondoBlue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Sort options */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium whitespace-nowrap">Sort by:</label>
            <select
              id="sort"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mondoBlue"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mondoBlue"
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
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mondoBlue"
                  value={selectedSubcategory || ''}
                  onChange={(e) => setSelectedSubcategory(e.target.value || null)}
                >
                  <option value="">All Subcategories</option>
                  {subcategories.map(subcat => (
                    <option key={subcat} value={subcat}>
                      {subcat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                className="text-mondoBlue hover:text-mondoBlue/80"
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
              : products.length === 0 
                ? 'No products found' 
                : `${products.length} products found`}
          </h2>
          
          {/* Display active filters */}
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mondoBlue text-white">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </span>
            )}
            {selectedSubcategory && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mondoYellow text-mondoBlue">
                {selectedSubcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-mondoBlue" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <SlidersHorizontal className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-xl font-medium text-gray-500 mb-2">No products found</p>
            <p className="text-gray-400">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
