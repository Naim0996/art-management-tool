'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { shopAPI, CartResponse } from '@/services/ShopAPIService';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCartState from '@/components/cart/EmptyCartState';

export default function CartPage() {
  const locale = useLocale();
  const toast = useRef<Toast>(null);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to calculate cart totals
  const calculateCartTotals = (items: CartResponse['cart']['items']) => {
    try {
      console.log(`🛒 [CALC] Calculating totals for ${items.length} items:`, items);
      
      let subtotal = 0;
      items.forEach((item, index) => {
        if (item.product) {
          const basePrice = item.product.base_price || 0;
          const priceAdjustment = item.variant?.price_adjustment || 0;
          const itemTotal = (basePrice + priceAdjustment) * item.quantity;
          subtotal += itemTotal;
          
          console.log(`🛒 [CALC] Item ${index}: basePrice=${basePrice}, adjustment=${priceAdjustment}, quantity=${item.quantity}, total=${itemTotal}`);
        } else {
          console.warn(`🛒 [CALC] Item ${index} has no product data:`, item);
        }
      });
      
      const tax = subtotal * 0.1; // 10% tax (adjust as needed)
      const discount = 0; // No discount for now
      const total = subtotal + tax - discount;
      
      const result = { subtotal, tax, discount, total };
      console.log(`🛒 [CALC] Final totals:`, result);
      
      return result;
    } catch (error) {
      console.error(`🛒 [CALC] Error calculating totals:`, error);
      // Return safe defaults
      return { subtotal: 0, tax: 0, discount: 0, total: 0 };
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setApiError(null);
      console.log(`🛒 [FETCH] Starting cart fetch...`);
      const data = await shopAPI.getCart();
      console.log(`🛒 [FETCH] Cart fetched successfully:`, data);
      
      // Validate data before setting state
      if (data && data.cart && typeof data.cart.id === 'number') {
        console.log(`🛒 [FETCH] Data validation passed, updating state`);
        setCartData(data);
        console.log(`🛒 [FETCH] Cart state updated successfully`);
      } else {
        console.error('🛒 [FETCH] Invalid cart data received:', data);
        setApiError('Invalid cart data received from server');
      }
    } catch (error) {
      console.error('🛒 [FETCH] Error fetching cart:', error);
      console.error('🛒 [FETCH] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        originalError: error
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load cart';
      setApiError(errorMessage);
      
      // Don't clear cartData on fetch error - keep existing state
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 3000,
      });
    } finally {
      setLoading(false);
      console.log(`🛒 [FETCH] Fetch operation completed`);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number | null | undefined) => {
    // Validate quantity - prevent null/undefined values
    const validQuantity = quantity && quantity > 0 ? quantity : 1;
    
    // Don't make API call if quantity is the same
    const currentItem = cartData?.cart?.items?.find(item => item.id === itemId);
    if (currentItem && currentItem.quantity === validQuantity) {
      return;
    }
    
    // Store original state for potential rollback
    const originalCartData = cartData;
    
    setUpdating(itemId);
    try {
      console.log(`🛒 Updating item ${itemId} to quantity ${validQuantity}`);
      const data = await shopAPI.updateCartItem(itemId, validQuantity);
      console.log(`🛒 Update response:`, data);
      
      if (data && data.cart) {
        setCartData(data);
        toast.current?.show({
          severity: 'success',
          summary: 'Updated',
          detail: 'Cart updated successfully',
          life: 2000,
        });
      } else {
        console.warn('🛒 Invalid response format, re-fetching cart');
        await fetchCart();
      }
    } catch (error) {
      console.error('🛒 Error updating cart:', error);
      // Rollback to original state and re-fetch
      setCartData(originalCartData);
      try {
        await fetchCart();
      } catch (fetchError) {
        console.error('🛒 Error re-fetching cart:', fetchError);
      }
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update cart',
        life: 3000,
      });
    } finally {
      setUpdating(null);
    }
  };

  const removeFromCart = async (itemId: number) => {
    console.log(`🛒 [START] Removing item ${itemId}`);
    
    // Store original state for potential rollback
    const originalCartData = cartData;
    console.log(`🛒 Original cart data:`, originalCartData);
    
    setUpdating(itemId);
    try {
      console.log(`🛒 Making API call to remove item ${itemId}`);
      await shopAPI.removeCartItem(itemId);
      console.log(`🛒 API call successful, item ${itemId} removed`);
      
      // FORCE immediate UI update - remove item immediately after successful API call
      console.log(`🛒 FORCING immediate UI update...`);
      if (cartData && cartData.cart && cartData.cart.items) {
        const updatedItems = cartData.cart.items.filter(item => item.id !== itemId);
        console.log(`🛒 Updated items after filter:`, updatedItems);
        
        const newTotals = calculateCartTotals(updatedItems);
        console.log(`🛒 Calculated new totals:`, newTotals);
        
        const updatedCart = {
          ...cartData,
          cart: {
            ...cartData.cart,
            items: updatedItems
          },
          ...newTotals
        };
        console.log(`🛒 Setting updated cart data:`, updatedCart);
        setCartData(updatedCart);
        console.log(`🛒 FORCED UI update completed`);
      }
      
      // Show success immediately
      toast.current?.show({
        severity: 'success',
        summary: 'Removed',
        detail: 'Item removed from cart',
        life: 2000,
      });
      console.log(`🛒 Success toast shown`);
      
    } catch (error) {
      console.error('🛒 [ERROR] Error removing from cart:', error);
      console.error('🛒 [ERROR] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        originalError: error
      });
      
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove item',
        life: 3000,
      });
    } finally {
      setUpdating(null);
      console.log(`🛒 [END] Remove item operation completed`);
    }
  };

  const clearCart = async () => {
    console.log(`🛒 [START] Clear cart operation`);
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.');
    if (!confirmed) {
      console.log(`🛒 Clear cart cancelled by user`);
      return;
    }
    
    // Store original state for potential rollback
    const originalCartData = cartData;
    console.log(`🛒 Original cart data:`, originalCartData);
    
    setClearingCart(true);
    try {
      console.log(`🛒 Making API call to clear cart`);
      await shopAPI.clearCart();
      console.log(`🛒 API call successful, cart cleared`);
      
      // FORCE immediate UI update - clear cart state immediately after successful API call
      console.log(`🛒 FORCING immediate UI update...`);
      if (cartData && cartData.cart) {
        const clearedCart = {
          ...cartData,
          cart: {
            ...cartData.cart,
            items: []
          },
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0
        };
        console.log(`🛒 Setting cleared cart data:`, clearedCart);
        setCartData(clearedCart);
        console.log(`🛒 FORCED UI update completed`);
      }
      
      // Show success immediately
      toast.current?.show({
        severity: 'success',
        summary: 'Cleared',
        detail: 'Cart cleared successfully',
        life: 2000,
      });
      console.log(`🛒 Success toast shown`);
      
      // Re-fetch in background to ensure consistency (but don't wait for it)
      console.log(`🛒 Background re-fetch for consistency...`);
      fetchCart().catch(fetchError => {
        console.warn(`🛒 Background fetch failed, but UI already updated:`, fetchError);
      });
      
    } catch (error) {
      console.error('🛒 [ERROR] Error clearing cart:', error);
      console.error('🛒 [ERROR] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        originalError: error
      });
      
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to clear cart',
        life: 3000,
      });
    } finally {
      setClearingCart(false);
      console.log(`🛒 [END] Clear cart operation completed`);
    }
  };

  const proceedToCheckout = () => {
    router.push(`/${locale}/checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <Toast ref={toast} />
          <div className="flex items-center justify-center h-64">
            <i className="pi pi-spin pi-spinner text-4xl text-purple-600"></i>
          </div>
        </div>
      </div>
    );
  }

  const hasItems = cartData?.cart?.items && cartData.cart.items.length > 0;
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🛒 Cart state - hasItems: ${hasItems}, items count: ${cartData?.cart?.items?.length || 0}`, cartData?.cart?.items);
  }

  // If there's an API error, show error state
  if (apiError && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toast ref={toast} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-16 bg-white shadow-sm">
            <div className="space-y-4">
              <i className="pi pi-exclamation-triangle text-6xl text-red-400"></i>
              <h2 className="text-2xl font-semibold text-gray-800">Error loading cart</h2>
              <p className="text-gray-600">{apiError}</p>
              <Button
                label="Try Again"
                icon="pi pi-refresh"
                size="large"
                className="mt-4"
                onClick={() => {
                  setLoading(true);
                  fetchCart();
                }}
              />
              <Link href={`/${locale}/shop`}>
                <Button
                  label="Continue Shopping"
                  icon="pi pi-shopping-bag"
                  outlined
                  size="large"
                  className="mt-2"
                />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toast ref={toast} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={`/${locale}/shop`} className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium">
            <i className="pi pi-arrow-left mr-2"></i>
            Continua shopping
          </Link>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black">Carrello</h1>
          {hasItems && (
            <Button
              label="Svuota"
              icon="pi pi-trash"
              className="p-button-text p-button-danger"
              onClick={clearCart}
              loading={clearingCart}
              disabled={clearingCart}
            />
          )}
        </div>
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.cart.items.map((item) => {
                try {
                  return (
                    <CartItem
                      key={item.id}
                      item={item}
                      updating={updating === item.id}
                      onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                      onRemove={() => removeFromCart(item.id)}
                    />
                  );
                } catch (renderError) {
                  console.error(`🛒 [RENDER] Error rendering item ${item.id}:`, renderError);
                  return (
                    <Card key={item.id} className="shadow-sm">
                      <div className="p-4 text-red-600">
                        <i className="pi pi-exclamation-triangle mr-2"></i>
                        Error rendering item {item.id}
                      </div>
                    </Card>
                  );
                }
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={cartData.subtotal}
                discount={cartData.discount}
                tax={cartData.tax}
                total={cartData.total}
                currency={cartData.cart.items[0]?.product?.currency || 'EUR'}
                locale={locale}
                onCheckout={proceedToCheckout}
              />
            </div>
          </div>
        ) : (
          <EmptyCartState locale={locale} />
        )}
      </main>
    </div>
  );
}
