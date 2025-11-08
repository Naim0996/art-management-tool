-- Add etsy_link field to products table
ALTER TABLE products ADD COLUMN etsy_link VARCHAR(500);

CREATE INDEX idx_products_etsy_link ON products(etsy_link);
