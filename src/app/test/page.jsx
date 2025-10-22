'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/test-shopify');
        const data = await response.json();
        setTestResult(data);
      } catch (error) {
        setTestResult({
          success: false,
          error: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Shopify Connection Test
            </h1>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Home
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Testing connection...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status */}
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {testResult.success ? '✅' : '❌'}
                  </span>
                  <div>
                    <h2 className={`font-semibold text-lg ${
                      testResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                    </h2>
                    {testResult.message && (
                      <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                        {testResult.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {!testResult.success && testResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
                  <p className="text-red-700 text-sm font-mono">{testResult.error}</p>
                  {testResult.details && (
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Shop Information */}
              {testResult.success && testResult.shop && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Shop Information:</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-blue-700">Name:</dt>
                      <dd className="text-blue-900">{testResult.shop.name}</dd>
                    </div>
                    {testResult.shop.description && (
                      <div>
                        <dt className="text-sm font-medium text-blue-700">Description:</dt>
                        <dd className="text-blue-900">{testResult.shop.description}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-blue-700">Domain:</dt>
                      <dd className="text-blue-900">{testResult.shop.primaryDomain.url}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Sample Products */}
              {testResult.success && testResult.sampleProducts && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">
                    Sample Products ({testResult.productCount} found):
                  </h3>
                  <div className="space-y-3">
                    {testResult.sampleProducts.map((product) => (
                      <div 
                        key={product.id}
                        className="bg-white p-3 rounded border border-green-200"
                      >
                        <h4 className="font-medium text-gray-900">{product.title}</h4>
                        <p className="text-sm text-gray-600">Handle: {product.handle}</p>
                        <p className="text-sm text-green-700 font-semibold">
                          Price: {product.price.amount} {product.price.currencyCode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {testResult.success ? (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2">✅</span>
                        <span>Your Shopify connection is working perfectly!</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">👉</span>
                        <Link href="/products" className="text-blue-600 hover:underline">
                          View all products
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start">
                        <span className="mr-2">1.</span>
                        <span>Check your .env.local file exists in the project root</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">2.</span>
                        <span>Verify NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is correct (e.g., your-store.myshopify.com)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">3.</span>
                        <span>Verify NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is correct</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">4.</span>
                        <span>Restart your development server after making changes</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Test Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

