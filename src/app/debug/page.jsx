'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products-debug');
      const data = await response.json();
      setDebugData(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      setDebugData({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔍 Shopify Backend Debug
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time verification that products are coming from Shopify
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/products"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Products →
              </Link>
              <button
                onClick={fetchDebugData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Last Updated:</strong> {lastUpdated}
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Fetching live data from Shopify...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className={`p-4 rounded-lg ${
                debugData?.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h2 className={`font-semibold text-lg mb-2 ${
                  debugData?.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {debugData?.success ? '✅ Live Shopify Connection' : '❌ Connection Failed'}
                </h2>
                {debugData?.timestamp && (
                  <p className={`text-sm ${
                    debugData?.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Response Time: {debugData.requestTime} | API Timestamp: {debugData.timestamp}
                  </p>
                )}
              </div>

              {/* Error Details */}
              {!debugData?.success && debugData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Error:</h3>
                  <p className="text-red-700 font-mono text-sm">{debugData.error}</p>
                </div>
              )}

              {/* Shop Information */}
              {debugData?.success && debugData?.shopInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Shop Information (Live from Shopify):</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-blue-700">Shop Name:</dt>
                      <dd className="text-blue-900 font-semibold">{debugData.shopInfo.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-blue-700">Domain:</dt>
                      <dd className="text-blue-900">{debugData.shopInfo.domain}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-blue-700">Description:</dt>
                      <dd className="text-blue-900">{debugData.shopInfo.description}</dd>
                    </div>
                  </div>
                  <div className="mt-3">
                    <dt className="text-sm font-medium text-blue-700">API Endpoint:</dt>
                    <dd className="text-blue-900 font-mono text-sm">{debugData.apiEndpoint}</dd>
                  </div>
                </div>
              )}

              {/* Products Debug */}
              {debugData?.success && debugData?.products && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">
                    Products from Shopify ({debugData.productCount} found):
                  </h3>
                  <div className="space-y-4">
                    {debugData.products.map((product, index) => (
                      <div key={product.id} className="bg-white p-4 rounded border border-green-200">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-lg text-gray-900">{product.title}</h4>
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            Live Data
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="font-medium text-gray-700 mb-1">Product ID:</dt>
                            <dd className="text-gray-900 font-mono text-xs">{product.id}</dd>
                          </div>
                          
                          <div>
                            <dt className="font-medium text-gray-700 mb-1">Handle:</dt>
                            <dd className="text-gray-900">{product.handle}</dd>
                          </div>
                          
                          <div>
                            <dt className="font-medium text-gray-700 mb-1">Created:</dt>
                            <dd className="text-gray-900">{new Date(product.createdAt).toLocaleString()}</dd>
                          </div>
                          
                          <div>
                            <dt className="font-medium text-gray-700 mb-1">Updated:</dt>
                            <dd className="text-gray-900">{new Date(product.updatedAt).toLocaleString()}</dd>
                          </div>
                          
                          <div>
                            <dt className="font-medium text-gray-700 mb-1">Published:</dt>
                            <dd className="text-gray-900">
                              {product.publishedAt ? new Date(product.publishedAt).toLocaleString() : 'Not Published'}
                            </dd>
                          </div>
                          
                          <div>
                            <dt className="font-medium text-gray-700 mb-1">Price:</dt>
                            <dd className="text-gray-900 font-semibold">
                              {product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                            </dd>
                          </div>
                        </div>
                        
                        {product.description && (
                          <div className="mt-3">
                            <dt className="font-medium text-gray-700 mb-1">Description:</dt>
                            <dd className="text-gray-900 text-sm">{product.description}</dd>
                          </div>
                        )}
                        
                        {product.variants && product.variants.length > 0 && (
                          <div className="mt-3">
                            <dt className="font-medium text-gray-700 mb-2">Variants:</dt>
                            <div className="space-y-2">
                              {product.variants.map((variant) => (
                                <div key={variant.id} className="bg-gray-50 p-2 rounded text-sm">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{variant.title}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      variant.availableForSale ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {variant.availableForSale ? 'Available' : 'Unavailable'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    Price: {variant.price.amount} {variant.price.currencyCode}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {product.images && product.images.length > 0 && (
                          <div className="mt-3">
                            <dt className="font-medium text-gray-700 mb-2">Images:</dt>
                            <div className="flex gap-2">
                              {product.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="text-xs">
                                  <img 
                                    src={image.url} 
                                    alt={image.altText || product.title}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                  <p className="text-gray-600 truncate max-w-16">{image.id}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw API Response */}
              {debugData?.success && debugData?.rawResponse && (
                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-900 mb-3">
                    📋 Raw Shopify API Response (Click to expand)
                  </summary>
                  <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
                    {JSON.stringify(debugData.rawResponse, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
