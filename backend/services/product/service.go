package product

import (
	"errors"
	"fmt"
	"strings"

	"github.com/Naim0996/art-management-tool/backend/models"
	"gorm.io/gorm"
)

var (
	ErrProductNotFound  = errors.New("product not found")
	ErrVariantNotFound  = errors.New("variant not found")
	ErrCategoryNotFound = errors.New("category not found")
	ErrInvalidSlug      = errors.New("invalid slug")
	ErrDuplicateSKU     = errors.New("duplicate SKU")
)

// Service handles product operations
type Service struct {
	db *gorm.DB
}

// NewService creates a new product service
func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// ListProducts lists products with filters
func (s *Service) ListProducts(filters *ProductFilters) ([]models.EnhancedProduct, int64, error) {
	var products []models.EnhancedProduct
	var total int64

	query := s.db.Model(&models.EnhancedProduct{})

	// Apply filters
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}

	if filters.CategoryID > 0 {
		query = query.Joins("JOIN product_categories ON product_categories.product_id = products.id").
			Where("product_categories.category_id = ?", filters.CategoryID)
	}

	if filters.CharacterID > 0 {
		query = query.Where("character_id = ?", filters.CharacterID)
	}

	if filters.CharacterValue != "" {
		query = query.Where("LOWER(character_value) = LOWER(?)", filters.CharacterValue)
	}

	if filters.MinPrice > 0 {
		query = query.Where("base_price >= ?", filters.MinPrice)
	}

	if filters.MaxPrice > 0 {
		query = query.Where("base_price <= ?", filters.MaxPrice)
	}

	if filters.Search != "" {
		search := "%" + strings.ToLower(filters.Search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(short_description) LIKE ? OR LOWER(long_description) LIKE ?",
			search, search, search)
	}

	if filters.InStock {
		// FIX: Usa una subquery per filtrare prodotti con almeno una variante in stock
		// Questo funziona anche per prodotti senza varianti (non vengono esclusi)
		query = query.Where("EXISTS (SELECT 1 FROM product_variants WHERE product_variants.product_id = products.id AND product_variants.stock > 0)")
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (filters.Page - 1) * filters.PerPage
	query = query.Offset(offset).Limit(filters.PerPage)

	// Order
	if filters.SortBy != "" {
		query = query.Order(fmt.Sprintf("%s %s", filters.SortBy, filters.SortOrder))
	} else {
		query = query.Order("created_at DESC")
	}

	// Load relationships
	query = query.Preload("Categories").
		Preload("Images").
		Preload("Variants")

	if err := query.Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

// GetProduct gets a product by ID
func (s *Service) GetProduct(id uint) (*models.EnhancedProduct, error) {
	var product models.EnhancedProduct
	err := s.db.Preload("Categories").
		Preload("Images").
		Preload("Variants").
		First(&product, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	return &product, nil
}

// GetProductBySlug gets a product by slug
func (s *Service) GetProductBySlug(slug string) (*models.EnhancedProduct, error) {
	var product models.EnhancedProduct
	err := s.db.Where("slug = ?", slug).
		Preload("Categories").
		Preload("Images").
		Preload("Variants").
		First(&product).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	return &product, nil
}

// CreateProduct creates a new product
func (s *Service) CreateProduct(product *models.EnhancedProduct) error {
	// Validate slug
	if product.Slug == "" {
		return ErrInvalidSlug
	}

	// Check for duplicate SKU
	if product.SKU != "" {
		var count int64
		s.db.Model(&models.EnhancedProduct{}).Where("sku = ?", product.SKU).Count(&count)
		if count > 0 {
			return ErrDuplicateSKU
		}
	}

	return s.db.Create(product).Error
}

// UpdateProduct updates a product
func (s *Service) UpdateProduct(id uint, updates *models.EnhancedProduct) error {
	var product models.EnhancedProduct
	if err := s.db.First(&product, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductNotFound
		}
		return err
	}

	// Check for duplicate SKU if changing
	if updates.SKU != "" && updates.SKU != product.SKU {
		var count int64
		s.db.Model(&models.EnhancedProduct{}).Where("sku = ? AND id != ?", updates.SKU, id).Count(&count)
		if count > 0 {
			return ErrDuplicateSKU
		}
	}

	return s.db.Model(&product).Updates(updates).Error
}

// DeleteProduct soft deletes a product
func (s *Service) DeleteProduct(id uint) error {
	result := s.db.Delete(&models.EnhancedProduct{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
}

// AddVariant adds a variant to a product
func (s *Service) AddVariant(productID uint, variant *models.ProductVariant) error {
	// Verify product exists
	var product models.EnhancedProduct
	if err := s.db.First(&product, productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductNotFound
		}
		return err
	}

	// Check for duplicate SKU
	var count int64
	s.db.Model(&models.ProductVariant{}).Where("sku = ?", variant.SKU).Count(&count)
	if count > 0 {
		return ErrDuplicateSKU
	}

	variant.ProductID = productID
	return s.db.Create(variant).Error
}

// UpdateVariant updates a variant
func (s *Service) UpdateVariant(id uint, updates *models.ProductVariant) error {
	var variant models.ProductVariant
	if err := s.db.First(&variant, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrVariantNotFound
		}
		return err
	}

	// Check for duplicate SKU if changing
	if updates.SKU != "" && updates.SKU != variant.SKU {
		var count int64
		s.db.Model(&models.ProductVariant{}).Where("sku = ? AND id != ?", updates.SKU, id).Count(&count)
		if count > 0 {
			return ErrDuplicateSKU
		}
	}

	return s.db.Model(&variant).Updates(updates).Error
}

// DeleteVariant soft deletes a variant
func (s *Service) DeleteVariant(id uint) error {
	result := s.db.Delete(&models.ProductVariant{}, id)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return ErrVariantNotFound
	}

	return nil
}

// AddImage adds an image to a product
func (s *Service) AddImage(productID uint, image *models.ProductImage) error {
	// Verify product exists
	var product models.EnhancedProduct
	if err := s.db.First(&product, productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrProductNotFound
		}
		return err
	}

	image.ProductID = productID
	return s.db.Create(image).Error
}

// RemoveImage removes an image from a product
func (s *Service) RemoveImage(imageID uint) error {
	return s.db.Delete(&models.ProductImage{}, imageID).Error
}

// UpdateInventory updates variant stock
func (s *Service) UpdateInventory(variantID uint, quantity int, operation string) error {
	var variant models.ProductVariant
	if err := s.db.First(&variant, variantID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrVariantNotFound
		}
		return err
	}

	switch operation {
	case "set":
		variant.Stock = quantity
	case "add":
		variant.Stock += quantity
	case "subtract":
		variant.Stock -= quantity
		if variant.Stock < 0 {
			variant.Stock = 0
		}
	default:
		return fmt.Errorf("invalid operation: %s", operation)
	}

	return s.db.Save(&variant).Error
}

// ProductFilters represents filters for product listing
type ProductFilters struct {
	Status         models.ProductStatus
	CategoryID     uint
	CharacterID    uint
	CharacterValue string
	MinPrice       float64
	MaxPrice       float64
	Search         string
	InStock        bool
	Page           int
	PerPage        int
	SortBy         string
	SortOrder      string
}

// DefaultFilters returns default filters
func DefaultFilters() *ProductFilters {
	return &ProductFilters{
		Page:      1,
		PerPage:   20,
		SortBy:    "created_at",
		SortOrder: "DESC",
	}
}
