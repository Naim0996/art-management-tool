-- Remove character_id field from products table
DROP INDEX IF EXISTS idx_products_character;
ALTER TABLE products DROP COLUMN IF EXISTS character_id;

