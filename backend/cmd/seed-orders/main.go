package main

import (
	"log"
	"time"

	"github.com/Naim0996/art-management-tool/backend/database"
	"github.com/Naim0996/art-management-tool/backend/models"
)

func main() {
	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("Seeding database with sample orders...")

	// Sample orders
	orders := []models.Order{
		{
			OrderNumber:       "ORD-SEED-001",
			CustomerEmail:     "mario.rossi@example.com",
			CustomerName:      "Mario Rossi",
			Subtotal:          150.00,
			Total:             150.00,
			PaymentStatus:     models.PaymentStatusPaid,
			FulfillmentStatus: models.FulfillmentStatusFulfilled,
			CreatedAt:         time.Now().Add(-48 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Quadro Leon",
					Quantity:    1,
					UnitPrice:   100.00,
					TotalPrice:  100.00,
				},
				{
					ProductName: "Stampa Giullare",
					Quantity:    2,
					UnitPrice:   25.00,
					TotalPrice:  50.00,
				},
			},
		},
		{
			OrderNumber:       "ORD-SEED-002",
			CustomerEmail:     "lucia.bianchi@example.com",
			CustomerName:      "Lucia Bianchi",
			Subtotal:          89.99,
			Total:             89.99,
			PaymentStatus:     models.PaymentStatusPending,
			FulfillmentStatus: models.FulfillmentStatusUnfulfilled,
			CreatedAt:         time.Now().Add(-24 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Poster Ribelle",
					Quantity:    1,
					UnitPrice:   89.99,
					TotalPrice:  89.99,
				},
			},
		},
		{
			OrderNumber:       "ORD-SEED-003",
			CustomerEmail:     "giovanni.verdi@example.com",
			CustomerName:      "Giovanni Verdi",
			Subtotal:          275.50,
			Total:             275.50,
			PaymentStatus:     models.PaymentStatusPaid,
			FulfillmentStatus: models.FulfillmentStatusUnfulfilled,
			CreatedAt:         time.Now().Add(-12 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Opera Polemico",
					Quantity:    1,
					UnitPrice:   200.00,
					TotalPrice:  200.00,
				},
				{
					ProductName: "Stampa Leon",
					Quantity:    3,
					UnitPrice:   25.17,
					TotalPrice:  75.51,
				},
			},
		},
		{
			OrderNumber:       "ORD-SEED-004",
			CustomerEmail:     "anna.neri@example.com",
			CustomerName:      "Anna Neri",
			Subtotal:          450.00,
			Total:             450.00,
			PaymentStatus:     models.PaymentStatusPaid,
			FulfillmentStatus: models.FulfillmentStatusFulfilled,
			CreatedAt:         time.Now().Add(-72 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Collezione Completa",
					Quantity:    1,
					UnitPrice:   450.00,
					TotalPrice:  450.00,
				},
			},
		},
		{
			OrderNumber:       "ORD-SEED-005",
			CustomerEmail:     "paolo.gialli@example.com",
			CustomerName:      "Paolo Gialli",
			Subtotal:          125.00,
			Total:             125.00,
			PaymentStatus:     models.PaymentStatusFailed,
			FulfillmentStatus: models.FulfillmentStatusUnfulfilled,
			CreatedAt:         time.Now().Add(-96 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Quadro Giullare",
					Quantity:    1,
					UnitPrice:   125.00,
					TotalPrice:  125.00,
				},
			},
		},
	}

	// Insert orders
	for _, order := range orders {
		if err := database.DB.Create(&order).Error; err != nil {
			log.Printf("Failed to create order: %v", err)
			continue
		}
		log.Printf("Created order #%d for %s", order.ID, order.CustomerEmail)
	}

	log.Println("Database seeding completed successfully!")
}
