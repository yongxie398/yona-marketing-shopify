// Middleware utilities for the AI Revenue Agent for Shopify

import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export interface ShopifySession {
  shop: string;
  accessToken: string;
  userId: string;
  expires: number;
}

export interface ShopifyHeaders {
  shop: string;
  accessToken: string;
}

export interface AuthenticatedRequest extends NextRequest {
  shopify: ShopifyHeaders;
}

/**
 * Extracts and validates Shopify session from request
 */
export async function authenticateShopifyRequest(request: NextRequest): Promise<ShopifyHeaders | null> {
  // First, try to get shop from URL parameters
  let shop: string | null = null;
  
  // Check for shop in URL
  if (request.nextUrl.pathname.includes('/api/') || request.nextUrl.pathname.includes('/auth/')) {
    const urlShop = request.nextUrl.searchParams.get('shop');
    if (urlShop) {
      shop = urlShop;
    }
  }
  
  // If not in URL, try from headers
  if (!shop) {
    shop = request.headers.get('x-shopify-shop-domain');
  }
  
  // If still not found, try from cookie
  if (!shop) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/shop=([^;]+)/);
      if (match) {
        shop = match[1];
      }
    }
  }
  
  if (!shop) {
    console.error('No shop found in request:', {
      pathname: request.nextUrl.pathname,
      headers: Array.from(request.headers.keys()),
      searchParams: Object.fromEntries(request.nextUrl.searchParams.entries())
    });
    return null;
  }

  // Clean up the shop domain
  shop = shop.startsWith('https://') ? shop.replace('https://', '') : shop;
  shop = shop.endsWith('.myshopify.com') ? shop : `${shop}.myshopify.com`;
  
  // Validate store exists by calling backend API
  const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
  const storeResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shop}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!storeResponse.ok) {
    console.error(`Store not found in backend: ${shop}`);
    return null;
  }
  
  const store = await storeResponse.json();
  
  if (store.status !== 'active') {
    console.error(`Store is not active: ${shop}, status: ${store.status}`);
    return null;
  }

  // For API requests, we may need an access token depending on the endpoint
  let accessToken: string | null = null;
  
  // If there's an authorization header, use it
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.substring(7);
  }
  
  // If we have a shop cookie, we might be able to extract the access token
  if (!accessToken) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const tokenMatch = cookieHeader.match(/_yona_session=([^;]+)/);
      if (tokenMatch) {
        try {
          // This would typically be a signed session cookie containing the access token
          // For now, we'll skip this and rely on backend validation
        } catch (e) {
          console.error('Failed to parse session cookie:', e);
        }
      }
    }
  }
  
  return {
    shop,
    accessToken: accessToken || ''
  };
}

/**
 * Shopify API middleware that adds shopify headers to the request
 */
export async function shopifyMiddleware(request: NextRequest) {
  // Skip authentication for public routes
  const publicPaths = ['/api/auth', '/api/webhooks', '/api/health'];
  const isPublicRoute = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  // For API routes that require authentication
  const requiresAuth = request.nextUrl.pathname.startsWith('/api/') && 
                      !isPublicRoute &&
                      !request.nextUrl.pathname.includes('/api/store-info') &&
                      !request.nextUrl.pathname.includes('/api/decisions') &&
                      !request.nextUrl.pathname.includes('/api/metrics');
  
  if (requiresAuth) {
    const shopifyHeaders = await authenticateShopifyRequest(request);
    
    if (!shopifyHeaders) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing Shopify session' },
        { status: 401 }
      );
    }
    
    // Create a new request with Shopify headers
    const newRequest = request.clone();
    (newRequest as any).shopify = shopifyHeaders;
    
    // Add shop to headers for downstream handlers
    const headers = new Headers(request.headers);
    headers.set('x-shopify-shop-domain', shopifyHeaders.shop);
    if (shopifyHeaders.accessToken) {
      headers.set('x-shopify-access-token', shopifyHeaders.accessToken);
    }
    
    const modifiedRequest = new NextRequest(newRequest.url, {
      headers,
      method: request.method,
      body: request.body,
    });
    
    return NextResponse.next({
      request: modifiedRequest,
    });
  }
  
  // For non-API routes or public routes, just continue
  return NextResponse.next();
}