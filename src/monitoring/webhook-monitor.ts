let getQueueMetrics: () => { queueSize: number; dlqSize: number };
let getCircuitBreakerStatus: () => { isOpen: boolean; failureCount: number };

async function loadWorker() {
  const worker = await import('../workers/webhook-worker');
  getQueueMetrics = worker.getQueueMetrics;
  getCircuitBreakerStatus = worker.getCircuitBreakerStatus;
}

/**
 * Monitor webhook processing metrics
 */
export async function monitorWebhookMetrics(): Promise<void> {
  await loadWorker();

  setInterval(() => {
    try {
      const { queueSize, dlqSize } = getQueueMetrics();
      const circuitStatus = getCircuitBreakerStatus();
      
      console.log(`Webhook Queue Metrics:`);
      console.log(`  Active Queue Size: ${queueSize}`);
      console.log(`  Dead Letter Queue Size: ${dlqSize}`);
      console.log(`  Circuit Breaker Status: ${circuitStatus.isOpen ? 'OPEN' : 'CLOSED'} (${circuitStatus.failureCount} failures)`);
      
      // Alert if queue size grows too large
      if (queueSize > 1000) {
        console.warn(`WARNING: Large webhook queue size: ${queueSize}`);
      }
      
      if (dlqSize > 0) {
        console.warn(`WARNING: Dead letter queue has ${dlqSize} events`);
      }
      
      if (circuitStatus.isOpen) {
        console.warn(`WARNING: Circuit breaker is OPEN`);
      }
    } catch (error) {
      console.error('Error monitoring webhook metrics:', error);
    }
  }, 30000); // Check every 30 seconds
}

// Start monitoring
monitorWebhookMetrics();