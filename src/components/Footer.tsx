
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-mondoBlue text-white">
      <div className="container mx-auto px-4 py-2 md:py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
          {/* Column 1: About */}
          <div className="text-center md:text-left">
            <h3 className="text-sm md:text-base font-bold mb-1">Mondo Carton King</h3>
            <p className="text-xs hidden md:block">
              Your one-stop shop for bulk products
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-xs md:text-sm font-bold mb-1">Links</h3>
            <ul className="space-y-0">
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
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="text-center md:text-left">
            <h3 className="text-xs md:text-sm font-bold mb-1">Contact</h3>
            <ul className="space-y-0">
              <li className="flex items-center justify-center md:justify-start">
                <Phone size={10} className="mr-1 shrink-0" />
                <span className="text-[10px] md:text-xs">+234 803 580 2867</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Mail size={10} className="mr-1 shrink-0" />
                <span className="text-[10px] md:text-xs truncate">mondocartonking@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="text-center md:text-left">
            <h3 className="text-xs md:text-sm font-bold mb-1">Follow Us</h3>
            <div className="flex space-x-2 justify-center md:justify-start">
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Facebook size={14} />
              </a>
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Instagram size={14} />
              </a>
              <a href="#" className="text-white hover:text-mondoYellow transition-colors">
                <Twitter size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-1 border-t border-blue-800">
          <p className="text-center text-[10px] md:text-xs">
            &copy; {new Date().getFullYear()} Mondo Carton King
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
