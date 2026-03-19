/**
 * Test script to manually trigger a webhook event
 * This helps verify the webhook endpoint is working
 */

import * as crypto from 'crypto';

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_WEBHOOK_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64');
}

async function testWebhook() {
  if (!SHOPIFY_API_SECRET) {
    console.error('❌ SHOPIFY_API_SECRET or SHOPIFY_WEBHOOK_SECRET environment variable is required');
    process.exit(1);
  }

  if (!APP_URL) {
    console.error('❌ APP_URL or NEXT_PUBLIC_APP_URL environment variable is required');
    process.exit(1);
  }

  const webhookUrl = `${APP_URL}/api/webhooks`;
  const shop = process.argv[2] || 'test-store.myshopify.com';
  
  // Create a test checkout event payload
  const payload = JSON.stringify({
    id: 1234567890,
    token: 'test_checkout_token_123',
    cart_token: 'test_cart_token_456',
    email: 'test@example.com',
    gateway: null,
    test: true,
    total_price: '99.99',
    subtotal_price: '89.99',
    total_weight: 0,
    total_tax: '10.00',
    taxes_included: false,
    currency: 'USD',
    financial_status: 'pending',
    confirmed: false,
    name: '#999999999',
    checkout_token: 'test_checkout_token_123',
    checkout_url: `https://${shop}/checkouts/test_checkout_token_123`,
    line_items: [
      {
        id: 1,
        title: 'Test Product',
        quantity: 1,
        price: '89.99',
        sku: 'TEST-001'
      }
    ],
    customer: {
      id: 123456,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'Customer'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const signature = generateSignature(payload, SHOPIFY_API_SECRET);

  console.log('🧪 Testing webhook endpoint...\n');
  console.log(`URL: ${webhookUrl}`);
  console.log(`Shop: ${shop}`);
  console.log(`Signature: ${signature.substring(0, 20)}...\n`);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'checkouts/create',
        'X-Shopify-Shop-Domain': shop,
        'X-Shopify-Hmac-SHA256': signature,
        'X-Shopify-Webhook-Id': `test-webhook-${Date.now()}`,
      },
      body: payload,
    });

    console.log(`Response status: ${response.status}`);
    
    const responseText = await response.text();
    if (responseText) {
      console.log(`Response body: ${responseText}`);
    }

    if (response.status === 200) {
      console.log('\n✅ Webhook test successful!');
    } else if (response.status === 401) {
      console.log('\n❌ Signature verification failed. Check your SHOPIFY_API_SECRET.');
    } else if (response.status === 404) {
      console.log('\n❌ Store not found. Make sure the store is registered in the backend.');
    } else {
      console.log(`\n⚠️ Unexpected response: ${response.status}`);
    }

  } catch (error: any) {
    console.error('\n❌ Error sending webhook test:', error.message);
    console.log('\nPossible issues:');
    console.log('- The server is not running');
    console.log('- APP_URL is incorrect');
    console.log('- Network connectivity issues');
  }
}

testWebhook();
