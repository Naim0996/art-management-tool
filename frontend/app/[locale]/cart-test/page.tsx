'use client';

import { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export default function CartTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [cartData, setCartData] = useState<any>(null);
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    updateCookies();
  }, []);

  const updateCookies = () => {
    const allCookies = document.cookie;
    const localStorage_backup = localStorage.getItem('cart_session_backup');
    setCookies(allCookies || 'No cookies');
    addLog(`Cookies: ${allCookies || 'None'}`);
    addLog(`LocalStorage backup: ${localStorage_backup || 'None'}`);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const testAddToCart = async () => {
    addLog('🛒 Testing add to cart...');
    try {
      const response = await fetch('/api/shop/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: 1,
          quantity: 1,
        }),
      });

      addLog(`Response status: ${response.status}`);
      
      const setCookieHeader = response.headers.get('set-cookie');
      addLog(`Set-Cookie header: ${setCookieHeader || 'None'}`);
      
      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`);
      setCartData(data);
      
      updateCookies();
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const testGetCart = async () => {
    addLog('📦 Testing get cart...');
    try {
      const response = await fetch('/api/shop/cart', {
        method: 'GET',
        credentials: 'include',
      });

      addLog(`Response status: ${response.status}`);
      
      const setCookieHeader = response.headers.get('set-cookie');
      addLog(`Set-Cookie header: ${setCookieHeader || 'None'}`);
      
      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`);
      setCartData(data);
      
      updateCookies();
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const clearSession = () => {
    addLog('🧹 Clearing session data...');
    // Clear cookie
    document.cookie = 'cart_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Clear localStorage
    localStorage.removeItem('cart_session_backup');
    updateCookies();
    addLog('✅ Session cleared');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Cart Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card title="Actions">
            <div className="flex flex-col gap-3">
              <Button 
                label="Add Product 1 to Cart" 
                icon="pi pi-shopping-cart"
                onClick={testAddToCart}
                className="p-button-success"
              />
              <Button 
                label="Get Cart" 
                icon="pi pi-box"
                onClick={testGetCart}
                className="p-button-info"
              />
              <Button 
                label="Refresh Cookies" 
                icon="pi pi-refresh"
                onClick={updateCookies}
                className="p-button-secondary"
              />
              <Button 
                label="Clear Session" 
                icon="pi pi-times"
                onClick={clearSession}
                className="p-button-warning"
              />
              <Button 
                label="Clear Logs" 
                icon="pi pi-trash"
                onClick={clearLogs}
                className="p-button-danger"
              />
            </div>
          </Card>

          <Card title="Current Cookies">
            <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
              {cookies}
            </div>
          </Card>
        </div>

        <Card title="Cart Data" className="mb-6">
          {cartData ? (
            <div className="bg-gray-100 p-3 rounded">
              <p><strong>Cart ID:</strong> {cartData.cart?.id}</p>
              <p><strong>Session Token:</strong> {cartData.cart?.session_token}</p>
              <p><strong>Items Count:</strong> {cartData.cart?.items?.length || 0}</p>
              <p><strong>Subtotal:</strong> €{cartData.subtotal?.toFixed(2)}</p>
              <p><strong>Total:</strong> €{cartData.total?.toFixed(2)}</p>
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Full JSON</summary>
                <pre className="text-xs mt-2">{JSON.stringify(cartData, null, 2)}</pre>
              </details>
            </div>
          ) : (
            <p className="text-gray-500">No cart data yet. Click "Get Cart" or "Add to Cart" to load data.</p>
          )}
        </Card>

        <Card title="Logs">
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
