import eventQueue from '../lib/event-queue';

/**
 * Monitor webhook processing metrics
 */
export async function monitorWebhookMetrics(): Promise<void> {
  setInterval(async () => {
    try {
      const stats = await eventQueue.getStats();
      
      console.log(`Webhook Queue Metrics:`);
      console.log(`  Active Queue Size: ${stats.totalEvents}`);
      console.log(`  Dead Letter Queue Size: ${stats.deadLetterQueue}`);
      
      // Alert if queue size grows too large
      if (stats.totalEvents > 1000) {
        console.warn(`WARNING: Large webhook queue size: ${stats.totalEvents}`);
      }
      
      if (stats.deadLetterQueue > 0) {
        console.warn(`WARNING: Dead letter queue has ${stats.deadLetterQueue} events`);
      }
    } catch (error) {
      console.error('Error monitoring webhook metrics:', error);
    }
  }, 30000); // Check every 30 seconds
}

// Start monitoring
monitorWebhookMetrics();
