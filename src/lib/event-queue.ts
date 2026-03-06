import logger from '../utils/logger';
import aiCoreService from './ai-core-service';
import metricsService from './metrics-service';

interface QueuedEvent {
  id: string;
  eventId: string;
  storeId: string;
  eventType: string;
  payload: any;
  source?: string;
  createdAt: string;
  retries: number;
  nextRetryAt?: string;
}

class EventQueue {
  private client: any = null;
  private readonly QUEUE_NAME = 'webhook-events';
  private readonly DLQ_NAME = 'webhook-dlq';
  private readonly MAX_RETRIES: number = 5;
  private readonly RETRY_DELAY: number = 60000;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private redisAvailable: boolean = false;
  private memoryQueue: QueuedEvent[] = [];
  private memoryDLQ: QueuedEvent[] = [];

  constructor() {
    this.initializeRedis();
    this.processingInterval = setInterval(() => this.processQueue(), 5000);
    logger.info('EventQueue initialized', { context: 'EventQueue' });
  }

  private initializeRedis(): void {
    try {
      const { createClient } = require('redis');
      
      const redisHost = process.env.REDIS_CLOUD_HOST;
      const redisPort = parseInt(process.env.REDIS_CLOUD_PORT || '6379');
      const redisUsername = process.env.REDIS_CLOUD_USERNAME;
      const redisPassword = process.env.REDIS_CLOUD_PASSWORD;
      
      let clientConfig: any;
      
      if (redisHost && redisPassword) {
        logger.info('Using Redis Cloud configuration', { context: 'EventQueue' });
        clientConfig = {
          socket: {
            host: redisHost,
            port: redisPort,
          },
          username: redisUsername || 'default',
          password: redisPassword,
          database: 0,
          disableOfflineQueue: false,
        };
      } else {
        logger.info('Using local Redis configuration (fallback)', { context: 'EventQueue' });
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        clientConfig = {
          url: redisUrl
        };
        
        const localRedisPassword = process.env.REDIS_PASSWORD;
        if (localRedisPassword) {
          clientConfig.password = localRedisPassword;
        }
      }
      
      this.client = createClient(clientConfig);
      this.redisAvailable = true;
      
      this.client.on('error', (err: Error) => {
        logger.error('Redis Client Error', { context: 'EventQueue', error: err });
      });
      
      this.client.on('connect', () => {
        logger.info('Redis connected', { context: 'EventQueue' });
      });
      
      this.client.on('ready', () => {
        logger.info('Redis ready', { context: 'EventQueue' });
      });

      logger.info('EventQueue initialized with Redis backend', { context: 'EventQueue' });
    } catch (error) {
      logger.warn('Redis not available, using in-memory queue (not recommended for production)', { 
        context: 'EventQueue',
        error: error as Error 
      });
      this.redisAvailable = false;
    }
  }

  private async connect(): Promise<void> {
    if (!this.redisAvailable || !this.client) {
      return;
    }
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async enqueue(event: {
    eventId: string;
    storeId: string;
    eventType: string;
    payload: any;
    source?: string;
  }): Promise<void> {
    const queuedEvent: QueuedEvent = {
      id: `${event.eventType}-${event.storeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId: event.eventId,
      storeId: event.storeId,
      eventType: event.eventType,
      payload: event.payload,
      source: event.source,
      createdAt: new Date().toISOString(),
      retries: 0
    };

    if (this.redisAvailable && this.client) {
      try {
        await this.connect();
        await this.client.lPush(this.QUEUE_NAME, JSON.stringify(queuedEvent));
        logger.debug('Event added to Redis queue', {
          context: 'EventQueue',
          metadata: { eventId: queuedEvent.id, eventType: queuedEvent.eventType, storeId: queuedEvent.storeId }
        });
      } catch (error) {
        logger.error('Failed to add event to Redis, falling back to memory queue', {
          context: 'EventQueue',
          error: error as Error
        });
        this.memoryQueue.push(queuedEvent);
      }
    } else {
      this.memoryQueue.push(queuedEvent);
      logger.debug('Event added to memory queue', {
        context: 'EventQueue',
        metadata: { eventId: queuedEvent.id, eventType: queuedEvent.eventType, storeId: queuedEvent.storeId }
      });
    }
    
    const queueSize = await this.getQueueSize();
    metricsService.updateQueueSize(queueSize);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    try {
      const queueSize = await this.getQueueSize();
      
      if (queueSize === 0) {
        this.isProcessing = false;
        return;
      }
      
      logger.debug(`Processing events from queue (size: ${queueSize})`, { context: 'EventQueue' });

      const batchSize = Math.min(10, queueSize);
      const eventsToProcess: QueuedEvent[] = [];
      
      if (this.redisAvailable && this.client) {
        await this.connect();
        for (let i = 0; i < batchSize; i++) {
          const result = await this.client.rPop(this.QUEUE_NAME);
          if (result) {
            eventsToProcess.push(JSON.parse(result));
          }
        }
      } else {
        for (let i = 0; i < batchSize && this.memoryQueue.length > 0; i++) {
          const event = this.memoryQueue.shift();
          if (event) {
            eventsToProcess.push(event);
          }
        }
      }
      
      if (eventsToProcess.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      const results = await Promise.allSettled(
        eventsToProcess.map(event => this.processEvent(event))
      );
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const event = eventsToProcess[i];
        
        if (result.status === 'rejected') {
          event.retries += 1;
          
          if (event.retries >= this.MAX_RETRIES) {
            if (this.redisAvailable && this.client) {
              await this.client.lPush(this.DLQ_NAME, JSON.stringify(event));
            } else {
              this.memoryDLQ.push(event);
            }
            logger.error(`Event ${event.id} moved to DLQ after ${this.MAX_RETRIES} failures`, {
              context: 'EventQueue',
              metadata: { eventId: event.eventId, storeId: event.storeId, eventType: event.eventType }
            });
          } else {
            event.nextRetryAt = new Date(Date.now() + this.RETRY_DELAY * Math.pow(2, event.retries - 1)).toISOString();
            if (this.redisAvailable && this.client) {
              await this.client.lPush(this.QUEUE_NAME, JSON.stringify(event));
            } else {
              this.memoryQueue.push(event);
            }
            logger.warn(`Event ${event.id} requeued for retry ${event.retries}/${this.MAX_RETRIES}`, {
              context: 'EventQueue',
              metadata: { eventId: event.eventId, storeId: event.storeId, retries: event.retries }
            });
          }
        }
      }
      
      const newQueueSize = await this.getQueueSize();
      metricsService.updateQueueSize(newQueueSize);
      
    } catch (error) {
      logger.error('Error processing event queue', {
        context: 'EventQueue',
        error: error as Error
      });
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(event: QueuedEvent): Promise<void> {
    const startTime = Date.now();
    let shopDomain = '';
    
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
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
      
      metricsService.recordEventProcessed(shopDomain, processingTime);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error(`Failed to process event ${event.id} (original event ID: ${event.eventId})`, {
        context: 'EventQueue',
        error: error as Error,
        metadata: { eventType: event.eventType, storeId: event.storeId, eventId: event.eventId, shopDomain, processingTime }
      });
      
      metricsService.recordEventFailed(shopDomain);
      metricsService.recordEventRetried(shopDomain);
      
      throw error;
    }
  }

  async getQueueSize(): Promise<number> {
    if (this.redisAvailable && this.client) {
      await this.connect();
      return await this.client.lLen(this.QUEUE_NAME);
    }
    return this.memoryQueue.length;
  }

  async getDLQSize(): Promise<number> {
    if (this.redisAvailable && this.client) {
      await this.connect();
      return await this.client.lLen(this.DLQ_NAME);
    }
    return this.memoryDLQ.length;
  }

  async getStats(): Promise<{
    totalEvents: number;
    deadLetterQueue: number;
  }> {
    const [totalEvents, deadLetterQueue] = await Promise.all([
      this.getQueueSize(),
      this.getDLQSize()
    ]);

    return {
      totalEvents,
      deadLetterQueue
    };
  }

  async shutdown(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    
    if (this.redisAvailable && this.client && this.client.isOpen) {
      await this.client.quit();
    }
    
    logger.info('EventQueue shut down gracefully', { context: 'EventQueue' });
  }
}

export default new EventQueue();
