/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

// Timeout for requests (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Allowed content types for response validation
const ALLOWED_CONTENT_TYPES = ['application/json', 'text/plain'];

interface ApiError extends Error {
  status: number;
  data?: any;
}

export async function postJson<T = any>(url: string, body: unknown, token?: string): Promise<T> {
  // Input validation
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  // URL validation - only allow HTTPS in production
  if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
    throw new Error('Only HTTPS URLs are allowed in production');
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Security headers
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      // Additional security options
      credentials: 'same-origin',
      mode: 'cors',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });

    clearTimeout(timeoutId);

    // Validate content type
    const contentType = res.headers.get('content-type') || '';
    const isValidContentType = ALLOWED_CONTENT_TYPES.some(type => 
      contentType.includes(type)
    );

    const text = await res.text();
    let data: any = undefined;

    // Only parse JSON if content type is appropriate
    if (isValidContentType && text) {
      try {
        data = JSON.parse(text);
      } catch {
        // If JSON parsing fails, treat as text response
        data = text;
      }
    } else if (text) {
      data = text;
    }

    if (!res.ok) {
      const message = data?.message || data?.error || res.statusText || "Request failed";
      const error = new Error(message) as ApiError;
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
}

// Additional utility function for GET requests
export async function getJson<T = any>(url: string, token?: string): Promise<T> {
  // Input validation
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  // URL validation - only allow HTTPS in production
  if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
    throw new Error('Only HTTPS URLs are allowed in production');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      credentials: 'same-origin',
      mode: 'cors',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    const isValidContentType = ALLOWED_CONTENT_TYPES.some(type => 
      contentType.includes(type)
    );

    const text = await res.text();
    let data: any = undefined;

    if (isValidContentType && text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } else if (text) {
      data = text;
    }

    if (!res.ok) {
      const message = data?.message || data?.error || res.statusText || "Request failed";
      const error = new Error(message) as ApiError;
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
}

// Utility to safely handle API responses
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error && typeof (error as any).status === 'number';
}
