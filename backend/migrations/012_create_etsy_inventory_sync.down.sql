-- Drop Etsy inventory sync log table
DROP INDEX IF EXISTS idx_etsy_inv_synced;
DROP INDEX IF EXISTS idx_etsy_inv_variant;
DROP INDEX IF EXISTS idx_etsy_inv_listing;
DROP TABLE IF EXISTS etsy_inventory_sync_log;
