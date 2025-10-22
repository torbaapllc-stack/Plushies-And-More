import { getProduct } from '@/lib/shopify';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetails from '@/components/ProductDetails';

export async function generateMetadata({ params }) {
  const { handle } = await params;
  
  try {
    const product = await getProduct(handle);
    
    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    return {
      title: product.seo?.title || `${product.title} | Plushies Store`,
      description: product.seo?.description || product.description,
      openGraph: {
        title: product.title,
        description: product.description,
        images: product.images?.edges?.map(({ node }) => ({
          url: node.url,
          width: node.width,
          height: node.height,
          alt: node.altText || product.title,
        })) || [],
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
    };
  }
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  
  let product = null;
  
  try {
    product = await getProduct(handle);
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/products" 
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
        </div>
      </header>

      {/* Product Details */}
      <main>
        <ProductDetails product={product} />
      </main>
    </div>
  );
}

