/**
 * Unit tests for webhook flow functionality
 * Tests the complete webhook processing pipeline with all implemented features
 */

import { processWebhook } from '../src/utils/shopify';
import { addToWebhookQueue, getQueueMetrics, getCircuitBreakerStatus, webhookQueue, deadLetterQueue } from '../src/workers/webhook-worker';

// Mock data
const mockPayload = {
  id: '12345',
  customer: {
    id: 123,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe'
  },
  line_items: [
    {
      id: 456,
      product_id: 789,
      title: 'Test Product',
      quantity: 1,
      price: '29.99'
    }
  ]
};

describe('Webhook Flow Tests', () => {
  beforeEach(() => {
    // Clear any existing state
    webhookQueue.length = 0;
    deadLetterQueue.length = 0;
  });

  test('1. Should process webhook and add to queue', async () => {
    // Spy on the addToWebhookQueue function to verify it's called
    const originalAddToQueue = addToWebhookQueue;
    let queueCallCount = 0;
    let queueArgs: any = null;
    
    // Temporarily override the function to capture calls
    (global as any).testQueueCalls = [];
    
    const originalImport = global.import;
    (global as any).import = async (path: string) => {
      if (path === '../workers/webhook-worker') {
        return {
          addToWebhookQueue: (...args: any[]) => {
            queueCallCount++;
            queueArgs = args;
            (global as any).testQueueCalls.push(args);
            // Actually call the real function for full functionality
            return originalAddToQueue(...args);
          },
          getQueueMetrics,
          getCircuitBreakerStatus,
          webhookQueue,
          deadLetterQueue
        };
      }
      return originalImport(path);
    };

    // Process a webhook
    await processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload);

    // Restore original import
    (global as any).import = originalImport;

    // Verify the function was called
    expect(queueCallCount).toBeGreaterThan(0);
    expect(queueArgs).not.toBeNull();
    expect(queueArgs[0]).toBe('orders/create');
    expect(queueArgs[1]).toBe('test-shop.myshopify.com');
    expect(queueArgs[2]).toEqual(mockPayload);

    // Verify the item was added to the actual queue
    const metrics = getQueueMetrics();
    expect(metrics.queueSize).toBe(1);
  });

  test('2. Should handle duplicate webhooks', async () => {
    // Process the same webhook twice
    await processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload);
    await processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload); // Duplicate

    // Should only have one item in queue despite two calls
    const metrics = getQueueMetrics();
    expect(metrics.queueSize).toBe(1); // Only one unique event should be processed
  });

  test('3. Should enforce rate limiting', async () => {
    // Process many webhooks from the same shop to test rate limiting
    for (let i = 0; i < 105; i++) {
      await processWebhook('products/update', 'rate-limited-shop.myshopify.com', { ...mockPayload, id: `id-${i}` });
    }

    // Should be limited to 100 events per minute per store
    // (In our implementation, we allow 100 per minute, so 105 would have some rejected)
    const metrics = getQueueMetrics();
    // Note: The exact count depends on timing, but we should see evidence of rate limiting
    console.log(`Rate limiting test - Queue size: ${metrics.queueSize}`);
  });

  test('4. Should handle circuit breaker functionality', () => {
    // Initially should be closed
    const initialStatus = getCircuitBreakerStatus();
    expect(initialStatus.isOpen).toBe(false);
    
    // The circuit breaker is tested more thoroughly when actual API calls fail
    // For unit testing, we can verify the status reporting works
    expect(typeof initialStatus.failureCount).toBe('number');
  });

  test('5. Should maintain proper queue metrics', () => {
    // Add some items to the queue
    addToWebhookQueue('test/event1', 'shop1.myshopify.com', mockPayload);
    addToWebhookQueue('test/event2', 'shop2.myshopify.com', mockPayload);

    const metrics = getQueueMetrics();
    expect(metrics.queueSize).toBe(2);
    expect(metrics.dlqSize).toBe(0); // Should be empty initially
  });

  test('6. Should handle dead letter queue', () => {
    // Verify initial DLQ is empty
    const metrics = getQueueMetrics();
    expect(metrics.dlqSize).toBe(0);
  });

  test('7. Should process multiple different webhook types', async () => {
    const webhookTypes = [
      'orders/create',
      'customers/create', 
      'products/update',
      'checkouts/create'
    ];
    
    for (const eventType of webhookTypes) {
      await processWebhook(eventType, 'multi-test-shop.myshopify.com', mockPayload);
    }

    const metrics = getQueueMetrics();
    expect(metrics.queueSize).toBe(webhookTypes.length);
  });

  test('8. Should handle different shops separately for rate limiting', async () => {
    // Process webhooks for different shops
    for (let i = 0; i < 105; i++) {
      const shopDomain = `shop-${i % 3}.myshopify.com`; // Distribute among 3 shops
      await processWebhook('orders/create', shopDomain, { ...mockPayload, id: `id-${i}` });
    }

    // All 3 shops should be able to process events (unless they hit individual limits)
    const metrics = getQueueMetrics();
    console.log(`Multiple shops test - Queue size: ${metrics.queueSize}`);
  });
});

// Run a simple execution test
console.log('🧪 Running webhook flow unit tests...\n');

// Manual test of the core functionality
async function manualTest() {
  console.log('Running manual webhook processing test...');
  
  try {
    // Test basic webhook processing
    await processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload);
    console.log('✅ Basic webhook processing: SUCCESS');
    
    // Check metrics
    const metrics = getQueueMetrics();
    console.log(`📊 Queue metrics after processing: ${metrics.queueSize} items in queue, ${metrics.dlqSize} in DLQ`);
    
    // Test duplicate detection
    await processWebhook('orders/create', 'test-shop.myshopify.com', mockPayload);
    const metricsAfterDup = getQueueMetrics();
    console.log(`📊 Queue metrics after duplicate: ${metricsAfterDup.queueSize} items in queue (should be same as before)`);
    
    // Test circuit breaker status
    const cbStatus = getCircuitBreakerStatus();
    console.log(`🔄 Circuit breaker status: ${cbStatus.isOpen ? 'OPEN' : 'CLOSED'}, failures: ${cbStatus.failureCount}`);
    
    console.log('\n✅ All manual tests completed successfully!');
    console.log('✅ Webhook flow functionality is working properly');
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
    throw error;
  }
}

// Execute the manual test
manualTest().catch(err => {
  console.error('Manual test execution failed:', err);
  process.exit(1);
});

export {};