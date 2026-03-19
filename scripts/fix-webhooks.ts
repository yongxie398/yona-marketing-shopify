/**
 * Script to check and re-register Shopify webhooks
 * Run this after fixing the API version issue
 */

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

const WEBHOOKS_TO_REGISTER = [
  { topic: 'app/uninstalled', description: 'App uninstallation' },
  { topic: 'orders/create', description: 'New order creation' },
  { topic: 'orders/updated', description: 'Order updates' },
  { topic: 'customers/create', description: 'New customer creation' },
  { topic: 'customers/update', description: 'Customer updates' },
  { topic: 'products/create', description: 'New product creation' },
  { topic: 'products/update', description: 'Product updates' },
  { topic: 'checkouts/create', description: 'New checkout creation' },
  { topic: 'checkouts/update', description: 'Checkout updates' },
];

async function getStoreAccessToken(shopDomain: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/stores/domain/${shopDomain}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      console.error(`Failed to get store: ${response.status}`);
      return null;
    }
    
    const store = await response.json();
    return store.access_token || null;
  } catch (error) {
    console.error('Error getting store access token:', error);
    return null;
  }
}

async function listWebhooks(shopDomain: string, accessToken: string) {
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-01/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to list webhooks: ${response.status}`);
      const errorText = await response.text();
      console.error('Error:', errorText);
      return [];
    }
    
    const data = await response.json();
    return data.webhooks || [];
  } catch (error) {
    console.error('Error listing webhooks:', error);
    return [];
  }
}

async function registerWebhook(shopDomain: string, accessToken: string, topic: string, address: string) {
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address,
          format: 'json',
        },
      }),
    });
    
    if (response.ok) {
      console.log(`✅ Successfully registered ${topic}`);
      return true;
    } else {
      const errorText = await response.text();
      if (errorText.includes('already been taken')) {
        console.log(`ℹ️ ${topic} already registered`);
        return true;
      }
      console.error(`❌ Failed to register ${topic}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error registering ${topic}:`, error);
    return false;
  }
}

async function deleteWebhook(shopDomain: string, accessToken: string, webhookId: number) {
  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2023-01/webhooks/${webhookId}.json`, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    });
    
    if (response.ok) {
      console.log(`🗑️ Deleted webhook ${webhookId}`);
      return true;
    } else {
      console.error(`Failed to delete webhook ${webhookId}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting webhook ${webhookId}:`, error);
    return false;
  }
}

async function fixWebhooks(shopDomain: string) {
  console.log(`\n🔧 Fixing webhooks for ${shopDomain}\n`);
  
  const accessToken = await getStoreAccessToken(shopDomain);
  if (!accessToken) {
    console.error('❌ Could not get access token. Make sure the store is registered.');
    return;
  }
  
  console.log('📋 Current webhooks:');
  const existingWebhooks = await listWebhooks(shopDomain, accessToken);
  
  if (existingWebhooks.length === 0) {
    console.log('  No webhooks registered');
  } else {
    existingWebhooks.forEach((webhook: any) => {
      console.log(`  - ${webhook.topic} -> ${webhook.address}`);
    });
  }
  
  console.log('\n📝 Registering required webhooks:');
  const webhookAddress = `${APP_URL}/api/webhooks`;
  
  for (const webhook of WEBHOOKS_TO_REGISTER) {
    await registerWebhook(shopDomain, accessToken, webhook.topic, webhookAddress);
  }
  
  console.log('\n✅ Webhook fix complete!');
  console.log('\n📋 Updated webhooks:');
  const updatedWebhooks = await listWebhooks(shopDomain, accessToken);
  updatedWebhooks.forEach((webhook: any) => {
    console.log(`  - ${webhook.topic} -> ${webhook.address}`);
  });
}

// Get shop domain from command line argument
const shopDomain = process.argv[2];

if (!shopDomain) {
  console.error('Usage: npx ts-node scripts/fix-webhooks.ts <shop-domain>');
  console.error('Example: npx ts-node scripts/fix-webhooks.ts my-store.myshopify.com');
  process.exit(1);
}

if (!APP_URL) {
  console.error('❌ APP_URL environment variable is not set');
  process.exit(1);
}

fixWebhooks(shopDomain);
