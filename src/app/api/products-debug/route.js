import { NextResponse } from 'next/server';

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  // Real-time timestamp
  const timestamp = new Date().toISOString();
  
  // Check if environment variables are set
  if (!domain || !token) {
    return NextResponse.json({
      success: false,
      error: 'Missing environment variables',
      timestamp,
    }, { status: 500 });
  }

  // Enhanced query to get more detailed product info with real-time data
  const query = `
    query {
      shop {
        name
        description
        primaryDomain {
          url
        }
      }
      products(first: 5) {
        edges {
          node {
            id
            createdAt
            updatedAt
            title
            handle
            description
            publishedAt
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  id
                }
              }
            }
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const startTime = Date.now();
    
    const response = await fetch(`https://${domain}/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({
        success: false,
        error: 'GraphQL Error',
        details: data.errors,
        timestamp,
        requestTime: responseTime + 'ms',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Real-time Shopify data fetch successful!',
      timestamp,
      requestTime: responseTime + 'ms',
      shopInfo: {
        name: data.data.shop.name,
        domain: data.data.shop.primaryDomain.url,
        description: data.data.shop.description || 'No description',
      },
      rawResponse: data,
      products: data.data.products.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        publishedAt: node.publishedAt,
        description: node.description,
        priceRange: node.priceRange,
        images: node.images.edges.map(img => ({
          url: img.node.url,
          altText: img.node.altText,
          id: img.node.id,
        })),
        variants: node.variants.edges.map(variant => ({
          id: variant.node.id,
          title: variant.node.title,
          availableForSale: variant.node.availableForSale,
          price: variant.node.priceV2,
        })),
      })),
      productCount: data.data.products.edges.length,
      apiEndpoint: `https://${domain}/api/2024-10/graphql.json`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp,
      details: 'Failed to connect to Shopify API',
    }, { status: 500 });
  }
}
