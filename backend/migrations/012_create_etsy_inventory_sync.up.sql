-- Etsy inventory synchronization log table
CREATE TABLE IF NOT EXISTS etsy_inventory_sync_log (
    id SERIAL PRIMARY KEY,
    etsy_listing_id BIGINT NOT NULL,
    local_variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    etsy_quantity INTEGER NOT NULL,
    local_quantity INTEGER NOT NULL,
    quantity_diff INTEGER,
    sync_action VARCHAR(50),
    sync_result VARCHAR(50),
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient log queries
CREATE INDEX IF NOT EXISTS idx_etsy_inv_listing ON etsy_inventory_sync_log(etsy_listing_id);
CREATE INDEX IF NOT EXISTS idx_etsy_inv_variant ON etsy_inventory_sync_log(local_variant_id);
CREATE INDEX IF NOT EXISTS idx_etsy_inv_synced ON etsy_inventory_sync_log(synced_at);

COMMENT ON TABLE etsy_inventory_sync_log IS 'Log of inventory synchronization operations between Etsy and local system';
COMMENT ON COLUMN etsy_inventory_sync_log.sync_action IS 'Action taken: push_to_etsy, pull_from_etsy, no_change';
COMMENT ON COLUMN etsy_inventory_sync_log.sync_result IS 'Result: success, error, skipped';
