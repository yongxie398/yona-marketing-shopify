// Database utilities for the AI Revenue Agent for Shopify
// Connects to existing database tables

import { Pool } from 'pg';
import { Store, CommerceEvent, AIDecision, MessageExecution } from '@/types';

// Database connection pool
let pool: Pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || '',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : undefined,
  });
} catch {
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'yona_marketing',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });
}

export class DatabaseService {
  // Get store by domain
  static async getStoreByDomain(domain: string): Promise<Store | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, shop_domain, shop_name, access_token, hmac_secret, brand_voice, frequency_caps, paused, created_at, updated_at FROM stores WHERE shop_domain = $1',
        [domain]
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
        `INSERT INTO stores (shop_domain, shop_name, access_token, hmac_secret, brand_voice, frequency_caps, paused) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [data.shop_domain, data.shop_name, data.access_token, data.hmac_secret, data.brand_voice, data.frequency_caps, data.paused]
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
        `INSERT INTO events (store_id, event_type, customer_id, product_ids, payload, processed) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.store_id, data.event_type, data.customer_id, data.product_ids, data.payload, data.processed]
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
  static async getCommerceEvents(storeId: number, startDate: Date, endDate: Date): Promise<CommerceEvent[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM events 
         WHERE store_id = $1 AND created_at BETWEEN $2 AND $3 
         ORDER BY created_at DESC`,
        [storeId, startDate, endDate]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Get AI decisions by store
  static async getAIDecisions(storeId: number): Promise<AIDecision[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM ai_decisions WHERE store_id = $1 ORDER BY created_at DESC',
        [storeId]
      );
      return result.rows;
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

  // Get product data
  static async getProductById(productId: string): Promise<any | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE id = $1',
        [productId]
      );
      return result.rows.length > 0 ? result.rows[0] : null;
    } finally {
      client.release();
    }
  }

  // Get store metrics
  static async getStoreMetrics(storeId: number): Promise<any> {
    const client = await pool.connect();
    try {
      // Get revenue attribution data
      const revenueResult = await client.query(
        `SELECT SUM(amount) as total_revenue 
         FROM revenue_attributions 
         WHERE store_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
        [storeId]
      );
      
      // Get message delivery stats
      const messageResult = await client.query(
        `SELECT COUNT(*) as messages_sent
         FROM email_delivery_logs 
         WHERE created_at >= NOW() - INTERVAL '30 days'`
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
}

export default DatabaseService;