/**
 * Verify the exact URL construction for AI Core Service
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://shopify-dev-api.yonamark.com';

// Replicate the logic from ai-core-service.ts
const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL + 'api/v1' : BACKEND_URL + '/api/v1';
const eventsUrl = `${baseUrl}/events`;

console.log('\n🔍 URL Construction Verification\n');
console.log('1. BACKEND_URL from env:', BACKEND_URL);
console.log('2. baseUrl constructed:', baseUrl);
console.log('3. Final events URL:', eventsUrl);
console.log('');

// Test the URL
async function testUrl() {
  console.log('🧪 Testing URL:', eventsUrl);
  console.log('');

  try {
    const response = await fetch(eventsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.CORE_AI_SERVICE_API_KEY || '',
      },
      body: JSON.stringify({
        event_type: 'test',
        store_id: 'test-store',
        occurred_at: new Date().toISOString(),
        payload: { test: true }
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('');

    const text = await response.text();
    console.log('Response Body (first 300 chars):');
    console.log(text.substring(0, 300));

    if (response.ok) {
      console.log('\n✅ URL is working correctly!');
    } else {
      console.log('\n❌ URL returned error status:', response.status);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testUrl();
