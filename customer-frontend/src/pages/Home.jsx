import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowRight, Cpu, Monitor, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, newArrivalsRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/products/new-arrivals')
      ]);
      setFeaturedProducts(featuredRes.data.data.products);
      setNewArrivals(newArrivalsRes.data.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          minHeight: '420px',
          backgroundImage:
            'url("https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-16" style={{ minHeight: '420px' }}>
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-wide mb-3">
              Quality Product With Affordable Price
            </h1>
            <p className="text-white/80 text-base md:text-lg mb-8 flex items-center gap-1">
              <span>📍</span> Your one-stop shop for premium Gaming PCs &amp; Laptops in Ethiopia
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products?isNewArrival=true"
                className="px-8 py-3 bg-white text-gray-900 font-bold uppercase tracking-wider rounded-full hover:bg-gray-200 transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                to="/products?category=gaming-pc"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold uppercase tracking-wider rounded-full hover:bg-white/10 transition-colors"
              >
                Gaming PC
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">High Performance</h3>
          <p className="text-gray-600 text-sm">
            Latest processors and graphics cards for seamless gaming
          </p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-accent-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
          <p className="text-gray-600 text-sm">
            Top-tier components from trusted brands worldwide
          </p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
          <p className="text-gray-600 text-sm">
            Quick shipping across Ethiopia with tracking
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gradient">Featured Products</h2>
          <Link to="/products" className="flex items-center text-primary-600 hover:text-primary-700 font-semibold">
            View All <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gradient">New Arrivals</h2>
          <Link to="/products?isNewArrival=true" className="flex items-center text-primary-600 hover:text-primary-700 font-semibold">
            View All <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Upgrade Your Setup?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Browse our collection of premium Gaming PCs and Laptops.
        </p>
        <Link to="/products" className="btn-primary">
          Shop Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
