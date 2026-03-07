-- Migration to add first sale celebration tracking fields to stores table

-- Add first sale tracking fields
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS first_sale_recovered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_sale_celebration_shown BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_sale_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_sale_customer_name VARCHAR(255) DEFAULT 'Customer',
ADD COLUMN IF NOT EXISTS first_sale_recovery_time VARCHAR(100) DEFAULT 'Just now',
ADD COLUMN IF NOT EXISTS first_sale_campaign VARCHAR(100) DEFAULT 'Cart Recovery',
ADD COLUMN IF NOT EXISTS first_sale_recovered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_sale_celebration_shown_at TIMESTAMP;

-- Create index for first sale queries
CREATE INDEX IF NOT EXISTS idx_stores_first_sale ON stores(first_sale_recovered, first_sale_celebration_shown);
