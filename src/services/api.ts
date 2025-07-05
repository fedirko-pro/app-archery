import env from '../config/env';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse 
} from '../contexts/types';
import type { UserProfile } from '../components/profile/types';
import type { ApiError } from './types';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = env.API_BASE_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private removeToken(): void {
    localStorage.removeItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ApiError;
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password } as LoginCredentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async register(userData: RegisterData): Promise<User> {
    return await this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        authProvider: 'local',
      }),
    });
  }

  async getProfile(): Promise<User> {
    return await this.request<User>('/users/profile');
  }

  async updateProfile(profileData: UserProfile): Promise<User> {
    return await this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
  }
}

export const apiService = new ApiService();
export default apiService; 