import env from '../config/env';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  ChangePasswordData
} from '../contexts/types';
import type { ProfileData } from '../components/profile/types';
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
      console.log('API request:', url, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ApiError;
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
      
      // Якщо це помилка мережі, спробуємо перевірити доступність бекенду
      if (error instanceof TypeError && error.message.includes('Load failed')) {
        console.error('Network error - backend might be down');
        throw new Error('Backend server is not available. Please check if the server is running.');
      }
      
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string, confirmPassword: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  }

  async setPassword(password: string, confirmPassword: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ password, confirmPassword }),
    });
  }

  async getProfile(): Promise<User> {
    return await this.request<User>('/users/profile');
  }

  async updateProfile(profileData: ProfileData): Promise<User> {
    return await this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    const token = this.getToken();
    return await this.request<void>('/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await this.request<User[]>('/users/admin/all');
  }

  async adminUpdateUser(userId: string, userData: any): Promise<User> {
    return await this.request<User>(`/users/admin/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async adminResetUserPassword(userId: string): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/auth/admin/reset-password/${userId}`, {
      method: 'POST',
    });
  }

  async getAllTournaments(): Promise<any[]> {
    return await this.request<any[]>('/tournaments');
  }

  async getTournament(id: string): Promise<any> {
    return await this.request<any>(`/tournaments/${id}`);
  }

  async createTournament(tournamentData: any): Promise<any> {
    return await this.request<any>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  }

  async updateTournament(id: string, tournamentData: any): Promise<any> {
    return await this.request<any>(`/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tournamentData),
    });
  }

  async deleteTournament(id: string): Promise<void> {
    return await this.request<void>(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllPatrols(): Promise<any[]> {
    return await this.request<any[]>('/patrols');
  }

  async getPatrolsByTournament(tournamentId: string): Promise<any[]> {
    return await this.request<any[]>(`/patrols/tournament/${tournamentId}`);
  }

  async getPatrol(id: string): Promise<any> {
    return await this.request<any>(`/patrols/${id}`);
  }

  async createPatrol(patrolData: any): Promise<any> {
    return await this.request<any>('/patrols', {
      method: 'POST',
      body: JSON.stringify(patrolData),
    });
  }

  async updatePatrol(id: string, patrolData: any): Promise<any> {
    return await this.request<any>(`/patrols/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patrolData),
    });
  }

  async deletePatrol(id: string): Promise<void> {
    return await this.request<void>(`/patrols/${id}`, {
      method: 'DELETE',
    });
  }

  async addPatrolMember(patrolId: string, userId: string, role: string): Promise<any> {
    return await this.request<any>(`/patrols/${patrolId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
  }

  async removePatrolMember(patrolId: string, userId: string): Promise<void> {
    return await this.request<void>(`/patrols/${patrolId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async createTournamentApplication(applicationData: {
    tournamentId: string;
    category?: string;
    division?: string;
    equipment?: string;
    notes?: string;
  }): Promise<any> {
    return await this.request<any>('/tournament-applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getMyApplications(): Promise<any[]> {
    return await this.request<any[]>('/tournament-applications/my-applications');
  }

  async getTournamentApplications(tournamentId: string): Promise<any[]> {
    return await this.request<any[]>(`/tournament-applications/tournament/${tournamentId}`);
  }

  async getTournamentApplicationStats(tournamentId: string): Promise<any> {
    return await this.request<any>(`/tournament-applications/tournament/${tournamentId}/stats`);
  }

  async updateApplicationStatus(applicationId: string, status: string, rejectionReason?: string): Promise<any> {
    return await this.request<any>(`/tournament-applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async withdrawApplication(applicationId: string): Promise<any> {
    return await this.request<any>(`/tournament-applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  async deleteApplication(applicationId: string): Promise<void> {
    return await this.request<void>(`/tournament-applications/${applicationId}/admin`, {
      method: 'DELETE',
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