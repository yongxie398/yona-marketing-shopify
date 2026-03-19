/**
 * Simple script to check webhook registration status via Shopify Admin API
 * 
 * Usage: node scripts/check-webhook-status.js <shop-domain> <access-token>
 * Example: node scripts/check-webhook-status.js my-store.myshopify.com shpat_xxx
 */

const shopDomain = process.argv[2];
const accessToken = process.argv[3];

if (!shopDomain || !accessToken) {
  console.error('Usage: node scripts/check-webhook-status.js <shop-domain> <access-token>');
  console.error('Example: node scripts/check-webhook-status.js my-store.myshopify.com shpat_xxx');
  process.exit(1);
}

async function checkWebhooks() {
  console.log(`\n🔍 Checking webhooks for ${shopDomain}\n`);

  try {
    const response = await fetch(`https://${shopDomain}/admin/api/2026-01/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch webhooks: ${response.status}`);
      const errorText = await response.text();
      console.error('Error:', errorText);
      return;
    }

    const data = await response.json();
    const webhooks = data.webhooks || [];

    console.log(`Found ${webhooks.length} webhooks:\n`);

    if (webhooks.length === 0) {
      console.log('⚠️ No webhooks registered!');
    } else {
      webhooks.forEach((webhook, index) => {
        console.log(`${index + 1}. ${webhook.topic}`);
        console.log(`   Address: ${webhook.address}`);
        console.log(`   Created: ${webhook.created_at}`);
        console.log(`   ID: ${webhook.id}`);
        console.log('');
      });

      // Check for checkout webhooks
      const checkoutWebhooks = webhooks.filter(w => w.topic.includes('checkout'));
      console.log(`\n📦 Checkout webhooks: ${checkoutWebhooks.length}`);
      checkoutWebhooks.forEach(w => {
        console.log(`   - ${w.topic}: ${w.address}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkWebhooks();
