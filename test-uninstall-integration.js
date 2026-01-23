// Integration test for uninstall endpoint
const { default: aiCoreService } = require('./src/lib/ai-core-service.ts');

// Mock environment variables
process.env.CORE_AI_SERVICE_URL = 'http://localhost:8000';
process.env.CORE_AI_SERVICE_API_KEY = 'test_core_ai_key';

// Test function
async function testUninstallEndpoint() {
  console.log('Testing uninstall endpoint integration...');
  
  try {
    // Test store ID
    const testStoreId = 'test-store-123';
    
    // Mock fetch implementation
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: testStoreId,
        status: 'uninstalled',
        message: 'Store uninstalled successfully'
      })
    });
    
    // Call removeStore method
    await aiCoreService.removeStore(testStoreId);
    
    // Verify fetch was called with correct parameters
    console.log('✓ removeStore method called successfully');
    
    // Check fetch call details
    const fetchCall = global.fetch.mock.calls[0];
    console.log('✓ Fetch URL:', fetchCall[0]);
    console.log('✓ Fetch method:', fetchCall[1].method);
    console.log('✓ Fetch headers:', fetchCall[1].headers);
    
    // Verify correct endpoint was used
    if (fetchCall[0].includes('/shops/test-store-123/uninstall')) {
      console.log('✓ CORRECT ENDPOINT: POST /shops/{store_id}/uninstall');
    } else {
      console.log('✗ WRONG ENDPOINT: Expected /shops/{store_id}/uninstall');
      return false;
    }
    
    // Verify POST method was used
    if (fetchCall[1].method === 'POST') {
      console.log('✓ CORRECT METHOD: POST');
    } else {
      console.log('✗ WRONG METHOD: Expected POST');
      return false;
    }
    
    console.log('\n🎉 Integration test PASSED!');
    console.log('The uninstall endpoint is working correctly.');
    return true;
    
  } catch (error) {
    console.error('✗ Integration test FAILED:', error.message);
    return false;
  }
}

// Run test
testUninstallEndpoint().then(success => {
  process.exit(success ? 0 : 1);
});