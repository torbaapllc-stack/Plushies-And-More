'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { createCart, getCart, addToCart as addToCartAPI, updateCartLines, removeFromCart as removeFromCartAPI } from '@/lib/shopify';

const CartContext = createContext();

const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  SET_ERROR: 'SET_ERROR',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART'
};

function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case CART_ACTIONS.SET_CART:
      return { 
        ...state, 
        cart: action.payload,
        loading: false,
        error: null 
      };
    
    case CART_ACTIONS.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        loading: false 
      };
    
    case CART_ACTIONS.ADD_ITEM:
      return { 
        ...state, 
        cart: action.payload,
        loading: false,
        error: null 
      };
    
    case CART_ACTIONS.UPDATE_ITEM:
      return { 
        ...state, 
        cart: action.payload,
        loading: false,
        error: null 
      };
    
    case CART_ACTIONS.REMOVE_ITEM:
      return { 
        ...state, 
        cart: action.payload,
        loading: false,
        error: null 
      };
    
    case CART_ACTIONS.CLEAR_CART:
      return { 
        ...state, 
        cart: null,
        loading: false,
        error: null 
      };
    
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: false,
    error: null
  });
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const cartId = localStorage.getItem('shopify-cart-id');
    if (cartId) {
      loadCart(cartId);
    }
  }, []);

  const loadCart = async (cartId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const cart = await getCart(cartId);
      dispatch({ type: CART_ACTIONS.SET_CART, payload: cart });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      // Clear invalid cart ID
      localStorage.removeItem('shopify-cart-id');
    }
  };

  const createNewCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const result = await createCart();
      
      if (result.userErrors?.length > 0) {
        throw new Error(result.userErrors[0].message);
      }
      
      const cart = result.cart;
      localStorage.setItem('shopify-cart-id', cart.id);
      dispatch({ type: CART_ACTIONS.SET_CART, payload: cart });
      return cart;
    } catch (error) {
      console.error('Error creating cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const ensureCart = async () => {
    const cartId = localStorage.getItem('shopify-cart-id');
    if (cartId && !state.cart) {
      await loadCart(cartId);
    }
    if (!state.cart) {
      await createNewCart();
    }
    return state.cart;
  };

  const addToCart = async (variantId, quantity = 1) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      
      let cart = state.cart;
      if (!cart) {
        const cartId = localStorage.getItem('shopify-cart-id');
        if (cartId) {
          try {
            cart = await getCart(cartId);
          } catch (error) {
            // Cart ID is invalid, create new cart
            cart = await createNewCart();
          }
        } else {
          cart = await createNewCart();
        }
      }

      const lines = [{
        merchandiseId: variantId,
        quantity: quantity
      }];

      const result = await addToCartAPI(cart.id, lines);
      
      if (result.userErrors?.length > 0) {
        throw new Error(result.userErrors[0].message);
      }

      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: result.cart });
      return result.cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateCartItem = async (lineId, quantity) => {
    try {
      // Don't set global loading for individual item updates
      if (typeof window === 'undefined') return;
      
      const cartId = localStorage.getItem('shopify-cart-id');
      if (!cartId) throw new Error('No cart found');

      const lines = [{
        id: lineId,
        quantity: quantity
      }];

      console.log('Updating cart item:', { lineId, quantity, cartId });
      const result = await updateCartLines(cartId, lines);
      
      if (result.userErrors?.length > 0) {
        throw new Error(result.userErrors[0].message);
      }

      console.log('Cart updated successfully:', result.cart);
      dispatch({ type: CART_ACTIONS.UPDATE_ITEM, payload: result.cart });
      return result.cart;
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const removeFromCart = async (lineId) => {
    try {
      // Don't set global loading for individual item removal
      if (typeof window === 'undefined') return;
      
      const cartId = localStorage.getItem('shopify-cart-id');
      if (!cartId) throw new Error('No cart found');

      const result = await removeFromCartAPI(cartId, [lineId]);
      
      if (result.userErrors?.length > 0) {
        throw new Error(result.userErrors[0].message);
      }

      console.log('Item removed successfully:', result.cart);
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: result.cart });
      return result.cart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
      throw error;
    }
  };

  const clearCart = () => {
    localStorage.removeItem('shopify-cart-id');
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    ensureCart,
    totalQuantity: state.cart?.totalQuantity || 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
