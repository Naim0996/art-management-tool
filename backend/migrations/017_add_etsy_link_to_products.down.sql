-- Remove etsy_link field from products table
DROP INDEX IF EXISTS idx_products_etsy_link;
ALTER TABLE products DROP COLUMN IF EXISTS etsy_link;
