// centralNetwork.ts

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
   Helper: Build query string
------------------------------------------------------- */
const buildQueryString = (params?: Record<string, any>) => {
  if (!params) return '';
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');

  return query ? `?${query}` : '';
};

/* -------------------------------------------------------
   Central Network Method
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

    const response = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body:
        method === 'GET' || method === 'DELETE'
          ? undefined
          : JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await response.text();
    const responseData = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData?.message || 'Something went wrong',
        data: responseData,
      };
    }

    return responseData;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/* -------------------------------------------------------
   Convenience methods (optional)
------------------------------------------------------- */
export const GET = <T>(
  url: string,
  queryParams?: Record<string, any>,
  config?: Partial<ApiRequestConfig>
) =>
  apiRequest<T>({
    url,
    queryParams,
    method: 'GET',
    ...config,
  });

export const POST = <T>(
  url: string,
  body?: any,
  config?: Partial<ApiRequestConfig>
) =>
  apiRequest<T>({
    url,
    body,
    method: 'POST',
    ...config,
  });

export const PUT = <T>(
  url: string,
  body?: any,
  config?: Partial<ApiRequestConfig>
) =>
  apiRequest<T>({
    url,
    body,
    method: 'PUT',
    ...config,
  });

export const DELETE = <T>(
  url: string,
  queryParams?: Record<string, any>,
  config?: Partial<ApiRequestConfig>
) =>
  apiRequest<T>({
    url,
    queryParams,
    method: 'DELETE',
    ...config,
  });
