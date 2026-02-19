// Shopify API utilities for the AI Revenue Agent
import { PoolClient } from 'pg';

// Simple in-memory cache for deduplication (would use Redis in production)
const webhookCache = new Map<string, number>();

export function addToCache(key: string, ttlMs: number = 300000): void { // 5 minutes default TTL
  webhookCache.set(key, Date.now() + ttlMs);
  
  // Clean up expired entries periodically
  if (webhookCache.size > 1000) { // Prevent unlimited growth
    const now = Date.now();
    const entriesToDelete: string[] = [];
    // Use Array.from to convert iterator to array to avoid the iteration error
    const entries = Array.from(webhookCache.entries());
    for (const [cachedKey, expiry] of entries) {
      if (expiry < now) {
        entriesToDelete.push(cachedKey);
      }
    }
    for (const key of entriesToDelete) {
      webhookCache.delete(key);
    }
  }
}

export function isInCache(key: string): boolean {
  const expiry = webhookCache.get(key);
  if (expiry === undefined) {
    return false;
  }
  
  if (Date.now() > expiry) {
    // Entry has expired
    webhookCache.delete(key);
    return false;
  }
  
  return true;
}

export function removeFromCache(key: string): void {
  webhookCache.delete(key);
}

/**
 * Gets a Shopify admin access token for a given shop
 * @param shopDomain The shop's domain (e.g., 'example.myshopify.com')
 * @returns Promise<string> The access token
 */
export async function getShopifyAccessToken(shopDomain: string): Promise<string> {
  // Get store from backend API to get the access token
  const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
  const response = await fetch(`${backendUrl}/api/v1/stores/domain/${shopDomain}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get store from backend: ${response.statusText}`);
  }

  const store = await response.json();
  
  if (!store.access_token) {
    throw new Error(`No access token found for shop: ${shopDomain}`);
  }
  
  return store.access_token;
}

/**
 * Makes a request to the Shopify Admin API
 * @param shopDomain The shop's domain (e.g., 'example.myshopify.com')
 * @param path The API path (e.g., '/admin/api/2023-01/products.json')
 * @param options Additional fetch options
 * @returns Promise<any> The API response
 */
export async function makeShopifyAdminApiRequest(
  shopDomain: string, 
  path: string, 
  options: RequestInit = {}
): Promise<any> {
  const accessToken = await getShopifyAccessToken(shopDomain);
  
  const url = `https://${shopDomain}${path}`;
  const defaultOptions: RequestInit = {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    throw new Error(`Shopify API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Checks if a customer has marketing consent
 * @param shopDomain The shop's domain
 * @param customerId The Shopify customer ID
 * @returns Promise<boolean> Whether the customer has marketing consent
 */
export async function hasMarketingConsent(shopDomain: string, customerId: string): Promise<boolean> {
  try {
    // In a real implementation, this would call the Shopify Admin API to check customer consent
    // For now, we'll return true as a default
    const customerData = await makeShopifyAdminApiRequest(
      shopDomain,
      `/admin/api/2023-01/customers/${customerId}.json`
    );
    
    // Check if customer has agreed to receive marketing communications
    // This is a simplified check - in reality, you'd check specific consent fields
    return customerData.customer?.accepts_marketing ?? true;
  } catch (error) {
    console.error(`Error checking marketing consent for customer ${customerId}:`, error);
    // Default to false if we can't determine consent
    return false;
  }
}

/**
 * Gets customer's recent activity
 * @param shopDomain The shop's domain
 * @param customerId The Shopify customer ID
 * @returns Promise<any> Customer activity data
 */
export async function getCustomerActivity(shopDomain: string, customerId: string): Promise<any> {
  try {
    // Get customer's recent orders
    const orders = await makeShopifyAdminApiRequest(
      shopDomain,
      `/admin/api/2023-01/orders.json?customer_id=${customerId}&limit=5&status=any`
    );
    
    // Get customer's recent events (in a real implementation)
    // This would typically come from Shopify's GraphQL Admin API or custom tracking
    return {
      orders: orders.orders || [],
      lastOrderDate: orders.orders?.[0]?.created_at || null,
      totalSpent: orders.orders?.reduce((sum: number, order: any) => sum + order.total_price, 0) || 0,
    };
  } catch (error) {
    console.error(`Error getting customer activity for customer ${customerId}:`, error);
    return {
      orders: [],
      lastOrderDate: null,
      totalSpent: 0,
    };
  }
}

/**
 * Gets product information
 * @param shopDomain The shop's domain
 * @param productId The Shopify product ID
 * @returns Promise<any> Product data
 */
export async function getProductInfo(shopDomain: string, productId: string): Promise<any> {
  try {
    return await makeShopifyAdminApiRequest(
      shopDomain,
      `/admin/api/2023-01/products/${productId}.json`
    );
  } catch (error) {
    console.error(`Error getting product info for product ${productId}:`, error);
    return null;
  }
}

/**
 * Gets cart information
 * @param shopDomain The shop's domain
 * @param cartToken The cart token
 * @returns Promise<any> Cart data
 */
export async function getCartInfo(shopDomain: string, cartToken: string): Promise<any> {
  // Note: Shopify's cart API is limited, so this would typically use custom cart persistence
  // For now, we'll return a placeholder
  console.log(`Getting cart info for cart token: ${cartToken} on shop: ${shopDomain}`);
  return {
    token: cartToken,
    lineItems: [],
    totalValue: 0,
  };
}

// Export types that might be used elsewhere
export interface ShopifyWebhookPayload {
  id: string;
  adminGraphqlApiId?: string;
  createdAt: string;
  updatedAt?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  state: string;
  note?: string;
  currencyCode: string;
  totalPrice: string;
  totalTax: string;
  taxesIncluded: boolean;
  financialStatus: string;
  confirmed: boolean;
  totalDiscounts: string;
  totalLineItemsPrice: string;
  cartToken?: string;
  totalWeight: number;
  buyerAcceptsMarketing: boolean;
  name: string;
  referringSite?: string;
  landingSite?: string;
  cancelledAt?: string;
  cancelReason?: string;
  totalPriceUsd?: string;
  checkoutToken?: string;
  reference?: string;
  userId?: number;
  locationId?: number;
  sourceIdentifier?: string;
  sourceUrl?: string;
  processedAt: string;
  deviceId?: number;
  phone?: string;
  customerLocale?: string;
  appId?: number;
  browserIp?: string;
  landingSiteRef?: string;
  orderNumber: number;
  discountCodes: any[];
  noteAttributes: any[];
  paymentGatewayNames: string[];
  processingMethod: string;
  sourceName: string;
  subtotalPrice: string;
  totalShippingPriceSet: any;
  totalTaxSet: any;
  totalTipReceived: string;
  totalPriceSet: any;
  totalDuties?: any;
  presentmentCurrency: string;
  buyerAcceptsMarketingUpdatedAt?: string;
  cancelReasonLocalized?: string;
  closedAt?: string;
  customer: any;
  discountApplications: any[];
  fulfillments: any[];
  fulfillmentStatus?: string;
  lineItems: any[];
  paymentTerms?: any;
  refunds: any[];
  shippingAddress: any;
  shippingLines: any[];
}