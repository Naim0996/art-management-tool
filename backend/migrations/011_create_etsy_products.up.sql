-- Etsy product mapping table for tracking synced products
CREATE TABLE IF NOT EXISTS etsy_products (
    id SERIAL PRIMARY KEY,
    etsy_listing_id BIGINT NOT NULL UNIQUE,
    local_product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    quantity INTEGER DEFAULT 0,
    sku VARCHAR(255),
    state VARCHAR(50),
    url TEXT,
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_etsy_listing_id ON etsy_products(etsy_listing_id);
CREATE INDEX IF NOT EXISTS idx_etsy_local_product ON etsy_products(local_product_id);
CREATE INDEX IF NOT EXISTS idx_etsy_sync_status ON etsy_products(sync_status);
CREATE INDEX IF NOT EXISTS idx_etsy_deleted_at ON etsy_products(deleted_at);

COMMENT ON TABLE etsy_products IS 'Mapping table between Etsy listings and local products';
COMMENT ON COLUMN etsy_products.etsy_listing_id IS 'Unique Etsy listing ID';
COMMENT ON COLUMN etsy_products.local_product_id IS 'Reference to local products table';
COMMENT ON COLUMN etsy_products.sync_status IS 'Sync status: pending, synced, error';
