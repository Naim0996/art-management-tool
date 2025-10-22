-- Drop Etsy products mapping table
DROP INDEX IF EXISTS idx_etsy_deleted_at;
DROP INDEX IF EXISTS idx_etsy_sync_status;
DROP INDEX IF EXISTS idx_etsy_local_product;
DROP INDEX IF EXISTS idx_etsy_listing_id;
DROP TABLE IF EXISTS etsy_products;
