# Backend API

This is the backend API for the art management tool, built with Go.

## Features

- Product management (CRUD operations)
- Authentication for admin access
- Customer-facing product listing
- Shopping cart functionality
- Checkout with multiple payment methods

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Admin Endpoints (Requires Authentication)
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create a new product
- `PUT /api/admin/products/{id}` - Update a product
- `DELETE /api/admin/products/{id}` - Delete a product

### Customer Endpoints
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get a single product
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get cart contents
- `DELETE /api/cart/{id}` - Remove item from cart
- `POST /api/checkout` - Process checkout

### Health Check
- `GET /health` - Health check endpoint

## Setup

1. Install dependencies:
   ```bash
   go mod download
   ```

2. Run the server:
   ```bash
   go run main.go
   ```

The server will start on port 8080.

## Authentication

Admin endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Default admin credentials for demo:
- Username: `admin`
- Password: `admin`

## Payment Methods

Supported payment methods:
- `credit_card`
- `paypal`
- `stripe`
