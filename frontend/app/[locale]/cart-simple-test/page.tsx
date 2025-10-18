'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { shopAPI, CartResponse } from '@/services/ShopAPIService';

export default function CartSimpleTestPage() {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      console.log('🧪 Fetching cart...');
      const data = await shopAPI.getCart();
      console.log('🧪 Cart fetched:', data);
      setCartData(data);
    } catch (error) {
      console.error('🧪 Error fetching cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch cart',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFirstItem = async () => {
    if (!cartData?.cart?.items?.length) {
      console.log('🧪 No items to remove');
      return;
    }

    const firstItem = cartData.cart.items[0];
    console.log('🧪 Removing first item:', firstItem);

    setLoading(true);
    try {
      console.log('🧪 API call: removeCartItem');
      await shopAPI.removeCartItem(firstItem.id);
      console.log('🧪 API call successful');

      console.log('🧪 Re-fetching cart...');
      await fetchCart();
      console.log('🧪 Cart re-fetched');

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Item removed',
        life: 2000,
      });
    } catch (error) {
      console.error('🧪 Error removing item:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove item',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cartData?.cart?.items?.length) {
      console.log('🧪 No items to clear');
      return;
    }

    console.log('🧪 Clearing cart...');

    setLoading(true);
    try {
      console.log('🧪 API call: clearCart');
      await shopAPI.clearCart();
      console.log('🧪 API call successful');

      console.log('🧪 Re-fetching cart...');
      await fetchCart();
      console.log('🧪 Cart re-fetched');

      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Cart cleared',
        life: 2000,
      });
    } catch (error) {
      console.error('🧪 Error clearing cart:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to clear cart',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Toast ref={toast} />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Simple Cart Test</h1>
        
        <div className="space-y-4 mb-6">
          <Button 
            label="Refresh Cart" 
            icon="pi pi-refresh"
            onClick={fetchCart}
            disabled={loading}
            loading={loading}
          />
          
          <Button 
            label="Remove First Item" 
            icon="pi pi-trash"
            onClick={removeFirstItem}
            disabled={loading || !cartData?.cart?.items?.length}
            loading={loading}
            severity="warning"
          />
          
          <Button 
            label="Clear Cart" 
            icon="pi pi-times"
            onClick={clearCart}
            disabled={loading || !cartData?.cart?.items?.length}
            loading={loading}
            severity="danger"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cart Status</h2>
          
          {cartData ? (
            <div>
              <p><strong>Cart ID:</strong> {cartData.cart.id}</p>
              <p><strong>Items Count:</strong> {cartData.cart.items.length}</p>
              <p><strong>Total:</strong> €{cartData.total.toFixed(2)}</p>
              
              {cartData.cart.items.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Items:</h3>
                  <ul className="space-y-2">
                    {cartData.cart.items.map((item, index) => (
                      <li key={item.id} className="p-2 bg-gray-100 rounded">
                        <span className="font-medium">Item {index + 1}:</span> ID {item.id}
                        {item.product && <span> - {item.product.title}</span>}
                        <span> (Qty: {item.quantity})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Loading cart data...</p>
          )}
        </div>

        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-medium mb-2">Debug Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Look for 🧪 prefixed logs</li>
            <li>Try "Remove First Item" or "Clear Cart"</li>
            <li>Check if UI updates immediately after operation</li>
            <li>Check network tab for API calls</li>
          </ol>
        </div>
      </div>
    </div>
  );
}