import { NextResponse } from 'next/server';

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  // Check if environment variables are set
  if (!domain || !token) {
    return NextResponse.json({
      success: false,
      error: 'Missing environment variables',
      details: {
        hasDomain: !!domain,
        hasToken: !!token,
        domain: domain ? `${domain.substring(0, 10)}...` : 'not set',
      }
    }, { status: 500 });
  }

  // Test query to fetch shop information
  const query = `
    query {
      shop {
        name
        description
        primaryDomain {
          url
        }
      }
      products(first: 3) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({
        success: false,
        error: 'GraphQL Error',
        details: data.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Shopify connection successful!',
      shop: data.data.shop,
      productCount: data.data.products.edges.length,
      sampleProducts: data.data.products.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        price: node.priceRange.minVariantPrice,
      })),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Failed to connect to Shopify API',
    }, { status: 500 });
  }
}

