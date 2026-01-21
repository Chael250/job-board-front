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

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
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

        return Promise.reject(this.formatError(error));
      }
    );
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

  // HTTP methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
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
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;