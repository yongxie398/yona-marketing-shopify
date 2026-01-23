"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorWebhookMetrics = monitorWebhookMetrics;
const webhook_worker_1 = require("../workers/webhook-worker");
/**
 * Monitor webhook processing metrics
 */
async function monitorWebhookMetrics() {
    setInterval(() => {
        try {
            const { queueSize, dlqSize } = (0, webhook_worker_1.getQueueMetrics)();
            const circuitStatus = (0, webhook_worker_1.getCircuitBreakerStatus)();
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
        }
        catch (error) {
            console.error('Error monitoring webhook metrics:', error);
        }
    }, 30000); // Check every 30 seconds
}
// Start monitoring
monitorWebhookMetrics();
