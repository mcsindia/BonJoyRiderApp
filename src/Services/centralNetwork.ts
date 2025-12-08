// src/network/centralNetwork.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestConfig {
  url: string;
  method?: HttpMethod;
  queryParams?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 15000;

/* -------------------------------------------------------
   Helper: Query string builder
------------------------------------------------------- */
const buildQueryString = (params?: Record<string, any>) => {
  if (!params) return '';
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return query ? `?${query}` : '';
};

/* -------------------------------------------------------
   Central API Handler
------------------------------------------------------- */
export const apiRequest = async <T = any>({
  url,
  method = 'GET',
  queryParams,
  body,
  headers = {},
  token,
  timeout = DEFAULT_TIMEOUT,
}: ApiRequestConfig): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const finalUrl = `${url}${buildQueryString(queryParams)}`;
    const isFormData = body instanceof FormData;

    const response = await fetch(finalUrl, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        method === 'GET' || method === 'DELETE'
          ? undefined
          : isFormData
          ? body
          : JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || 'API Error',
        data,
      };
    }

    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};

/* -------------------------------------------------------
   HTTP Helpers
------------------------------------------------------- */
export const GET = <T>(url: string, queryParams?: any, config?: Partial<ApiRequestConfig>) =>
  apiRequest<T>({ url, queryParams, method: 'GET', ...config });

export const POST = <T>(url: string, body?: any, config?: Partial<ApiRequestConfig>) =>
  apiRequest<T>({ url, body, method: 'POST', ...config });

export const PUT = <T>(url: string, body?: any, config?: Partial<ApiRequestConfig>) =>
  apiRequest<T>({ url, body, method: 'PUT', ...config });

export const DELETE = <T>(url: string, queryParams?: any, config?: Partial<ApiRequestConfig>) =>
  apiRequest<T>({ url, queryParams, method: 'DELETE', ...config });
