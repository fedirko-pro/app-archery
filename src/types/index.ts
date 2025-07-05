// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  bio?: string;
  location?: string;
  website?: string;
  authProvider: 'local' | 'google' | 'facebook';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  bio?: string;
  location?: string;
  website?: string;
}

// Auth types
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

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  updateUser: (userData: User) => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

// API types
export interface ApiError {
  message: string;
  status?: number;
}

// Component props types
export interface MenuItem {
  link: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface MenuProps {
  active: boolean;
  items: MenuItem[];
  position: 'left' | 'right';
  clickHandle: () => void;
  onLogout?: (() => void) | null;
}

export interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  clickHandle?: () => void;
}

// Environment types
export interface Environment {
  API_BASE_URL: string;
  GOOGLE_AUTH_URL: string;
} 