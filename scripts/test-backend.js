/**
 * Test script to verify backend API is accessible
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://shopify-dev-api.yonamark.com';
const API_KEY = process.env.CORE_AI_SERVICE_API_KEY || '';

async function testBackend() {
  console.log(`\n🧪 Testing backend API at ${BACKEND_URL}\n`);

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    const healthText = await healthResponse.text();
    console.log(`   Response: ${healthText.substring(0, 200)}`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  // Test 2: API status
  console.log('\n2️⃣ Testing API status endpoint...');
  try {
    const statusResponse = await fetch(`${BACKEND_URL}/api/v1/status`);
    console.log(`   Status: ${statusResponse.status}`);
    const contentType = statusResponse.headers.get('content-type');
    console.log(`   Content-Type: ${contentType}`);
    const statusText = await statusResponse.text();
    console.log(`   Response: ${statusText.substring(0, 200)}`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  // Test 3: Events endpoint (POST)
  console.log('\n3️⃣ Testing events endpoint (POST)...');
  try {
    const eventResponse = await fetch(`${BACKEND_URL}/api/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        event_type: 'test',
        store_id: 'test-store',
        occurred_at: new Date().toISOString(),
        payload: { test: true }
      }),
    });
    console.log(`   Status: ${eventResponse.status}`);
    const contentType = eventResponse.headers.get('content-type');
    console.log(`   Content-Type: ${contentType}`);
    const eventText = await eventResponse.text();
    console.log(`   Response: ${eventText.substring(0, 300)}`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }

  console.log('\n✅ Backend tests complete!');
}

testBackend();
