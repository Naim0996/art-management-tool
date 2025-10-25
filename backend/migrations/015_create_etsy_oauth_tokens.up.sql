-- Create etsy_oauth_tokens table for storing OAuth2 tokens
CREATE TABLE IF NOT EXISTS etsy_oauth_tokens (
    id SERIAL PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP NOT NULL,
    scope TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_etsy_oauth_tokens_shop_id ON etsy_oauth_tokens(shop_id);
CREATE INDEX idx_etsy_oauth_tokens_expires_at ON etsy_oauth_tokens(expires_at);
