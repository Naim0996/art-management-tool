-- Add character_id field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS character_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_products_character ON products(character_id);

