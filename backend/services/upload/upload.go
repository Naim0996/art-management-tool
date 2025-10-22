package upload

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// Config represents upload configuration
type Config struct {
	BaseDir        string   // Base directory for uploads (e.g., "./uploads")
	MaxFileSize    int64    // Maximum file size in bytes
	AllowedTypes   []string // Allowed MIME types
	AllowedExts    []string // Allowed file extensions
}

// DefaultConfig returns default upload configuration
func DefaultConfig() *Config {
	return &Config{
		BaseDir:     "./uploads",
		MaxFileSize: 10 << 20, // 10 MB
		AllowedTypes: []string{
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
		},
		AllowedExts: []string{".jpg", ".jpeg", ".png", ".gif", ".webp"},
	}
}

// Service handles file upload operations
type Service struct {
	config *Config
}

// NewService creates a new upload service
func NewService(config *Config) *Service {
	if config == nil {
		config = DefaultConfig()
	}
	return &Service{config: config}
}

// ValidateFile validates file type and size
func (s *Service) ValidateFile(header *multipart.FileHeader) error {
	// Check file size
	if header.Size > s.config.MaxFileSize {
		return fmt.Errorf("file size exceeds maximum allowed size of %d bytes", s.config.MaxFileSize)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))
	validExt := false
	for _, allowedExt := range s.config.AllowedExts {
		if ext == allowedExt {
			validExt = true
			break
		}
	}
	if !validExt {
		return fmt.Errorf("file extension %s is not allowed", ext)
	}

	// Check MIME type
	contentType := header.Header.Get("Content-Type")
	validType := false
	for _, allowedType := range s.config.AllowedTypes {
		if contentType == allowedType {
			validType = true
			break
		}
	}
	if !validType {
		return fmt.Errorf("file type %s is not allowed", contentType)
	}

	return nil
}

// SaveFile saves an uploaded file to disk
func (s *Service) SaveFile(file multipart.File, header *multipart.FileHeader, subDir string, prefix string) (string, error) {
	// Validate file
	if err := s.ValidateFile(header); err != nil {
		return "", err
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%s%s", prefix, uuid.New().String()[:8], ext)
	filename = strings.ReplaceAll(filename, " ", "_")

	// Create directory if not exists
	uploadDir := filepath.Join(s.config.BaseDir, subDir)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Create destination file
	filePath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy file contents
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	// Return public URL
	publicURL := fmt.Sprintf("/uploads/%s/%s", subDir, filename)
	return publicURL, nil
}

// DeleteFile removes a file from disk
func (s *Service) DeleteFile(publicURL string) error {
	if !strings.HasPrefix(publicURL, "/uploads/") {
		return fmt.Errorf("invalid file URL")
	}

	filePath := filepath.Join(".", publicURL)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}
