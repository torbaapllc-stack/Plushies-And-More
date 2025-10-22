/**
 * Shopify Storefront API Client
 * Handles all API calls to Shopify
 */

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function shopifyFetch({ query, variables = {}, useCache = true }) {
  // Fail fast with helpful errors if env vars are missing (common on fresh deploys)
  if (!domain) {
    const hint = `Missing NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN. Set it in your environment (.env.local for local, Vercel Project Settings → Environment Variables for prod). Example: NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com`;
    console.error('❌ [SHOPIFY API] Config error:', hint);
    throw new Error(hint);
  }
  if (!storefrontAccessToken) {
    const hint = `Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN. Set a valid Storefront API token from your Headless App.`;
    console.error('❌ [SHOPIFY API] Config error:', hint);
    throw new Error(hint);
  }
  const endpoint = `https://${domain}/api/2024-10/graphql.json`;
  const startTime = Date.now();
  
  // Log the API call for debugging
  console.log('🛒 [SHOPIFY API] Making request to:', endpoint);
  console.log('🛒 [SHOPIFY API] Query:', query.substring(0, 100) + '...');
  console.log('🛒 [SHOPIFY API] Variables:', variables);
  
  try {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    };

    // Only add cache for non-cart operations
    if (useCache) {
      fetchOptions.next = { revalidate: 3600 }; // Cache for 1 hour
    }

    const response = await fetch(endpoint, fetchOptions);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('🛒 [SHOPIFY API] Response received in:', responseTime + 'ms');
    console.log('🛒 [SHOPIFY API] Status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
      console.error('❌ [SHOPIFY API] GraphQL errors:', json.errors);
      throw new Error(json.errors[0]?.message || 'GraphQL Error');
    }

    console.log('✅ [SHOPIFY API] Success! Data received:', {
      hasProducts: json.data?.products?.edges?.length || 0,
      hasProduct: !!json.data?.product,
      timestamp: new Date().toISOString()
    });

    return json.data;
  } catch (error) {
    console.error('❌ [SHOPIFY API] Error fetching from Shopify:', error);
    throw error;
  }
}

/**
 * Get all products from Shopify store
 */
export async function getProducts(numProducts = 20) {
  const query = `
    query getProducts($numProducts: Int!) {
      products(first: $numProducts) {
        edges {
          node {
            id
            title
            handle
            description
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
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch({
    query,
    variables: { numProducts }
  });

  return data.products.edges.map(({ node }) => node);
}

/**
 * Get a single product by handle okay 
 */
export async function getProduct(handle) {
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
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
        compareAtPriceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
              width
              height
            }
          }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              availableForSale
              priceV2 {
                amount
                currencyCode
              }
              compareAtPriceV2 {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
        options {
          id
          name
          values
        }
        tags
        vendor
        productType
        seo {
          title
          description
        }
      }
    }
  `;

  const data = await shopifyFetch({
    query,
    variables: { handle }
  });

  return data.product;
}

/**
 * Search products by query
 */
export async function searchProducts(searchQuery, numProducts = 10) {
  const query = `
    query searchProducts($query: String!, $numProducts: Int!) {
      products(first: $numProducts, query: $query) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch({
    query,
    variables: { query: searchQuery, numProducts }
  });

  return data.products.edges.map(({ node }) => node);
}

/**
 * Create or get cart
 */
export async function createCart() {
  const mutation = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch({ query: mutation, useCache: false });
    return data.cartCreate;
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
}

/**
 * Get cart by ID
 */
export async function getCart(cartId) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  availableForSale
                  priceV2 {
                    amount
                    currencyCode
                  }
                  product {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                          width
                          height
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch({ 
      query, 
      variables: { cartId },
      useCache: false
    });
    return data.cart;
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
}

/**
 * Add items to cart
 */
export async function addToCart(cartId, lines) {
  const mutation = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                            width
                            height
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch({ 
      query: mutation, 
      variables: { cartId, lines },
      useCache: false
    });
    return data.cartLinesAdd;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

/**
 * Update cart line items
 */
export async function updateCartLines(cartId, lines) {
  const mutation = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                            width
                            height
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch({ 
      query: mutation, 
      variables: { cartId, lines },
      useCache: false
    });
    return data.cartLinesUpdate;
  } catch (error) {
    console.error('Error updating cart lines:', error);
    throw error;
  }
}

/**
 * Remove line item from cart
 */
export async function removeFromCart(cartId, lineIds) {
  const mutation = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                            width
                            height
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch({ 
      query: mutation, 
      variables: { cartId, lineIds },
      useCache: false
    });
    return data.cartLinesRemove;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

/**
 * Format price with currency
 */
export function formatPrice(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

