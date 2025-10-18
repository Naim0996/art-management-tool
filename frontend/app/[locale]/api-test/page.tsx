'use client';

import { useEffect, useState } from 'react';

export default function APITestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testAPI = async (url: string, description: string) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      console.log(`Testing: ${description} - ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const duration = Date.now() - startTime;
      const data = await response.json();
      
      setResults(prev => [...prev, {
        description,
        url,
        status: response.status,
        ok: response.ok,
        duration: `${duration}ms`,
        data: JSON.stringify(data, null, 2),
        error: null,
      }]);
      
      console.log(`✅ Success: ${description}`, data);
    } catch (error) {
      const duration = Date.now() - startTime;
      setResults(prev => [...prev, {
        description,
        url,
        status: 'Error',
        ok: false,
        duration: `${duration}ms`,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      }]);
      
      console.error(`❌ Error: ${description}`, error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    
    // Test 1: Health check (via Next.js proxy)
    await testAPI('/health', 'Backend Health Check (via Next.js)');
    
    // Test 2: Public products (via Next.js proxy)
    await testAPI('/api/shop/products', 'Shop Products API (via Next.js)');
    
    // Test 3: Personaggi (via Next.js proxy)
    await testAPI('/api/personaggi', 'Personaggi API (via Next.js)');
    
    // Test 4: Direct backend call (for comparison)
    await testAPI('http://localhost:8080/health', 'Backend Direct Health Check');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Frontend URL:</strong> {window.location.origin}</p>
            <p><strong>API Mode:</strong> Next.js Proxy (rewrites to http://localhost:8080)</p>
            <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '(relative paths)'}</p>
            <p><strong>Browser:</strong> {navigator.userAgent}</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '⏳ Testing...' : '▶️ Run All Tests'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className={`bg-white rounded-lg shadow p-6 border-l-4 ${result.ok ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {result.ok ? '✅' : '❌'} {result.description}
                </h3>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {result.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.url}</code></p>
                <p><strong>Duration:</strong> {result.duration}</p>
                
                {result.error && (
                  <div className="mt-4">
                    <p className="font-semibold text-red-600 mb-2">Error:</p>
                    <pre className="bg-red-50 p-3 rounded text-red-800 overflow-x-auto">
                      {result.error}
                    </pre>
                  </div>
                )}
                
                {result.data && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Response:</p>
                    <pre className="bg-gray-50 p-3 rounded overflow-x-auto max-h-96">
                      {result.data}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Click "Run All Tests" to start testing API connectivity
          </div>
        )}
      </div>
    </div>
  );
}
