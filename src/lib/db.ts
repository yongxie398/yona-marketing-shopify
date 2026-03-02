// Database utilities for the AI Revenue Agent for Shopify
// Connects to existing database tables

import { Pool } from 'pg';
import { Store, CommerceEvent, AIDecision, MessageExecution } from '@/types';
import { initializeDatabase } from './database';
import logger from '@/utils/logger';

// Database connection pool
let pool: Pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || '',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : undefined,
  });
  logger.info('Database connection pool created successfully', {
    context: 'DatabaseService'
  });
} catch (error) {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'yona_marketing',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });
  logger.info('Database connection pool created with fallback configuration', {
    context: 'DatabaseService'
  });
}

// Database initialization is handled by the backend service
// The Shopify app should only connect to existing database tables
console.log('Database connection established - initialization handled by backend');

export class DatabaseService {
  // Get store by domain (without status filter)
  static async getStoreByDomain(domain: string, includeInactive: boolean = false): Promise<Store | null> {
    const client = await pool.connect();
    try {
      if (includeInactive) {
        const result = await client.query(
          'SELECT id, platform_store_id, domain, name, access_token, hmac_secret, brand_tone, frequency_caps, status, created_at, config_updated_at FROM stores WHERE domain = $1',
          [domain]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
      } else {
        const result = await client.query(
          'SELECT id, platform_store_id, domain, name, access_token, hmac_secret, brand_tone, frequency_caps, status, created_at, config_updated_at FROM stores WHERE domain = $1 AND status = $2',
          [domain, 'active']
        );
        return result.rows.length > 0 ? result.rows[0] : null;
      }
    } finally {
      client.release();
    }
  }

  // Get store by ID
  static async getStoreById(id: string): Promise<Store | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, platform_store_id, domain, name, access_token, hmac_secret, brand_tone, frequency_caps, status, created_at, config_updated_at FROM stores WHERE id = $1::uuid AND status = $2',
        [id, 'active']
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  // Create store
  static async createStore(data: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO stores (domain, name, platform_store_id, access_token, hmac_secret, brand_tone, frequency_caps, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [data.domain, data.name, data.platform_store_id, data.access_token, data.hmac_secret, data.brand_tone, data.frequency_caps, data.status || 'active']
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Update store
  static async updateStore(id: string, data: Partial<Omit<Store, 'id' | 'created_at' | 'updated_at'>> & { tenant_id?: string }): Promise<Store> {
    const client = await pool.connect();
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const result = await client.query(
        `UPDATE stores SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Create commerce event
  static async createCommerceEvent(data: Omit<CommerceEvent, 'id' | 'created_at'>): Promise<CommerceEvent> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO events (store_id, event_type, customer_id, payload) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.store_id, data.event_type, data.customer_id, data.payload]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Create AI decision
  static async createAIDecision(data: Omit<AIDecision, 'id' | 'created_at'>): Promise<AIDecision> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO ai_decisions (store_id, customer_id, event_id, decision_type, campaign_type, content_generated, scheduled_at, executed_at, revenue_impact) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [data.store_id, data.customer_id, data.event_id, data.decision_type, data.campaign_type, data.content_generated, data.scheduled_at, data.executed_at, data.revenue_impact]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Create message execution
  static async createMessageExecution(data: Omit<MessageExecution, 'id' | 'created_at'>): Promise<MessageExecution> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO email_delivery_logs (decision_id, customer_id, channel, subject, content, delivery_status, delivery_response, delivered_at, opened_at, clicked_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [data.decision_id, data.customer_id, data.channel, data.subject, data.content, data.delivery_status, data.delivery_response, data.delivered_at, data.opened_at, data.clicked_at]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Get commerce events by store and date range
  static async getCommerceEvents(storeId: string, startDate: Date, endDate: Date): Promise<CommerceEvent[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM events 
         WHERE store_id = $1 AND occurred_at BETWEEN $2 AND $3 
         ORDER BY occurred_at DESC`,
        [storeId, startDate, endDate]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get AI decisions by store
  static async getAIDecisions(storeId: string): Promise<AIDecision[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM ai_decisions WHERE store_id = $1::uuid ORDER BY created_at DESC',
        [storeId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Update event processed status
  static async updateEventStatus(eventId: string, processed: boolean): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE events SET processed = $1 WHERE id = $2::uuid',
        [processed, eventId]
      );
    } finally {
      client.release();
    }
  }

  // Get database client for direct queries
  static async getClient() {
    return await pool.connect();
  }

  // Additional queries based on your existing schema
  
  // Get customer data
  static async getCustomerById(customerId: string): Promise<any | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM customers WHERE id = $1',
        [customerId]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  // Get store metrics
  static async getStoreMetrics(storeId: string): Promise<any> {
    const client = await pool.connect();
    try {
      // Get revenue attribution data
      const revenueResult = await client.query(
        `SELECT SUM(amount) as total_revenue 
         FROM revenue_attributions 
         WHERE store_id = $1::uuid AND created_at >= NOW() - INTERVAL '30 days'`,
        [storeId]
      );
      
      // Get message delivery stats
      const messageResult = await client.query(
        `SELECT COUNT(*) as messages_sent
         FROM email_delivery_logs 
         JOIN ai_decisions ON email_delivery_logs.decision_id = ai_decisions.id
         WHERE email_delivery_logs.created_at >= NOW() - INTERVAL '30 days' AND ai_decisions.store_id = $1::uuid`,
        [storeId]
      );
      
      return {
        revenue: parseFloat(revenueResult.rows[0]?.total_revenue || 0),
        messagesSent: parseInt(messageResult.rows[0]?.messages_sent || 0),
        avgOpenRate: 0, // This would come from the AI Core Service
        avgClickRate: 0, // This would come from the AI Core Service
      };
    } finally {
      client.release();
    }
  }

  // Update store status
  static async updateStoreStatus(shopDomain: string, status: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE stores SET status = $1, config_updated_at = CURRENT_TIMESTAMP WHERE domain = $2',
        [status, shopDomain]
      );
      
      logger.info(`Successfully updated store status for: ${shopDomain} to ${status}`, {
        context: 'DatabaseService',
        metadata: { shopDomain, status }
      });
    } catch (error) {
      logger.error('Error updating store status:', {
        context: 'DatabaseService',
        error: error as Error,
        metadata: { shopDomain, status }
      });
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete store and all associated data (GDPR compliance)
  static async deleteStore(shopDomain: string): Promise<void> {
    const client = await pool.connect();
    try {
      // Start a transaction
      await client.query('BEGIN');
      
      // Get store ID first to delete related records
      const storeResult = await client.query(
        'SELECT id FROM stores WHERE domain = $1',
        [shopDomain]
      );
      
      if (storeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return;
      }
      
      const storeId = storeResult.rows[0].id;
      
      // Delete related data in order (respecting foreign key constraints)
      // 1. Delete revenue attributions
      await client.query(
        'DELETE FROM revenue_attributions WHERE store_id = $1::uuid',
        [storeId]
      );
      
      // 2. Delete email delivery logs (foreign key to ai_decisions)
      await client.query(
        `DELETE FROM email_delivery_logs 
         WHERE decision_id IN (SELECT id FROM ai_decisions WHERE store_id = $1::uuid)`,
        [storeId]
      );
      
      // 3. Delete AI decisions (foreign key to events)
      await client.query(
        `DELETE FROM ai_decisions 
         WHERE event_id IN (SELECT id FROM events WHERE store_id = $1::uuid)`,
        [storeId]
      );
      
      // 4. Delete commerce events (foreign key to stores)
      await client.query(
        'DELETE FROM events WHERE store_id = $1::uuid',
        [storeId]
      );
      
      // 5. Delete customers
      await client.query(
        'DELETE FROM customers WHERE store_id = $1::uuid',
        [storeId]
      );
      
      // 6. Finally delete the store
      await client.query(
        'DELETE FROM stores WHERE id = $1::uuid',
        [storeId]
      );
      
      // Commit the transaction
      await client.query('COMMIT');
      
      logger.info('Store data deleted successfully', {
        context: 'DatabaseService',
        metadata: { shopDomain, storeId }
      });
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      logger.error('Error deleting store data:', {
        context: 'DatabaseService',
        error: error as Error,
        metadata: { shopDomain }
      });
      throw error;
    } finally {
      client.release();
    }
  }
}

export default DatabaseService;