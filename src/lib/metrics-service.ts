// Metrics service for tracking event processing performance

import logger from '@/utils/logger';

interface Metrics {
  eventsReceived: number;
  eventsProcessed: number;
  eventsFailed: number;
  eventsRetried: number;
  avgProcessingTime: number;
  queueSize: number;
  duplicateEventsDetected: number;
  recoveredRevenue: number;
  messagesSent: number;
  activeCampaigns: number;
  roi: number;
  startTime: Date;
}

interface StoreMetrics {
  [shopDomain: string]: Metrics;
}

interface StoreProcessingTimes {
  [shopDomain: string]: number[];
}

class MetricsService {
  private globalMetrics: Metrics;
  private storeMetrics: StoreMetrics = {};
  private globalProcessingTimes: number[] = [];
  private storeProcessingTimes: StoreProcessingTimes = {};
  private readonly MAX_PROCESSING_TIMES: number = 1000;

  constructor() {
    this.globalMetrics = this.createEmptyMetrics();
    logger.info('MetricsService initialized', { context: 'MetricsService' });
  }

  private createEmptyMetrics(): Metrics {
    return {
      eventsReceived: 0,
      eventsProcessed: 0,
      eventsFailed: 0,
      eventsRetried: 0,
      avgProcessingTime: 0,
      queueSize: 0,
      duplicateEventsDetected: 0,
      recoveredRevenue: 0,
      messagesSent: 0,
      activeCampaigns: 0,
      roi: 0,
      startTime: new Date()
    };
  }

  private getOrCreateStoreMetrics(shopDomain: string): Metrics {
    if (!this.storeMetrics[shopDomain]) {
      this.storeMetrics[shopDomain] = this.createEmptyMetrics();
      this.storeProcessingTimes[shopDomain] = [];
    }
    return this.storeMetrics[shopDomain];
  }

  // Record an event being received
  recordEventReceived(shopDomain: string): void {
    this.globalMetrics.eventsReceived++;
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.eventsReceived++;
  }

  // Record a successful event processing
  recordEventProcessed(shopDomain: string, processingTime: number): void {
    this.globalMetrics.eventsProcessed++;
    this.addProcessingTime('global', processingTime);
    this.updateAverageProcessingTime('global');

    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.eventsProcessed++;
    this.addProcessingTime(shopDomain, processingTime);
    this.updateAverageProcessingTime(shopDomain);
  }

  // Record a failed event processing
  recordEventFailed(shopDomain: string): void {
    this.globalMetrics.eventsFailed++;
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.eventsFailed++;
  }

  // Record a retry attempt
  recordEventRetried(shopDomain: string): void {
    this.globalMetrics.eventsRetried++;
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.eventsRetried++;
  }

  // Record a duplicate event detection
  recordDuplicateEvent(shopDomain: string): void {
    this.globalMetrics.duplicateEventsDetected++;
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.duplicateEventsDetected++;
  }

  // Record recovered revenue
  recordRecoveredRevenue(shopDomain: string, amount: number): void {
    this.globalMetrics.recoveredRevenue += amount;
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.recoveredRevenue += amount;
  }

  // Record sent message
  recordMessageSent(shopDomain: string): void {
    this.globalMetrics.messagesSent++;
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.messagesSent++;
  }

  // Update active campaigns count
  updateActiveCampaigns(shopDomain: string, count: number): void {
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.activeCampaigns = count;
  }

  // Update ROI
  updateROI(shopDomain: string, roi: number): void {
    const storeMetrics = this.getOrCreateStoreMetrics(shopDomain);
    storeMetrics.roi = roi;
  }

  // Update queue size
  updateQueueSize(size: number): void {
    this.globalMetrics.queueSize = size;
  }

  // Add processing time to the history
  private addProcessingTime(shopDomain: string, time: number): void {
    const timesArray = shopDomain === 'global' ? this.globalProcessingTimes : this.storeProcessingTimes[shopDomain];
    timesArray.push(time);
    // Keep only the last MAX_PROCESSING_TIMES entries
    if (timesArray.length > this.MAX_PROCESSING_TIMES) {
      timesArray.shift();
    }
  }

  // Calculate average processing time
  private updateAverageProcessingTime(shopDomain: string): void {
    const metrics = shopDomain === 'global' ? this.globalMetrics : this.getOrCreateStoreMetrics(shopDomain);
    const timesArray = shopDomain === 'global' ? this.globalProcessingTimes : this.storeProcessingTimes[shopDomain];

    if (timesArray.length === 0) {
      metrics.avgProcessingTime = 0;
      return;
    }

    const sum = timesArray.reduce((total, time) => total + time, 0);
    metrics.avgProcessingTime = sum / timesArray.length;
  }

  // Get global metrics
  getMetrics(): Metrics {
    return { ...this.globalMetrics };
  }

  // Get metrics for a specific store
  getStoreMetrics(shopDomain: string): Metrics {
    return { ...this.getOrCreateStoreMetrics(shopDomain) };
  }

  // Get metrics from backend API for a specific store
  async getDatabaseMetrics(shopDomain: string): Promise<Metrics> {
    try {
      // Get store from backend API to validate existence
      const backendUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
      const storeResponse = await fetch(`${backendUrl}/api/v1/stores/domain/${shopDomain}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!storeResponse.ok) {
        logger.warn('Store not found when fetching database metrics', {
          context: 'MetricsService',
          metadata: { shopDomain, statusCode: storeResponse.status }
        });
        return this.getStoreMetrics(shopDomain);
      }

      const store = await storeResponse.json();
      
      // Fetch actual metrics from backend API
      const metricsResponse = await fetch(`${backendUrl}/api/v1/analytics/metrics/${store.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!metricsResponse.ok) {
        logger.warn('Failed to fetch metrics from backend API, using in-memory metrics', {
          context: 'MetricsService',
          metadata: { shopDomain, storeId: store.id, statusCode: metricsResponse.status }
        });
        return this.getStoreMetrics(shopDomain);
      }

      const backendMetrics = await metricsResponse.json();
      
      // Map backend metrics to our metrics format
      const metrics = this.getStoreMetrics(shopDomain);
      
      // Update with actual backend values where available
      metrics.eventsReceived = backendMetrics.eventsReceived || metrics.eventsReceived;
      metrics.eventsProcessed = backendMetrics.eventsProcessed || metrics.eventsProcessed;
      metrics.eventsFailed = backendMetrics.eventsFailed || metrics.eventsFailed;
      metrics.eventsRetried = backendMetrics.eventsRetried || metrics.eventsRetried;
      metrics.avgProcessingTime = backendMetrics.avgProcessingTime || metrics.avgProcessingTime;
      metrics.duplicateEventsDetected = backendMetrics.duplicateEventsDetected || metrics.duplicateEventsDetected;
      metrics.recoveredRevenue = backendMetrics.recoveredRevenue || metrics.recoveredRevenue;
      metrics.messagesSent = backendMetrics.messagesSent || metrics.messagesSent;
      metrics.activeCampaigns = backendMetrics.activeCampaigns || metrics.activeCampaigns;
      metrics.roi = backendMetrics.roi || metrics.roi;
      
      return metrics;
    } catch (error) {
      logger.error('Error fetching database metrics', { 
        context: 'MetricsService', 
        error: error as Error,
        metadata: { shopDomain }
      });
      // Return in-memory metrics as fallback
      return this.getStoreMetrics(shopDomain);
    }
  }

  // Get formatted metrics for monitoring
  getFormattedMetrics(): string {
    const metrics = this.getMetrics();
    const uptime = Math.floor((Date.now() - metrics.startTime.getTime()) / 1000);
    
    return `
AI Revenue Agent Metrics:
----------------------------------------
Events Received: ${metrics.eventsReceived}
Events Processed: ${metrics.eventsProcessed}
Events Failed: ${metrics.eventsFailed}
Events Retried: ${metrics.eventsRetried}
Duplicate Events Detected: ${metrics.duplicateEventsDetected}
Queue Size: ${metrics.queueSize}
Average Processing Time: ${metrics.avgProcessingTime.toFixed(2)}ms
Recovered Revenue: $${metrics.recoveredRevenue.toFixed(2)}
Messages Sent: ${metrics.messagesSent}
Active Campaigns: ${metrics.activeCampaigns}
ROI: ${metrics.roi}x
Uptime: ${uptime} seconds
----------------------------------------
`;
  }

  // Reset metrics (for testing purposes)
  reset(): void {
    this.globalMetrics = this.createEmptyMetrics();
    this.storeMetrics = {};
    this.globalProcessingTimes = [];
    this.storeProcessingTimes = {};
    logger.info('Metrics reset', { context: 'MetricsService' });
  }
}

export default new MetricsService();