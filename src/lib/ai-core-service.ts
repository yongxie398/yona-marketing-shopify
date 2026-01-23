// Service for communicating with the Core AI Service
import logger from '../utils/logger';

// Event types
interface AICoreEvent {
  event_type: string;
  customer_id?: string;
  store_id: string;
  occurred_at: string;
  properties: {
    [key: string]: any;
  };
}

// Shop types
interface ShopRegisterRequest {
  name: string;
  tenant_id: string;
  platform_store_id: string;
  shopify_domain: string;
  shopify_api_key: string;
  shopify_access_token: string;
}

interface Shop {
  id: string;
  name: string;
  tenant_id: string;
  platform_store_id: string;
  shopify_domain: string;
  shopify_api_key: string;
  created_at: string;
  updated_at: string;
}

// Message types
interface MessageCreateRequest {
  recipient_id: string;
  content_template_id: string;
  channel: string;
  status: string;
  store_id: string;
}

interface Message {
  id: string;
  recipient_id: string;
  content_template_id: string;
  channel: string;
  status: string;
  store_id: string;
  created_at: string;
  updated_at: string;
}

interface MessageSendResponse {
  message_id: string;
  status: string;
}

// Analytics types
interface RevenueAnalytics {
  store_id: string;
  period: string;
  total_revenue: number;
  attributed_revenue: number;
  baseline_revenue: number;
  revenue_lift: number;
  attribution_rate: number;
  top_performing_campaigns: Array<{
    campaign_id: string;
    revenue: number;
    attribution_rate: number;
  }>;
  generated_at: string;
}

interface RevenueAttribution {
  [key: string]: any;
}

// AI types
interface AIContext {
  id: string;
  store_id: string;
  customer_id: string;
  context_data: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

interface AIContextCreateRequest {
  store_id: string;
  customer_id: string;
  context_data: {
    [key: string]: any;
  };
}

interface AIDecision {
  id: string;
  store_id: string;
  customer_id: string;
  event_id: string;
  decision_type: string;
  campaign_type: string;
  content_generated: boolean;
  scheduled_at: string;
  executed_at?: string;
  revenue_impact?: number;
  created_at: string;
  updated_at: string;
}

interface AIDecisionCreateRequest {
  store_id: string;
  customer_id: string;
  event_id: string;
  decision_type: string;
  campaign_type: string;
  content_generated: boolean;
  scheduled_at: string;
}

interface FatigueState {
  id: string;
  store_id: string;
  customer_id: string;
  state: {
    [key: string]: any;
  };
  updated_at: string;
}

interface FatigueStateUpdateRequest {
  store_id: string;
  customer_id: string;
  state: {
    [key: string]: any;
  };
}

// System types
interface SystemHealth {
  status: string;
}

interface DatabaseStatus {
  health: string;
  table_counts: {
    [table: string]: number;
  };
}

interface SystemConfig {
  [key: string]: any;
}

interface AnalyticsOverview {
  [key: string]: any;
}

class AICoreService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    const baseUrl = process.env.CORE_AI_SERVICE_URL || 'http://localhost:8000';
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl + 'api/v1' : baseUrl + '/api/v1';
    this.apiKey = process.env.CORE_AI_SERVICE_API_KEY || '';
  }

  // Forward Shopify events to Core AI Service
  async forwardEvent(event: AICoreEvent): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AICoreService: ${errorData.detail || errorData.message || response.statusText}`);
      }

      logger.info('Event forwarded to Core AI Service successfully', {
        context: 'AICoreService',
        metadata: { event_type: event.event_type, store_id: event.store_id }
      });
    } catch (error) {
      logger.error('Error forwarding event to Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { event_type: event.event_type, store_id: event.store_id }
      });
      // Don't throw - this shouldn't crash the entire app
    }
  }

  // Register a new store with the Core AI Service
  async registerStore(store: {
    id: string;
    domain: string;
    name: string;
    platform_store_id?: string; // Optional platform-specific store ID
    config: any;
  }): Promise<any> {
    try {
      // Follow the new shop registration instructions:
      // - Omit tenant_id unless we're certain it exists
      // - Let the system automatically create or associate tenant
      // - Include platform and other required fields
      const response = await fetch(`${this.baseUrl}/shops/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          name: store.name,
          platform: 'shopify',
          platform_store_id: store.platform_store_id || store.id,
          domain: store.domain, // Core AI Service expects 'domain', not 'shopify_domain'
          currency: 'USD', // Default currency as expected by Core AI Service
          brand_tone: store.config?.brand_tone, // Use brand_tone from config as brand_tone
          frequency_caps: store.config?.frequency_caps || { daily: 1, weekly: 3 }, // Default frequency caps
          status: store.config?.status || 'active', // Default status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AICoreService: ${errorData.detail || errorData.message || response.statusText}`);
      }

      const storeData = await response.json();
      logger.info('Store registered with Core AI Service successfully', {
        context: 'AICoreService',
        metadata: { 
          shop_domain: store.domain, 
          store_id: store.id,
          tenant_id: storeData.tenant_id
        }
      });
      
      return storeData;
    } catch (error) {
      logger.error('Error registering store with Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { shop_domain: store.domain }
      });
      // Don't throw - this shouldn't crash the entire app
    }
  }

  // Get store metrics from Core AI Service
  async getStoreMetrics(storeId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/revenue/${storeId}`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get metrics: ${errorData.detail || response.statusText}`);
      }

      const metrics = await response.json();
      logger.info('Fetched store metrics from Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: storeId }
      });
      return metrics;
    } catch (error) {
      logger.error('Error getting store metrics from Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: storeId }
      });
      return null;
    }
  }

  // Send a message to a customer via Core AI Service
  async sendMessage(params: {
    storeId: string;
    customerId: string;
    messageType: string;
    content: any;
  }): Promise<MessageSendResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          recipient_id: params.customerId,
          content_template_id: params.content?.templateId || 'default',
          channel: params.messageType,
          status: 'pending',
          store_id: params.storeId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send message: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json() as MessageSendResponse;
      logger.info('Message sent via Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: params.storeId, customer_id: params.customerId, message_type: params.messageType }
      });
      return result;
    } catch (error) {
      logger.error('Error sending message via Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: params.storeId, customer_id: params.customerId }
      });
      return null;
    }
  }

  // Create a new message
  async createMessage(request: MessageCreateRequest): Promise<Message | null> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create message: ${errorData.detail || response.statusText}`);
      }

      const message = await response.json() as Message;
      logger.info('Message created via Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: request.store_id, message_id: message.id }
      });
      return message;
    } catch (error) {
      logger.error('Error creating message via Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: request.store_id }
      });
      return null;
    }
  }

  // Get revenue attribution details
  async getRevenueAttribution(): Promise<RevenueAttribution | null> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/revenue-attribution`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get revenue attribution: ${errorData.detail || response.statusText}`);
      }

      const attribution = await response.json() as RevenueAttribution;
      logger.info('Fetched revenue attribution from Core AI Service', {
        context: 'AICoreService',
      });
      return attribution;
    } catch (error) {
      logger.error('Error getting revenue attribution from Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
      });
      return null;
    }
  }

  // Create AI context for decision making
  async createAIContext(request: AIContextCreateRequest): Promise<AIContext | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/contexts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create AI context: ${errorData.detail || response.statusText}`);
      }

      const context = await response.json() as AIContext;
      logger.info('AI context created via Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: request.store_id, customer_id: request.customer_id }
      });
      return context;
    } catch (error) {
      logger.error('Error creating AI context via Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: request.store_id, customer_id: request.customer_id }
      });
      return null;
    }
  }

  // Create AI decision
  async createAIDecision(request: AIDecisionCreateRequest): Promise<AIDecision | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/decisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create AI decision: ${errorData.detail || response.statusText}`);
      }

      const decision = await response.json() as AIDecision;
      logger.info('AI decision created via Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: request.store_id, customer_id: request.customer_id }
      });
      return decision;
    } catch (error) {
      logger.error('Error creating AI decision via Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: request.store_id, customer_id: request.customer_id }
      });
      return null;
    }
  }

  // Update fatigue state for a customer
  async updateFatigueState(request: FatigueStateUpdateRequest): Promise<FatigueState | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/fatigue-state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update fatigue state: ${errorData.detail || response.statusText}`);
      }

      const fatigueState = await response.json() as FatigueState;
      logger.info('Fatigue state updated via Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: request.store_id, customer_id: request.customer_id }
      });
      return fatigueState;
    } catch (error) {
      logger.error('Error updating fatigue state via Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: request.store_id, customer_id: request.customer_id }
      });
      return null;
    }
  }

  // Get fatigue state for a customer
  async getFatigueState(storeId: string, customerId: string): Promise<FatigueState | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/fatigue-state/${storeId}/${customerId}`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get fatigue state: ${errorData.detail || response.statusText}`);
      }

      const fatigueState = await response.json() as FatigueState;
      logger.info('Fatigue state fetched via Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: storeId, customer_id: customerId }
      });
      return fatigueState;
    } catch (error) {
      logger.error('Error getting fatigue state via Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: storeId, customer_id: customerId }
      });
      return null;
    }
  }

  // Health check endpoint
  async getHealthStatus(): Promise<SystemHealth | null> {
    try {
      const response = await fetch(`${this.baseUrl}/system/health`);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const health = await response.json() as SystemHealth;
      logger.info('Health check performed', {
        context: 'AICoreService',
        metadata: { status: health.status }
      });
      return health;
    } catch (error) {
      logger.error('Error performing health check', {
        context: 'AICoreService',
        error: error as Error,
      });
      return null;
    }
  }

  // Database connection status
  async getDatabaseStatus(): Promise<DatabaseStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/system/database-status`);

      if (!response.ok) {
        throw new Error(`Database status check failed: ${response.statusText}`);
      }

      const status = await response.json() as DatabaseStatus;
      logger.info('Database status check performed', {
        context: 'AICoreService',
        metadata: { health: status.health }
      });
      return status;
    } catch (error) {
      logger.error('Error performing database status check', {
        context: 'AICoreService',
        error: error as Error,
      });
      return null;
    }
  }

  // System configuration information
  async getSystemConfig(): Promise<SystemConfig | null> {
    try {
      const response = await fetch(`${this.baseUrl}/system/config`);

      if (!response.ok) {
        throw new Error(`Failed to get system config: ${response.statusText}`);
      }

      const config = await response.json() as SystemConfig;
      logger.info('System config fetched', {
        context: 'AICoreService',
      });
      return config;
    } catch (error) {
      logger.error('Error getting system config', {
        context: 'AICoreService',
        error: error as Error,
      });
      return null;
    }
  }

  // Analytics overview metrics
  async getAnalyticsOverview(): Promise<AnalyticsOverview | null> {
    try {
      const response = await fetch(`${this.baseUrl}/system/analytics/overview`);

      if (!response.ok) {
        throw new Error(`Failed to get analytics overview: ${response.statusText}`);
      }

      const overview = await response.json() as AnalyticsOverview;
      logger.info('Analytics overview fetched', {
        context: 'AICoreService',
      });
      return overview;
    } catch (error) {
      logger.error('Error getting analytics overview', {
        context: 'AICoreService',
        error: error as Error,
      });
      return null;
    }
  }

  // Get complete API specification
  async getApiSpec(): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api-spec`);

      if (!response.ok) {
        throw new Error(`Failed to get API spec: ${response.statusText}`);
      }

      const spec = await response.json();
      logger.info('API spec fetched', {
        context: 'AICoreService',
      });
      return spec;
    } catch (error) {
      logger.error('Error getting API spec', {
        context: 'AICoreService',
        error: error as Error,
      });
      return null;
    }
  }

  // Get campaign performance metrics
  async getCampaignPerformance(storeId: string): Promise<any[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/campaign-performance/${storeId}`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get campaign performance: ${errorData.detail || response.statusText}`);
      }

      const performance = await response.json();
      logger.info('Fetched campaign performance from Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: storeId }
      });
      return performance;
    } catch (error) {
      logger.error('Error getting campaign performance from Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: storeId }
      });
      return null;
    }
  }

  // Get next AI actions
  async getNextActions(storeId: string): Promise<string[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/next-actions/${storeId}`, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get next actions: ${errorData.detail || response.statusText}`);
      }

      const actions = await response.json();
      logger.info('Fetched next AI actions from Core AI Service', {
        context: 'AICoreService',
        metadata: { store_id: storeId }
      });
      return actions;
    } catch (error) {
      logger.error('Error getting next AI actions from Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: storeId }
      });
      return null;
    }
  }

  // Remove store from Core AI Service (for GDPR compliance)
  async removeStore(storeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/shops/${storeId}/uninstall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        // Handle the 404 case before trying to parse JSON
        if (response.status === 404) {
          logger.info('Store not found in Core AI Service during uninstallation (may have never been registered)', {
            context: 'AICoreService',
            metadata: { store_id: storeId }
          });
          return; // Consider this a success - the store doesn't exist there anyway
        }
        
        // Attempt to parse JSON error response, fallback to status text if not JSON
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, use status text
          throw new Error(`AICoreService: ${response.statusText}`);
        }
        
        throw new Error(`AICoreService: ${errorData.detail || errorData.message || response.statusText}`);
      }

      logger.info('Store removed from Core AI Service successfully', {
        context: 'AICoreService',
        metadata: { store_id: storeId }
      });
    } catch (error) {
      logger.error('Error removing store from Core AI Service', {
        context: 'AICoreService',
        error: error as Error,
        metadata: { store_id: storeId }
      });
      // Re-throw the error so callers can handle failure appropriately
      throw error;
    }
  }
}

export default new AICoreService();