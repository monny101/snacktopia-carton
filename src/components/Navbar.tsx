
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search for:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-mondoBlue">Mondo</span>
            <span className="text-2xl font-bold text-mondoYellow">Carton King</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mondoBlue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-mondoBlue"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="font-medium text-gray-700 hover:text-mondoBlue transition-colors">
              Shop
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="font-medium text-gray-700 hover:text-mondoBlue transition-colors flex items-center gap-1">
                  <User size={20} />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="font-medium text-gray-700 hover:text-mondoBlue transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="default" className="bg-mondoBlue hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <Link to="/cart" className="relative">
              <ShoppingCart size={24} className="text-gray-700 hover:text-mondoBlue transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-mondoYellow text-mondoBlue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart size={24} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-mondoYellow text-mondoBlue text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={toggleMenu} className="text-gray-700">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search - Visible Only on Mobile */}
        <form onSubmit={handleSearch} className="mt-4 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mondoBlue"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-mondoBlue"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Mobile Menu - Visible Only When Toggled */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <ul className="flex flex-col space-y-4 pb-4">
              <li>
                <Link 
                  to="/products" 
                  className="block font-medium text-gray-700 hover:text-mondoBlue"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link 
                      to="/profile" 
                      className="block font-medium text-gray-700 hover:text-mondoBlue"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="block font-medium text-gray-700 hover:text-mondoBlue"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/login" 
                      className="block font-medium text-gray-700 hover:text-mondoBlue"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register" 
                      className="block font-medium text-gray-700 hover:text-mondoBlue"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
