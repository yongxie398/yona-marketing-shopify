// Event queuing system for reliable event processing

import logger from '@/utils/logger';
import aiCoreService from './ai-core-service';
import metricsService from './metrics-service';

interface QueuedEvent {
  id: string;
  eventId: string; // Original event ID from database
  storeId: string;
  eventType: string;
  payload: any;
  createdAt: Date;
  retries: number;
  nextRetryAt?: Date;
}

class EventQueue {
  private queue: QueuedEvent[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_RETRIES: number = 5;
  private readonly RETRY_DELAY: number = 60000; // 1 minute
  private readonly PROCESSING_BATCH_SIZE: number = 10;

  constructor() {
    // Start processing queue every 5 seconds
    setInterval(() => this.processQueue(), 5000);
    logger.info('EventQueue initialized', { context: 'EventQueue' });
  }

  // Add event to queue
  async enqueue(event: {
    eventId: string; // Original event ID from database
    storeId: string;
    eventType: string;
    payload: any;
  }): Promise<void> {
    const queuedEvent: QueuedEvent = {
      id: `${event.eventType}-${event.storeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId: event.eventId,
      storeId: event.storeId,
      eventType: event.eventType,
      payload: event.payload,
      createdAt: new Date(),
      retries: 0
    };

    this.queue.push(queuedEvent);
    logger.debug('Event added to queue', {
      context: 'EventQueue',
      metadata: { eventId: queuedEvent.id, eventType: queuedEvent.eventType, storeId: queuedEvent.storeId }
    });
    
    // Update queue size metric
    metricsService.updateQueueSize(this.queue.length);

    // Process queue immediately if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Process events in queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    logger.debug(`Processing ${this.queue.length} events from queue`, { context: 'EventQueue' });

    try {
      // Get next batch of events to process
      const batch = this.queue.slice(0, this.PROCESSING_BATCH_SIZE);
      
      // Process events in parallel
      await Promise.allSettled(batch.map(event => this.processEvent(event)));
      
      // Remove processed events from queue
      this.queue = this.queue.filter(event => 
        !batch.some(batchEvent => batchEvent.id === event.id)
      );
      
      // Update queue size metric
      metricsService.updateQueueSize(this.queue.length);
      
      // Requeue failed events with retry logic
      this.requeueFailedEvents();
    } catch (error) {
      logger.error('Error processing event queue', {
        context: 'EventQueue',
        error: error as Error
      });
    } finally {
      this.isProcessing = false;
      
      // If there are still events left, process them
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  // Process a single event
  private async processEvent(event: QueuedEvent): Promise<void> {
    const startTime = Date.now();
    let shopDomain = '';
    
    try {
      // Get store information from backend API to get the shop domain
      const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
      const storeResponse = await fetch(`${backendUrl}/api/v1/stores/${event.storeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (storeResponse.ok) {
        const store = await storeResponse.json();
        shopDomain = store.domain;
      }

      logger.debug(`Processing event ${event.id} (original event ID: ${event.eventId})`, {
        context: 'EventQueue',
        metadata: { eventType: event.eventType, storeId: event.storeId, eventId: event.eventId, shopDomain }
      });

      // Forward event to Core AI Service
      await aiCoreService.forwardEvent({
        event_type: event.eventType,
        store_id: event.storeId,
        occurred_at: new Date().toISOString(),
        payload: event.payload
      });

      logger.debug(`Event ${event.eventId} forwarded to Core AI Service`, {
        context: 'EventQueue',
        metadata: { eventId: event.eventId, storeId: event.storeId, shopDomain }
      });

      const processingTime = Date.now() - startTime;
      logger.info(`Successfully processed event ${event.id} (original event ID: ${event.eventId})`, {
        context: 'EventQueue',
        metadata: { eventType: event.eventType, storeId: event.storeId, eventId: event.eventId, shopDomain, processingTime }
      });
      
      // Record successful processing with shop domain
      metricsService.recordEventProcessed(shopDomain, processingTime);
      
      // Update queue size metric
      metricsService.updateQueueSize(this.queue.length);
    } catch (error) {
      event.retries += 1;
      const processingTime = Date.now() - startTime;
      
      logger.error(`Failed to process event ${event.id} (original event ID: ${event.eventId}) (attempt ${event.retries}/${this.MAX_RETRIES})`, {
        context: 'EventQueue',
        error: error as Error,
        metadata: { eventType: event.eventType, storeId: event.storeId, eventId: event.eventId, shopDomain, processingTime, retries: event.retries }
      });
      
      // Record failed processing with shop domain
      metricsService.recordEventFailed(shopDomain);
      metricsService.recordEventRetried(shopDomain);
      
      // If max retries reached, log as failed
      if (event.retries >= this.MAX_RETRIES) {
        logger.error(`Event ${event.id} (original event ID: ${event.eventId}) failed after ${this.MAX_RETRIES} attempts, marking as failed`, {
          context: 'EventQueue',
          metadata: { eventType: event.eventType, storeId: event.storeId, eventId: event.eventId, shopDomain }
        });
        // TODO: Implement dead letter queue or failed event storage
      } else {
        // Schedule next retry
        event.nextRetryAt = new Date(Date.now() + this.RETRY_DELAY * Math.pow(2, event.retries - 1)); // Exponential backoff
      }
    }
  }

  // Requeue failed events with scheduled retry times
  private requeueFailedEvents(): void {
    const now = new Date();
    const readyToRetry = this.queue.filter(event => 
      event.nextRetryAt && event.nextRetryAt <= now
    );

    if (readyToRetry.length > 0) {
      logger.debug(`Requeueing ${readyToRetry.length} events for retry`, { context: 'EventQueue' });
      // Move ready-to-retry events to front of queue
      this.queue = [...readyToRetry, ...this.queue.filter(event => 
        !readyToRetry.some(retryEvent => retryEvent.id === event.id)
      )];
      
      // Update queue size metric
      metricsService.updateQueueSize(this.queue.length);
    }
  }

  // Get queue statistics
  getStats(): {
    totalEvents: number;
    pendingEvents: number;
    readyToRetry: number;
  } {
    const now = new Date();
    const readyToRetry = this.queue.filter(event => 
      event.nextRetryAt && event.nextRetryAt <= now
    ).length;

    return {
      totalEvents: this.queue.length,
      pendingEvents: this.queue.length - readyToRetry,
      readyToRetry
    };
  }
}

export default new EventQueue();