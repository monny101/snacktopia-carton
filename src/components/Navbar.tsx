
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, User, Package, LogOut, 
  Settings, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, isStaff, profile, logout } = useAuth();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-10 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className="text-yellow-300">Mondo</span>
              <span className="ml-1">Carton King</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-yellow-300 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-yellow-300 transition-colors">Products</Link>
            
            {/* Authentication Links */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 px-2 text-white hover:text-yellow-300 hover:bg-transparent">
                    <User className="mr-1 h-4 w-4" />
                    {profile?.full_name && profile.full_name.split(' ')[0]}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cart" className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Cart</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Admin Link */}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Administration</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Staff Link */}
                  {isStaff && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Staff</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/staff" className="cursor-pointer">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Staff Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-300 transition-colors">Login</Link>
                <Link to="/register">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-medium">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            {/* Cart Link (always visible) */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 hover:text-yellow-300 transition-colors" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="mr-4 relative">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="text-white hover:text-yellow-300 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 pt-2 pb-4 space-y-3 bg-blue-700">
          <Link to="/" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
            Products
          </Link>
          <Link to="/wishlist" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
            Wishlist
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/orders" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
                My Orders
              </Link>
              {isAdmin && (
                <Link to="/admin" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              {isStaff && (
                <Link to="/staff" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
                  Staff Panel
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="block w-full text-left hover:text-yellow-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block hover:text-yellow-300" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
