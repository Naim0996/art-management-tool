package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Naim0996/art-management-tool/backend/models"
	"github.com/Naim0996/art-management-tool/backend/services/etsy"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Config contiene la configurazione del database
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// GetConfigFromEnv legge la configurazione dalle variabili d'ambiente
func GetConfigFromEnv() *Config {
	return &Config{
		Host:     getEnv("DB_HOST", "giorgiopriviteralab.com"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "artuser"),
		Password: getEnv("DB_PASSWORD", "artpassword"),
		DBName:   getEnv("DB_NAME", "artmanagement"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}
}

// Connect stabilisce la connessione al database
func Connect() error {
	config := GetConfigFromEnv()

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host,
		config.Port,
		config.User,
		config.Password,
		config.DBName,
		config.SSLMode,
	)

	log.Printf("Connecting to database at %s:%s...", config.Host, config.Port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configura connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connection established successfully")

	return nil
}

// AutoMigrate esegue le migrazioni automatiche dei modelli
func AutoMigrate() error {
	log.Println("Running database migrations...")

	// Prima esegui AutoMigrate per creare le tabelle
	err := DB.AutoMigrate(
		&models.Personaggio{},
		&models.Fumetto{},
		// E-commerce models
		&models.Category{},
		&models.EnhancedProduct{},
		&models.ProductImage{},
		&models.ProductVariant{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.Notification{},
		&models.AuditLog{},
		&models.DiscountCode{},
		&models.ShopifyLink{},
		// Etsy Integration models
		&etsy.OAuthToken{},
		&models.EtsySyncConfig{},
		&models.EtsyProduct{},
		&models.EtsyInventorySyncLog{},
		&models.EtsyReceipt{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Poi esegui le migrazioni personalizzate per gestire i dati esistenti
	if err := runCustomMigrations(); err != nil {
		return fmt.Errorf("failed to run custom migrations: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// runCustomMigrations gestisce migrazioni personalizzate per dati esistenti
func runCustomMigrations() error {
	log.Println("Running custom migrations...")

	// Migrazione per order_number: gestisce ordini esistenti senza order_number
	if err := migrateOrderNumber(); err != nil {
		return fmt.Errorf("failed to migrate order_number: %w", err)
	}

	return nil
}

// migrateOrderNumber aggiunge order_number agli ordini esistenti
func migrateOrderNumber() error {
	// Verifica se la tabella orders esiste
	var tableExists bool
	err := DB.Raw(`
		SELECT EXISTS (
			SELECT 1 
			FROM information_schema.tables 
			WHERE table_name = 'orders'
		)
	`).Scan(&tableExists).Error

	if err != nil {
		return err
	}

	if !tableExists {
		log.Println("Orders table does not exist yet, skipping order_number migration")
		return nil
	}

	// Verifica se ci sono ordini con order_number NULL
	var nullCount int64
	err = DB.Raw("SELECT COUNT(*) FROM orders WHERE order_number IS NULL").Scan(&nullCount).Error
	if err != nil {
		log.Printf("Warning: Could not check for null order_numbers: %v", err)
		// Non è un errore critico, continua
		return nil
	}

	if nullCount > 0 {
		log.Printf("Found %d orders with NULL order_number, populating...", nullCount)

		// Popola order_number per i record esistenti usando l'ID
		if err := DB.Exec(`
			UPDATE orders 
			SET order_number = CONCAT('ORD-', LPAD(CAST(id AS TEXT), 8, '0'))
			WHERE order_number IS NULL OR order_number = ''
		`).Error; err != nil {
			return fmt.Errorf("failed to populate order_number: %w", err)
		}

		log.Println("order_number populated successfully")
	} else {
		log.Println("All orders already have order_number, skipping migration")
	}

	return nil
}

// Close chiude la connessione al database
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// getEnv legge una variabile d'ambiente con valore di default
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
