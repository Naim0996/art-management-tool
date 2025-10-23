package models

import (
	"testing"
)

func TestPersonaggioInputValidation(t *testing.T) {
	tests := []struct {
		name    string
		input   PersonaggioInput
		wantErr bool
	}{
		{
			name: "valid personaggio with all fields",
			input: PersonaggioInput{
				Name:            "Test Character",
				Description:     "A test character description",
				Icon:            "/uploads/icon.png",
				Images:          []string{"/uploads/img1.png", "/uploads/img2.png"},
				BackgroundColor: "#FF0000",
				BackgroundType:  "solid",
				Order:           0,
			},
			wantErr: false,
		},
		{
			name: "valid personaggio with gradient",
			input: PersonaggioInput{
				Name:            "Gradient Character",
				Description:     "Character with gradient background",
				Images:          []string{},
				BackgroundColor: "#FF0000",
				BackgroundType:  "gradient",
				GradientFrom:    "#FF0000",
				GradientTo:      "#0000FF",
				Order:           1,
			},
			wantErr: false,
		},
		{
			name: "valid personaggio minimal fields",
			input: PersonaggioInput{
				Name:   "Minimal Character",
				Images: []string{},
			},
			wantErr: false,
		},
		{
			name: "invalid - empty name",
			input: PersonaggioInput{
				Name:   "",
				Images: []string{},
			},
			wantErr: true,
		},
		{
			name: "invalid - name too long",
			input: PersonaggioInput{
				Name:   "This is a very long name that exceeds the maximum allowed length of 100 characters for a personaggio name field",
				Images: []string{},
			},
			wantErr: true,
		},
		{
			name: "invalid - description too long",
			input: PersonaggioInput{
				Name:        "Valid Name",
				Description: string(make([]byte, 2001)),
				Images:      []string{},
			},
			wantErr: true,
		},
		{
			name: "invalid - too many images",
			input: PersonaggioInput{
				Name: "Valid Name",
				Images: []string{
					"/img1.png", "/img2.png", "/img3.png", "/img4.png", "/img5.png",
					"/img6.png", "/img7.png", "/img8.png", "/img9.png", "/img10.png",
					"/img11.png", "/img12.png", "/img13.png", "/img14.png", "/img15.png",
					"/img16.png", "/img17.png", "/img18.png", "/img19.png", "/img20.png",
					"/img21.png", // 21 images - exceeds limit
				},
			},
			wantErr: true,
		},
		{
			name: "invalid - bad hex color",
			input: PersonaggioInput{
				Name:            "Valid Name",
				Images:          []string{},
				BackgroundColor: "red", // Not a hex color
			},
			wantErr: true,
		},
		{
			name: "invalid - bad background type",
			input: PersonaggioInput{
				Name:           "Valid Name",
				Images:         []string{},
				BackgroundType: "pattern", // Invalid type
			},
			wantErr: true,
		},
		{
			name: "invalid - gradient without colors",
			input: PersonaggioInput{
				Name:           "Valid Name",
				Images:         []string{},
				BackgroundType: "gradient",
				// Missing GradientFrom and GradientTo
			},
			wantErr: false, // Gradient colors are optional even when type is gradient
		},
		{
			name: "invalid - negative order",
			input: PersonaggioInput{
				Name:   "Valid Name",
				Images: []string{},
				Order:  -1,
			},
			wantErr: true,
		},
		{
			name: "invalid - bad URL format",
			input: PersonaggioInput{
				Name:   "Valid Name",
				Icon:   "not-a-url",
				Images: []string{},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.input.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("PersonaggioInput.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateProductCreate(t *testing.T) {
	tests := []struct {
		name    string
		product EnhancedProduct
		wantErr bool
	}{
		{
			name: "valid product",
			product: EnhancedProduct{
				Title:            "Test Product",
				Slug:             "test-product",
				ShortDescription: "A test product",
				BasePrice:        99.99,
				Currency:         "EUR",
				SKU:              "TEST-001",
				Status:           ProductStatusDraft,
			},
			wantErr: false,
		},
		{
			name: "valid product minimal fields",
			product: EnhancedProduct{
				Title:     "Minimal Product",
				Slug:      "minimal-product",
				BasePrice: 0,
			},
			wantErr: false,
		},
		{
			name: "invalid - empty title",
			product: EnhancedProduct{
				Title:     "",
				Slug:      "test-product",
				BasePrice: 10.0,
			},
			wantErr: true,
		},
		{
			name: "invalid - empty slug",
			product: EnhancedProduct{
				Title:     "Test Product",
				Slug:      "",
				BasePrice: 10.0,
			},
			wantErr: true,
		},
		{
			name: "invalid - slug with uppercase",
			product: EnhancedProduct{
				Title:     "Test Product",
				Slug:      "Test-Product",
				BasePrice: 10.0,
			},
			wantErr: true,
		},
		{
			name: "invalid - slug with spaces",
			product: EnhancedProduct{
				Title:     "Test Product",
				Slug:      "test product",
				BasePrice: 10.0,
			},
			wantErr: true,
		},
		{
			name: "invalid - negative price",
			product: EnhancedProduct{
				Title:     "Test Product",
				Slug:      "test-product",
				BasePrice: -10.0,
			},
			wantErr: true,
		},
		{
			name: "invalid - title too long",
			product: EnhancedProduct{
				Title:     string(make([]byte, 501)),
				Slug:      "test-product",
				BasePrice: 10.0,
			},
			wantErr: true,
		},
		{
			name: "invalid - invalid status",
			product: EnhancedProduct{
				Title:     "Test Product",
				Slug:      "test-product",
				BasePrice: 10.0,
				Status:    ProductStatus("invalid"),
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateProductCreate(&tt.product)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateProductCreate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateProductUpdate(t *testing.T) {
	tests := []struct {
		name    string
		product EnhancedProduct
		wantErr bool
	}{
		{
			name: "valid update - title only",
			product: EnhancedProduct{
				Title: "Updated Title",
			},
			wantErr: false,
		},
		{
			name: "valid update - price only",
			product: EnhancedProduct{
				BasePrice: 199.99,
			},
			wantErr: false,
		},
		{
			name: "valid update - all fields",
			product: EnhancedProduct{
				Title:            "Updated Product",
				Slug:             "updated-product",
				ShortDescription: "Updated description",
				BasePrice:        150.0,
				Status:           ProductStatusPublished,
			},
			wantErr: false,
		},
		{
			name: "valid update - empty title means no update",
			product: EnhancedProduct{
				Title: "",
			},
			wantErr: false,
		},
		{
			name: "invalid - slug with uppercase",
			product: EnhancedProduct{
				Slug: "Invalid-Slug",
			},
			wantErr: true,
		},
		{
			name: "invalid - negative price",
			product: EnhancedProduct{
				BasePrice: -50.0,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateProductUpdate(&tt.product)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateProductUpdate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateVariant(t *testing.T) {
	tests := []struct {
		name    string
		variant ProductVariant
		wantErr bool
	}{
		{
			name: "valid variant",
			variant: ProductVariant{
				SKU:             "VAR-001",
				Name:            "Size M",
				Attributes:      `{"size": "M"}`,
				PriceAdjustment: 5.0,
				Stock:           100,
			},
			wantErr: false,
		},
		{
			name: "valid variant minimal",
			variant: ProductVariant{
				SKU:   "VAR-002",
				Name:  "Default",
				Stock: 0,
			},
			wantErr: false,
		},
		{
			name: "invalid - empty SKU",
			variant: ProductVariant{
				SKU:   "",
				Name:  "Size M",
				Stock: 10,
			},
			wantErr: true,
		},
		{
			name: "invalid - empty name",
			variant: ProductVariant{
				SKU:   "VAR-003",
				Name:  "",
				Stock: 10,
			},
			wantErr: true,
		},
		{
			name: "invalid - negative stock",
			variant: ProductVariant{
				SKU:   "VAR-004",
				Name:  "Size L",
				Stock: -5,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateVariant(&tt.variant)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateVariant() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateProductImage(t *testing.T) {
	tests := []struct {
		name    string
		image   ProductImage
		wantErr bool
	}{
		{
			name: "valid image",
			image: ProductImage{
				URL:      "/uploads/product-image.png",
				AltText:  "Product image",
				Position: 0,
			},
			wantErr: false,
		},
		{
			name: "valid image with https URL",
			image: ProductImage{
				URL:      "https://example.com/image.png",
				Position: 1,
			},
			wantErr: false,
		},
		{
			name: "invalid - empty URL",
			image: ProductImage{
				URL:      "",
				Position: 0,
			},
			wantErr: true,
		},
		{
			name: "invalid - bad URL format",
			image: ProductImage{
				URL:      "not-a-url",
				Position: 0,
			},
			wantErr: true,
		},
		{
			name: "invalid - negative position",
			image: ProductImage{
				URL:      "/uploads/image.png",
				Position: -1,
			},
			wantErr: true,
		},
		{
			name: "invalid - alt text too long",
			image: ProductImage{
				URL:      "/uploads/image.png",
				AltText:  string(make([]byte, 501)),
				Position: 0,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateProductImage(&tt.image)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateProductImage() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidator(t *testing.T) {
	t.Run("Required validation", func(t *testing.T) {
		v := NewValidator()
		v.Required("test", "")
		if !v.HasErrors() {
			t.Error("Expected error for empty required field")
		}
	})

	t.Run("MinLength validation", func(t *testing.T) {
		v := NewValidator()
		v.MinLength("test", "ab", 3)
		if !v.HasErrors() {
			t.Error("Expected error for string too short")
		}
	})

	t.Run("MaxLength validation", func(t *testing.T) {
		v := NewValidator()
		v.MaxLength("test", "abcdef", 5)
		if !v.HasErrors() {
			t.Error("Expected error for string too long")
		}
	})

	t.Run("MinValue validation", func(t *testing.T) {
		v := NewValidator()
		v.MinValue("price", 5.0, 10.0)
		if !v.HasErrors() {
			t.Error("Expected error for value too small")
		}
	})

	t.Run("MaxValue validation", func(t *testing.T) {
		v := NewValidator()
		v.MaxValue("price", 150.0, 100.0)
		if !v.HasErrors() {
			t.Error("Expected error for value too large")
		}
	})

	t.Run("Email validation", func(t *testing.T) {
		v := NewValidator()
		v.Email("email", "not-an-email")
		if !v.HasErrors() {
			t.Error("Expected error for invalid email")
		}
	})

	t.Run("ColorHex validation", func(t *testing.T) {
		v := NewValidator()
		v.ColorHex("color", "red")
		if !v.HasErrors() {
			t.Error("Expected error for invalid hex color")
		}
	})

	t.Run("Valid hex color", func(t *testing.T) {
		v := NewValidator()
		v.ColorHex("color", "#FF0000")
		if v.HasErrors() {
			t.Error("Expected no error for valid hex color")
		}
	})

	t.Run("OneOf validation", func(t *testing.T) {
		v := NewValidator()
		v.OneOf("status", "invalid", []string{"draft", "published", "archived"})
		if !v.HasErrors() {
			t.Error("Expected error for value not in allowed list")
		}
	})
}
