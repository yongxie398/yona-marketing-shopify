/**
 * Script to retrieve store access token from backend
 * 
 * Usage: npx ts-node scripts/get-store-token.ts <shop-domain>
 * Example: npx ts-node scripts/get-store-token.ts yona-prod.myshopify.com
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

async function getStoreToken(shopDomain: string) {
  console.log(`\n🔍 Fetching store info for ${shopDomain}\n`);

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/stores/domain/${shopDomain}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch store: ${response.status}`);
      const errorText = await response.text();
      console.error('Error:', errorText);
      return;
    }

    const store = await response.json();
    
    console.log('✅ Store found:\n');
    console.log(`   ID: ${store.id}`);
    console.log(`   Domain: ${store.domain}`);
    console.log(`   Name: ${store.name}`);
    console.log(`   Status: ${store.status}`);
    console.log(`   Access Token: ${store.access_token ? store.access_token.substring(0, 20) + '...' : 'NOT SET'}`);
    
    if (store.access_token) {
      console.log(`\n🔑 Full Access Token:`);
      console.log(store.access_token);
      
      console.log(`\n💡 You can now check webhooks with:`);
      console.log(`   node scripts/check-webhook-status.js ${shopDomain} ${store.access_token}`);
    } else {
      console.log('\n❌ No access token found for this store');
      console.log('   The store may need to be re-authorized');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

const shopDomain = process.argv[2];

if (!shopDomain) {
  console.error('Usage: npx ts-node scripts/get-store-token.ts <shop-domain>');
  console.error('Example: npx ts-node scripts/get-store-token.ts yona-prod.myshopify.com');
  process.exit(1);
}

getStoreToken(shopDomain);
