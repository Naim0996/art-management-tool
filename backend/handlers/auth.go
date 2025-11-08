package handlers

import (
	"encoding/json"
	"net/http"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  string `json:"user"`
}

// Login handles admin authentication
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// In a real application, validate credentials against a database
	// For demo purposes, we'll accept a simple combination
	if req.Username == "artadmin" && req.Password == "ArtM@nag3r2025!" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(LoginResponse{
			Token: "demo-token-12345",
			User:  req.Username,
		})
		return
	}

	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
}
