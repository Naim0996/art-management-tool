-- Add character_value column to products table
ALTER TABLE products ADD COLUMN character_value VARCHAR(255);

-- Create index for filtering
CREATE INDEX idx_products_character_value ON products(character_value);

