-- Remove character_value column from products table
DROP INDEX IF EXISTS idx_products_character_value;
ALTER TABLE products DROP COLUMN IF EXISTS character_value;

