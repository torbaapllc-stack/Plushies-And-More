#!/bin/bash

# Add Shopify environment variables to Vercel
echo "Adding environment variables to Vercel..."

# Add store domain
echo "6j07vt-14.myshopify.com" | vercel env add NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN production

# Add storefront access token  
echo "5a173732a1d7f7b85baea0778700b27c" | vercel env add NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN production

# Also add to preview environment
echo "6j07vt-14.myshopify.com" | vercel env add NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN preview
echo "5a173732a1d7f7b85baea0778700b27c" | vercel env add NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN preview

echo "Environment variables added successfully!"
echo "Now redeploy your project: vercel --prod"
