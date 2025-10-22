import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/shopify';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] });
    }

    console.log('🔍 Searching for:', query);

    const products = await searchProducts(query);
    
    console.log('✅ Found products:', products.length);

    return NextResponse.json({ 
      products,
      query,
      count: products.length 
    });
  } catch (error) {
    console.error('❌ Search API Error:', error);
    return NextResponse.json(
      { error: 'Failed to search products', details: error.message },
      { status: 500 }
    );
  }
}

