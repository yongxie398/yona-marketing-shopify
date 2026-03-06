// DEPRECATED: This file is deprecated and will be removed in a future version.
// All webhook processing is now handled by the Redis-based EventQueue in lib/event-queue.ts
// The webhook route (app/api/webhooks/route.ts) now uses eventQueue.enqueue() directly.

import eventQueue from '../lib/event-queue';
import { ShopifyWebhookPayload } from '../types';

/**
 * @deprecated Use eventQueue.enqueue() from lib/event-queue.ts instead
 * Add a webhook to the queue
 */
export function addToWebhookQueue(
  topic: string,
  shopDomain: string,
  payload: ShopifyWebhookPayload
): void {
  console.warn('DEPRECATED: addToWebhookQueue is deprecated. Use eventQueue.enqueue() instead.');
  
  // Forward to the new Redis-based event queue
  eventQueue.enqueue({
    eventId: crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`,
    storeId: shopDomain, // Note: This should be the actual store ID, not domain
    eventType: topic,
    payload
  }).catch(error => {
    console.error('Failed to enqueue event:', error);
  });
}

/**
 * @deprecated Use eventQueue.getStats() instead
 * Get queue metrics
 */
export async function getQueueMetrics(): Promise<{ queueSize: number; dlqSize: number }> {
  const stats = await eventQueue.getStats();
  return {
    queueSize: stats.totalEvents,
    dlqSize: stats.deadLetterQueue
  };
}

/**
 * @deprecated Circuit breaker is now handled internally by event-queue.ts
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus() {
  console.warn('DEPRECATED: Circuit breaker status is now handled internally by event-queue.ts');
  return { isOpen: false, failureCount: 0 };
}

// Empty arrays for backward compatibility
export const webhookQueue: any[] = [];
export const deadLetterQueue: any[] = [];

console.log('DEPRECATED: webhook-worker.ts is deprecated. All functionality has been moved to lib/event-queue.ts with Redis support.');
