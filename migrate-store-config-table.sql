-- Migration to ensure stores table has all required configuration fields
-- These fields already exist in the current schema based on database inspection

-- Add configuration fields to stores table if they don't exist
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS brand_voice VARCHAR(50) DEFAULT 'friendly',
ADD COLUMN IF NOT EXISTS frequency_caps JSONB DEFAULT '{"daily": 1, "weekly": 3}',
ADD COLUMN IF NOT EXISTS paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS config_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for performance on config_updated_at
CREATE INDEX IF NOT EXISTS idx_stores_config_updated_at ON stores(config_updated_at);