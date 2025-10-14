package models

type CartItem struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

type Cart struct {
	ID    string     `json:"id"`
	Items []CartItem `json:"items"`
}
