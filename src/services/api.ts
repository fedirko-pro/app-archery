import env from '../config/env';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ChangePasswordData,
} from '../contexts/types';
import type { ProfileData } from '../pages/profile/types';
import type {
  ApiError,
  BowCategory,
  CategoryDto,
  ClubDto,
  CreateBowCategoryDto,
  DivisionDto,
  RuleDto,
  UpdateBowCategoryDto,
} from './types';
import { getCurrentI18nLang } from '../utils/i18n-lang';
import categoriesData from '../data/categories';
import divisionsData from '../data/divisions';

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

  /**
   * Helper method for GET requests.
   */
  private async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * Helper method for POST requests.
   */
  private async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Helper method for PATCH requests.
   */
  private async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Helper method for DELETE requests.
   */
  private async delete<T = void>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
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

  async getUserById(userId: string): Promise<User> {
    return await this.request<User>(`/users/admin/${userId}`);
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

  /**
   * Generate patrol preview for a tournament (without saving)
   */
  async generatePatrolsPreview(tournamentId: string): Promise<{
    patrols: any[];
    stats: any;
  }> {
    return await this.request<{ patrols: any[]; stats: any }>(
      `/patrols/tournaments/${tournamentId}/generate`,
      { method: 'POST' },
    );
  }

  /**
   * Generate and save patrols for a tournament
   */
  async generateAndSavePatrols(tournamentId: string): Promise<{
    patrols: any[];
    stats: any;
  }> {
    return await this.request<{ patrols: any[]; stats: any }>(
      `/patrols/tournaments/${tournamentId}/generate-and-save`,
      { method: 'POST' },
    );
  }

  /**
   * Get or generate patrols for a tournament.
   * If patrols exist, returns them. If not, generates and saves new ones.
   */
  async getOrGeneratePatrols(tournamentId: string): Promise<{
    patrols: any[];
    stats?: any;
    isNewlyGenerated: boolean;
  }> {
    // First try to get existing patrols
    const existingPatrols = await this.getPatrolsByTournament(tournamentId);
    
    if (existingPatrols && existingPatrols.length > 0) {
      return {
        patrols: existingPatrols,
        isNewlyGenerated: false,
      };
    }

    // No patrols exist, generate and save new ones
    const result = await this.generateAndSavePatrols(tournamentId);
    return {
      patrols: result.patrols,
      stats: result.stats,
      isNewlyGenerated: true,
    };
  }

  /**
   * Regenerate patrols for a tournament (deletes existing and creates new)
   */
  async regeneratePatrols(tournamentId: string): Promise<{
    patrols: any[];
    stats: any;
  }> {
    // First delete all existing patrols
    const existingPatrols = await this.getPatrolsByTournament(tournamentId);
    for (const patrol of existingPatrols) {
      await this.deletePatrol(patrol.id);
    }
    
    // Generate and save new patrols
    return await this.generateAndSavePatrols(tournamentId);
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
   * Fetch all bow categories from the backend.
   * @param ruleId Optional filter by rule ID
   */
  async getBowCategories(ruleId?: string): Promise<BowCategory[]> {
    const endpoint = ruleId ? `/bow-categories?ruleId=${ruleId}` : '/bow-categories';
    return this.get<BowCategory[]>(endpoint);
  }

  /**
   * Fetch a single bow category by ID from the backend.
   */
  async getBowCategoryById(id: string): Promise<BowCategory | undefined> {
    try {
      return await this.get<BowCategory>(`/bow-categories/${id}`);
    } catch (error) {
      console.error(`Failed to fetch bow category ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Fetch a single bow category by code from the backend.
   */
  async getBowCategoryByCode(code: string): Promise<BowCategory | undefined> {
    try {
      return await this.get<BowCategory>(`/bow-categories/code/${code}`);
    } catch (error) {
      console.error(`Failed to fetch bow category with code ${code}:`, error);
      return undefined;
    }
  }

  /**
   * Fetch bow categories filtered by rule code.
   * @param ruleCode The rule code (e.g., 'IFAA', 'FABP')
   */
  async getBowCategoriesByRule(ruleCode: string): Promise<BowCategory[]> {
    try {
      const rule = await this.getRuleByCode(ruleCode);
      if (!rule || !rule.id) {
        console.warn(`Rule with code ${ruleCode} not found`);
        return [];
      }
      return await this.getBowCategories(rule.id);
    } catch (error) {
      console.error(`Failed to fetch bow categories for rule ${ruleCode}:`, error);
      return [];
    }
  }

  /**
   * Create a new bow category (admin only).
   */
  async createBowCategory(categoryData: CreateBowCategoryDto): Promise<BowCategory> {
    return this.post<BowCategory>('/bow-categories', categoryData);
  }

  /**
   * Update an existing bow category (admin only).
   */
  async updateBowCategory(id: string, categoryData: UpdateBowCategoryDto): Promise<BowCategory> {
    return this.patch<BowCategory>(`/bow-categories/${id}`, categoryData);
  }

  /**
   * Delete a bow category (admin only).
   */
  async deleteBowCategory(id: string): Promise<void> {
    await this.delete(`/bow-categories/${id}`);
  }

  /**
   * @deprecated Use getBowCategories() instead. This method is kept for backward compatibility.
   * Fetch categories from a FE-only local data module.
   * Replaced by backend once available.
   */
  async getCategories(): Promise<CategoryDto[]> {
    return categoriesData as CategoryDto[];
  }

  /**
   * @deprecated Use getBowCategoryById() or getBowCategoryByCode() instead.
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
   * @deprecated Use createBowCategory() or updateBowCategory() instead.
   * FE-only stub. Will be implemented when backend is ready.
   */
  async upsertCategory(_: CategoryDto): Promise<CategoryDto> {
    throw new Error('Categories API not available yet. FE stub only.');
  }

  /**
   * @deprecated Use deleteBowCategory() instead.
   * FE-only stub. Will be implemented when backend is ready.
   */
  async deleteCategory(_: string): Promise<void> {
    throw new Error('Categories API not available yet. FE stub only.');
  }

  /**
   * Fetch all rules from the backend.
   */
  async getRules(): Promise<RuleDto[]> {
    return this.get<RuleDto[]>('/rules');
  }

  /**
   * Fetch a single rule by ID from the backend.
   */
  async getRuleById(id: string): Promise<RuleDto | undefined> {
    try {
      return await this.get<RuleDto>(`/rules/${id}`);
    } catch (error) {
      console.error(`Failed to fetch rule ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Fetch a single rule by code from the backend.
   */
  async getRuleByCode(ruleCode: string): Promise<RuleDto | undefined> {
    try {
      return await this.get<RuleDto>(`/rules/code/${ruleCode}`);
    } catch (error) {
      console.error(`Failed to fetch rule with code ${ruleCode}:`, error);
      return undefined;
    }
  }

  /**
   * Create a new rule (admin only).
   */
  async createRule(ruleData: Omit<RuleDto, 'id' | 'createdAt' | 'updatedAt' | 'divisions' | 'bowCategories'>): Promise<RuleDto> {
    return this.post<RuleDto>('/rules', ruleData);
  }

  /**
   * Update an existing rule (admin only).
   */
  async updateRule(id: string, ruleData: Partial<Omit<RuleDto, 'id' | 'createdAt' | 'updatedAt' | 'divisions' | 'bowCategories'>>): Promise<RuleDto> {
    return this.patch<RuleDto>(`/rules/${id}`, ruleData);
  }

  /**
   * Delete a rule (admin only).
   * Note: Cannot delete if divisions or bow categories are linked to this rule.
   */
  async deleteRule(id: string): Promise<void> {
    await this.delete(`/rules/${id}`);
  }

  /**
   * Fetch all clubs from the backend.
   */
  async getClubs(): Promise<ClubDto[]> {
    return this.get<ClubDto[]>('/clubs');
  }

  /**
   * Fetch a single club by ID from the backend.
   */
  async getClubById(id: string): Promise<ClubDto | undefined> {
    try {
      return await this.get<ClubDto>(`/clubs/${id}`);
    } catch (error) {
      console.error(`Failed to fetch club ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Create or update a club (admin only).
   * If club.id is provided, updates the existing club.
   * Otherwise, creates a new club.
   */
  async upsertClub(club: ClubDto): Promise<ClubDto> {
    if (club.id) {
      // Update existing club - remove readonly fields
      const { id, createdAt, updatedAt, ...updateData } = club;
      return this.patch<ClubDto>(`/clubs/${id}`, updateData);
    } else {
      // Create new club - remove all system-generated fields
      const { id, createdAt, updatedAt, ...createData } = club;
      return this.post<ClubDto>('/clubs', createData);
    }
  }

  /**
   * Delete a club by ID (admin only).
   */
  async deleteClub(id: string): Promise<void> {
    await this.delete(`/clubs/${id}`);
  }

  /**
   * Fetch divisions from the backend API.
   */
  async getDivisions(ruleId?: string): Promise<DivisionDto[]> {
    try {
      const url = ruleId ? `/divisions?ruleId=${ruleId}` : '/divisions';
      const divisions = await this.get<any[]>(url);
      
      // Check if divisions is an array and not empty
      if (!Array.isArray(divisions) || divisions.length === 0) {
        console.warn('Backend returned empty or invalid divisions array, using fallback data');
        return divisionsData as DivisionDto[];
      }
      
      // Transform backend response to DivisionDto format
      // Backend returns divisions with populated rule object
      const transformed = divisions
        .filter((div: any) => div && div.id && div.name) // Filter out invalid entries
        .map((div: any) => ({
          id: div.id,
          name: div.name,
          description: div.description || undefined,
          rule_id: div.rule?.id,
          rule_code: div.rule?.ruleCode, // Extract ruleCode from rule object
          created_at: div.createdAt,
          updated_at: div.updatedAt,
        }));

      // Remove duplicates by id
      const uniqueDivisions = Array.from(
        new Map(transformed.map((d) => [d.id, d])).values()
      );

      // If no valid divisions after transformation, use fallback
      if (uniqueDivisions.length === 0) {
        console.warn('No valid divisions after transformation, using fallback data');
        return divisionsData as DivisionDto[];
      }

      return uniqueDivisions;
    } catch (error) {
      console.error('Failed to fetch divisions from backend, using fallback data:', error);
      // Fallback to static data if backend is unavailable
      return divisionsData as DivisionDto[];
    }
  }

  /**
   * Fetch divisions filtered by rule code.
   */
  async getDivisionsByRule(ruleCode: string): Promise<DivisionDto[]> {
    try {
      // First, find the rule by code
      const rule = await this.getRuleByCode(ruleCode);
      if (!rule || !rule.id) {
        console.warn(`Rule with code ${ruleCode} not found, using fallback data`);
        // Fallback to static data filtering
        const divisions = divisionsData as DivisionDto[];
        return divisions.filter((d) => d.rule_code === ruleCode);
      }

      // Then fetch divisions for that rule
      const divisions = await this.getDivisions(rule.id);
      
      // If getDivisions returned fallback data, filter it by rule_code
      if (divisions.length > 0 && divisions.some((d) => d.rule_code === ruleCode)) {
        // Filter by rule_code to ensure consistency
        const filtered = divisions.filter((d) => d.rule_code === ruleCode);

        // Remove duplicates by id
        const uniqueDivisions = Array.from(
          new Map(filtered.map((d) => [d.id, d])).values()
        );

        return uniqueDivisions;
      }

      // If no divisions found, try fallback
      console.warn(`No divisions found for rule ${ruleCode}, using fallback data`);
      const fallbackDivisions = divisionsData as DivisionDto[];
      return fallbackDivisions.filter((d) => d.rule_code === ruleCode);
    } catch (error) {
      console.error(`Failed to fetch divisions for rule ${ruleCode}:`, error);
      // Fallback to static data filtering
      const divisions = divisionsData as DivisionDto[];
      return divisions.filter((d) => d.rule_code === ruleCode);
    }
  }

  /**
   * Resolve a single division by id.
   */
  async getDivisionById(id: string): Promise<DivisionDto | undefined> {
    try {
      const division = await this.get<any>(`/divisions/${id}`);
      if (!division) return undefined;

      // Transform backend response to DivisionDto format
      return {
        id: division.id,
        name: division.name,
        description: division.description,
        rule_id: division.rule?.id,
        rule_code: division.rule?.ruleCode,
        created_at: division.createdAt,
        updated_at: division.updatedAt,
      };
    } catch (error) {
      console.error(`Failed to fetch division ${id}:`, error);
      // Fallback to static data
      const divisions = divisionsData as DivisionDto[];
      return divisions.find((d) => d.id === id);
    }
  }

  /**
   * FE-only stub. Will be implemented when backend is ready.
   */
  async upsertDivision(_: DivisionDto): Promise<DivisionDto> {
    throw new Error('Divisions API not available yet. FE stub only.');
  }

  /**
   * FE-only stub. Will be implemented when backend is ready.
   */
  async deleteDivision(_: string): Promise<void> {
    throw new Error('Divisions API not available yet. FE stub only.');
  }

  /**
   * Upload an image (avatar, banner, or logo) with optional cropping and processing.
   * Returns the URL and metadata of the uploaded image.
   */
  async uploadImage(
    file: File,
    type: 'avatar' | 'banner' | 'logo',
    options?: {
      cropX?: number;
      cropY?: number;
      cropWidth?: number;
      cropHeight?: number;
      quality?: number;
      entityId?: string;
    },
  ): Promise<{
    url: string;
    filename: string;
    size: number;
    dimensions: { width: number; height: number };
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    if (options) {
      if (options.cropX !== undefined)
        formData.append('cropX', String(options.cropX));
      if (options.cropY !== undefined)
        formData.append('cropY', String(options.cropY));
      if (options.cropWidth !== undefined)
        formData.append('cropWidth', String(options.cropWidth));
      if (options.cropHeight !== undefined)
        formData.append('cropHeight', String(options.cropHeight));
      if (options.quality !== undefined)
        formData.append('quality', String(options.quality));
      if (options.entityId !== undefined)
        formData.append('entityId', options.entityId);
    }

    const url = `${this.baseURL}/upload/image`;
    const token = this.getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept-Language': getCurrentI18nLang(),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiError;
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Upload an attachment file for a tournament.
   * Returns the metadata of the uploaded attachment.
   */
  async uploadAttachment(
    file: File,
    tournamentId: string,
  ): Promise<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tournamentId', tournamentId);

    const url = `${this.baseURL}/upload/attachment`;
    const token = this.getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept-Language': getCurrentI18nLang(),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiError;
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Delete an attachment file from a tournament.
   */
  async deleteAttachment(
    tournamentId: string,
    filename: string,
  ): Promise<void> {
    return await this.request<void>(
      `/upload/attachment/${tournamentId}/${filename}`,
      {
        method: 'DELETE',
      },
    );
  }
}

export const apiService = new ApiService();
export default apiService;
