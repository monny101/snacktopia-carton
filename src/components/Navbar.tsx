import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Package,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, isStaff, profile, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const goToAdminPanel = () => {
    navigate("/admin");
    setIsMenuOpen(false);
  };

  // Close mobile menu when switching to desktop view
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-10 shadow-md">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold flex items-center">
              <span className="text-yellow-300">Mondo</span>
              <span className="ml-1">Carton King</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/" className="hover:text-yellow-300 transition-colors">
              Home
            </Link>
            <Link
              to="/products"
              className="hover:text-yellow-300 transition-colors"
            >
              Products
            </Link>

            {/* Authentication Links */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 px-2 text-white hover:text-yellow-300 hover:bg-transparent"
                  >
                    <User className="mr-1 h-4 w-4" />
                    {profile?.full_name && profile.full_name.split(" ")[0]}
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

                  {/* Admin/Staff Links */}
                  {(isAdmin || isStaff) && (
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

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-yellow-300 transition-colors"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-medium whitespace-nowrap">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Cart Link (always visible) */}
            <Link to="/cart" className="relative">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 hover:text-yellow-300 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="mr-4 relative">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={toggleMenu}
              className="text-white hover:text-yellow-300 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-4 pt-2 pb-4 space-y-3 bg-blue-700">
          <Link
            to="/"
            className="block hover:text-yellow-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="block hover:text-yellow-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Products
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="block hover:text-yellow-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </div>
              </Link>
              {(isAdmin || isStaff) && (
                <Link
                  to="/admin"
                  className="block hover:text-yellow-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                  </div>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left hover:text-yellow-300 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block hover:text-yellow-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </div>
              </Link>
              <Link
                to="/register"
                className="block hover:text-yellow-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
