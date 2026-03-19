/**
 * Diagnostic script to check webhook registration and test connectivity
 */

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

async function diagnoseWebhooks(shopDomain: string, accessToken: string) {
  console.log(`\n🔍 Diagnosing webhooks for ${shopDomain}\n`);

  // 1. Check current webhooks
  console.log('1️⃣ Checking registered webhooks...');
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2026-01/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to list webhooks: ${response.status}`);
      const errorText = await response.text();
      console.error('Error:', errorText);
      return;
    }

    const data = await response.json();
    const webhooks = data.webhooks || [];

    if (webhooks.length === 0) {
      console.log('   ⚠️ No webhooks registered!');
    } else {
      console.log(`   ✅ Found ${webhooks.length} webhooks:`);
      webhooks.forEach((webhook: any) => {
        console.log(`      - ${webhook.topic} -> ${webhook.address}`);
        console.log(`        ID: ${webhook.id}, Created: ${webhook.created_at}`);
      });
    }

    // Check for checkout webhooks specifically
    const checkoutWebhooks = webhooks.filter((w: any) => 
      w.topic.includes('checkout')
    );
    
    if (checkoutWebhooks.length === 0) {
      console.log('\n   ⚠️ No checkout webhooks found!');
    } else {
      console.log(`\n   ✅ Found ${checkoutWebhooks.length} checkout webhooks`);
    }

  } catch (error) {
    console.error('❌ Error checking webhooks:', error);
  }

  // 2. Test webhook endpoint accessibility
  console.log('\n2️⃣ Testing webhook endpoint accessibility...');
  const webhookUrl = `${APP_URL}/api/webhooks`;
  console.log(`   Webhook URL: ${webhookUrl}`);
  
  try {
    // Test if the endpoint is reachable
    const testResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Topic': 'test/event',
        'X-Shopify-Shop-Domain': shopDomain,
        'X-Shopify-Hmac-SHA256': 'invalid-test-signature',
      },
      body: JSON.stringify({ test: true }),
    });

    console.log(`   Response status: ${testResponse.status}`);
    
    if (testResponse.status === 401) {
      console.log('   ✅ Endpoint is accessible (returned 401 for invalid signature as expected)');
    } else if (testResponse.status === 400) {
      console.log('   ✅ Endpoint is accessible (returned 400 for missing data as expected)');
    } else {
      console.log(`   ⚠️ Unexpected response: ${testResponse.status}`);
      const text = await testResponse.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.error('❌ Cannot reach webhook endpoint:', error.message);
    console.log('\n   Possible issues:');
    console.log('   - APP_URL is not set correctly');
    console.log('   - The server is not running');
    console.log('   - Network/firewall issues');
  }

  // 3. Check environment variables
  console.log('\n3️⃣ Checking environment variables...');
  console.log(`   APP_URL: ${APP_URL || '❌ NOT SET'}`);
  console.log(`   SHOPIFY_API_KEY: ${SHOPIFY_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   SHOPIFY_API_SECRET: ${SHOPIFY_API_SECRET ? '✅ SET' : '❌ NOT SET'}`);

  // 4. Recommendations
  console.log('\n4️⃣ Recommendations:');
  
  if (!APP_URL) {
    console.log('   ❌ Set APP_URL or NEXT_PUBLIC_APP_URL environment variable');
  }
  
  console.log('\n   To fix missing webhooks:');
  console.log('   Option 1: Re-install the app');
  console.log('   Option 2: Run: npx ts-node scripts/fix-webhooks.ts ' + shopDomain);
}

// Get parameters from command line
const shopDomain = process.argv[2];
const accessToken = process.argv[3];

if (!shopDomain || !accessToken) {
  console.error('Usage: npx ts-node scripts/diagnose-webhooks.ts <shop-domain> <access-token>');
  console.error('Example: npx ts-node scripts/diagnose-webhooks.ts my-store.myshopify.com shpat_xxx');
  process.exit(1);
}

diagnoseWebhooks(shopDomain, accessToken);
