'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import Button from './Button';
import { getProducts } from '@/lib/shopify';

export default function NewArrivalsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch 4 products for the new arrivals section
        const fetchedProducts = await getProducts(4);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching new arrivals products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-white py-16 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7380] border-t-transparent"></div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* New Arrivals Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#ff7380] text-white px-4 py-2 rounded-full text-sm font-medium">
            New Arrivals
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 font-nunito">
            Fresh & Cuddly Arrivals
          </h2>
        </div>

        {/* Description */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <p className="text-gray-600 text-lg leading-relaxed">
            Say Hello To The Latest Cuteness! From Disney Tsundere Plushies To Adorable Mini Flopsies, Our New Arrivals Are Perfect Gifts Or Sweet Treats For Yourself. Don't Miss Out—Our New Cuties Sell Fast!
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {products.map((product) => (
            <div key={product.id} className="flex justify-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button 
            href="/products"
            variant="primary"
            size="medium"
          >
            See What's New
          </Button>
        </div>
      </div>
    </section>
  );
}
