-- Shopify mapping table for future integration
CREATE TABLE IF NOT EXISTS shopify_links (
    id SERIAL PRIMARY KEY,
    local_id INTEGER NOT NULL,
    shopify_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- product, variant, order
    synced_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_shopify_local ON shopify_links(entity_type, local_id);
CREATE UNIQUE INDEX idx_shopify_remote ON shopify_links(entity_type, shopify_id);
CREATE INDEX idx_shopify_synced ON shopify_links(synced_at);

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
    value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(10, 2),
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    starts_at TIMESTAMP,
    expires_at TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discount_code ON discount_codes(code);
CREATE INDEX idx_discount_active ON discount_codes(active);
CREATE INDEX idx_discount_expires ON discount_codes(expires_at);
