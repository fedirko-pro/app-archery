import env from '../config/env';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ChangePasswordData,
} from '../contexts/types';
import type { ProfileData } from '../pages/profile/types';
import type { ApiError, CategoryDto, RuleDto } from './types';
import { getCurrentI18nLang } from '../utils/i18n-lang';
import categoriesData from '../data/categories';
import rulesData from '../data/rules';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Centralized API client for backend integration.
 * Temporarily also provides FE-only data sources while BE is not ready.
 */
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

  /**
   * Perform an authenticated JSON request to the backend API.
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': getCurrentI18nLang(),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiError;
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const status = response.status;
      if (status === 204 || status === 205) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Load failed')) {
        throw new Error(
          'Backend server is not available. Please check if the server is running.',
        );
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

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    return await this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    });
  }

  async setPassword(
    password: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
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
    return await this.request<{ message: string }>(
      `/auth/admin/reset-password/${userId}`,
      {
        method: 'POST',
      },
    );
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

  async addPatrolMember(
    patrolId: string,
    userId: string,
    role: string,
  ): Promise<any> {
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
    return await this.request<any[]>(
      '/tournament-applications/my-applications',
    );
  }

  async getTournamentApplications(tournamentId: string): Promise<any[]> {
    return await this.request<any[]>(
      `/tournament-applications/tournament/${tournamentId}`,
    );
  }

  async getTournamentApplicationStats(tournamentId: string): Promise<any> {
    return await this.request<any>(
      `/tournament-applications/tournament/${tournamentId}/stats`,
    );
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    rejectionReason?: string,
  ): Promise<any> {
    return await this.request<any>(
      `/tournament-applications/${applicationId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, rejectionReason }),
      },
    );
  }

  async withdrawApplication(applicationId: string): Promise<any> {
    return await this.request<any>(
      `/tournament-applications/${applicationId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async deleteApplication(applicationId: string): Promise<void> {
    return await this.request<void>(
      `/tournament-applications/${applicationId}/admin`,
      {
        method: 'DELETE',
      },
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
  }

  /**
   * Fetch categories from a FE-only local data module.
   * Replaced by backend once available.
   */
  async getCategories(): Promise<CategoryDto[]> {
    return categoriesData as CategoryDto[];
  }

  /**
   * Resolve a single category by id or code (case-insensitive).
   */
  async getCategoryById(id: string): Promise<CategoryDto | undefined> {
    const categories = await this.getCategories();
    const target = id.toLowerCase();
    return categories.find((c) => {
      const candidate = (c.id ? String(c.id) : c.code).toLowerCase();
      return candidate === target;
    });
  }

  /**
   * FE-only stub. Will be implemented when backend is ready.
   */
  async upsertCategory(_: CategoryDto): Promise<CategoryDto> {
    throw new Error('Categories API not available yet. FE stub only.');
  }

  /**
   * FE-only stub. Will be implemented when backend is ready.
   */
  async deleteCategory(_: string): Promise<void> {
    throw new Error('Categories API not available yet. FE stub only.');
  }

  /**
   * Fetch rules (FE-only dataset for now)
   */
  async getRules(): Promise<RuleDto[]> {
    return rulesData as RuleDto[];
  }
}

export const apiService = new ApiService();
export default apiService;
