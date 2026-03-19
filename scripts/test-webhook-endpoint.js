/**
 * Test script to verify webhook endpoint is accessible
 */

const APP_URL = process.env.APP_URL || process.env.SHOPIFY_APP_URL || 'https://shopify-dev.yonamark.com';

async function testWebhookEndpoint() {
  console.log(`\n🧪 Testing webhook endpoint at ${APP_URL}\n`);

  try {
    // Test the main webhook endpoint
    console.log('1️⃣ Testing main webhook endpoint (/api/webhooks)...');
    const mainResponse = await fetch(`${APP_URL}/api/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'checkouts/create',
        'X-Shopify-Shop-Domain': 'yona-prod.myshopify.com',
        'X-Shopify-Hmac-SHA256': 'invalid-signature-for-test',
      },
      body: JSON.stringify({ test: true }),
    });

    console.log(`   Status: ${mainResponse.status}`);
    if (mainResponse.status === 401) {
      console.log('   ✅ Endpoint is accessible (401 = signature verification working)');
    } else if (mainResponse.status === 400) {
      console.log('   ✅ Endpoint is accessible (400 = missing shop domain)');
    } else {
      const text = await mainResponse.text();
      console.log(`   Response: ${text.substring(0, 100)}`);
    }

    // Test the test webhook endpoint
    console.log('\n2️⃣ Testing test webhook endpoint (/api/webhooks/test)...');
    const testResponse = await fetch(`${APP_URL}/api/webhooks/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'checkouts/create',
        'X-Shopify-Shop-Domain': 'yona-prod.myshopify.com',
      },
      body: JSON.stringify({ 
        id: 12345,
        token: 'test_token',
        checkout_token: 'test_checkout_token',
        email: 'test@example.com'
      }),
    });

    console.log(`   Status: ${testResponse.status}`);
    if (testResponse.status === 200) {
      console.log('   ✅ Test endpoint is working!');
    } else {
      const text = await testResponse.text();
      console.log(`   Response: ${text.substring(0, 100)}`);
    }

    console.log('\n✅ Webhook endpoint tests complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check your server logs for "TEST WEBHOOK RECEIVED" messages');
    console.log('   2. Create a checkout in your Shopify store');
    console.log('   3. Check logs again for "WEBHOOK RECEIVED" messages');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n⚠️ The webhook endpoint is not accessible.');
    console.log('   Make sure your Cloudflare tunnel is running and the server is started.');
  }
}

testWebhookEndpoint();
