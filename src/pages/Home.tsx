
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import FeaturedProducts from '@/components/FeaturedProducts';
import Categories from '@/components/Categories';
import PromoMarquee from '@/components/PromoMarquee';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Carousel */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Quality Cartons and Packaging Solutions
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Mondo Carton King provides top-quality packaging materials for businesses of all sizes.
                From cardboard boxes to specialized packaging, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/products" className="flex items-center">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Shop By Category</h2>
          <Categories />
          <div className="text-center mt-8">
            <Link to="/products">
              <Button variant="outline">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-4 bg-blue-600 text-white overflow-hidden">
        <PromoMarquee />
      </section>

      {/* Featured Products */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Featured Products</h2>
          <FeaturedProducts />
          <div className="text-center mt-8">
            <Link to="/products">
              <Button>
                Browse All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses that trust Mondo Carton King for their packaging needs.
            Register now and get access to wholesale pricing and exclusive deals.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/register">Create an Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
