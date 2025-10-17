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
			CustomerEmail: "mario.rossi@example.com",
			CustomerName:  "Mario Rossi",
			Total:         150.00,
			Status:        "completed",
			CreatedAt:     time.Now().Add(-48 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Quadro Leon",
					Quantity:    1,
					Price:       100.00,
				},
				{
					ProductName: "Stampa Giullare",
					Quantity:    2,
					Price:       25.00,
				},
			},
		},
		{
			CustomerEmail: "lucia.bianchi@example.com",
			CustomerName:  "Lucia Bianchi",
			Total:         89.99,
			Status:        "pending",
			CreatedAt:     time.Now().Add(-24 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Poster Ribelle",
					Quantity:    1,
					Price:       89.99,
				},
			},
		},
		{
			CustomerEmail: "giovanni.verdi@example.com",
			CustomerName:  "Giovanni Verdi",
			Total:         275.50,
			Status:        "processing",
			CreatedAt:     time.Now().Add(-12 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Opera Polemico",
					Quantity:    1,
					Price:       200.00,
				},
				{
					ProductName: "Stampa Leon",
					Quantity:    3,
					Price:       25.17,
				},
			},
		},
		{
			CustomerEmail: "anna.neri@example.com",
			CustomerName:  "Anna Neri",
			Total:         450.00,
			Status:        "completed",
			CreatedAt:     time.Now().Add(-72 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Collezione Completa",
					Quantity:    1,
					Price:       450.00,
				},
			},
		},
		{
			CustomerEmail: "paolo.gialli@example.com",
			CustomerName:  "Paolo Gialli",
			Total:         125.00,
			Status:        "cancelled",
			CreatedAt:     time.Now().Add(-96 * time.Hour),
			Items: []models.OrderItem{
				{
					ProductName: "Quadro Giullare",
					Quantity:    1,
					Price:       125.00,
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
