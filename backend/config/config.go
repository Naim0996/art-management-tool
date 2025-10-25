package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all application configuration
type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	Etsy      EtsyConfig
	Scheduler SchedulerConfig
	RateLimit RateLimitConfig
	Logging   LoggingConfig
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port        string
	Environment string
}

// DatabaseConfig holds database connection configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

// EtsyConfig holds Etsy API integration configuration
type EtsyConfig struct {
	APIKey                string
	APISecret             string
	ShopID                string
	ShopName              string
	ShopURL               string
	AccessToken           string
	RedirectURI           string
	BaseURL               string
	SyncEnabled           bool
	SyncIntervalProducts  time.Duration
	SyncIntervalInventory time.Duration
	RateLimitRequests     int
	RateLimitWindow       time.Duration
	PaymentCallbackURL    string
}

// SchedulerConfig holds scheduler configuration
type SchedulerConfig struct {
	Enabled bool
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	Enabled           bool
	RequestsPerMinute int
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level  string
	Format string
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:        getEnv("PORT", "8080"),
			Environment: getEnv("ENVIRONMENT", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "artuser"),
			Password: getEnv("DB_PASSWORD", "artpassword"),
			Name:     getEnv("DB_NAME", "artmanagement"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Etsy: EtsyConfig{
			APIKey:                getEnv("ETSY_API_KEY", ""),
			APISecret:             getEnv("ETSY_API_SECRET", ""),
			ShopID:                getEnv("ETSY_SHOP_ID", ""),
			ShopName:              getEnv("ETSY_SHOP_NAME", ""),
			ShopURL:               getEnv("ETSY_SHOP_URL", ""),
			AccessToken:           getEnv("ETSY_ACCESS_TOKEN", ""),
			RedirectURI:           getEnv("ETSY_REDIRECT_URI", "http://localhost:3000/admin/etsy-sync/callback"),
			BaseURL:               getEnv("ETSY_API_BASE_URL", "https://openapi.etsy.com/v3"),
			SyncEnabled:           getEnvBool("ETSY_SYNC_ENABLED", false),
			SyncIntervalProducts:  time.Duration(getEnvInt("ETSY_SYNC_INTERVAL_PRODUCTS", 3600)) * time.Second,
			SyncIntervalInventory: time.Duration(getEnvInt("ETSY_SYNC_INTERVAL_INVENTORY", 1800)) * time.Second,
			RateLimitRequests:     getEnvInt("ETSY_RATE_LIMIT_REQUESTS", 10000),
			RateLimitWindow:       time.Duration(getEnvInt("ETSY_RATE_LIMIT_WINDOW", 86400)) * time.Second,
			PaymentCallbackURL:    getEnv("ETSY_PAYMENT_CALLBACK_URL", ""),
		},
		Scheduler: SchedulerConfig{
			Enabled: getEnvBool("SCHEDULER_ENABLED", true),
		},
		RateLimit: RateLimitConfig{
			Enabled:           getEnvBool("RATE_LIMIT_ENABLED", true),
			RequestsPerMinute: getEnvInt("RATE_LIMIT_REQUESTS_PER_MINUTE", 60),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
	}
}

// IsEtsyEnabled checks if Etsy integration is properly configured
// Note: AccessToken is no longer required as OAuth tokens are managed dynamically
func (c *Config) IsEtsyEnabled() bool {
	return c.Etsy.APIKey != "" &&
		c.Etsy.APISecret != "" &&
		c.Etsy.ShopID != "" &&
		c.Etsy.SyncEnabled
}

// IsProduction checks if running in production environment
func (c *Config) IsProduction() bool {
	return c.Server.Environment == "production"
}

// IsStaging checks if running in staging environment
func (c *Config) IsStaging() bool {
	return c.Server.Environment == "staging"
}

// IsDevelopment checks if running in development environment
func (c *Config) IsDevelopment() bool {
	return c.Server.Environment == "development"
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvInt gets an integer environment variable with a default value
func getEnvInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}

// getEnvBool gets a boolean environment variable with a default value
func getEnvBool(key string, defaultValue bool) bool {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.ParseBool(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}
