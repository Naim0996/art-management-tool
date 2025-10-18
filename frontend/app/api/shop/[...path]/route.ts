import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * Proxy all /api/shop requests to backend, handling cookies properly
 * This is needed because Next.js rewrites don't forward Set-Cookie headers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = `${BACKEND_URL}/api/shop/${path}`;
    
    // Get search params from original request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    
    console.log(`🔄 Proxying ${method} ${fullUrl}`);
    
    // Forward cart_session cookie to backend
    const cartSession = request.cookies.get('cart_session');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (cartSession) {
      headers['Cookie'] = `cart_session=${cartSession.value}`;
      console.log(`🍪 Forwarding cookie: ${cartSession.value.substring(0, 20)}...`);
    }
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };
    
    // Add body for POST/PATCH requests
    if (method === 'POST' || method === 'PATCH') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }
    
    // Forward request to backend
    const response = await fetch(fullUrl, fetchOptions);
    
    // Get response body
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Create Next.js response
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    // Forward Set-Cookie header from backend to browser
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log(`🍪 Setting cookie from backend: ${setCookieHeader.substring(0, 50)}...`);
      
      // Parse cookie to set it properly
      const cookieParts = setCookieHeader.split(';');
      const [nameValue] = cookieParts;
      const [name, value] = nameValue.split('=');
      
      // Extract MaxAge if present
      let maxAge = 86400 * 7; // default 7 days
      const maxAgeMatch = setCookieHeader.match(/Max-Age=(\d+)/i);
      if (maxAgeMatch) {
        maxAge = parseInt(maxAgeMatch[1]);
      }
      
      // Set cookie in Next.js response
      nextResponse.cookies.set({
        name: name.trim(),
        value: value.trim(),
        maxAge,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    }
    
    console.log(`✅ Proxy completed: ${response.status}`);
    return nextResponse;
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', details: String(error) },
      { status: 500 }
    );
  }
}
