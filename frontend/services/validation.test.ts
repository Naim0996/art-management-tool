/**
 * Frontend validation tests
 * These tests ensure the frontend validation matches backend validation
 */

import {
  validatePersonaggio,
  validateProductCreate,
  validateProductUpdate,
  validateVariant,
  validateProductImage,
  validateImageFile,
  Validator,
} from './validation';

describe('Personaggio Validation', () => {
  it('should validate valid personaggio with all fields', () => {
    const data = {
      name: 'Test Character',
      description: 'A test character description',
      icon: '/uploads/icon.png',
      images: ['/uploads/img1.png', '/uploads/img2.png'],
      backgroundColor: '#FF0000',
      backgroundType: 'solid' as const,
      order: 0,
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate valid personaggio with gradient', () => {
    const data = {
      name: 'Gradient Character',
      description: 'Character with gradient background',
      images: [],
      backgroundColor: '#FF0000',
      backgroundType: 'gradient' as const,
      gradientFrom: '#FF0000',
      gradientTo: '#0000FF',
      order: 1,
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate valid personaggio with minimal fields', () => {
    const data = {
      name: 'Minimal Character',
      images: [],
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject empty name', () => {
    const data = {
      name: '',
      images: [],
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('name')).toBeDefined();
  });

  it('should reject name too long', () => {
    const data = {
      name: 'This is a very long name that exceeds the maximum allowed length of 100 characters for a personaggio name field',
      images: [],
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('name')).toBeDefined();
  });

  it('should reject too many images', () => {
    const data = {
      name: 'Valid Name',
      images: Array(21).fill('/img.png'), // 21 images - exceeds limit
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('images')).toBeDefined();
  });

  it('should reject bad hex color', () => {
    const data = {
      name: 'Valid Name',
      images: [],
      backgroundColor: 'red', // Not a hex color
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('backgroundColor')).toBeDefined();
  });

  it('should reject invalid background type', () => {
    const data = {
      name: 'Valid Name',
      images: [],
      backgroundType: 'pattern' as any, // Invalid type
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('backgroundType')).toBeDefined();
  });

  it('should reject negative order', () => {
    const data = {
      name: 'Valid Name',
      images: [],
      order: -1,
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('order')).toBeDefined();
  });

  it('should reject bad URL format', () => {
    const data = {
      name: 'Valid Name',
      icon: 'not-a-url',
      images: [],
    };

    const result = validatePersonaggio(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('icon')).toBeDefined();
  });
});

describe('Product Create Validation', () => {
  it('should validate valid product', () => {
    const data = {
      title: 'Test Product',
      slug: 'test-product',
      short_description: 'A test product',
      base_price: 99.99,
      currency: 'EUR',
      sku: 'TEST-001',
      status: 'draft' as const,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate valid product with minimal fields', () => {
    const data = {
      title: 'Minimal Product',
      slug: 'minimal-product',
      base_price: 0,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject empty title', () => {
    const data = {
      title: '',
      slug: 'test-product',
      base_price: 10.0,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('title')).toBeDefined();
  });

  it('should reject empty slug', () => {
    const data = {
      title: 'Test Product',
      slug: '',
      base_price: 10.0,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('slug')).toBeDefined();
  });

  it('should reject slug with uppercase', () => {
    const data = {
      title: 'Test Product',
      slug: 'Test-Product',
      base_price: 10.0,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('slug')).toBeDefined();
  });

  it('should reject slug with spaces', () => {
    const data = {
      title: 'Test Product',
      slug: 'test product',
      base_price: 10.0,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('slug')).toBeDefined();
  });

  it('should reject negative price', () => {
    const data = {
      title: 'Test Product',
      slug: 'test-product',
      base_price: -10.0,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('base_price')).toBeDefined();
  });

  it('should reject invalid status', () => {
    const data = {
      title: 'Test Product',
      slug: 'test-product',
      base_price: 10.0,
      status: 'invalid' as any,
    };

    const result = validateProductCreate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('status')).toBeDefined();
  });
});

describe('Product Update Validation', () => {
  it('should validate title update', () => {
    const data = {
      title: 'Updated Title',
    };

    const result = validateProductUpdate(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate price update', () => {
    const data = {
      base_price: 199.99,
    };

    const result = validateProductUpdate(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate full update', () => {
    const data = {
      title: 'Updated Product',
      slug: 'updated-product',
      short_description: 'Updated description',
      base_price: 150.0,
      status: 'published' as const,
    };

    const result = validateProductUpdate(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject slug with uppercase', () => {
    const data = {
      slug: 'Invalid-Slug',
    };

    const result = validateProductUpdate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('slug')).toBeDefined();
  });

  it('should reject negative price', () => {
    const data = {
      base_price: -50.0,
    };

    const result = validateProductUpdate(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('base_price')).toBeDefined();
  });
});

describe('Variant Validation', () => {
  it('should validate valid variant', () => {
    const data = {
      sku: 'VAR-001',
      name: 'Size M',
      attributes: '{"size": "M"}',
      price_adjustment: 5.0,
      stock: 100,
    };

    const result = validateVariant(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate minimal variant', () => {
    const data = {
      sku: 'VAR-002',
      name: 'Default',
      stock: 0,
    };

    const result = validateVariant(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject empty SKU', () => {
    const data = {
      sku: '',
      name: 'Size M',
      stock: 10,
    };

    const result = validateVariant(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('sku')).toBeDefined();
  });

  it('should reject empty name', () => {
    const data = {
      sku: 'VAR-003',
      name: '',
      stock: 10,
    };

    const result = validateVariant(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('name')).toBeDefined();
  });

  it('should reject negative stock', () => {
    const data = {
      sku: 'VAR-004',
      name: 'Size L',
      stock: -5,
    };

    const result = validateVariant(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('stock')).toBeDefined();
  });
});

describe('Product Image Validation', () => {
  it('should validate valid image', () => {
    const data = {
      url: '/uploads/product-image.png',
      alt_text: 'Product image',
      position: 0,
    };

    const result = validateProductImage(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should validate image with https URL', () => {
    const data = {
      url: 'https://example.com/image.png',
      position: 1,
    };

    const result = validateProductImage(data);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject empty URL', () => {
    const data = {
      url: '',
      position: 0,
    };

    const result = validateProductImage(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('url')).toBeDefined();
  });

  it('should reject bad URL format', () => {
    const data = {
      url: 'not-a-url',
      position: 0,
    };

    const result = validateProductImage(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('url')).toBeDefined();
  });

  it('should reject negative position', () => {
    const data = {
      url: '/uploads/image.png',
      position: -1,
    };

    const result = validateProductImage(data);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('position')).toBeDefined();
  });
});

describe('Image File Validation', () => {
  it('should validate valid image file', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

    const result = validateImageFile(file, 10);
    expect(result.hasErrors()).toBe(false);
  });

  it('should reject non-image file', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });

    const result = validateImageFile(file, 10);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('file')).toBeDefined();
  });

  it('should reject file too large', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB

    const result = validateImageFile(file, 10);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('file')).toBeDefined();
  });

  it('should reject invalid file extension', () => {
    const file = new File([''], 'test.bmp', { type: 'image/bmp' });

    const result = validateImageFile(file, 10);
    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('file')).toBeDefined();
  });
});

describe('Validator Class', () => {
  it('should validate required fields', () => {
    const validator = new Validator();
    validator.required('test', '');
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('test')).toBeDefined();
  });

  it('should validate minimum length', () => {
    const validator = new Validator();
    validator.minLength('test', 'ab', 3);
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('test')).toBeDefined();
  });

  it('should validate maximum length', () => {
    const validator = new Validator();
    validator.maxLength('test', 'abcdef', 5);
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('test')).toBeDefined();
  });

  it('should validate minimum value', () => {
    const validator = new Validator();
    validator.minValue('price', 5.0, 10.0);
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('price')).toBeDefined();
  });

  it('should validate maximum value', () => {
    const validator = new Validator();
    validator.maxValue('price', 150.0, 100.0);
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('price')).toBeDefined();
  });

  it('should validate email format', () => {
    const validator = new Validator();
    validator.email('email', 'not-an-email');
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('email')).toBeDefined();
  });

  it('should validate hex color format', () => {
    const validator = new Validator();
    validator.colorHex('color', 'red');
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('color')).toBeDefined();
  });

  it('should accept valid hex color', () => {
    const validator = new Validator();
    validator.colorHex('color', '#FF0000');
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(false);
  });

  it('should validate oneOf constraint', () => {
    const validator = new Validator();
    validator.oneOf('status', 'invalid', ['draft', 'published', 'archived']);
    const result = validator.getResult();

    expect(result.hasErrors()).toBe(true);
    expect(result.getFieldError('status')).toBeDefined();
  });
});
