import { NextResponse } from 'next/server';
import { addToCart as addToCartAPI, createCart } from '@/lib/shopify';

export async function POST(request) {
  try {
    const { variantId, quantity = 1 } = await request.json();

    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }

    console.log('🛒 Adding to cart:', { variantId, quantity });

    // For now, we'll create a new cart for each request
    // In a real app, you'd manage cart sessions properly
    const cartCreateResult = await createCart();
    
    if (cartCreateResult.userErrors?.length > 0) {
      throw new Error(cartCreateResult.userErrors[0].message);
    }

    const result = await addToCartAPI(cartCreateResult.cart.id, [{
      merchandiseId: variantId,
      quantity: parseInt(quantity)
    }]);

    if (result.userErrors?.length > 0) {
      throw new Error(result.userErrors[0].message);
    }

    return NextResponse.json({ 
      success: true, 
      cart: result.cart,
      cartId: cartCreateResult.cart.id 
    });
  } catch (error) {
    console.error('❌ Cart API Error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: error.message },
      { status: 500 }
    );
  }
}
