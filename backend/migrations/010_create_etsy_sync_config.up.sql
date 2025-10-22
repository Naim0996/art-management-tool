-- Etsy API synchronization configuration table
CREATE TABLE IF NOT EXISTS etsy_sync_config (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL UNIQUE,
    last_product_sync TIMESTAMP,
    last_inventory_sync TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'idle',
    sync_error TEXT,
    rate_limit_remaining INTEGER DEFAULT 10000,
    rate_limit_reset_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient sync status queries
CREATE INDEX IF NOT EXISTS idx_etsy_sync_status ON etsy_sync_config(sync_status);
CREATE INDEX IF NOT EXISTS idx_etsy_rate_limit ON etsy_sync_config(rate_limit_reset_at);

COMMENT ON TABLE etsy_sync_config IS 'Configuration and state tracking for Etsy API synchronization';
COMMENT ON COLUMN etsy_sync_config.shop_id IS 'Etsy shop ID';
COMMENT ON COLUMN etsy_sync_config.sync_status IS 'Current sync status: idle, in_progress, error, completed';
COMMENT ON COLUMN etsy_sync_config.rate_limit_remaining IS 'Remaining API calls in current window';
