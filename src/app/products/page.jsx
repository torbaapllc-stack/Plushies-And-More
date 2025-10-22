import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';

export const metadata = {
  title: 'Our Products | Plushies Store',
  description: 'Browse our collection of adorable plushies',
};

export default async function ProductsPage() {
  let products = [];
  let error = null;

  try {
    products = await getProducts(20);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="mt-2 text-gray-600">
            Discover our amazing collection of plushies
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Error Loading Products
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">
              Please check your Shopify API configuration in the .env.local file
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">
              No Products Found
            </h2>
            <p className="text-yellow-700">
              Add some products to your Shopify store to see them here.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
              </p>
            </div>

                <div className="flex flex-wrap justify-center gap-[37px]">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
          </>
        )}
      </main>
    </div>
  );
}

