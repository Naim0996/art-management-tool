-- Migration: Create etsy_receipts table
-- Description: Stores Etsy receipts (orders/transactions) synced from Etsy platform
-- Author: Copilot
-- Date: 2025-10-22

CREATE TABLE IF NOT EXISTS etsy_receipts (
    id BIGSERIAL PRIMARY KEY,
    etsy_receipt_id BIGINT NOT NULL UNIQUE,
    local_order_id BIGINT,
    shop_id VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255),
    buyer_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open',
    is_paid BOOLEAN DEFAULT FALSE,
    is_shipped BOOLEAN DEFAULT FALSE,
    grand_total DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    total_shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    total_tax_cost DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(100),
    shipping_address TEXT,
    message_from_buyer TEXT,
    etsy_created_at TIMESTAMP NOT NULL,
    etsy_updated_at TIMESTAMP NOT NULL,
    last_synced_at TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_etsy_receipts_order FOREIGN KEY (local_order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_etsy_receipts_shop_id ON etsy_receipts(shop_id);
CREATE INDEX IF NOT EXISTS idx_etsy_receipts_status ON etsy_receipts(status);
CREATE INDEX IF NOT EXISTS idx_etsy_receipts_is_paid ON etsy_receipts(is_paid);
CREATE INDEX IF NOT EXISTS idx_etsy_receipts_local_order_id ON etsy_receipts(local_order_id);
CREATE INDEX IF NOT EXISTS idx_etsy_receipts_sync_status ON etsy_receipts(sync_status);
CREATE INDEX IF NOT EXISTS idx_etsy_receipts_deleted_at ON etsy_receipts(deleted_at);

-- Add comment
COMMENT ON TABLE etsy_receipts IS 'Stores Etsy receipts (orders/transactions) synced from Etsy marketplace';
