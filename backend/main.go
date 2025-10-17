package main

import (
	"log"
	"net/http"

	"github.com/Naim0996/art-management-tool/backend/database"
	"github.com/Naim0996/art-management-tool/backend/handlers"
	"github.com/Naim0996/art-management-tool/backend/handlers/admin"
	"github.com/Naim0996/art-management-tool/backend/handlers/shop"
	"github.com/Naim0996/art-management-tool/backend/middleware"
	"github.com/Naim0996/art-management-tool/backend/services/cart"
	"github.com/Naim0996/art-management-tool/backend/services/notification"
	"github.com/Naim0996/art-management-tool/backend/services/order"
	"github.com/Naim0996/art-management-tool/backend/services/payment"
	"github.com/Naim0996/art-management-tool/backend/services/product"
	"github.com/Naim0996/art-management-tool/backend/services/shopify"
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

	// Initialize services
	cartService := cart.NewService(database.DB)
	productService := product.NewService(database.DB)
	notifService := notification.NewService(database.DB)
	
	// Initialize payment provider (use mock for development)
	paymentProvider := payment.NewMockProvider("mock", 1, false) // Minimum 1 cent
	// For production with Stripe:
	// paymentProvider := payment.NewStripeProvider()
	
	orderService := order.NewService(database.DB, paymentProvider, notifService)
	shopifyService := shopify.NewSyncService(database.DB, "", "", "")
	
	// Create shop handlers
	catalogHandler := shop.NewCatalogHandler(productService)
	cartHandler := shop.NewCartHandler(cartService)
	checkoutHandler := shop.NewCheckoutHandler(database.DB, cartService, orderService, paymentProvider)
	webhookHandler := shop.NewWebhookHandler(orderService, paymentProvider)
	
	// Create admin handlers
	adminProductHandler := admin.NewProductHandler(productService)
	adminOrderHandler := admin.NewOrderHandler(orderService)
	adminNotifHandler := admin.NewNotificationHandler(notifService)

	// Legacy handlers
	personaggiHandler := handlers.NewPersonaggiHandler(database.DB)
	ordersHandler := handlers.NewOrdersHandler(database.DB)

	r := mux.NewRouter()

	// ===== Enhanced Shop API (New) =====
	// Public shop endpoints
	shopRouter := r.PathPrefix("/api/shop").Subrouter()
	shopRouter.HandleFunc("/products", catalogHandler.ListProducts).Methods("GET")
	shopRouter.HandleFunc("/products/{slug}", catalogHandler.GetProduct).Methods("GET")
	shopRouter.HandleFunc("/cart", cartHandler.GetCart).Methods("GET")
	shopRouter.HandleFunc("/cart/items", cartHandler.AddItem).Methods("POST")
	shopRouter.HandleFunc("/cart/items/{id}", cartHandler.UpdateItem).Methods("PATCH")
	shopRouter.HandleFunc("/cart/items/{id}", cartHandler.RemoveItem).Methods("DELETE")
	shopRouter.HandleFunc("/cart", cartHandler.ClearCart).Methods("DELETE")
	shopRouter.HandleFunc("/cart/discount", checkoutHandler.ApplyDiscount).Methods("POST")
	shopRouter.HandleFunc("/checkout", checkoutHandler.ProcessCheckout).Methods("POST")
	
	// Webhook endpoints (public but verified)
	r.HandleFunc("/api/webhooks/payment/stripe", webhookHandler.HandleStripeWebhook).Methods("POST")

	// ===== Admin API (Enhanced) =====
	adminRouter := r.PathPrefix("/api/admin").Subrouter()
	adminRouter.Use(middleware.AuthMiddleware)
	
	// Stats (existing)
	adminRouter.HandleFunc("/stats", handlers.GetDashboardStats(database.DB)).Methods("GET")
	
	// Enhanced product management
	adminRouter.HandleFunc("/shop/products", adminProductHandler.ListProducts).Methods("GET")
	adminRouter.HandleFunc("/shop/products", adminProductHandler.CreateProduct).Methods("POST")
	adminRouter.HandleFunc("/shop/products/{id}", adminProductHandler.GetProduct).Methods("GET")
	adminRouter.HandleFunc("/shop/products/{id}", adminProductHandler.UpdateProduct).Methods("PATCH")
	adminRouter.HandleFunc("/shop/products/{id}", adminProductHandler.DeleteProduct).Methods("DELETE")
	adminRouter.HandleFunc("/shop/products/{id}/variants", adminProductHandler.AddVariant).Methods("POST")
	adminRouter.HandleFunc("/shop/variants/{id}", adminProductHandler.UpdateVariant).Methods("PATCH")
	adminRouter.HandleFunc("/shop/inventory/adjust", adminProductHandler.UpdateInventory).Methods("POST")
	
	// Enhanced order management
	adminRouter.HandleFunc("/shop/orders", adminOrderHandler.ListOrders).Methods("GET")
	adminRouter.HandleFunc("/shop/orders/{id}", adminOrderHandler.GetOrder).Methods("GET")
	adminRouter.HandleFunc("/shop/orders/{id}/fulfillment", adminOrderHandler.UpdateFulfillmentStatus).Methods("PATCH")
	adminRouter.HandleFunc("/shop/orders/{id}/refund", adminOrderHandler.RefundOrder).Methods("POST")
	
	// Notifications
	adminRouter.HandleFunc("/notifications", adminNotifHandler.ListNotifications).Methods("GET")
	adminRouter.HandleFunc("/notifications/{id}", adminNotifHandler.GetNotification).Methods("GET")
	adminRouter.HandleFunc("/notifications/{id}/read", adminNotifHandler.MarkAsRead).Methods("PATCH")
	adminRouter.HandleFunc("/notifications/read-all", adminNotifHandler.MarkAllAsRead).Methods("POST")
	adminRouter.HandleFunc("/notifications/{id}", adminNotifHandler.Delete).Methods("DELETE")
	
	// Shopify sync (stub)
	adminRouter.HandleFunc("/shopify/sync", func(w http.ResponseWriter, r *http.Request) {
		if !shopifyService.IsEnabled() {
			http.Error(w, "Shopify integration not configured", http.StatusNotImplemented)
			return
		}
		// Trigger sync in background
		w.WriteHeader(http.StatusAccepted)
		w.Write([]byte(`{"message":"Sync initiated"}`))
	}).Methods("POST")
	
	// Legacy product endpoints (backward compatibility)
	adminRouter.HandleFunc("/products", handlers.GetAdminProducts).Methods("GET")
	adminRouter.HandleFunc("/products", handlers.CreateProduct).Methods("POST")
	adminRouter.HandleFunc("/products/{id}", handlers.UpdateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", handlers.DeleteProduct).Methods("DELETE")
	
	// Legacy orders management routes (backward compatibility)
	adminRouter.HandleFunc("/orders", ordersHandler.GetOrders).Methods("GET")
	adminRouter.HandleFunc("/orders/stats", ordersHandler.GetOrderStats).Methods("GET")
	adminRouter.HandleFunc("/orders/{id}", ordersHandler.GetOrder).Methods("GET")
	adminRouter.HandleFunc("/orders/{id}/status", ordersHandler.UpdateOrderStatus).Methods("PUT")

	// Personaggi management routes (authenticated)
	adminRouter.HandleFunc("/personaggi", personaggiHandler.GetPersonaggi).Methods("GET")
	adminRouter.HandleFunc("/personaggi", personaggiHandler.CreatePersonaggio).Methods("POST")
	adminRouter.HandleFunc("/personaggi/deleted", personaggiHandler.GetDeletedPersonaggi).Methods("GET")
	adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.GetPersonaggio).Methods("GET")
	adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.UpdatePersonaggio).Methods("PUT")
	adminRouter.HandleFunc("/personaggi/{id}", personaggiHandler.DeletePersonaggio).Methods("DELETE")
	adminRouter.HandleFunc("/personaggi/{id}/restore", personaggiHandler.RestorePersonaggio).Methods("POST")

	// ===== Public API =====
	// Authentication endpoints
	r.HandleFunc("/api/auth/login", handlers.Login).Methods("POST")

	// Legacy customer API endpoints (backward compatibility)
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
