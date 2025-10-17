package main

import (
	"log"
	"net/http"

	"github.com/Naim0996/art-management-tool/backend/database"
	"github.com/Naim0996/art-management-tool/backend/handlers"
	"github.com/Naim0996/art-management-tool/backend/middleware"
	"github.com/gorilla/mux"
)

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Inizializza il database
	if err := database.Connect(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Esegui le migrazioni
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("Failed to run database migrations:", err)
	}

	log.Println("Database initialized successfully")

	// Crea gli handler
	personaggiHandler := handlers.NewPersonaggiHandler(database.DB)

	r := mux.NewRouter()

	// Management API endpoints (authenticated)
	adminRouter := r.PathPrefix("/api/admin").Subrouter()
	adminRouter.Use(middleware.AuthMiddleware)
	adminRouter.HandleFunc("/products", handlers.GetAdminProducts).Methods("GET")
	adminRouter.HandleFunc("/products", handlers.CreateProduct).Methods("POST")
	adminRouter.HandleFunc("/products/{id}", handlers.UpdateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", handlers.DeleteProduct).Methods("DELETE")

	// Personaggi management routes (authenticated)
	adminRouter.HandleFunc("/personaggi", personaggiHandler.CreatePersonaggio).Methods("POST")
	adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.UpdatePersonaggio).Methods("PUT")
	adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.DeletePersonaggio).Methods("DELETE")
	adminRouter.HandleFunc("/personaggi/{id}/restore", personaggiHandler.RestorePersonaggio).Methods("POST")
	adminRouter.HandleFunc("/personaggi/deleted", personaggiHandler.GetDeletedPersonaggi).Methods("GET")

	// Authentication endpoints
	r.HandleFunc("/api/auth/login", handlers.Login).Methods("POST")

	// Customer API endpoints (public)
	r.HandleFunc("/api/products", handlers.GetProducts).Methods("GET")
	r.HandleFunc("/api/products/{id}", handlers.GetProduct).Methods("GET")
	r.HandleFunc("/api/cart", handlers.AddToCart).Methods("POST")
	r.HandleFunc("/api/cart", handlers.GetCart).Methods("GET")
	r.HandleFunc("/api/cart/{id}", handlers.RemoveFromCart).Methods("DELETE")
	r.HandleFunc("/api/checkout", handlers.Checkout).Methods("POST")

	// Personaggi public routes (read-only)
	r.HandleFunc("/api/personaggi", personaggiHandler.GetPersonaggi).Methods("GET")
	r.HandleFunc("/api/personaggi/{id}", personaggiHandler.GetPersonaggio).Methods("GET")

	// Health check
	r.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	// Apply CORS middleware
	handler := corsMiddleware(r)

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
