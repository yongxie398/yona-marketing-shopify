"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deadLetterQueue = exports.webhookQueue = void 0;
exports.addToWebhookQueue = addToWebhookQueue;
exports.getQueueMetrics = getQueueMetrics;
exports.getCircuitBreakerStatus = getCircuitBreakerStatus;
// Import AICoreService as default export
const ai_core_service_1 = require("../lib/ai-core-service");
// Simple in-memory queue (would use Redis queue in production)
const webhookQueue = [];
exports.webhookQueue = webhookQueue;
// Dead letter queue for failed events
const deadLetterQueue = [];
exports.deadLetterQueue = deadLetterQueue;
// Reference to the AI Core Service
const aiCoreService = ai_core_service_1.default;
// Circuit breaker implementation
class WebhookCircuitBreaker {
    constructor() {
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.isOpen = false;
        this.threshold = 5; // Number of failures before opening circuit
        this.timeout = 30000; // Time in ms before attempting to close circuit
    }
    async execute(forwardFunction) {
        if (this.isOpen) {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                console.log('Circuit breaker half-open, attempting to close');
                this.isOpen = false; // Half-open state, next call attempts to close
            }
            else {
                console.log('Circuit breaker open, failing fast');
                return false; // Still open, fail fast
            }
        }
        try {
            await forwardFunction();
            this.reset(); // Success, reset the circuit
            return true;
        }
        catch (error) {
            this.onFailure();
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.threshold) {
            console.log('Circuit breaker opened due to failures');
            this.isOpen = true;
        }
    }
    reset() {
        this.failureCount = 0;
        this.isOpen = false;
    }
    getStatus() {
        return { isOpen: this.isOpen, failureCount: this.failureCount };
    }
}
const circuitBreaker = new WebhookCircuitBreaker();
/**
 * Process the webhook queue
 */
async function processWebhookQueue() {
    console.log('Starting webhook worker...');
    while (true) {
        try {
            // Look for unprocessed items in the queue
            const unprocessedItems = webhookQueue.filter(item => !item.processed);
            if (unprocessedItems.length > 0) {
                // Process one item at a time
                const item = unprocessedItems[0];
                console.log(`Processing webhook: ${item.id}`);
                // Forward to Core AI Service with circuit breaker and retry logic
                await forwardToCoreAIWithCircuitBreakerAndRetry(item);
                // Mark as processed
                const queueItem = webhookQueue.find(qi => qi.id === item.id);
                if (queueItem) {
                    queueItem.processed = true;
                }
                console.log(`Successfully processed webhook: ${item.id}`);
            }
            // Brief pause to prevent tight loop
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        catch (error) {
            console.error('Error processing webhook queue:', error);
            // Brief pause before continuing to prevent tight loop on errors
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
/**
 * Forward event to Core AI Service with circuit breaker and retry logic
 */
async function forwardToCoreAIWithCircuitBreakerAndRetry(item, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Execute with circuit breaker
            const success = await circuitBreaker.execute(async () => {
                // Forward the event to Core AI Service
                await aiCoreService.forwardEvent({
                    event_type: item.topic,
                    store_id: item.shopDomain, // or actual store ID if available
                    occurred_at: item.timestamp,
                    properties: item.payload
                });
            });
            if (success) {
                return; // Success, exit retry loop
            }
        }
        catch (error) {
            console.error(`Failed to forward event (attempt ${i + 1}):`, error);
            if (i === maxRetries - 1) {
                // Final attempt failed, move to dead letter queue
                deadLetterQueue.push({
                    id: item.id,
                    topic: item.topic,
                    shopDomain: item.shopDomain,
                    payload: item.payload,
                    timestamp: item.timestamp,
                    error: error.message || 'Unknown error'
                });
                console.error(`Moved failed event to DLQ: ${item.id}`);
                return;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}
/**
 * Add a webhook to the queue
 */
function addToWebhookQueue(topic, shopDomain, payload) {
    const queueItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`, // Fallback for crypto
        topic,
        shopDomain,
        payload,
        timestamp: new Date().toISOString(),
        processed: false
    };
    webhookQueue.push(queueItem);
    console.log(`Added webhook to queue: ${queueItem.id}`);
}
/**
 * Get queue metrics
 */
function getQueueMetrics() {
    return {
        queueSize: webhookQueue.filter(item => !item.processed).length,
        dlqSize: deadLetterQueue.length
    };
}
/**
 * Get circuit breaker status
 */
function getCircuitBreakerStatus() {
    return circuitBreaker.getStatus();
}
// Start the worker
processWebhookQueue().catch(error => {
    console.error('Worker failed to start:', error);
    process.exit(1);
});
