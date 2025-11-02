'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { shopAPI, Product, ProductVariant } from '@/services/ShopAPIService';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const toast = useRef<Toast>(null);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const productData = await shopAPI.getProduct(slug);
      setProduct(productData);
      
      // Auto-select first variant if available
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load product details',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await shopAPI.addToCart({
        product_id: product.id,
        variant_id: selectedVariant?.id,
        quantity,
      });
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `${quantity} item(s) added to cart!`,
        life: 3000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add to cart',
        life: 3000,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const getStockQuantity = (): number => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    
    if (product?.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    
    return 0;
  };

  const getCurrentPrice = (): number => {
    if (!product) return 0;
    
    if (selectedVariant) {
      return product.base_price + selectedVariant.price_adjustment;
    }
    
    return product.base_price;
  };

  const getImages = () => {
    if (!product?.images || product.images.length === 0) {
      return [{ url: '/placeholder-art.png', alt_text: product?.title || 'Product' }];
    }
    
    // Sort by is_primary and position
    return [...product.images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.position - b.position;
    });
  };

  const nextImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Toast ref={toast} />
              <div className="flex items-center justify-center h-64">
                <i className="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
              </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Toast ref={toast} />
          <div className="text-center py-16">
            <i className="pi pi-exclamation-triangle text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product Not Found</h2>
            <Link href={`/${locale}/shop`}>
              <Button label="Back to Shop" icon="pi pi-arrow-left" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockQty = getStockQuantity();
  const inStock = stockQty > 0;
  const currentPrice = getCurrentPrice();
  const images = getImages();

  return (
    <div className="min-h-screen bg-white">
      <Toast ref={toast} />

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <Link href={`/${locale}/shop`} className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium">
            <i className="pi pi-arrow-left mr-2"></i>
            Torna allo Shop
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 p-4 md:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="w-full">
                {/* Main Image */}
                <div className="relative w-full h-[500px] mb-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <img 
                    src={images[currentImageIndex]?.url || '/placeholder-art.png'} 
                    alt={images[currentImageIndex]?.alt_text || product?.title}
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110"
                        aria-label="Next image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'bg-blue-500 w-8' 
                              : 'bg-gray-400 hover:bg-gray-500'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail carousel */}
                {images.length > 1 && (
                  <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`flex-shrink-0 relative w-20 h-20 rounded-lg border-2 transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-300' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          aria-label={`Thumbnail ${index + 1}`}
                        >
                          <img 
                            src={img.url} 
                            alt={img.alt_text || product?.title}
                            className="w-full h-full object-cover rounded"
                          />
                          {index === currentImageIndex && (
                            <div className="absolute inset-0 bg-blue-500/10" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                {product.short_description && (
                  <p className="text-base text-gray-600 mb-3">{product.short_description}</p>
                )}
                {product.long_description && (
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-4">
                    {product.long_description}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-blue-600">
                  {product.currency === 'EUR' ? '€' : '$'}{currentPrice.toFixed(2)}
                </span>
                {selectedVariant && selectedVariant.price_adjustment !== 0 && (
                  <span className="text-2xl text-gray-400 line-through">
                    {product.currency === 'EUR' ? '€' : '$'}{product.base_price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <i className={`pi ${inStock ? 'pi-check-circle' : 'pi-times-circle'}`} 
                   style={{ color: inStock ? '#10b981' : '#ef4444', fontSize: '1.25rem' }}></i>
                <span className={`font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {inStock ? `${stockQty} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <label className="font-semibold text-gray-900 text-base">Select Variant:</label>
                  <Dropdown
                    value={selectedVariant}
                    options={product.variants}
                    onChange={(e) => setSelectedVariant(e.value)}
                    optionLabel="name"
                    placeholder="Choose a variant"
                    className="w-full"
                    itemTemplate={(option) => (
                      <div className="flex justify-between items-center py-2">
                        <span>{option.name}</span>
                        <span className="text-sm text-gray-500">
                          {option.stock > 0 ? `${option.stock} available` : 'Out of stock'}
                        </span>
                      </div>
                    )}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="font-semibold text-gray-900 text-base">Quantity:</label>
                <div className="flex items-center border rounded-md overflow-hidden w-full max-w-xs">
                  <Button
                    icon="pi pi-minus"
                    className="p-button-text p-button-danger border-0 rounded-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!inStock || quantity <= 1}
                    style={{ height: '3rem' }}
                  />
                  <InputNumber
                    value={quantity}
                    onValueChange={(e) => setQuantity(e.value || 1)}
                    min={1}
                    max={stockQty}
                    disabled={!inStock}
                    className="flex-1 border-0"
                    inputClassName="text-center border-0"
                    showButtons={false}
                    style={{ width: '100%' }}
                  />
                  <Button
                    icon="pi pi-plus"
                    className="p-button-text p-button-success border-0 rounded-none"
                    onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                    disabled={!inStock || quantity >= stockQty}
                    style={{ height: '3rem' }}
                  />
                </div>
              </div>

              {/* Add to Cart and Checkout Buttons */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4">
                <Button
                  label="Add to Cart"
                  icon="pi pi-shopping-cart"
                  className="w-full md:flex-1 p-button-primary"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  loading={addingToCart}
                  style={{ 
                    backgroundColor: '#0066CC',
                    borderColor: '#0066CC',
                    height: '3.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}
                />
                <Link href={`/${locale}/checkout`} className="w-full md:flex-1">
                  <Button
                    label="Checkout"
                    icon="pi pi-credit-card"
                    className="w-full p-button-outlined"
                    size="large"
                    disabled={!inStock}
                    style={{ 
                      borderColor: '#0066CC',
                      color: '#0066CC',
                      height: '3.5rem',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}
                  />
                </Link>
              </div>

              {/* Etsy Button */}
              {product.etsy_shop_url && (
                <a href={product.etsy_shop_url} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    label="Acquista su Etsy"
                    icon="pi pi-external-link"
                    className="w-full"
                    size="large"
                    style={{ 
                      backgroundColor: '#F1641E',
                      borderColor: '#F1641E',
                      color: '#ffffff',
                      height: '3.5rem',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}
                  />
                </a>
              )}
              
              {/* View Character Button */}
              {product.character_id && (
                <Link href={`/${locale}/personaggi`}>
                  <Button
                    label="View Character"
                    icon="pi pi-user"
                    className="w-full p-button-outlined"
                    size="large"
                    style={{ 
                      height: '3.5rem',
                      fontSize: '1.1rem',
                      borderColor: '#0066CC',
                      color: '#0066CC',
                      fontWeight: '600'
                    }}
                  />
                </Link>
              )}

              {/* Product Meta */}
              {product.sku && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">SKU:</span>
                    <span>{product.sku}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
