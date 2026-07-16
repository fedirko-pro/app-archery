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
import { getCachedUser, setCachedUser } from '../utils/cached-user';
import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../utils/i18n-lang';
import { isNetworkError } from '../utils/offline-cache';
import { resolvePostAuthPath } from '../utils/post-auth-redirect';
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
  const [initializing, setInitializing] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
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
        const userData = await apiService.getProfile();
        setUser(userData);
        setCachedUser(userData);
      } catch (error) {
        // Keep the last known session when offline so local-first features still work.
        if (isNetworkError(error) || (typeof navigator !== 'undefined' && !navigator.onLine)) {
          const cachedUser = getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
            return;
          }
        }
        setCachedUser(null);
        await apiService.logout();
      } finally {
        setInitializing(false);
      }
    };

    checkAuth();
  }, []);

  const handlePostAuthRedirect = (authenticatedUser?: User | null) => {
    const landingUser = authenticatedUser !== undefined ? authenticatedUser : user;
    navigate(resolvePostAuthPath(currentLang, landingUser));
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      setActionLoading(true);

      const response = await apiService.login(email, password);
      const userData = await apiService.getProfile();

      setUser(userData);
      setCachedUser(userData);
      handlePostAuthRedirect(userData);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      setError(null);
      setActionLoading(true);

      const response = await apiService.register(userData);

      // After successful registration, log the user in automatically
      await apiService.login(userData.email, userData.password);
      const userProfile = await apiService.getProfile();

      setUser(userProfile);
      setCachedUser(userProfile);
      handlePostAuthRedirect(userProfile);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = (): void => {
    void apiService.logout();
    setCachedUser(null);
    setUser(null);
    setError(null);
    pendingApplicationProcessedRef.current = false;
    authCheckExecutedRef.current = false;
    navigate(`/${currentLang}/tournaments`);
  };

  const updateUser = (userData: User): void => {
    setUser(userData);
    setCachedUser(userData);
  };

  const handleGoogleAuth = useCallback(async (): Promise<void> => {
    try {
      setActionLoading(true);

      const userData = await apiService.getProfile();
      setUser(userData);
      setCachedUser(userData);

      if (pendingApplicationProcessedRef.current) {
        return;
      }

      pendingApplicationProcessedRef.current = true;

      // Use the same redirect logic as normal login
      handlePostAuthRedirect(userData);
    } catch {
      setCachedUser(null);
      apiService.logout();
      setUser(null);
      navigate(`/${currentLang}/signin`);
    } finally {
      setActionLoading(false);
    }
  }, [currentLang, navigate]);

  const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
    try {
      setError(null);
      setActionLoading(true);

      await apiService.changePassword(passwordData);

      navigate(`/${currentLang}/profile`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setError(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const setPassword = async (password: string, confirmPassword: string): Promise<void> => {
    try {
      setError(null);
      setActionLoading(true);

      await apiService.setPassword(password, confirmPassword);

      // Refresh user data to update the password status
      const userData = await apiService.getProfile();
      setUser(userData);
      setCachedUser(userData);

      navigate(`/${currentLang}/profile`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set password';
      setError(errorMessage);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    initializing,
    actionLoading,
    loading: initializing || actionLoading,
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
