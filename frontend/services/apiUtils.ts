// Common API utilities for authentication and fetch operations

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || '';
}

export async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit,
  useAuth = false
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (useAuth) {
    Object.assign(headers, getAuthHeaders());
  }

  const response = await fetch(`${getApiBaseUrl()}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function uploadFile(
  url: string,
  formData: FormData,
  useAuth = true
): Promise<Response> {
  const headers: HeadersInit = useAuth ? getAuthHeaders() : {};

  const response = await fetch(`${getApiBaseUrl()}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response;
}
