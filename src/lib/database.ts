// Database schema and connection for the Shopify App
import { Pool } from 'pg';

// Updated Type definitions matching actual SQL schema
export interface Store {
  id: string; // UUID, not number
  domain: string;
  name: string;
  access_token: string;
  hmac_secret: string;
  brand_tone?: string;
  frequency_caps?: any;
  status?: string;
  created_at: Date;
  config_updated_at: Date;
}

export interface CommerceEvent {
  id: string;
  store_id: string; // UUID, not number
  event_type: string;
  customer_id: string;
  payload: any;
  occurred_at: Date;
  product_ids?: string[]; // Optional, not in actual table
  processed?: boolean; // Optional, not in actual table
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

// Database initialization should be handled by the backend service
// The Shopify app should not manage database schema
export async function initializeDatabase() {
  console.log('Database initialization skipped - handled by backend service');
  // This is a no-op function to maintain compatibility
  // Real database initialization should happen in the backend
}

// Export the pool for use in other modules
export default pool;