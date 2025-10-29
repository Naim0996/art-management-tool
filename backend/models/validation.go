package models

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
)

// ValidationError represents a validation error with field-specific details
type ValidationError struct {
	Field   string
	Message string
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidationErrors represents multiple validation errors
type ValidationErrors []ValidationError

func (e ValidationErrors) Error() string {
	var messages []string
	for _, err := range e {
		messages = append(messages, err.Error())
	}
	return strings.Join(messages, "; ")
}

// Validator provides validation utilities
type Validator struct {
	errors ValidationErrors
}

// NewValidator creates a new validator instance
func NewValidator() *Validator {
	return &Validator{
		errors: ValidationErrors{},
	}
}

// Required validates that a field is not empty
func (v *Validator) Required(field, value string) *Validator {
	if strings.TrimSpace(value) == "" {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "is required",
		})
	}
	return v
}

// MinLength validates minimum string length
func (v *Validator) MinLength(field, value string, min int) *Validator {
	if len(strings.TrimSpace(value)) < min {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: fmt.Sprintf("must be at least %d characters", min),
		})
	}
	return v
}

// MaxLength validates maximum string length
func (v *Validator) MaxLength(field, value string, max int) *Validator {
	if len(value) > max {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: fmt.Sprintf("must not exceed %d characters", max),
		})
	}
	return v
}

// MinValue validates minimum numeric value
func (v *Validator) MinValue(field string, value float64, min float64) *Validator {
	if value < min {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: fmt.Sprintf("must be at least %.2f", min),
		})
	}
	return v
}

// MaxValue validates maximum numeric value
func (v *Validator) MaxValue(field string, value float64, max float64) *Validator {
	if value > max {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: fmt.Sprintf("must not exceed %.2f", max),
		})
	}
	return v
}

// Pattern validates string against regex pattern
func (v *Validator) Pattern(field, value, pattern string) *Validator {
	matched, err := regexp.MatchString(pattern, value)
	if err != nil || !matched {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "has invalid format",
		})
	}
	return v
}

// OneOf validates that value is one of allowed values
func (v *Validator) OneOf(field, value string, allowed []string) *Validator {
	for _, a := range allowed {
		if value == a {
			return v
		}
	}
	v.errors = append(v.errors, ValidationError{
		Field:   field,
		Message: fmt.Sprintf("must be one of: %s", strings.Join(allowed, ", ")),
	})
	return v
}

// URL validates URL format
func (v *Validator) URL(field, value string) *Validator {
	if value == "" {
		return v // Allow empty URLs if not required
	}
	// Simple URL validation
	if !strings.HasPrefix(value, "http://") && !strings.HasPrefix(value, "https://") && !strings.HasPrefix(value, "/") {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "must be a valid URL",
		})
	}
	return v
}

// Email validates email format
func (v *Validator) Email(field, value string) *Validator {
	if value == "" {
		return v // Allow empty email if not required
	}
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	matched, err := regexp.MatchString(pattern, value)
	if err != nil || !matched {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "must be a valid email address",
		})
	}
	return v
}

// ColorHex validates hex color format
func (v *Validator) ColorHex(field, value string) *Validator {
	if value == "" {
		return v // Allow empty color if not required
	}
	pattern := `^#[0-9A-Fa-f]{6}$`
	matched, err := regexp.MatchString(pattern, value)
	if err != nil || !matched {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "must be a valid hex color (e.g., #FF0000)",
		})
	}
	return v
}

// HasErrors returns true if there are validation errors
func (v *Validator) HasErrors() bool {
	return len(v.errors) > 0
}

// Errors returns all validation errors
func (v *Validator) Errors() error {
	if len(v.errors) == 0 {
		return nil
	}
	return v.errors
}

// Validate PersonaggioInput
func (p *PersonaggioInput) Validate() error {
	v := NewValidator()

	v.Required("name", p.Name).
		MinLength("name", p.Name, 1).
		MaxLength("name", p.Name, 100)

	v.MaxLength("description", p.Description, 2000)

	if p.Icon != "" {
		v.URL("icon", p.Icon)
	}

	if len(p.Images) > 20 {
		v.errors = append(v.errors, ValidationError{
			Field:   "images",
			Message: "cannot exceed 20 images",
		})
	}

	for i, img := range p.Images {
		v.URL(fmt.Sprintf("images[%d]", i), img)
	}

	if p.BackgroundColor != "" {
		v.ColorHex("backgroundColor", p.BackgroundColor)
	}

	if p.BackgroundType != "" {
		v.OneOf("backgroundType", p.BackgroundType, []string{"solid", "gradient", "image"})
	}

	if p.BackgroundType == "gradient" {
		if p.GradientFrom != "" {
			v.ColorHex("gradientFrom", p.GradientFrom)
		}
		if p.GradientTo != "" {
			v.ColorHex("gradientTo", p.GradientTo)
		}
	}

	if p.BackgroundType == "image" && p.BackgroundImage != "" {
		v.URL("backgroundImage", p.BackgroundImage)
	}

	if p.Order < 0 {
		v.errors = append(v.errors, ValidationError{
			Field:   "order",
			Message: "must be a non-negative integer",
		})
	}

	return v.Errors()
}

// Validate EnhancedProduct for creation
func ValidateProductCreate(p *EnhancedProduct) error {
	v := NewValidator()

	v.Required("title", p.Title).
		MinLength("title", p.Title, 1).
		MaxLength("title", p.Title, 500)

	v.Required("slug", p.Slug).
		MinLength("slug", p.Slug, 1).
		MaxLength("slug", p.Slug, 255).
		Pattern("slug", p.Slug, `^[a-z0-9-]+$`)

	v.MaxLength("shortDescription", p.ShortDescription, 1000)
	v.MaxLength("longDescription", p.LongDescription, 50000)

	v.MinValue("basePrice", p.BasePrice, 0)

	if p.Currency == "" {
		p.Currency = "EUR"
	}
	v.MaxLength("currency", p.Currency, 3)

	v.MaxLength("sku", p.SKU, 100)
	v.MaxLength("gtin", p.GTIN, 50)

	if p.Status == "" {
		p.Status = ProductStatusDraft
	}
	v.OneOf("status", string(p.Status), []string{
		string(ProductStatusDraft),
		string(ProductStatusPublished),
		string(ProductStatusArchived),
	})

	return v.Errors()
}

// Validate EnhancedProduct for updates
func ValidateProductUpdate(p *EnhancedProduct) error {
	v := NewValidator()

	if p.Title != "" {
		v.MinLength("title", p.Title, 1).
			MaxLength("title", p.Title, 500)
	}

	if p.Slug != "" {
		v.MinLength("slug", p.Slug, 1).
			MaxLength("slug", p.Slug, 255).
			Pattern("slug", p.Slug, `^[a-z0-9-]+$`)
	}

	if p.ShortDescription != "" {
		v.MaxLength("shortDescription", p.ShortDescription, 1000)
	}

	if p.LongDescription != "" {
		v.MaxLength("longDescription", p.LongDescription, 50000)
	}

	if p.BasePrice < 0 {
		v.MinValue("basePrice", p.BasePrice, 0)
	}

	if p.Currency != "" {
		v.MaxLength("currency", p.Currency, 3)
	}

	if p.SKU != "" {
		v.MaxLength("sku", p.SKU, 100)
	}

	if p.GTIN != "" {
		v.MaxLength("gtin", p.GTIN, 50)
	}

	if p.Status != "" {
		v.OneOf("status", string(p.Status), []string{
			string(ProductStatusDraft),
			string(ProductStatusPublished),
			string(ProductStatusArchived),
		})
	}

	return v.Errors()
}

// Validate ProductVariant
func ValidateVariant(variant *ProductVariant) error {
	v := NewValidator()

	v.Required("sku", variant.SKU).
		MaxLength("sku", variant.SKU, 100)

	v.Required("name", variant.Name).
		MaxLength("name", variant.Name, 255)

	if variant.Stock < 0 {
		return errors.New("stock must be non-negative")
	}

	return v.Errors()
}

// Validate ProductImage
func ValidateProductImage(img *ProductImage) error {
	v := NewValidator()

	v.Required("url", img.URL).
		MaxLength("url", img.URL, 1000).
		URL("url", img.URL)

	v.MaxLength("altText", img.AltText, 500)

	if img.Position < 0 {
		return errors.New("position must be non-negative")
	}

	return v.Errors()
}

// Validate FumettoInput
func (f *FumettoInput) Validate() error {
	v := NewValidator()

	v.Required("title", f.Title).
		MinLength("title", f.Title, 1).
		MaxLength("title", f.Title, 200)

	v.MaxLength("description", f.Description, 5000)

	if f.CoverImage != "" {
		v.URL("coverImage", f.CoverImage)
	}

	if len(f.Pages) > 100 {
		v.errors = append(v.errors, ValidationError{
			Field:   "pages",
			Message: "cannot exceed 100 pages",
		})
	}

	for i, page := range f.Pages {
		v.URL(fmt.Sprintf("pages[%d]", i), page)
	}

	if f.Order < 0 {
		v.errors = append(v.errors, ValidationError{
			Field:   "order",
			Message: "must be a non-negative integer",
		})
	}

	return v.Errors()
}
