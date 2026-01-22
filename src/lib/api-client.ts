import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RequestConfig extends AxiosRequestConfig {
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly defaultCacheTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheSize = 100;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.startCacheCleanup();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token and performance tracking
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Add performance tracking
        (config as any).startTime = Date.now();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh and performance tracking
    this.client.interceptors.response.use(
      (response) => {
        // Track response time
        const startTime = (response.config as any).startTime;
        if (startTime) {
          const responseTime = Date.now() - startTime;
          if (responseTime > 1000) {
            console.warn(`Slow API request: ${response.config.method?.toUpperCase()} ${response.config.url} took ${responseTime}ms`);
          }
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle retries for network errors
        if (this.shouldRetry(error) && originalRequest.retries > 0) {
          originalRequest.retries--;
          const delay = this.calculateRetryDelay(originalRequest.retries);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.client(originalRequest);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateCacheKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`;
  }

  private shouldRetry(error: any): boolean {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      (error.response?.status >= 500 && error.response?.status < 600)
    );
  }

  private calculateRetryDelay(retriesLeft: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.pow(2, 3 - retriesLeft) * 1000;
  }

  private isValidCacheEntry(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    });

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.maxCacheSize) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.cache.size - this.maxCacheSize);
      
      sortedEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  private startCacheCleanup(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupCache();
      }, 60000); // Clean up every minute
    }
  }

  private async handleTokenRefresh(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    this.setTokens(accessToken, newRefreshToken);
    return accessToken;
  }

  private formatError(error: any): ApiError {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: 'unknown',
    };
  }

  // Enhanced request method with caching and deduplication
  private async request<T = any>(config: RequestConfig): Promise<T> {
    const {
      cache = false,
      cacheTTL = this.defaultCacheTTL,
      retries = 3,
      ...axiosConfig
    } = config;

    // Set retries
    (axiosConfig as any).retries = retries;

    const cacheKey = this.generateCacheKey(axiosConfig);

    // Check cache for GET requests
    if (cache && axiosConfig.method?.toLowerCase() === 'get') {
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && this.isValidCacheEntry(cachedEntry)) {
        return cachedEntry.data;
      }
    }

    // Check for pending request (request deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Make the request
    const requestPromise = this.client.request<T>(axiosConfig)
      .then((response: AxiosResponse<T>) => {
        // Cache successful GET responses
        if (cache && axiosConfig.method?.toLowerCase() === 'get' && response.status === 200) {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            ttl: cacheTTL,
          });
        }

        return response.data;
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
      });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  // Token management methods
  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get(process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'job_board_token') || null;
  }

  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get(process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'job_board_refresh_token') || null;
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    
    const tokenKey = process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'job_board_token';
    const refreshTokenKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'job_board_refresh_token';
    
    // Set secure cookies with appropriate expiration
    Cookies.set(tokenKey, accessToken, {
      expires: 1/96, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    Cookies.set(refreshTokenKey, refreshToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  public clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    const tokenKey = process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'job_board_token';
    const refreshTokenKey = process.env.NEXT_PUBLIC_REFRESH_TOKEN_STORAGE_KEY || 'job_board_refresh_token';
    
    Cookies.remove(tokenKey);
    Cookies.remove(refreshTokenKey);
  }

  public isTokenExpiringSoon(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const threshold = parseInt(process.env.NEXT_PUBLIC_JWT_REFRESH_THRESHOLD || '300000'); // 5 minutes

      return (expirationTime - currentTime) < threshold;
    } catch {
      return true;
    }
  }

  // HTTP methods with caching support
  public async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'GET',
      url,
      cache: config?.cache ?? true, // Enable cache by default for GET requests
    });
  }

  public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data,
    });
  }

  public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  public async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }

  public async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      ...config,
      method: 'DELETE',
      url,
    });
  }

  // File upload method
  public async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response: AxiosResponse<T> = await this.client.post(url, formData, config);
    return response.data;
  }

  // Cache management
  public clearCache(): void {
    this.cache.clear();
  }

  public invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.clearCache();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  // Performance monitoring
  public getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size,
    };
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;