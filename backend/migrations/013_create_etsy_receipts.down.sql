-- Rollback migration: Drop etsy_receipts table
-- Description: Removes the etsy_receipts table
-- Author: Copilot
-- Date: 2025-10-22

DROP INDEX IF EXISTS idx_etsy_receipts_deleted_at;
DROP INDEX IF EXISTS idx_etsy_receipts_sync_status;
DROP INDEX IF EXISTS idx_etsy_receipts_local_order_id;
DROP INDEX IF EXISTS idx_etsy_receipts_is_paid;
DROP INDEX IF EXISTS idx_etsy_receipts_status;
DROP INDEX IF EXISTS idx_etsy_receipts_shop_id;

DROP TABLE IF EXISTS etsy_receipts;
