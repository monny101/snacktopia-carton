
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mondoBlue text-white">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Column 1: About */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-2">Mondo Carton King</h3>
            <p className="text-xs md:text-sm">
              Your one-stop shop for bulk products
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold mb-1 md:mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/" className="text-xs hover:text-mondoYellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-xs hover:text-mondoYellow transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-xs hover:text-mondoYellow transition-colors">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold mb-1 md:mb-2">Contact</h3>
            <ul className="space-y-1">
              <li className="flex items-center justify-center md:justify-start">
                <Phone size={12} className="mr-1 shrink-0" />
                <span className="text-xs">+234 803 580 2867</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Mail size={12} className="mr-1 shrink-0" />
                <span className="text-xs">mondocartonking@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-bold mb-1 md:mb-2">Follow Us</h3>
            <div className="flex space-x-2 justify-center md:justify-start">
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Twitter size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-blue-800">
          <p className="text-center text-xs">
            &copy; {new Date().getFullYear()} Mondo Carton King
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
