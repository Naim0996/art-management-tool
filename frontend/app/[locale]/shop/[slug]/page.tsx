'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { shopAPI, Product, ProductVariant } from '@/services/ShopAPIService';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Galleria } from 'primereact/galleria';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';

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

  const slug = params?.slug as string;

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
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
    
    // Sort by is_primary and display_order
    return [...product.images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  };

  const itemTemplate = (item: any) => {
    return (
      <img 
        src={item.url} 
        alt={item.alt_text || product?.title} 
        className="w-full h-auto object-contain max-h-[600px]"
      />
    );
  };

  const thumbnailTemplate = (item: any) => {
    return (
      <img 
        src={item.url} 
        alt={item.alt_text || product?.title} 
        className="w-20 h-20 object-cover cursor-pointer"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Toast ref={toast} />
          <div className="flex items-center justify-center h-64">
            <i className="pi pi-spin pi-spinner text-4xl text-purple-600"></i>
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
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href={`/${locale}/shop`} className="text-purple-600 hover:underline inline-flex items-center">
            <i className="pi pi-arrow-left mr-2"></i>
            Back to Shop
          </Link>
        </div>
      </header>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <Galleria
                value={images}
                item={itemTemplate}
                thumbnail={thumbnailTemplate}
                numVisible={5}
                circular
                autoPlay={false}
                showItemNavigators
                showThumbnails={images.length > 1}
                className="product-gallery"
              />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.title}</h1>
                {product.short_description && (
                  <p className="text-xl text-gray-600">{product.short_description}</p>
                )}
              </div>

              <Divider />

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-purple-600">
                  {product.currency === 'EUR' ? '€' : '$'}{currentPrice.toFixed(2)}
                </span>
                {selectedVariant && selectedVariant.price_adjustment !== 0 && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.currency === 'EUR' ? '€' : '$'}{product.base_price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <i className={`pi ${inStock ? 'pi-check-circle text-green-600' : 'pi-times-circle text-red-600'}`}></i>
                <span className={`font-semibold ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {inStock ? `${stockQty} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">Select Variant:</label>
                  <Dropdown
                    value={selectedVariant}
                    options={product.variants}
                    onChange={(e) => setSelectedVariant(e.value)}
                    optionLabel="name"
                    placeholder="Choose a variant"
                    className="w-full"
                    itemTemplate={(option) => (
                      <div className="flex justify-between items-center">
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
              <div className="space-y-2">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <InputNumber
                  value={quantity}
                  onValueChange={(e) => setQuantity(e.value || 1)}
                  min={1}
                  max={stockQty}
                  disabled={!inStock}
                  showButtons
                  buttonLayout="horizontal"
                  decrementButtonClassName="p-button-danger"
                  incrementButtonClassName="p-button-success"
                  className="w-full"
                />
              </div>

              <Divider />

              {/* Add to Cart Button */}
              <div className="flex gap-4">
                <Button
                  label="Add to Cart"
                  icon="pi pi-shopping-cart"
                  className="flex-1"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={!inStock || addingToCart}
                  loading={addingToCart}
                />
                <Button
                  icon="pi pi-heart"
                  className="p-button-outlined"
                  size="large"
                  tooltip="Add to wishlist"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>

              {/* Product Meta */}
              {(product.sku || product.gtin) && (
                <div className="space-y-1 text-sm text-gray-600">
                  {product.sku && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">SKU:</span>
                      <span>{product.sku}</span>
                    </div>
                  )}
                  {product.gtin && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">GTIN:</span>
                      <span>{product.gtin}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Long Description */}
          {product.long_description && (
            <div className="border-t p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {product.long_description}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
