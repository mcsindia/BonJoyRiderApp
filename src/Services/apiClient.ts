import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ======================================================
   CONFIGURATION
====================================================== */

const BASE_URL = 'https://bonjoy.in/api/v1';
const TIMEOUT = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/* ======================================================
   STORAGE KEYS
====================================================== */

const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

/* ======================================================
   UTILITY FUNCTIONS
====================================================== */

const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

const clearSession = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const sessionKeys = keys.filter(key => 
      key === AUTH_TOKEN_KEY || 
      key === 'USER_SESSION' || 
      key === 'RIDER_PROFILE' || 
      key === 'USER_CONTACTS'
    );
    await AsyncStorage.multiRemove(sessionKeys);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

/* ======================================================
   ENHANCED AXIOS INSTANCE
====================================================== */

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private retryConfig = { maxRetries: MAX_RETRIES, retryDelay: RETRY_DELAY };
  
  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    
    this.setupInterceptors();
  }
  
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          if (__DEV__) {
            console.log('🚀 API Request:', {
              url: config.url,
              method: config.method?.toUpperCase(),
              data: config.data,
            });
          }
        } catch (error) {
          console.error('Request interceptor error:', error);
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
          });
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        if (__DEV__) {
          console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
          });
        }
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          await clearSession();
          return Promise.reject(error);
        }
        
        // Retry logic
        if (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED') {
          if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
          }
          
          if (originalRequest._retryCount < this.retryConfig.maxRetries) {
            originalRequest._retryCount++;
            
            const delay = this.retryConfig.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
            
            if (__DEV__) {
              console.log(`🔄 Retrying (${originalRequest._retryCount}/${this.retryConfig.maxRetries}) in ${delay}ms`);
            }
            
            return new Promise(resolve => setTimeout(resolve, delay))
              .then(() => this.axiosInstance(originalRequest));
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Public methods
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }
  
  async post<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }
  
  async put<T>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }
  
  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
  
  async upload<T>(url: string, formData: FormData): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  
  // Update retry config if needed
  setRetryConfig(maxRetries: number, retryDelay: number): void {
    this.retryConfig = { maxRetries, retryDelay };
  }
}

/* ======================================================
   SINGLE INSTANCE EXPORT
====================================================== */

const apiClient = ApiClient.getInstance();
export default apiClient;