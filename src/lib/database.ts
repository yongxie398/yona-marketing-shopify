// Database schema and connection for the Shopify App
import { Pool } from 'pg';

// Type definitions for our database entities
export interface Store {
  id: number;
  shop_domain: string;
  shop_name: string;
  access_token: string;
  hmac_secret: string;
  created_at: Date;
  updated_at: Date;
}

export interface StoreConfig {
  id: number;
  store_id: number;
  brand_voice: string;
  frequency_caps: {
    daily: number;
    weekly: number;
  };
  paused: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CommerceEvent {
  id: string;
  store_id: number;
  event_type: string;
  customer_id: string;
  product_ids: string[];
  payload: any;
  processed: boolean;
  created_at: Date;
}

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

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create stores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        shop_domain VARCHAR(255) UNIQUE NOT NULL,
        shop_name VARCHAR(255),
        access_token VARCHAR(255),
        hmac_secret VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create store_configs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS store_configs (
        id SERIAL PRIMARY KEY,
        store_id INTEGER REFERENCES stores(id),
        brand_voice VARCHAR(50) DEFAULT 'friendly',
        frequency_caps JSONB DEFAULT '{"daily": 1, "weekly": 3}',
        paused BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create commerce_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS commerce_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id INTEGER REFERENCES stores(id),
        event_type VARCHAR(50) NOT NULL,
        customer_id VARCHAR(255),
        product_ids TEXT[],
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_commerce_events_store_created ON commerce_events(store_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_commerce_events_type_created ON commerce_events(event_type, created_at);
      CREATE INDEX IF NOT EXISTS idx_commerce_events_customer ON commerce_events(customer_id);
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Export the pool for use in other modules
export default pool;