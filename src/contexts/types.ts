export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  picture?: string;
  bio?: string;
  location?: string;
  website?: string;
  authProvider: 'local' | 'google' | 'facebook';
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  authProvider: 'local';
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<User>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  setPassword: (password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  clearError: () => void;
  isAuthenticated: boolean;
} 