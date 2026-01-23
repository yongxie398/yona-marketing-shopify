// Tests for AICoreService
import aiCoreService from './ai-core-service';
import logger from '@/utils/logger';

// Mock the logger
jest.mock('@/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

describe('AICoreService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (fetch as jest.Mock).mockClear();
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  describe('forwardEvent', () => {
    test('should forward events to Core AI Service successfully', async () => {
      // Arrange
      const mockEvent = {
        event_type: 'test_event',
        customer_id: 'test-customer-456',
        store_id: 'test-store-123',
        occurred_at: new Date().toISOString(),
        properties: { test: 'data' },
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      
      // Act
      await aiCoreService.forwardEvent(mockEvent);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/events',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: JSON.stringify(mockEvent),
        }
      );
      
      expect(logger.info).toHaveBeenCalledWith(
        'Event forwarded to Core AI Service successfully',
        expect.objectContaining({
          context: 'AICoreService',
          metadata: { event_type: mockEvent.event_type, store_id: mockEvent.store_id },
        })
      );
    });

    test('should handle errors when forwarding events', async () => {
      // Arrange
      const mockEvent = {
        event_type: 'test_event',
        customer_id: 'test-customer-456',
        store_id: 'test-store-123',
        occurred_at: new Date().toISOString(),
        properties: { test: 'data' },
      };
      
      const errorMessage = 'Internal Server Error';
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: errorMessage }),
        statusText: errorMessage,
      });
      
      // Act
      await aiCoreService.forwardEvent(mockEvent);
      
      // Assert
      expect(fetch).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'Error forwarding event to Core AI Service',
        expect.objectContaining({
          context: 'AICoreService',
          error: expect.any(Error),
          metadata: expect.any(Object),
        })
      );
    });
  });

  describe('registerStore', () => {
    test('should register stores with Core AI Service successfully', async () => {
      // Arrange
      const mockStore = {
        id: 'test-store-123',
        domain: 'test.myshopify.com',
        name: 'Test Shop',
        platform_store_id: 'shopify-123',
        config: { api_version: '2023-10' },
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      
      // Act
      await aiCoreService.registerStore(mockStore);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/shops/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: expect.any(String),
        }
      );
      
      // Verify the request body contains the expected values
      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.name).toBe(mockStore.name);
      expect(requestBody.platform_store_id).toBe(mockStore.platform_store_id);
      expect(requestBody.shopify_domain).toBe(mockStore.domain);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Store registered with Core AI Service successfully',
        expect.objectContaining({
          context: 'AICoreService',
          metadata: { shop_domain: mockStore.domain, store_id: mockStore.id },
        })
      );
    });
  });

  describe('getStoreMetrics', () => {
    test('should get store metrics successfully', async () => {
      // Arrange
      const storeId = 'test-store-123';
      const mockMetrics = {
        store_id: storeId,
        period: 'month',
        total_revenue: 15000.00,
        attributed_revenue: 8500.00,
        baseline_revenue: 6500.00,
        revenue_lift: 2000.00,
        attribution_rate: 56.67,
        top_performing_campaigns: [],
        generated_at: new Date().toISOString(),
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMetrics),
      });
      
      // Act
      const result = await aiCoreService.getStoreMetrics(storeId);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/analytics/revenue/' + storeId,
        {
          headers: {
            'X-API-Key': 'test_core_ai_key',
          },
        }
      );
      
      expect(result).toEqual(mockMetrics);
      expect(logger.info).toHaveBeenCalled();
    });

    test('should return null when metrics fetch fails', async () => {
      // Arrange
      const storeId = 'test-store-123';
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: 'Not Found' }),
        statusText: 'Not Found',
      });
      
      // Act
      const result = await aiCoreService.getStoreMetrics(storeId);
      
      // Assert
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    test('should send messages successfully', async () => {
      // Arrange
      const mockParams = {
        storeId: 'test-store-123',
        customerId: 'test-customer-456',
        messageType: 'email',
        content: { subject: 'Test Subject', body: 'Test Body' },
      };
      
      const mockResult = {
        message_id: 'test-message-789',
        status: 'sent',
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResult),
      });
      
      // Act
      const result = await aiCoreService.sendMessage(mockParams);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/messages/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: JSON.stringify({
            recipient_id: mockParams.customerId,
            content_template_id: 'default',
            channel: mockParams.messageType,
            status: 'pending',
            store_id: mockParams.storeId,
          }),
        }
      );
      
      expect(result).toEqual(mockResult);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('createMessage', () => {
    test('should create messages successfully', async () => {
      // Arrange
      const mockMessageRequest = {
        recipient_id: 'test-customer-456',
        content_template_id: 'template-123',
        channel: 'email',
        status: 'pending',
        store_id: 'test-store-123',
      };
      
      const mockMessage = {
        id: 'test-message-789',
        ...mockMessageRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMessage),
      });
      
      // Act
      const result = await aiCoreService.createMessage(mockMessageRequest);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: JSON.stringify(mockMessageRequest),
        }
      );
      
      expect(result).toEqual(mockMessage);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getRevenueAttribution', () => {
    test('should get revenue attribution successfully', async () => {
      // Arrange
      const mockAttribution = {
        total: 10000,
        channels: {
          email: 6000,
          sms: 4000,
        },
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAttribution),
      });
      
      // Act
      const result = await aiCoreService.getRevenueAttribution();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/analytics/revenue-attribution',
        {
          headers: {
            'X-API-Key': 'test_core_ai_key',
          },
        }
      );
      
      expect(result).toEqual(mockAttribution);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('createAIContext', () => {
    test('should create AI context successfully', async () => {
      // Arrange
      const mockContextRequest = {
        store_id: 'test-store-123',
        customer_id: 'test-customer-456',
        context_data: {
          page_views: 5,
          cart_value: 100,
        },
      };
      
      const mockContext = {
        id: 'context-123',
        ...mockContextRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockContext),
      });
      
      // Act
      const result = await aiCoreService.createAIContext(mockContextRequest);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/ai/contexts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: JSON.stringify(mockContextRequest),
        }
      );
      
      expect(result).toEqual(mockContext);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('createAIDecision', () => {
    test('should create AI decision successfully', async () => {
      // Arrange
      const mockDecisionRequest = {
        store_id: 'test-store-123',
        customer_id: 'test-customer-456',
        event_id: 'event-123',
        decision_type: 'send_message',
        campaign_type: 'cart_abandonment',
        content_generated: true,
        scheduled_at: new Date().toISOString(),
      };
      
      const mockDecision = {
        id: 'decision-123',
        ...mockDecisionRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDecision),
      });
      
      // Act
      const result = await aiCoreService.createAIDecision(mockDecisionRequest);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/ai/decisions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: JSON.stringify(mockDecisionRequest),
        }
      );
      
      expect(result).toEqual(mockDecision);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('updateFatigueState', () => {
    test('should update fatigue state successfully', async () => {
      // Arrange
      const mockFatigueRequest = {
        store_id: 'test-store-123',
        customer_id: 'test-customer-456',
        state: {
          email_count: 5,
          last_sent: new Date().toISOString(),
        },
      };
      
      const mockFatigueState = {
        id: 'fatigue-123',
        ...mockFatigueRequest,
        updated_at: new Date().toISOString(),
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFatigueState),
      });
      
      // Act
      const result = await aiCoreService.updateFatigueState(mockFatigueRequest);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/ai/fatigue-state',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test_core_ai_key',
          },
          body: JSON.stringify(mockFatigueRequest),
        }
      );
      
      expect(result).toEqual(mockFatigueState);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getFatigueState', () => {
    test('should get fatigue state successfully', async () => {
      // Arrange
      const storeId = 'test-store-123';
      const customerId = 'test-customer-456';
      
      const mockFatigueState = {
        id: 'fatigue-123',
        store_id: storeId,
        customer_id: customerId,
        state: {
          email_count: 5,
          last_sent: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockFatigueState),
      });
      
      // Act
      const result = await aiCoreService.getFatigueState(storeId, customerId);
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/v1/ai/fatigue-state/${storeId}/${customerId}`,
        {
          headers: {
            'X-API-Key': 'test_core_ai_key',
          },
        }
      );
      
      expect(result).toEqual(mockFatigueState);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getHealthStatus', () => {
    test('should get health status successfully', async () => {
      // Arrange
      const mockHealth = {
        status: 'healthy',
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHealth),
      });
      
      // Act
      const result = await aiCoreService.getHealthStatus();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/system/health'
      );
      
      expect(result).toEqual(mockHealth);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getDatabaseStatus', () => {
    test('should get database status successfully', async () => {
      // Arrange
      const mockDatabaseStatus = {
        health: 'healthy',
        table_counts: {
          shops: 100,
          events: 1000,
          messages: 500,
        },
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockDatabaseStatus),
      });
      
      // Act
      const result = await aiCoreService.getDatabaseStatus();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/system/database-status'
      );
      
      expect(result).toEqual(mockDatabaseStatus);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getSystemConfig', () => {
    test('should get system config successfully', async () => {
      // Arrange
      const mockConfig = {
        version: '1.0.0',
        environment: 'development',
        features: {
          email_enabled: true,
          sms_enabled: false,
        },
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockConfig),
      });
      
      // Act
      const result = await aiCoreService.getSystemConfig();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/system/config'
      );
      
      expect(result).toEqual(mockConfig);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getAnalyticsOverview', () => {
    test('should get analytics overview successfully', async () => {
      // Arrange
      const mockOverview = {
        total_events: 10000,
        active_stores: 100,
        messages_sent: 5000,
        revenue_lift: 15000,
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOverview),
      });
      
      // Act
      const result = await aiCoreService.getAnalyticsOverview();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/system/analytics/overview'
      );
      
      expect(result).toEqual(mockOverview);
      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('getApiSpec', () => {
    test('should get API spec successfully', async () => {
      // Arrange
      const mockApiSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Core AI Service API',
          version: '1.0.0',
        },
        paths: {},
      };
      
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiSpec),
      });
      
      // Act
      const result = await aiCoreService.getApiSpec();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/api-spec'
      );
      
      expect(result).toEqual(mockApiSpec);
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
