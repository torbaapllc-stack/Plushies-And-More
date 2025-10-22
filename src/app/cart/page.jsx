'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, getCart } from '@/lib/shopify';

export default function CartPage() {
  const { cart, loading, removeFromCart, updateCartItem, totalQuantity } = useCart();
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const [initialLoad, setInitialLoad] = useState(true);
  const [optimisticQuantities, setOptimisticQuantities] = useState({});

  const cartLines = cart?.lines?.edges || [];

  // Only show loading on initial load, not during updates
  useEffect(() => {
    if (cart || !loading) {
      setInitialLoad(false);
    }
  }, [cart, loading]);

  const handleQuantityChange = async (e, lineId, newQuantity) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newQuantity < 1 || updatingItems.has(lineId)) return;
    
    // Optimistic update - show new quantity immediately
    setOptimisticQuantities(prev => ({ ...prev, [lineId]: newQuantity }));
    setUpdatingItems(prev => new Set(prev).add(lineId));
    
    try {
      await updateCartItem(lineId, newQuantity);
      // Clear optimistic value after successful update
      setOptimisticQuantities(prev => {
        const newState = { ...prev };
        delete newState[lineId];
        return newState;
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Revert optimistic update on error
      setOptimisticQuantities(prev => {
        const newState = { ...prev };
        delete newState[lineId];
        return newState;
      });
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(lineId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (e, lineId) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingItems(prev => new Set(prev).add(lineId));
    try {
      await removeFromCart(lineId);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(lineId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  };

  if (loading && initialLoad && !cart) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="pt-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff7380] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {totalQuantity > 0 ? `${totalQuantity} item${totalQuantity !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {cartLines.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center mb-8">
              <svg className="w-24 h-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any plushies to your cart yet!</p>
            <Link 
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-[#ff7380] text-white font-semibold rounded-lg hover:bg-[#ff5c6c] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {cartLines.map(({ node: line }) => {
                  const variant = line.merchandise;
                  const product = variant.product;
                  const image = product.images?.edges?.[0]?.node;

                  return (
                    <div 
                      key={line.id} 
                      className={`p-6 border-b border-gray-200 last:border-b-0 ${
                        removingItems.has(line.id) ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.altText || product.title}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${product.handle}`}
                            className="text-lg font-semibold text-gray-900 hover:text-[#ff7380] transition-colors"
                          >
                            {product.title}
                          </Link>
                          {variant.title && variant.title !== 'Default Title' && (
                            <p className="text-sm text-gray-500 mt-1">{variant.title}</p>
                          )}
                          <p className="text-[#ff7380] font-bold text-lg mt-1">
                            {formatPrice(variant.priceV2.amount, variant.priceV2.currencyCode)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              type="button"
                              onClick={(e) => {
                                const currentQty = optimisticQuantities[line.id] ?? line.quantity;
                                handleQuantityChange(e, line.id, currentQty - 1);
                              }}
                              disabled={updatingItems.has(line.id) || (optimisticQuantities[line.id] ?? line.quantity) <= 1}
                              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                              {optimisticQuantities[line.id] ?? line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                const currentQty = optimisticQuantities[line.id] ?? line.quantity;
                                handleQuantityChange(e, line.id, currentQty + 1);
                              }}
                              disabled={updatingItems.has(line.id)}
                              className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveItem(e, line.id)}
                            disabled={removingItems.has(line.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            {removingItems.has(line.id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {cart?.cost?.subtotalAmount && (
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}</span>
                    </div>
                  )}
                  
                  {cart?.cost?.totalTaxAmount && cart.cost.totalTaxAmount.amount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>{formatPrice(cart.cost.totalTaxAmount.amount, cart.cost.totalTaxAmount.currencyCode)}</span>
                    </div>
                  )}
                  
                  {cart?.cost?.totalAmount && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#ff7380] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#ff5c6c] transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link 
                  href="/products"
                  className="block w-full text-center text-gray-600 hover:text-[#ff7380] transition-colors mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
