'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { shopAPI, Product } from '@/services/ShopAPIService';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';

export default function ShopPage() {
  const locale = useLocale();
  const toast = useRef<Toast>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const perPage = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      console.log('🔄 Fetching products from API...', {
        mode: 'Next.js Proxy',
        endpoint: '/api/shop/products',
        proxiesTo: 'http://localhost:8080/api/shop/products',
      });
      
      const response = await shopAPI.listProducts({
        status: 'published',
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: 'DESC',
        page,
        per_page: perPage,
        // RIMOSSO: in_stock: true - Ora mostriamo tutti i prodotti published, anche senza stock
      });
      
      console.log('✅ Products fetched successfully:', response);
      setProducts(response.products || []);
      setTotalProducts(response.total || 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
      console.error('❌ Error fetching products:', error);
      setApiError(errorMessage);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, page, perPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = async (productId: number) => {
    try {
      await shopAPI.addToCart({
        product_id: productId,
        quantity: 1,
      });
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Product added to cart!',
        life: 3000,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add product to cart',
        life: 3000,
      });
    }
  };

  const sortOptions = [
    { label: 'Newest', value: 'created_at' },
    { label: 'Price', value: 'base_price' },
    { label: 'Title', value: 'title' },
  ];

  const totalPages = Math.ceil(totalProducts / perPage);

  const getStockQuantity = (product: Product): number => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return 0;
  };

  const getPrimaryImage = (product: Product): string => {
    const primaryImg = product.images?.find(img => img.is_primary);
    return primaryImg?.url || product.images?.[0]?.url || '/placeholder-art.png';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Debug Banner - Remove in production */}
      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start">
              <i className="pi pi-exclamation-triangle text-red-500 text-xl mr-3 mt-1"></i>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold">API Connection Error</h3>
                <p className="text-red-700 text-sm mt-1">{apiError}</p>
                <p className="text-red-600 text-xs mt-2">
                  Mode: Next.js Proxy → http://localhost:8080 • 
                  Testing page: <Link href={`/${locale}/api-test`} className="underline">Click here</Link>
                </p>
              </div>
              <button onClick={fetchProducts} className="text-red-600 hover:text-red-800">
                <i className="pi pi-refresh text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href={`/${locale}`} className="text-purple-600 hover:underline mb-2 inline-block">
                <i className="pi pi-arrow-left mr-2"></i>
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-gray-900">Art Shop</h1>
              <p className="text-gray-600 mt-1">Discover unique artworks</p>
            </div>
            <Link
              href={`/${locale}/cart`}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <i className="pi pi-shopping-cart"></i>
              Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <span className="p-input-icon-left w-full">
                <i className="pi pi-search" />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full"
                />
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600">Sort by:</label>
              <Dropdown
                value={sortBy}
                options={sortOptions}
                onChange={(e) => setSortBy(e.value)}
                className="w-40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => {
                const stockQty = getStockQuantity(product);
                const inStock = stockQty > 0;
                
                return (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="relative bg-gray-100 h-48 rounded-lg overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getPrimaryImage(product)}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <i className="pi pi-image text-6xl text-gray-400"></i>
                          </div>
                        )}
                        {!inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-semibold">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {product.short_description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-purple-600">
                            {product.currency === 'EUR' ? '€' : '$'}{product.base_price.toFixed(2)}
                          </span>
                        </div>
                        <span className={`text-sm ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {inStock ? `${stockQty} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          label="View"
                          icon="pi pi-eye"
                          className="flex-1"
                          outlined
                          onClick={() => window.location.href = `/${locale}/shop/${product.slug}`}
                        />
                        <Button
                          label="Add to Cart"
                          icon="pi pi-shopping-cart"
                          className="flex-1"
                          onClick={() => addToCart(product.id)}
                          disabled={!inStock}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  icon="pi pi-chevron-left"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  outlined
                />
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  icon="pi pi-chevron-right"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  outlined
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <i className="pi pi-inbox text-6xl text-gray-400 mb-4"></i>
            <p className="text-xl text-gray-600">No products available at the moment.</p>
          </div>
        )}
      </main>
    </div>
  );
}
