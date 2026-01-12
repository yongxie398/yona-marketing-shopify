// Shopify API utilities for the AI Revenue Agent
import { DatabaseService } from '@/lib/db';
import { ShopifyWebhookPayload } from '@/types';
import { PoolClient } from 'pg';

/**
 * Validates HMAC signature for Shopify webhooks
 */
export function validateHmacSignature(
  rawBody: string | Buffer,
  signature: string | string[] | undefined,
  secret: string
): boolean {
  if (!signature) {
    console.error('Missing signature in request');
    return false;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const receivedSignature = Array.isArray(signature) ? signature[0] : signature;
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

/**
 * Generates the Shopify OAuth authorization URL
 */
export function generateAuthUrl(shop: string, apiKey: string, scopes: string[]): string {
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
  const nonce = Math.random().toString(36).substring(2);
  
  const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
    `client_id=${apiKey}&` +
    `scope=${scopes.join(',')}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${nonce}`;

  return authUrl;
}

/**
 * Exchanges authorization code for access token
 */
export async function exchangeCodeForAccessToken(
  shop: string,
  code: string,
  apiKey: string,
  apiSecret: string
): Promise<{ accessToken: string; shopName: string }> {
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;

  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code for access token: ${response.status}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;
  
  // Get shop name
  const shopResponse = await fetch(`https://${shopDomain}/admin/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
  });
  
  if (!shopResponse.ok) {
    throw new Error(`Failed to get shop info: ${shopResponse.status}`);
  }
  
  const shopData = await shopResponse.json();
  
  return {
    accessToken,
    shopName: shopData.shop.name,
  };
}

/**
 * Registers webhooks with Shopify
 */
export async function registerWebhooks(accessToken: string, shopDomain: string): Promise<void> {
  const webhookUrl = `${process.env.SHOPIFY_APP_URL}/api/webhooks`;
  const topics = ['orders/create', 'checkouts/update', 'products/create', 'customers/create'];

  for (const topic of topics) {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address: webhookUrl,
          format: 'json',
        },
      }),
    });

    if (!response.ok) {
      console.error(`Failed to register webhook for topic ${topic}:`, await response.text());
    } else {
      console.log(`Successfully registered webhook for topic ${topic}`);
    }
  }
}

/**
 * Processes incoming Shopify webhook
 */
export async function processWebhook(topic: string, shopDomain: string, payload: ShopifyWebhookPayload): Promise<void> {
  console.log(`Processing webhook: ${topic} for shop: ${shopDomain}`);
  
  // Find store in database
  const store = await DatabaseService.getStoreByDomain(shopDomain);
  if (!store) {
    console.error(`Store not found for domain: ${shopDomain}`);
    return;
  }

  // Normalize the event based on topic
  let eventType: string;
  let customerId: string | undefined;
  let productIds: string[] = [];
  let orderId: string | undefined;
  let checkoutId: string | undefined;

  switch (topic) {
    case 'products/create':
    case 'products/update':
      eventType = 'product_view';
      
      // Store product data in the products table
      if (payload.product) {
        await storeProductData(payload.product, store.id);
      }
      break;
    case 'checkouts/update':
    case 'checkouts/create':
      eventType = 'checkout_started';
      customerId = payload.checkout?.customer?.id?.toString() || payload.customer?.id?.toString();
      checkoutId = payload.checkout?.id?.toString();
      if (payload.checkout?.line_items) {
        productIds = payload.checkout.line_items.map((item: any) => item.product_id.toString());
      }
      
      // Store checkout data in the checkouts table
      if (payload.checkout) {
        await storeCheckoutData(payload.checkout, store.id);
      }
      break;
    case 'orders/create':
      eventType = 'purchase_completed';
      customerId = payload.order?.customer?.id?.toString();
      orderId = payload.order?.id?.toString();
      if (payload.order?.line_items) {
        productIds = payload.order.line_items.map((item: any) => item.product_id.toString());
      }
      
      // Store order data in the orders table
      if (payload.order) {
        await storeOrderData(payload.order, store.id);
      }
      break;
    case 'customers/create':
    case 'customers/update':
      eventType = 'customer_updated';
      customerId = payload.customer?.id?.toString();
      
      // Store customer data in the customers table
      if (payload.customer) {
        await storeCustomerData(payload.customer, store.id);
      }
      break;
    default:
      eventType = topic.replace(/\//g, '_'); // Convert 'orders/paid' to 'orders_paid'
      
      // Try to extract common data patterns
      if (payload.checkout) {
        checkoutId = payload.checkout.id?.toString();
        customerId = payload.checkout.customer?.id?.toString();
        if (payload.checkout.line_items) {
          productIds = payload.checkout.line_items.map((item: any) => item.product_id.toString());
        }
        await storeCheckoutData(payload.checkout, store.id);
      } else if (payload.order) {
        orderId = payload.order.id?.toString();
        customerId = payload.order.customer?.id?.toString();
        if (payload.order.line_items) {
          productIds = payload.order.line_items.map((item: any) => item.product_id.toString());
        }
        await storeOrderData(payload.order, store.id);
      } else if (payload.customer) {
        customerId = payload.customer.id?.toString();
        await storeCustomerData(payload.customer, store.id);
      } else if (payload.product) {
        await storeProductData(payload.product, store.id);
      }
  }

  // Create commerce event record
  await DatabaseService.createCommerceEvent({
    store_id: store.id,
    event_type: eventType,
    customer_id: customerId || `unknown_${Date.now()}`,
    product_ids: productIds,
    payload: payload,
    processed: false,
  });

  console.log(`Created commerce event: ${eventType} for store: ${shopDomain}`);
  
  // Forward the event to the Core AI Service for processing
  try {
    await fetch(`${process.env.CORE_AI_SERVICE_URL}/api/events/shopify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CORE_AI_SERVICE_API_KEY}`
      },
      body: JSON.stringify({
        topic,
        shop_domain: shopDomain,
        data: payload,
        store_id: store.id,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to forward event to AI service:', error);
  }
}

/**
 * Store product data in the products table
 */
async function storeProductData(product: any, storeId: number): Promise<void> {
  // For now, this is a placeholder as the DatabaseService class doesn't expose direct pool access
  // In a full implementation, you would add a method to DatabaseService to store product data
  console.log(`Storing product data for product ID: ${product.id}, store ID: ${storeId}`);
}

/**
 * Store checkout data in the checkouts table
 */
async function storeCheckoutData(checkout: any, storeId: number): Promise<void> {
  // For now, this is a placeholder as the DatabaseService class doesn't expose direct pool access
  // In a full implementation, you would add a method to DatabaseService to store checkout data
  console.log(`Storing checkout data for checkout ID: ${checkout.id}, store ID: ${storeId}`);
}

/**
 * Store order data in the orders table
 */
async function storeOrderData(order: any, storeId: number): Promise<void> {
  // For now, this is a placeholder as the DatabaseService class doesn't expose direct pool access
  // In a full implementation, you would add a method to DatabaseService to store order data
  console.log(`Storing order data for order ID: ${order.id}, store ID: ${storeId}`);
}

/**
 * Store customer data in the customers table
 */
async function storeCustomerData(customer: any, storeId: number): Promise<void> {
  // For now, this is a placeholder as the DatabaseService class doesn't expose direct pool access
  // In a full implementation, you would add a method to DatabaseService to store customer data
  console.log(`Storing customer data for customer ID: ${customer.id}, store ID: ${storeId}`);
}