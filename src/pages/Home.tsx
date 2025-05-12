import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, TrendingUp, Truck, ThumbsUp } from 'lucide-react';
import PromoMarquee from '@/components/PromoMarquee';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
const Home: React.FC = () => {
  return <div className="flex flex-col min-h-screen">
      {/* Promotional Marquee */}
      <PromoMarquee />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-mondoBlue to-blue-600 py-20 md:py-28">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Buy in Bulk, <span className="text-mondoYellow">Save More!</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-50/90 max-w-lg">
                Explore our wide range of snacks, soaps, detergents, and food ingredients 
                at wholesale prices with convenient home delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-mondoYellow hover:bg-yellow-500 text-mondoBlue font-bold shadow-lg transition-all hover:shadow-xl">
                    <ShoppingBag className="mr-2" size={20} />
                    Shop Now
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10">
                <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Assorted products" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-24">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity="0.2"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ffffff" opacity="0.2"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff" opacity="0.2"></path>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Categories />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Featured Products</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Discover our most popular items at unbeatable bulk prices</p>
          <FeaturedProducts />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-mondoBlue/10 rounded-full">
                <ShoppingBag className="w-8 h-8 text-mondoBlue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bulk Pricing</h3>
              <p className="text-gray-600">Get the best prices when you buy in bulk for your business or home.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-mondoBlue/10 rounded-full">
                <TrendingUp className="w-8 h-8 text-mondoBlue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">We source the highest quality products for your satisfaction.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-mondoBlue/10 rounded-full">
                <Truck className="w-8 h-8 text-mondoBlue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Enjoy convenient home delivery or pickup options for your orders.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center transform transition-transform hover:scale-105 hover:shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-mondoBlue/10 rounded-full">
                <ThumbsUp className="w-8 h-8 text-mondoBlue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600">We prioritize your satisfaction with every purchase.</p>
            </div>
          </div>
        </div>
      </section>

     
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-mondoYellow to-yellow-400 py-[6px]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-mondoBlue">Ready to Start Saving?</h2>
          <p className="text-lg mb-8 text-gray-800 max-w-2xl mx-auto">
            Join thousands of satisfied customers who save money by buying in bulk from Mondo Carton King.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-mondoBlue hover:bg-blue-700 text-white font-bold shadow-lg transition-all hover:shadow-xl px-8">
              <ShoppingBag className="mr-2" size={20} />
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>;
};
export default Home;