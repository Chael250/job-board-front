import { apiClient } from '@/lib/api-client';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store tokens
      apiClient.setTokens(response.accessToken, response.refreshToken);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Store tokens
      apiClient.setTokens(response.accessToken, response.refreshToken);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = apiClient.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens
      apiClient.clearTokens();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = apiClient.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.post<AuthResponse>('/auth/refresh', {
        refreshToken,
      });

      // Store new tokens
      apiClient.setTokens(response.accessToken, response.refreshToken);
      
      return true;
    } catch (error) {
      // Clear tokens on refresh failure
      apiClient.clearTokens();
      return false;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = apiClient.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await apiClient.get<User>('/auth/me');
      return response;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = apiClient.getAccessToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get user role from token
   */
  getUserRole(): string | null {
    const token = apiClient.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  /**
   * Check if token needs refresh
   */
  shouldRefreshToken(): boolean {
    return apiClient.isTokenExpiringSoon();
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;