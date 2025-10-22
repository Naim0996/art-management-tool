-- Drop Etsy sync configuration table
DROP INDEX IF EXISTS idx_etsy_rate_limit;
DROP INDEX IF EXISTS idx_etsy_sync_status;
DROP TABLE IF EXISTS etsy_sync_config;
