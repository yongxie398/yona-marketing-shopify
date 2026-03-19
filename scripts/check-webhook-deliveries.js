/**
 * Script to check recent webhook deliveries
 * 
 * Usage: node scripts/check-webhook-deliveries.js <shop-domain> <access-token> [webhook-id]
 * Example: node scripts/check-webhook-deliveries.js yona-prod.myshopify.com shpat_xxx
 */

const shopDomain = process.argv[2];
const accessToken = process.argv[3];
const specificWebhookId = process.argv[4];

if (!shopDomain || !accessToken) {
  console.error('Usage: node scripts/check-webhook-deliveries.js <shop-domain> <access-token> [webhook-id]');
  console.error('Example: node scripts/check-webhook-deliveries.js yona-prod.myshopify.com shpat_xxx');
  process.exit(1);
}

async function checkWebhookDeliveries() {
  console.log(`\n🔍 Checking webhook deliveries for ${shopDomain}\n`);

  try {
    // First, get all webhooks
    const webhooksResponse = await fetch(`https://${shopDomain}/admin/api/2026-01/webhooks.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!webhooksResponse.ok) {
      console.error(`❌ Failed to fetch webhooks: ${webhooksResponse.status}`);
      return;
    }

    const data = await webhooksResponse.json();
    const webhooks = data.webhooks || [];

    // Filter for checkout webhooks
    const checkoutWebhooks = webhooks.filter(w => w.topic.includes('checkout'));
    
    console.log(`Found ${checkoutWebhooks.length} checkout webhooks\n`);

    for (const webhook of checkoutWebhooks) {
      console.log(`📦 ${webhook.topic}`);
      console.log(`   ID: ${webhook.id}`);
      console.log(`   Address: ${webhook.address}`);
      console.log(`   Created: ${webhook.created_at}`);
      
      // Check if this webhook has any deliveries
      try {
        const deliveriesResponse = await fetch(
          `https://${shopDomain}/admin/api/2026-01/webhooks/${webhook.id}/deliveries.json?limit=5`,
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        if (deliveriesResponse.ok) {
          const deliveriesData = await deliveriesResponse.json();
          const deliveries = deliveriesData.deliveries || [];
          
          if (deliveries.length === 0) {
            console.log(`   📭 No recent deliveries`);
          } else {
            console.log(`   📬 Recent deliveries:`);
            deliveries.forEach((delivery, idx) => {
              const status = delivery.status === 'success' ? '✅' : '❌';
              console.log(`      ${status} ${delivery.created_at} - ${delivery.status} (${delivery.response_code || 'no response'})`);
              if (delivery.status !== 'success' && delivery.error_message) {
                console.log(`         Error: ${delivery.error_message}`);
              }
            });
          }
        } else {
          console.log(`   ⚠️ Could not fetch deliveries: ${deliveriesResponse.status}`);
        }
      } catch (e) {
        console.log(`   ⚠️ Error fetching deliveries: ${e.message}`);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkWebhookDeliveries();
