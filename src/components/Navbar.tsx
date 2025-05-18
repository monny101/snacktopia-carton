
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount, getTotalCost } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu on navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const itemCount = getItemCount();
  const totalCost = getTotalCost();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-blue-600 text-xl font-bold">
              Mondo Carton King
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded-md">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded-md">
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded-md">
                  My Account
                </Link>
                <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 px-2 py-1 rounded-md flex items-center">
                  <Heart className="h-4 w-4 mr-1" /> Wishlist
                </Link>
              </>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {itemCount}
                  </span>
                  <span className="sr-only">{itemCount} items in cart</span>
                </>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <Link to="/profile" className="flex items-center text-gray-700 hover:text-blue-600">
                  <User className="h-6 w-6" />
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open main menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link 
                  to="/wishlist"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-4 w-4 mr-2" /> Wishlist
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link
                  to="/login"
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link
                  to="/register"
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
