package main

import (
	"log"
	"net/http"

	"github.com/Naim0996/art-management-tool/backend/handlers"
	"github.com/Naim0996/art-management-tool/backend/middleware"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	// Management API endpoints (authenticated)
	adminRouter := r.PathPrefix("/api/admin").Subrouter()
	adminRouter.Use(middleware.AuthMiddleware)
	adminRouter.HandleFunc("/products", handlers.GetAdminProducts).Methods("GET")
	adminRouter.HandleFunc("/products", handlers.CreateProduct).Methods("POST")
	adminRouter.HandleFunc("/products/{id}", handlers.UpdateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", handlers.DeleteProduct).Methods("DELETE")

	// Authentication endpoints
	r.HandleFunc("/api/auth/login", handlers.Login).Methods("POST")

	// Customer API endpoints (public)
	r.HandleFunc("/api/products", handlers.GetProducts).Methods("GET")
	r.HandleFunc("/api/products/{id}", handlers.GetProduct).Methods("GET")
	r.HandleFunc("/api/cart", handlers.AddToCart).Methods("POST")
	r.HandleFunc("/api/cart", handlers.GetCart).Methods("GET")
	r.HandleFunc("/api/cart/{id}", handlers.RemoveFromCart).Methods("DELETE")
	r.HandleFunc("/api/checkout", handlers.Checkout).Methods("POST")

	// Health check
	r.HandleFunc("/health", handlers.HealthCheck).Methods("GET")

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
