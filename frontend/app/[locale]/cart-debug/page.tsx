'use client';

import { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { shopAPI, CartResponse } from '@/services/ShopAPIService';

export default function CartDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [testProductId, setTestProductId] = useState<number>(1);
  const [testQuantity, setTestQuantity] = useState<number>(1);
  const toast = useRef<Toast>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setLogs(prev => [`[${timestamp}] ${icon} ${message}`, ...prev]);
    
    if (toast.current && type !== 'info') {
      toast.current.show({
        severity: type,
        summary: type === 'error' ? 'Error' : 'Success',
        detail: message,
        life: 3000,
      });
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Test 0: Health Check
  const testHealthCheck = async () => {
    addLog('💚 Testing backend health...');
    setLoading(true);
    try {
      const data = await shopAPI.healthCheck();
      addLog(`Backend is healthy: ${data.status}`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Backend health check failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 1: Get Cart
  const testGetCart = async () => {
    addLog('🛒 Testing GET cart...');
    setLoading(true);
    try {
      const data = await shopAPI.getCart();
      setCartData(data);
      addLog(`Cart retrieved successfully. ID: ${data.cart.id}, Items: ${data.cart.items.length}`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`GET cart failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Add to Cart
  const testAddToCart = async () => {
    addLog(`🛒 Testing ADD to cart (Product ID: ${testProductId}, Quantity: ${testQuantity})...`);
    setLoading(true);
    try {
      const data = await shopAPI.addToCart({
        product_id: testProductId,
        quantity: testQuantity,
      });
      setCartData(data);
      addLog(`Item added successfully. Cart now has ${data.cart.items.length} items`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`ADD to cart failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Update Cart Item
  const testUpdateCart = async () => {
    if (!cartData?.cart?.items?.length) {
      addLog('No items in cart to update', 'error');
      return;
    }

    const firstItem = cartData.cart.items[0];
    const newQuantity = firstItem.quantity + 1;
    
    addLog(`🛒 Testing UPDATE cart item ${firstItem.id} to quantity ${newQuantity}...`);
    setLoading(true);
    try {
      const data = await shopAPI.updateCartItem(firstItem.id, newQuantity);
      setCartData(data);
      addLog(`Item updated successfully. New quantity: ${newQuantity}`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`UPDATE cart failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Remove from Cart
  const testRemoveFromCart = async () => {
    if (!cartData?.cart?.items?.length) {
      addLog('No items in cart to remove', 'error');
      return;
    }

    const firstItem = cartData.cart.items[0];
    
    addLog(`🛒 Testing REMOVE cart item ${firstItem.id}...`);
    setLoading(true);
    try {
      await shopAPI.removeCartItem(firstItem.id);
      await testGetCart(); // Refresh cart
      addLog(`Item removed successfully`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`REMOVE from cart failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Clear Cart
  const testClearCart = async () => {
    addLog('🛒 Testing CLEAR cart...');
    setLoading(true);
    try {
      await shopAPI.clearCart();
      await testGetCart(); // Refresh cart
      addLog('Cart cleared successfully', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`CLEAR cart failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    addLog('🚀 Starting comprehensive cart tests...');
    await testHealthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testGetCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAddToCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testUpdateCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testRemoveFromCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testClearCart();
    addLog('🏁 All tests completed');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Toast ref={toast} />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Cart Debug & Testing</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card title="Test Controls">
            <div className="space-y-4">
              {/* Test Parameters */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded">
                <div>
                  <label className="block text-sm font-medium mb-2">Product ID:</label>
                  <InputNumber
                    value={testProductId}
                    onValueChange={(e) => setTestProductId(e.value || 1)}
                    min={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity:</label>
                  <InputNumber
                    value={testQuantity}
                    onValueChange={(e) => setTestQuantity(e.value || 1)}
                    min={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Individual Tests */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  label="Health Check"
                  icon="pi pi-heart"
                  onClick={testHealthCheck}
                  disabled={loading}
                  className="p-button-primary"
                />
                <Button
                  label="Get Cart"
                  icon="pi pi-box"
                  onClick={testGetCart}
                  disabled={loading}
                  className="p-button-info"
                />
                <Button
                  label="Add to Cart"
                  icon="pi pi-plus"
                  onClick={testAddToCart}
                  disabled={loading}
                  className="p-button-success"
                />
                <Button
                  label="Update Cart"
                  icon="pi pi-pencil"
                  onClick={testUpdateCart}
                  disabled={loading || !cartData?.cart?.items?.length}
                  className="p-button-warning"
                />
                <Button
                  label="Remove Item"
                  icon="pi pi-trash"
                  onClick={testRemoveFromCart}
                  disabled={loading || !cartData?.cart?.items?.length}
                  className="p-button-danger"
                />
                <Button
                  label="Clear Cart"
                  icon="pi pi-times"
                  onClick={testClearCart}
                  disabled={loading}
                  className="p-button-danger"
                />
              </div>

              <Button
                label="🚀 Run All Tests"
                onClick={runAllTests}
                disabled={loading}
                className="w-full p-button-primary"
                size="large"
              />

              <Button
                label="Clear Logs"
                icon="pi pi-eraser"
                onClick={clearLogs}
                className="w-full p-button-secondary"
              />
            </div>
          </Card>

          {/* Current Cart Data */}
          <Card title="Current Cart Data">
            {cartData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Cart ID:</strong> {cartData.cart.id}</div>
                  <div><strong>Session Token:</strong> {cartData.cart.session_token?.substring(0, 20)}...</div>
                  <div><strong>Items Count:</strong> {cartData.cart.items.length}</div>
                  <div><strong>Subtotal:</strong> €{cartData.subtotal.toFixed(2)}</div>
                  <div><strong>Tax:</strong> €{cartData.tax.toFixed(2)}</div>
                  <div><strong>Discount:</strong> €{cartData.discount.toFixed(2)}</div>
                  <div className="col-span-2"><strong>Total:</strong> €{cartData.total.toFixed(2)}</div>
                </div>

                {cartData.cart.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Items:</h4>
                    <div className="space-y-2">
                      {cartData.cart.items.map((item, index) => (
                        <div key={item.id} className="p-2 bg-gray-100 rounded text-sm">
                          <div><strong>Item {index + 1}:</strong> ID {item.id}</div>
                          <div>Product ID: {item.product_id}, Quantity: {item.quantity}</div>
                          {item.product && <div>Product: {item.product.title}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold">Full JSON Response</summary>
                  <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-64">
                    {JSON.stringify(cartData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-gray-500">No cart data yet. Run tests to load data.</p>
            )}
          </Card>
        </div>

        {/* Logs */}
        <Card title="Test Logs" className="mt-6">
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}