import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import apiService from '../services/api';
import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../utils/i18n-lang';
import type {
  User,
  RegisterData,
  AuthResponse,
  AuthContextType,
  ChangePasswordData,
} from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pendingApplicationProcessedRef = useRef(false);
  const authCheckExecutedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(location.pathname.split('/')[1] || inferredLang);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      // Prevent duplicate auth checks
      if (authCheckExecutedRef.current) {
        return;
      }
      authCheckExecutedRef.current = true;

      try {
        if (apiService.isAuthenticated()) {
          const userData = await apiService.getProfile();
          setUser(userData);
        }
      } catch {
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handlePostAuthRedirect = () => {
    // First priority: check for a stored return URL from protected route
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl);
      return;
    }

    // Second priority: check for pending application (tournament application flow)
    const pendingApplication = sessionStorage.getItem('pendingApplication');
    if (pendingApplication) {
      const { redirectTo } = JSON.parse(pendingApplication);
      sessionStorage.removeItem('pendingApplication');
      navigate(redirectTo);
      return;
    }

    // Default: redirect to tournaments page
    navigate(`/${currentLang}/tournaments`);
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.login(email, password);
      const userData = await apiService.getProfile();

      setUser(userData);
      handlePostAuthRedirect();

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.register(userData);

      // Після успішної реєстрації автоматично логінимо користувача
      await apiService.login(userData.email, userData.password);
      const userProfile = await apiService.getProfile();

      setUser(userProfile);
      handlePostAuthRedirect();

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
    setError(null);
    pendingApplicationProcessedRef.current = false;
    authCheckExecutedRef.current = false;
    navigate(`/${currentLang}/tournaments`);
  };

  const updateUser = (userData: User): void => {
    setUser(userData);
  };

  const handleGoogleAuth = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      if (!apiService.isAuthenticated()) {
        navigate(`/${currentLang}/signin`);
        return;
      }

      const userData = await apiService.getProfile();
      setUser(userData);

      // Запобігаємо повторній обробці
      if (pendingApplicationProcessedRef.current) {
        return;
      }

      pendingApplicationProcessedRef.current = true;

      // Use the same redirect logic as normal login
      handlePostAuthRedirect();
    } catch {
      apiService.logout();
      setUser(null);
      navigate(`/${currentLang}/signin`);
    } finally {
      setLoading(false);
    }
  }, [currentLang, navigate]);

  const changePassword = async (
    passwordData: ChangePasswordData,
  ): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      await apiService.changePassword(passwordData);

      navigate(`/${currentLang}/profile`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change password';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (
    password: string,
    confirmPassword: string,
  ): Promise<void> => {
    try {
      setError(null);
      setLoading(true);

      await apiService.setPassword(password, confirmPassword);

      // Refresh user data to update the password status
      const userData = await apiService.getProfile();
      setUser(userData);

      navigate(`/${currentLang}/profile`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to set password';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    changePassword,
    setPassword,
    logout,
    updateUser,
    handleGoogleAuth,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
