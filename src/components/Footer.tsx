
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mondoBlue text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Mondo Carton King</h3>
            <p className="text-sm">
              Your one-stop shop for bulk snacks, soaps, detergents, sweets, and food ingredients. 
              We offer convenient shopping with home delivery options.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-mondoYellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm hover:text-mondoYellow transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm hover:text-mondoYellow transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm hover:text-mondoYellow transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-mondoYellow transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=snacks" className="text-sm hover:text-mondoYellow transition-colors">
                  Snacks
                </Link>
              </li>
              <li>
                <Link to="/products?category=soaps" className="text-sm hover:text-mondoYellow transition-colors">
                  Soaps
                </Link>
              </li>
              <li>
                <Link to="/products?category=detergents" className="text-sm hover:text-mondoYellow transition-colors">
                  Detergents
                </Link>
              </li>
              <li>
                <Link to="/products?category=sweets" className="text-sm hover:text-mondoYellow transition-colors">
                  Sweets
                </Link>
              </li>
              <li>
                <Link to="/products?category=food-ingredients" className="text-sm hover:text-mondoYellow transition-colors">
                  Food Ingredients
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 shrink-0 mt-1" />
                <span className="text-sm">123 Market Street, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 shrink-0" />
                <span className="text-sm">+234 123 4567 890</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 shrink-0" />
                <span className="text-sm">info@mondocartonking.com</span>
              </li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-blue-800">
          <p className="text-center text-sm">
            &copy; {new Date().getFullYear()} Mondo Carton King. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
