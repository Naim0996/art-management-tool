'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { shopAPI, CartResponse } from '@/services/ShopAPIService';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { Card } from 'primereact/card';

export default function CartPage() {
  const locale = useLocale();
  const toast = useRef<Toast>(null);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await shopAPI.getCart();
      setCartData(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load cart',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setUpdating(itemId);
    try {
      const data = await shopAPI.updateCartItem(itemId, quantity);
      setCartData(data);
      toast.current?.show({
        severity: 'success',
        summary: 'Updated',
        detail: 'Cart updated successfully',
        life: 2000,
      });
    } catch (error) {
      console.error('Error updating cart:', error);
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
    setUpdating(itemId);
    try {
      await shopAPI.removeCartItem(itemId);
      await fetchCart();
      toast.current?.show({
        severity: 'success',
        summary: 'Removed',
        detail: 'Item removed from cart',
        life: 2000,
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove item',
        life: 3000,
      });
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    try {
      await shopAPI.clearCart();
      await fetchCart();
      toast.current?.show({
        severity: 'success',
        summary: 'Cleared',
        detail: 'Cart cleared successfully',
        life: 2000,
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to clear cart',
        life: 3000,
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/${locale}/shop`} className="text-purple-600 hover:underline mb-2 inline-block">
            <i className="pi pi-arrow-left mr-2"></i>
            Continue Shopping
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
            {hasItems && (
              <Button
                label="Clear Cart"
                icon="pi pi-trash"
                severity="danger"
                outlined
                onClick={clearCart}
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.cart.items.map((item) => {
                const product = item.product;
                const variant = item.variant;
                
                if (!product) return null;

                const price = product.base_price + (variant?.price_adjustment || 0);
                const total = price * item.quantity;

                return (
                  <Card key={item.id} className="shadow-sm">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images.find(img => img.is_primary)?.url || product.images[0].url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <i className="pi pi-image text-3xl text-gray-400"></i>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.title}
                        </h3>
                        {variant && (
                          <p className="text-sm text-gray-600 mt-1">
                            Variant: {variant.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          SKU: {variant?.sku || product.sku}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <InputNumber
                              value={item.quantity}
                              onValueChange={(e) => updateQuantity(item.id, e.value || 1)}
                              showButtons
                              min={1}
                              max={variant?.stock || 99}
                              disabled={updating === item.id}
                              className="w-32"
                            />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-lg font-bold text-purple-600">
                              {product.currency === 'EUR' ? '€' : '$'}{total.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.currency === 'EUR' ? '€' : '$'}{price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Button
                          icon="pi pi-trash"
                          severity="danger"
                          text
                          rounded
                          onClick={() => removeFromCart(item.id)}
                          disabled={updating === item.id}
                          loading={updating === item.id}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card title="Order Summary" className="shadow-lg sticky top-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      {cartData.cart.items[0]?.product?.currency === 'EUR' ? '€' : '$'}
                      {cartData.subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {cartData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">
                        -{cartData.cart.items[0]?.product?.currency === 'EUR' ? '€' : '$'}
                        {cartData.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {cartData.tax > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax:</span>
                      <span className="font-semibold">
                        {cartData.cart.items[0]?.product?.currency === 'EUR' ? '€' : '$'}
                        {cartData.tax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-purple-600">
                      {cartData.cart.items[0]?.product?.currency === 'EUR' ? '€' : '$'}
                      {cartData.total.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    label="Proceed to Checkout"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    className="w-full mt-4"
                    size="large"
                    onClick={proceedToCheckout}
                  />

                  <Link href={`/${locale}/shop`}>
                    <Button
                      label="Continue Shopping"
                      icon="pi pi-shopping-bag"
                      outlined
                      className="w-full"
                    />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="text-center py-16 bg-white shadow-sm">
            <div className="space-y-4">
              <i className="pi pi-shopping-cart text-6xl text-gray-400"></i>
              <h2 className="text-2xl font-semibold text-gray-800">Your cart is empty</h2>
              <p className="text-gray-600">Start shopping to add items to your cart</p>
              <Link href={`/${locale}/shop`}>
                <Button
                  label="Browse Products"
                  icon="pi pi-shopping-bag"
                  size="large"
                  className="mt-4"
                />
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
